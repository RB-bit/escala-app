import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook para leer datos de una tienda desde Supabase (pre-sincronizados por el worker).
 * Incluye suscripción realtime: el dashboard se actualiza automáticamente
 * cuando el cron worker escribe nuevos datos.
 *
 * @param {string|null} storeId - tn_store_id de la tienda (e.g. "2091475")
 * @returns {{ orders, products, storeInfo, lastSyncAt, syncStatus, isLoading, error, refetch }}
 */
export function useTiendaNube(storeId) {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [storeInfo, setStoreInfo] = useState(null)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [syncStatus, setSyncStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!storeId) return
    setIsLoading(true)
    setError(null)

    try {
      const [ordersRes, productsRes, storeRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('store_id', storeId)
          .order('tn_created_at', { ascending: false })
          .limit(200),

        supabase
          .from('products')
          .select('*')
          .eq('store_id', storeId)
          .order('total_stock', { ascending: true })
          .limit(500),

        supabase
          .from('stores')
          .select('tn_store_id, tn_store_name, last_sync_at, sync_status, sync_error, brand_id')
          .eq('tn_store_id', storeId)
          .single()
      ])

      if (ordersRes.error) throw ordersRes.error
      if (productsRes.error) throw productsRes.error
      if (storeRes.error && storeRes.error.code !== 'PGRST116') throw storeRes.error

      setOrders(ordersRes.data || [])
      setProducts(productsRes.data || [])
      setStoreInfo(storeRes.data || null)
      setLastSyncAt(storeRes.data?.last_sync_at || null)
      setSyncStatus(storeRes.data?.sync_status || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [storeId])

  // Fetch inicial
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Suscripción realtime: se actualiza cuando el worker hace upsert
  useEffect(() => {
    if (!storeId) return

    const channel = supabase
      .channel(`store-${storeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${storeId}`
      }, () => fetchData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stores',
        filter: `tn_store_id=eq.${storeId}`
      }, (payload) => {
        setLastSyncAt(payload.new?.last_sync_at || null)
        setSyncStatus(payload.new?.sync_status || null)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [storeId, fetchData])

  return { orders, products, storeInfo, lastSyncAt, syncStatus, isLoading, error, refetch: fetchData }
}

/**
 * Formatea el tiempo desde la última sync de forma amigable.
 * Ej: "hace 3 min", "hace 1 h", "Nunca"
 */
export function formatLastSync(lastSyncAt) {
  if (!lastSyncAt) return 'Nunca sincronizado'
  const diffMs = Date.now() - new Date(lastSyncAt).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'hace menos de 1 min'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH} h`
  return `hace ${Math.floor(diffH / 24)} días`
}
