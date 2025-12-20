import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { PortalLayoutClient } from '@/components/portal/PortalLayoutClient'
import { LimingCartProvider } from '@/lib/contexts/LimingCartContext'
import type { Profile } from '@/lib/types/database'

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
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Prepare user data for client component
  const userData = {
    email: user.email || '',
    profile: profile as Profile | null,
  }

  const isAdmin = profile?.role === 'admin'

  // Render authenticated layout with sidebar
  return (
    <LimingCartProvider>
      <PortalLayoutClient user={userData} isAdmin={isAdmin}>
        {children}
      </PortalLayoutClient>
    </LimingCartProvider>
  )
}
