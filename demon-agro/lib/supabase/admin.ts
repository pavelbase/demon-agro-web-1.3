import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

/**
 * Admin client for server-side operations that require elevated privileges
 * Uses the service role key - NEVER expose this in client-side code
 * Only use in Server Components, Server Actions, or API routes
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
