/**
 * ESCALA — Tienda Nube Sync Worker
 *
 * Uso:
 *   node worker.js          # delta sync (solo cambios desde last_sync_at)
 *   node worker.js --full   # full sync (re-sincroniza todo desde cero)
 *
 * Variables de entorno requeridas (en .env):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TN_USER_AGENT
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Cargar .env si existe
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '.env')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

import pLimit from 'p-limit'
import { supabase } from './lib/supabase.js'
import { syncStore } from './lib/syncStore.js'

const CONCURRENCY = 10  // Máximo 10 tiendas en paralelo
const forceFullSync = process.argv.includes('--full')

async function main() {
  const startTime = Date.now()
  console.log(`\n🚀 ESCALA Sync Worker — ${new Date().toISOString()}`)
  console.log(`   Modo: ${forceFullSync ? 'FULL (completo)' : 'DELTA (incremental)'}`)
  console.log(`   Concurrencia: ${CONCURRENCY} tiendas simultáneas\n`)

  // Cargar todas las tiendas desde tiendanube_connections (tokens OAuth)
  const { data: connections, error } = await supabase
    .from('tiendanube_connections')
    .select('store_id, access_token, last_sync_at, store_name, brand_id')

  if (error) {
    console.error('ERROR cargando tiendas:', error.message)
    process.exit(1)
  }

  if (!connections || connections.length === 0) {
    console.log('⚠️  No hay tiendas en tiendanube_connections.')
    process.exit(0)
  }

  // Normalizar al formato esperado por syncStore
  const stores = connections.map(c => ({
    tn_store_id: c.store_id,
    access_token: c.access_token,
    last_sync_at: c.last_sync_at,
    tn_store_name: c.store_name,
    brand_id: c.brand_id
  }))

  console.log(`📦 ${stores.length} tienda(s):\n`)
  for (const s of stores) {
    const lastSync = s.last_sync_at ? new Date(s.last_sync_at).toLocaleString('es-AR') : 'nunca'
    console.log(`   • ${s.tn_store_id} (${s.tn_store_name || 'sin nombre'}) — último sync: ${lastSync}`)
  }
  console.log()

  // Sync con concurrencia limitada
  const limit = pLimit(CONCURRENCY)
  const results = await Promise.all(
    stores.map(store => limit(() => syncStore(store, forceFullSync)))
  )

  // Resumen
  const ok = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const totalOrders = ok.reduce((s, r) => s + (r.ordersCount || 0), 0)
  const totalProducts = ok.reduce((s, r) => s + (r.productsCount || 0), 0)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ Sync completado en ${elapsed}s`)
  console.log(`   Tiendas OK: ${ok.length}/${stores.length}`)
  console.log(`   Órdenes sincronizadas: ${totalOrders}`)
  console.log(`   Productos sincronizados: ${totalProducts}`)

  if (failed.length > 0) {
    console.log(`\n❌ Tiendas con error (${failed.length}):`)
    for (const f of failed) {
      console.log(`   • ${f.storeId}: ${f.error}`)
    }
  }

  console.log()
  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('ERROR fatal:', err)
  process.exit(1)
})
