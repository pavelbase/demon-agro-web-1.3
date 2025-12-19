import { createClient } from './server'
import { redirect } from 'next/navigation'

/**
 * Get the current authenticated user from server components
 * Returns null if no user is authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current authenticated user or redirect to login
 * Use this in protected pages
 */
export async function requireAuth(redirectTo: string = '/portal/prihlaseni') {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(redirectTo)
  }
  
  return user
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // Check if user has admin role in metadata or a separate admin table
  // This is a placeholder - adjust based on your auth setup
  return user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
}

/**
 * Require admin role or redirect
 */
export async function requireAdmin(redirectTo: string = '/portal/dashboard') {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect(redirectTo)
  }
  
  return true
}

/**
 * Get user session
 */
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
