import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('ERROR: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env')
  process.exit(1)
}

// Service role: bypasa RLS para escritura desde el worker
export const supabase = createClient(url, key, {
  auth: { persistSession: false }
})
