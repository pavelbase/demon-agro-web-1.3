// Role management utilities

import { User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'admin'

/**
 * Get user role from Supabase user object
 * Checks both user_metadata and app_metadata
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'user'
  
  // Check user_metadata first, then app_metadata
  const role = user.user_metadata?.role || user.app_metadata?.role
  
  return role === 'admin' ? 'admin' : 'user'
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null): boolean {
  return getUserRole(user) === 'admin'
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null
}

/**
 * Get display name from user object
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest'
  
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'
  )
}
