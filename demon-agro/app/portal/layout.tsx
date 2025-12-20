import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { PortalLayoutClient } from '@/components/portal/PortalLayoutClient'
import { LimingCartProvider } from '@/lib/contexts/LimingCartContext'
import type { Profile } from '@/lib/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Portál | Démon Agro',
    template: '%s | Portál Démon Agro',
  },
  description: 'Uživatelský portál pro správu pozemků, plány hnojení a vápnění',
  robots: {
    index: false, // Don't index authenticated portal
    follow: false,
  },
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user
  const user = await getCurrentUser()

  // If no user, render minimal layout (for login, landing pages)
  if (!user) {
    return <>{children}</>
  }

  // Fetch user profile
  const supabase = await createClient()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // DEBUG: Log user and profile data
  console.log('=== PORTAL LAYOUT DEBUG ===')
  console.log('User ID:', user.id)
  console.log('User Email:', user.email)
  console.log('User metadata:', user.user_metadata)
  console.log('User app_metadata:', user.app_metadata)
  console.log('Profile data:', profile)
  console.log('Profile error:', profileError)
  console.log('Profile role:', profile?.role)

  // Prepare user data for client component
  const userData = {
    email: user.email || '',
    profile: profile as Profile | null,
  }

  // Determine admin status with multiple fallbacks
  // 1. Check profile.role from database (primary source)
  // 2. Check user.app_metadata.role (Supabase auth metadata)
  // 3. Check user.user_metadata.role (custom user metadata)
  // 4. Check if email is base@demonagro.cz (temporary fallback for testing)
  const isAdmin = 
    profile?.role === 'admin' ||
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin' ||
    user.email === 'base@demonagro.cz'

  console.log('Is Admin:', isAdmin)
  console.log('=========================')

  // Render authenticated layout with sidebar
  return (
    <LimingCartProvider>
      <PortalLayoutClient user={userData} isAdmin={isAdmin}>
        {children}
      </PortalLayoutClient>
    </LimingCartProvider>
  )
}
