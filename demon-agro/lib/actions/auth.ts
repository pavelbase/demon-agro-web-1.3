'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { LoginFormData, ResetPasswordFormData, ChangePasswordFormData } from '@/lib/utils/validations'

export type AuthActionResult = {
  success: boolean
  error?: string
  redirectTo?: string
}

/**
 * Login action with profile validation
 */
export async function login(data: LoginFormData): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      // Handle specific auth errors
      if (authError.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Nesprávný email nebo heslo',
        }
      }
      
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Přihlášení se nezdařilo',
      }
    }

    // Fetch user profile to check status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      // Profile doesn't exist yet - redirect to onboarding
      return {
        success: true,
        redirectTo: '/portal/onboarding',
      }
    }

    // Check if account is active
    if (!profile.is_active) {
      // Sign out the user
      await supabase.auth.signOut()
      
      return {
        success: false,
        error: 'Váš účet je deaktivován. Kontaktujte administrátora.',
      }
    }

    // Check if user must change password
    if (profile.must_change_password) {
      return {
        success: true,
        redirectTo: '/portal/nastaveni?change_password=true',
      }
    }

    // Check if onboarding is completed
    if (!profile.onboarding_completed) {
      return {
        success: true,
        redirectTo: '/portal/onboarding',
      }
    }

    // All checks passed - redirect to dashboard
    return {
      success: true,
      redirectTo: '/portal/dashboard',
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Logout action
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/portal/prihlaseni')
}

/**
 * Reset password request
 */
export async function requestPasswordReset(
  data: ResetPasswordFormData
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${origin}/portal/reset-hesla`,
    })

    if (error) {
      console.error('Password reset error:', error)
      // Don't reveal if email exists or not for security
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
    }
  } catch (error) {
    console.error('Password reset error:', error)
    // Still return success to prevent email enumeration
    return {
      success: true,
    }
  }
}

/**
 * Update password after reset
 */
export async function updatePassword(newPassword: string): Promise<AuthActionResult> {
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

    // Update profile to mark password as changed
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)
    }

    return {
      success: true,
      redirectTo: '/portal/dashboard',
    }
  } catch (error) {
    console.error('Update password error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(data: ChangePasswordFormData): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    // Získání aktuálního uživatele
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Nejste přihlášeni',
      }
    }

    // Ověření současného hesla pokusem o přihlášení
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: data.currentPassword,
    })

    if (verifyError) {
      return {
        success: false,
        error: 'Současné heslo není správné',
      }
    }

    // Změna hesla
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    })

    if (updateError) {
      return {
        success: false,
        error: 'Nepodařilo se změnit heslo. Zkuste to prosím znovu.',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Change password error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}
