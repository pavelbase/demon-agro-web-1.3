import { createClient } from './server'
import { redirect } from 'next/navigation'
import { getUserRole, isAdmin as checkIsAdmin, getUserDisplayName } from '../utils/roles'
import type { UserRole } from '../utils/roles'

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
  const user = await getCurrentUser()
  return checkIsAdmin(user)
}

/**
 * Get the current user's role
 */
export async function getUserRoleServer(): Promise<UserRole> {
  const user = await getCurrentUser()
  return getUserRole(user)
}

/**
 * Require admin role or redirect
 */
export async function requireAdmin(redirectTo: string = '/portal/dashboard') {
  const user = await getCurrentUser()
  
  if (!checkIsAdmin(user)) {
    redirect(redirectTo)
  }
  
  return user
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

/**
 * Get current user with additional metadata
 */
export async function getCurrentUserWithMetadata() {
  const user = await getCurrentUser()
  
  if (!user) return null
  
  return {
    user,
    role: getUserRole(user),
    isAdmin: checkIsAdmin(user),
    displayName: getUserDisplayName(user),
  }
}
