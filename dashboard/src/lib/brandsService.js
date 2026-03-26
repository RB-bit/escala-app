import { supabase } from './supabase'

/**
 * Fetch all brands ordered by created_at.
 */
export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Fetch a single brand with its Meta connection details.
 */
export async function getBrandWithConnection(brandId) {
  const { data, error } = await supabase
    .from('brands')
    .select('*, meta_connections(*)')
    .eq('id', brandId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new brand.
 */
export async function createBrand({ slug, name, emoji, color }) {
  const { data, error } = await supabase
    .from('brands')
    .insert([{ 
      slug, 
      name, 
      emoji, 
      color
    }])
    .select()

  if (error) throw error
  return data[0]
}

/**
 * Fetch all brands with their Meta + TN connections.
 * Falls back to meta-only query if tiendanube_connections table doesn't exist yet.
 */
export async function getBrandsWithConnections() {
  // Try full query with TN connections
  const { data, error } = await supabase
    .from('brands')
    .select('*, meta_connections(*), tiendanube_connections(*)')
    .order('created_at', { ascending: true })

  if (!error) return data

  // Fallback: tiendanube_connections table might not exist yet
  console.warn('getBrandsWithConnections fallback (tiendanube_connections may not exist):', error.message)
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('brands')
    .select('*, meta_connections(*)')
    .order('created_at', { ascending: true })

  if (fallbackError) throw fallbackError
  return fallbackData
}

/**
 * Save (insert or update) a Tienda Nube connection for a brand.
 */
export async function saveTNConnection(brandId, { storeId, accessToken, storeName }) {
  const { data: existing } = await supabase
    .from('tiendanube_connections')
    .select('id')
    .eq('brand_id', brandId)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('tiendanube_connections')
      .update({ store_id: storeId, access_token: accessToken, store_name: storeName, updated_at: new Date().toISOString() })
      .eq('brand_id', brandId)
      .select()
    if (error) throw error
    return data[0]
  } else {
    const { data, error } = await supabase
      .from('tiendanube_connections')
      .insert([{ brand_id: brandId, store_id: storeId, access_token: accessToken, store_name: storeName }])
      .select()
    if (error) throw error
    return data[0]
  }
}

/**
 * Save (insert or update) a Meta connection for a brand.
 * If a connection already exists for the brand, it updates it.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function saveMetaConnection(brandId, { adAccountId, adAccountName }) {
  if (!UUID_REGEX.test(brandId)) {
    throw new Error('Recargá la página — los datos locales no tienen ID válido de Supabase.')
  }
  // Check if a connection already exists for this brand
  const { data: existing } = await supabase
    .from('meta_connections')
    .select('id')
    .eq('brand_id', brandId)
    .maybeSingle()

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('meta_connections')
      .update({
        ad_account_id: adAccountId,
        ad_account_name: adAccountName,
        updated_at: new Date().toISOString(),
      })
      .eq('brand_id', brandId)
      .select()
    if (error) throw error
    return data[0]
  } else {
    // Insert
    const { data, error } = await supabase
      .from('meta_connections')
      .insert([{
        brand_id: brandId,
        ad_account_id: adAccountId,
        ad_account_name: adAccountName,
      }])
      .select()
    if (error) throw error
    return data[0]
  }
}

/**
 * Delete a brand and all its connections (cascade handled by DB).
 */
export async function deleteBrand(id) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)
  if (error) throw error
}

/**
 * Update an existing brand.
 */
export async function updateBrand(id, updateData) {
  const { data, error } = await supabase
    .from('brands')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}
