import { supabase } from './supabase'

/**
 * Send a magic link to the user's email.
 * Used for first login (set password) and password recovery.
 */
export async function signInWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: true,
    },
  })
  if (error) throw error
}

/**
 * Sign in with email + password. Used for everyday login.
 */
export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Set the user's password. Marks user_metadata.has_password = true so we know
 * the user has finished onboarding and can use email+password from now on.
 */
export async function setPassword(password) {
  const { data, error } = await supabase.auth.updateUser({
    password,
    data: { has_password: true },
  })
  if (error) throw error
  return data
}

/**
 * Whether the given session corresponds to a user that already set a password.
 * Falsy means we should force the "create password" screen.
 */
export function hasPassword(session) {
  return Boolean(session?.user?.user_metadata?.has_password)
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session, event)
  })
  return subscription
}
