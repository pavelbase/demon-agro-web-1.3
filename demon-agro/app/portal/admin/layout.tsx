import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require authentication
  const user = await requireAuth()
  
  // Create Supabase client and fetch user profile to check role
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // If there's an error fetching the profile or user is not admin, redirect to dashboard
  if (error || !profile || profile.role !== 'admin') {
    redirect('/portal/dashboard')
  }

  // User is confirmed admin - render admin content WITHOUT extra sidebar
  // Admin navigation is handled by portal sidebar (ADMIN ZÓNA section)
  return <>{children}</>
}
