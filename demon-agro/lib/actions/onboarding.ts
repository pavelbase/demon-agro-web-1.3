'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ProfileUpdate } from '@/lib/types/database'

export type OnboardingActionResult = {
  success: boolean
  error?: string
}

/**
 * Update password during onboarding
 */
export async function updatePasswordOnboarding(newPassword: string): Promise<OnboardingActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: 'Nepodařilo se změnit heslo. Zkuste to prosím znovu.',
      }
    }

    // Update profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)
    }

    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Update company information
 */
export async function updateCompanyInfo(data: {
  company_name: string
  ico?: string
  address?: string
  district?: string
  phone?: string
}): Promise<OnboardingActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    const updates: ProfileUpdate = {
      company_name: data.company_name,
      phone: data.phone || null,
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      return {
        success: false,
        error: 'Nepodařilo se uložit informace. Zkuste to prosím znovu.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Update company info error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        must_change_password: false,
      })
      .eq('id', user.id)
  }

  redirect('/portal/dashboard')
}
