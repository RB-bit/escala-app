/**
 * Tienda Nube API client
 * - Paginación completa via Link header (rel="next")
 * - Retry automático en 429 usando x-rate-limit-reset
 * - Backoff exponencial en 5xx (3 reintentos)
 * - Delta sync: updated_at_min cuando se provee lastSyncAt
 */

const TN_API_BASE = 'https://api.tiendanube.com/2025-03'
const USER_AGENT = process.env.TN_USER_AGENT || 'ESCALA (hola@escala.app)'
const MAX_RETRIES = 3
const PER_PAGE = 200

function buildHeaders(token) {
  return {
    'Authentication': `bearer ${token}`,
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/json'
  }
}

async function fetchWithRetry(url, headers, attempt = 1) {
  let res
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      const delay = Math.pow(2, attempt - 1) * 1000
      await sleep(delay)
      return fetchWithRetry(url, headers, attempt + 1)
    }
    throw new Error(`Network error after ${MAX_RETRIES} attempts: ${err.message}`)
  }

  if (res.status === 429) {
    const resetAt = res.headers.get('x-rate-limit-reset')
    const waitMs = resetAt
      ? Math.max(0, new Date(resetAt * 1000) - Date.now()) + 200
      : 2000
    console.log(`  ⏳ Rate limit hit, esperando ${Math.ceil(waitMs / 1000)}s...`)
    await sleep(waitMs)
    return fetchWithRetry(url, headers, attempt)
  }

  if (res.status >= 500 && attempt <= MAX_RETRIES) {
    const delay = Math.pow(2, attempt - 1) * 1000
    await sleep(delay)
    return fetchWithRetry(url, headers, attempt + 1)
  }

  return res
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Extrae el link "next" del header Link de paginación de TN.
 * Formato: <https://...>; rel="next", <https://...>; rel="prev"
 */
function extractNextLink(linkHeader) {
  if (!linkHeader) return null
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
  return match ? match[1] : null
}

/**
 * Fetch paginado de un recurso TN.
 * Retorna todos los registros de todas las páginas.
 */
async function fetchAllPages(storeId, token, resource, params = {}) {
  const headers = buildHeaders(token)
  const queryParams = new URLSearchParams({ per_page: PER_PAGE, ...params })
  let url = `${TN_API_BASE}/${storeId}/${resource}?${queryParams}`
  const allRecords = []
  let page = 1

  while (url) {
    const res = await fetchWithRetry(url, headers)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`TN API ${resource} error ${res.status}: ${body}`)
    }

    const data = await res.json()
    allRecords.push(...(Array.isArray(data) ? data : []))
    url = extractNextLink(res.headers.get('link'))
    page++

    if (page > 100) {
      console.warn(`  ⚠️  Más de 100 páginas para ${resource}, cortando para evitar loop infinito`)
      break
    }
  }

  return allRecords
}

/**
 * Trae todas las órdenes de una tienda.
 * Si lastSyncAt es provisto, solo trae órdenes actualizadas desde esa fecha (delta sync).
 */
export async function fetchAllOrders(storeId, token, { since } = {}) {
  const params = {}
  if (since) {
    params.updated_at_min = new Date(since).toISOString()
  }
  return fetchAllPages(storeId, token, 'orders', params)
}

/**
 * Trae todos los productos de una tienda.
 * Si lastSyncAt es provisto, solo trae productos actualizados desde esa fecha (delta sync).
 */
export async function fetchAllProducts(storeId, token, { since } = {}) {
  const params = {}
  if (since) {
    params.updated_at_min = new Date(since).toISOString()
  }
  return fetchAllPages(storeId, token, 'products', params)
}

/**
 * Trae la info básica de la tienda (nombre, dominio, plan).
 */
export async function fetchStoreInfo(storeId, token) {
  const headers = buildHeaders(token)
  const res = await fetchWithRetry(`${TN_API_BASE}/${storeId}/store`, headers)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TN API store info error ${res.status}: ${body}`)
  }
  return res.json()
}
