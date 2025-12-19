import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/portal/OnboardingWizard'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types/database'

export default async function OnboardingPage() {
  // Get authenticated user
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/portal/prihlaseni')
  }

  // Fetch user profile
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If onboarding is already completed, redirect to dashboard
  if (profile && profile.onboarding_completed && !profile.must_change_password) {
    redirect('/portal/dashboard')
  }

  return <OnboardingWizard profile={profile as Profile | null} />
}
