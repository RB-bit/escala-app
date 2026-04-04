/**
 * Sincroniza una sola tienda Tienda Nube con Supabase.
 * - Full sync si last_sync_at es null o si se pasa forceFullSync=true
 * - Delta sync (solo registros actualizados) en corridas normales
 * - Nunca lanza excepción: los errores se registran en sync_log y se retorna {success: false}
 */

import { supabase } from './supabase.js'
import { fetchAllOrders, fetchAllProducts, fetchStoreInfo } from './tiendanube.js'

const BATCH_SIZE = 200

/**
 * Normaliza un objeto de orden de TN al schema de Supabase.
 */
function normalizeOrder(order, storeId) {
  const customer = order.customer || {}
  const customerName = [customer.name, customer.lastname].filter(Boolean).join(' ') || null

  return {
    store_id: storeId,
    tn_order_id: order.id,
    order_number: order.number,
    status: order.status,
    payment_status: order.payment_status,
    total: parseFloat(order.total) || 0,
    customer_name: customerName,
    customer_email: customer.email || null,
    raw_json: order,
    tn_created_at: order.created_at,
    tn_updated_at: order.updated_at || order.created_at,
    synced_at: new Date().toISOString()
  }
}

/**
 * Normaliza un objeto de producto de TN al schema de Supabase.
 */
function normalizeProduct(product, storeId) {
  // Nombre: TN devuelve {es: "...", pt: "..."} o string directo
  let name = product.name
  if (typeof name === 'object' && name !== null) {
    name = name.es || name.pt || Object.values(name)[0] || null
  }

  // Stock total sumando todas las variantes
  const variants = product.variants || []
  const totalStock = variants.reduce((sum, v) => {
    const stock = v.stock !== null && v.stock !== undefined ? parseInt(v.stock, 10) : 0
    return sum + (isNaN(stock) ? 0 : stock)
  }, 0)

  // Precio de la primera variante con precio
  const priceVariant = variants.find(v => v.price) || variants[0] || {}
  const price = parseFloat(priceVariant.price || product.price) || 0

  return {
    store_id: storeId,
    tn_product_id: product.id,
    name,
    price,
    total_stock: totalStock,
    variants_json: variants,
    raw_json: product,
    tn_updated_at: product.updated_at || null,
    synced_at: new Date().toISOString()
  }
}

/**
 * Upsert en batches para no sobrecargar Supabase.
 */
async function upsertInBatches(table, records, conflictColumn) {
  let totalInserted = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error, count } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictColumn, ignoreDuplicates: false })
      .select('id', { count: 'exact', head: true })

    if (error) throw new Error(`Upsert ${table} error: ${error.message}`)
    totalInserted += count || batch.length
  }
  return totalInserted
}

/**
 * Sincroniza una tienda completa.
 * @param {Object} store - registro de la tabla stores en Supabase
 * @param {boolean} forceFullSync - ignorar last_sync_at y traer todo
 * @returns {{ storeId, success, ordersCount, productsCount, error }}
 */
export async function syncStore(store, forceFullSync = false) {
  const { tn_store_id: storeId, access_token: token, last_sync_at: lastSyncAt } = store
  const isDelta = !forceFullSync && lastSyncAt !== null
  const syncType = isDelta ? 'delta' : 'full'

  console.log(`  → [${storeId}] Iniciando sync ${syncType}${isDelta ? ` desde ${lastSyncAt}` : ''}`)

  // Registrar inicio en sync_log
  const { data: logEntry } = await supabase
    .from('sync_log')
    .insert({ store_id: storeId, sync_type: syncType, status: 'running' })
    .select('id')
    .single()
  const logId = logEntry?.id

  // Marcar tienda como syncing en tiendanube_connections
  await supabase.from('tiendanube_connections').update({ sync_status: 'syncing' }).eq('store_id', storeId)

  // Asegurar que la tienda exista en `stores` para satisfacer la FK de orders/products
  await supabase.from('stores').upsert({
    tn_store_id: storeId,
    brand_id: store.brand_id || 'unknown',
    access_token: token,
    tn_store_name: store.tn_store_name,
    sync_status: 'syncing'
  }, { onConflict: 'tn_store_id', ignoreDuplicates: false })

  try {
    // Para full sync, limitar a 6 meses para no traer toda la historia (~42k órdenes)
    // El cron delta sync cubrirá el resto gradualmente
    const SIX_MONTHS_AGO = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    const since = isDelta ? lastSyncAt : SIX_MONTHS_AGO

    // Fetch SECUENCIAL (no paralelo) para evitar rate limit con el mismo token
    const storeInfo = await fetchStoreInfo(storeId, token)
    const orders = await fetchAllOrders(storeId, token, { since })
    const products = await fetchAllProducts(storeId, token, { since: null }) // productos sin filtro de fecha

    console.log(`  → [${storeId}] Fetched: ${orders.length} órdenes, ${products.length} productos`)

    let ordersCount = 0
    let productsCount = 0

    // Upsert órdenes
    if (orders.length > 0) {
      const normalized = orders.map(o => normalizeOrder(o, storeId))
      ordersCount = await upsertInBatches('orders', normalized, 'store_id,tn_order_id')
    }

    // Upsert productos
    if (products.length > 0) {
      const normalized = products.map(p => normalizeProduct(p, storeId))
      productsCount = await upsertInBatches('products', normalized, 'store_id,tn_product_id')
    }

    // Actualizar sync status en tiendanube_connections y stores
    const now = new Date().toISOString()
    await Promise.all([
      supabase.from('tiendanube_connections').update({
        last_sync_at: now,
        sync_status: 'ok',
        sync_error: null,
        store_name: storeInfo?.name || store.tn_store_name,
        updated_at: now
      }).eq('store_id', storeId),
      supabase.from('stores').update({
        last_sync_at: now,
        sync_status: 'ok',
        sync_error: null,
        tn_store_name: storeInfo?.name || store.tn_store_name
      }).eq('tn_store_id', storeId)
    ])

    // Cerrar sync_log con éxito
    if (logId) {
      await supabase.from('sync_log').update({
        finished_at: now,
        records_synced: ordersCount + productsCount,
        status: 'success'
      }).eq('id', logId)
    }

    console.log(`  ✓ [${storeId}] Sync OK: ${ordersCount} órdenes, ${productsCount} productos`)
    return { storeId, success: true, ordersCount, productsCount }

  } catch (err) {
    console.error(`  ✗ [${storeId}] Error: ${err.message}`)

    // Registrar error sin interrumpir las demás tiendas
    const now = new Date().toISOString()
    await Promise.all([
      supabase.from('tiendanube_connections').update({
        sync_status: 'error',
        sync_error: err.message
      }).eq('store_id', storeId),
      supabase.from('stores').update({
        sync_status: 'error',
        sync_error: err.message
      }).eq('tn_store_id', storeId)
    ])

    if (logId) {
      await supabase.from('sync_log').update({
        finished_at: now,
        status: 'error',
        error_message: err.message
      }).eq('id', logId)
    }

    return { storeId, success: false, error: err.message }
  }
}
