/**
 * Meta Ads API service
 * Fetches insights per ad account directly from Graph API
 */

const META_API_BASE = 'https://graph.facebook.com/v21.0'
const FALLBACK_TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN

/**
 * Fetch all ad accounts accessible by the token
 * @param {string} accessToken - optional, falls back to VITE_META_ACCESS_TOKEN
 * @returns {Array} list of { id, name, account_status, currency }
 */
export async function fetchAdAccounts(accessToken) {
  const token = accessToken || FALLBACK_TOKEN
  if (!token) throw new Error('No access token available')

  const url = `${META_API_BASE}/me/adaccounts?fields=id,name,account_status,currency&limit=100&access_token=${token}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.error) throw new Error(data.error.message || 'Meta API error')
  if (!res.ok) throw new Error(`Meta API HTTP ${res.status}`)

  return data.data || []
}

/**
 * Fetch insights for a single ad account
 * @param {string} adAccountId - e.g. "act_12345678"
 * @param {string} accessToken - per-brand token (falls back to VITE_META_ACCESS_TOKEN)
 * @param {string} datePreset - preset name or 'custom'
 * @param {string} startDate - YYYY-MM-DD (for custom range)
 * @param {string} endDate - YYYY-MM-DD (for custom range)
 * @returns {{ spend, revenue, roas, conversions } | null}
 */
export async function fetchAccountInsights(adAccountId, accessToken, datePreset = 'this_month', startDate, endDate) {
  const token = accessToken || FALLBACK_TOKEN
  if (!token || !adAccountId) return null

  const fields = 'spend,purchase_roas,action_values,actions,impressions,clicks'

  // Meta API: use time_range for custom dates, date_preset for presets
  let dateParam
  if (datePreset === 'custom' && startDate && endDate) {
    dateParam = `time_range=${encodeURIComponent(JSON.stringify({ since: startDate, until: endDate }))}`
  } else {
    dateParam = `date_preset=${datePreset}`
  }

  const url = `${META_API_BASE}/${adAccountId}/insights?fields=${fields}&${dateParam}&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) throw new Error(data.error.message || 'Meta API error')
  if (!res.ok) throw new Error(`Meta API HTTP ${res.status}`)

  const row = data.data?.[0]
  if (!row) return { spend: 0, revenue: 0, roas: 0, conversions: 0 }

  const spend = parseFloat(row.spend || 0)
  const roas = parseFloat(
    row.purchase_roas?.find(r => r.action_type === 'omni_purchase')?.value || 0
  )
  const revenue = parseFloat(
    row.action_values?.find(r => r.action_type === 'omni_purchase')?.value || 0
  )
  const conversions = parseInt(
    row.actions?.find(r => r.action_type === 'omni_purchase')?.value || 0
  )

  return { spend, revenue, roas, conversions }
}
