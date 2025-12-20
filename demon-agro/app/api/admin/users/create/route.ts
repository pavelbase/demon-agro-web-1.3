import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { sendWelcomeEmail } from '@/lib/utils/email'

// Generate random password
function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const user = await requireAuth()
    const supabase = createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { email, company_name, ico, district } = body

    if (!email || !company_name) {
      return NextResponse.json(
        { error: 'Email a název firmy jsou povinné' },
        { status: 400 }
      )
    }

    // Generate random password
    const password = generatePassword()

    // Create user in Supabase Auth (using admin client)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        created_by_admin: true,
      },
    })

    if (authError) {
      throw new Error(`Nepodařilo se vytvořit uživatele: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('User not created')
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        company_name,
        ico: ico || null,
        district: district || null,
        role: 'user',
        ai_extractions_limit: 10,
      })

    if (profileError) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Nepodařilo se vytvořit profil: ${profileError.message}`)
    }

    // Log to audit_logs (admin action)
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin vytvořil uživatele: ${email}`,
      table_name: 'profiles',
      record_id: authData.user.id,
      new_data: { email, company_name, ico, district },
    })

    // Send welcome email with password
    const emailResult = await sendWelcomeEmail(
      email,
      company_name, // Use company name as display name
      password
    )

    if (!emailResult.success) {
      console.warn('Failed to send welcome email:', emailResult.error)
      // Don't fail the user creation, just log the error
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      message: 'Uživatel byl vytvořen',
      emailSent: emailResult.success,
      // For admin UI - show password if email failed
      temporaryPassword: emailResult.success ? undefined : password,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}
