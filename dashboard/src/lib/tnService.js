/**
 * Tienda Nube API service — todas las calls van via Supabase Edge Functions
 * para evitar CORS (TN no permite calls directas desde el browser)
 */

import { supabase } from './supabase.js'

/** Llama a la Edge Function proxy que hace el fetch a TN server-side */
async function tnFetch(storeId, accessToken, path, params = {}) {
  const { data, error } = await supabase.functions.invoke('tiendanube-proxy', {
    body: { storeId, accessToken, path, params },
  })
  if (error) throw new Error(`TN proxy error: ${error.message}`)
  if (data?.error) throw new Error(`${data.error}${data.detail ? ' — ' + data.detail : ''}`)
  return data
}

/**
 * Fetch total revenue & order count for a store in a period.
 * Paginates automatically up to 1000 orders via the Edge Function proxy.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate   - YYYY-MM-DD
 */
export async function fetchStoreRevenue(storeId, accessToken, startDate, endDate) {
  // Argentina es UTC-3 sin DST. "2026-04-04" debe mapear a 2026-04-04T03:00:00Z (medianoche ART)
  const toARTMidnightUTC = (dateStr) => `${dateStr}T03:00:00.000Z`
  const min = toARTMidnightUTC(startDate)
  // TN interpreta created_at_max como exclusivo (< fecha), sumamos 1 día en UTC
  const maxDate = new Date(`${endDate}T03:00:00.000Z`)
  maxDate.setUTCDate(maxDate.getUTCDate() + 1)
  const max = maxDate.toISOString()

  let revenue = 0
  let orders  = 0
  let page    = 1
  const perPage = 200

  while (page <= 5) {
    const data = await tnFetch(storeId, accessToken, 'orders', {
      created_at_min: min,
      created_at_max: max,
      per_page:       perPage,
      page,
    })

    if (!Array.isArray(data) || data.length === 0) break

    data.forEach(order => {
      // Sumar órdenes pagadas o autorizadas (tarjeta queda en 'authorized')
      const ps = order.payment_status
      if (ps === 'paid') {
        revenue += parseFloat(order.total || 0)
        orders++
      }
    })

    if (data.length < perPage) break
    page++
  }

  return { revenue, orders }
}

/**
 * Verify a TN connection and return basic store info.
 */
export async function fetchStoreInfo(storeId, accessToken) {
  const data = await tnFetch(storeId, accessToken, 'store')
  return { storeName: data.name?.es || data.name || storeId, storeId }
}

/**
 * Exchange a TN OAuth authorization code for an access token.
 * Llama a la Edge Function tiendanube-auth (server-side, sin CORS).
 */
export async function exchangeTNCode(code) {
  const { data, error } = await supabase.functions.invoke('tiendanube-auth', {
    body: { code },
  })
  if (error) throw new Error(`Error al intercambiar código TN: ${error.message}`)
  if (data?.error) throw new Error(data.error)
  return data // { access_token, token_type, scope, user_id }
}
