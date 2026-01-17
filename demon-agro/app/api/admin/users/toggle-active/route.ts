import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function PUT(request: NextRequest) {
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

    // Prevent admin from deactivating themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Nemůžete deaktivovat svůj vlastní účet' },
        { status: 400 }
      )
    }

    // Fetch current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('email, is_active')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      throw new Error('Uživatel nenalezen')
    }

    const newActiveState = !currentUser.is_active

    // Toggle is_active
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_active: newActiveState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Nepodařilo se změnit stav: ${updateError.message}`)
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin ${newActiveState ? 'aktivoval' : 'deaktivoval'} uživatele: ${currentUser.email}`,
      table_name: 'profiles',
      record_id: userId,
      old_data: { is_active: currentUser.is_active },
      new_data: { is_active: newActiveState },
    })

    return NextResponse.json({
      success: true,
      message: newActiveState ? 'Uživatel aktivován' : 'Uživatel deaktivován',
      is_active: newActiveState,
    })
  } catch (error) {
    console.error('Toggle active error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}



