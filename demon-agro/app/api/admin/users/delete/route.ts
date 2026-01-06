import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin
    const user = await requireAuth()
    const supabase = await createClient()
    
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId je povinný' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Nemůžete smazat svůj vlastní účet' },
        { status: 400 }
      )
    }

    // Fetch user data for audit log
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Uživatel nenalezen' },
        { status: 404 }
      )
    }

    // Check if user has any parcels
    const { count: parcelCount } = await supabase
      .from('parcels')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (parcelCount && parcelCount > 0) {
      return NextResponse.json(
        { error: 'Nelze smazat uživatele s existujícími pozemky' },
        { status: 400 }
      )
    }

    // IMPORTANT: Delete from auth.users FIRST using admin client
    // This prevents orphaned auth users if profile deletion succeeds but auth deletion fails
    const adminClient = createAdminClient()
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Failed to delete auth user:', authError)
      throw new Error(`Nepodařilo se smazat uživatele z Auth: ${authError.message}`)
    }

    // Delete profile (will cascade to related tables)
    // This happens AFTER auth deletion, so we don't end up with orphaned auth users
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      // Auth user is already deleted, but we should log this
      console.error('Profile deletion failed after auth deletion:', profileError)
      throw new Error(`Nepodařilo se smazat profil: ${profileError.message}`)
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin smazal uživatele: ${targetUser.email}`,
      table_name: 'profiles',
      record_id: userId,
      old_data: { email: targetUser.email },
    })

    return NextResponse.json({
      success: true,
      message: 'Uživatel byl smazán',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}

