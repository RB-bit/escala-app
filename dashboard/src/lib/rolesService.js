import { supabase } from './supabase'

const VALID_ROLES = ['owner', 'editor', 'viewer']

/**
 * Get current user's role for a brand. Returns 'owner' | 'editor' | 'viewer' | null.
 */
export async function getMyRole(brandId) {
  if (!brandId) return null
  const { data, error } = await supabase.rpc('current_user_role', { p_brand_id: brandId })
  if (error) {
    console.error('getMyRole error', error)
    return null
  }
  return data || null
}

/**
 * Fetch every member of a brand. Owner-only in practice (RLS allows members to see members).
 */
export async function getMembers(brandId) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id, user_id, email, role, created_at')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Invite a person to a brand by email. If they already have a Supabase user,
 * the trigger links them; otherwise the row sits with user_id = null until
 * they magic-link in for the first time.
 */
export async function inviteMember(brandId, email, role) {
  if (!VALID_ROLES.includes(role)) throw new Error(`Rol inválido: ${role}`)
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Email inválido')

  // Look up existing auth user by email — best-effort. If RLS blocks, the row
  // is still created with user_id = null and the trigger will link on first login.
  let userId = null
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('email', cleanEmail)
      .not('user_id', 'is', null)
      .limit(1)
      .maybeSingle()
    if (data?.user_id) userId = data.user_id
  } catch (_) { /* ignore */ }

  const { data: invitedBy } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('user_roles')
    .insert([{
      brand_id: brandId,
      email: cleanEmail,
      user_id: userId,
      role,
      invited_by: invitedBy?.user?.id || null,
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Ese email ya está invitado a esta marca.')
    throw error
  }
  return data
}

export async function updateMemberRole(memberId, role) {
  if (!VALID_ROLES.includes(role)) throw new Error(`Rol inválido: ${role}`)
  const { data, error } = await supabase
    .from('user_roles')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeMember(memberId) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', memberId)
  if (error) throw error
}
