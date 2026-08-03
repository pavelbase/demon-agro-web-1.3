import { createClient } from '@supabase/supabase-js'

/**
 * Admin client for server-side operations that require elevated privileges
 * Uses the service role key - NEVER expose this in client-side code
 * Only use in Server Components, Server Actions, or API routes
 *
 * Klient je záměrně bez generiky <Database>. Ručně psaný typ v
 * lib/types/database.ts nesplňuje tvar, který supabase-js pro schéma vyžaduje
 * (u tabulek chybí Relationships, ve schématu CompositeTypes), takže s ním
 * každý dotaz vrací never. Stejně je bez typů i session klient v server.ts.
 * Generiku lze vrátit, až budou typy vygenerované ze skutečného schématu.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
