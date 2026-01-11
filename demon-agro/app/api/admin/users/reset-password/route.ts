import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/supabase/auth-helpers'

// Generate random password
function generatePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  
  // Ensure at least one of each type
  let password = ''
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += special.charAt(Math.floor(Math.random() * special.length))
  
  // Fill the rest randomly
  const allChars = lowercase + uppercase + numbers + special
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== RESET PASSWORD DEBUG START ===')
    
    // Verify admin
    console.log('1. Verifying admin...')
    const user = await requireAuth()
    console.log('2. User authenticated:', user.id)
    
    const supabase = await createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('3. Profile loaded:', profile)

    if (!profile || profile.role !== 'admin') {
      console.log('4. Not admin!')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { userId, email } = body
    console.log('5. Request body:', { userId, email })

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'UserId nebo email je povinný' },
        { status: 400 }
      )
    }

    // Get user profile using admin client (bypass RLS)
    console.log('6. Creating admin client...')
    const adminClient = createAdminClient()
    console.log('7. Admin client created')
    
    console.log('8. Fetching target user...')
    let targetUser: { id: string; email: string; company_name: string | null }
    if (userId) {
      const { data, error } = await adminClient
        .from('profiles')
        .select('id, email, company_name')
        .eq('id', userId)
        .single() as { data: { id: string; email: string; company_name: string | null } | null; error: any }
      
      if (error) {
        console.error('9. Error fetching user:', error)
        return NextResponse.json(
          { error: 'Chyba při načítání uživatele: ' + error.message },
          { status: 500 }
        )
      }
      if (!data) {
        return NextResponse.json(
          { error: 'Uživatel nenalezen' },
          { status: 404 }
        )
      }
      targetUser = data
    } else {
      const { data, error } = await adminClient
        .from('profiles')
        .select('id, email, company_name')
        .eq('email', email)
        .single() as { data: { id: string; email: string; company_name: string | null } | null; error: any }
      
      if (error) {
        console.error('9. Error fetching user:', error)
        return NextResponse.json(
          { error: 'Chyba při načítání uživatele: ' + error.message },
          { status: 500 }
        )
      }
      if (!data) {
        return NextResponse.json(
          { error: 'Uživatel nenalezen' },
          { status: 404 }
        )
      }
      targetUser = data
    }

    console.log('10. Target user:', targetUser)

    if (!targetUser) {
      console.log('11. Target user not found')
      return NextResponse.json(
        { error: 'Uživatel nenalezen' },
        { status: 404 }
      )
    }

    // Generate new password
    console.log('12. Generating password...')
    const newPassword = generatePassword(12)
    console.log('13. Password generated')

    // Update user password using admin client
    console.log('14. Updating password...')
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    )
    console.log('15. Update result:', updateError ? 'ERROR' : 'SUCCESS')

    if (updateError) {
      console.error('16. Password reset error:', updateError)
      return NextResponse.json(
        { error: `Nepodařilo se resetovat heslo: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update profile - set must_change_password flag
    console.log('17. Updating profile...')
    await supabase
      .from('profiles')
      .update({
        must_change_password: false, // User can use this password
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUser.id)

    // Log to audit_logs
    console.log('18. Logging to audit...')
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin resetoval heslo uživatele: ${targetUser.email}`,
      table_name: 'profiles',
      record_id: targetUser.id,
    })

    console.log('19. SUCCESS! Returning response')
    console.log('=== RESET PASSWORD DEBUG END ===')
    
    // Return user data and new password for client-side email sending
    return NextResponse.json({
      success: true,
      userId: targetUser.id,
      email: targetUser.email,
      fullName: targetUser.company_name || 'Uživatel',
      newPassword: newPassword,
      message: 'Heslo bylo resetováno',
    })
  } catch (error) {
    console.error('=== RESET PASSWORD ERROR ===', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}
