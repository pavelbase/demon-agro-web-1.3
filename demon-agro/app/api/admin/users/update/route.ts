import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function PUT(request: NextRequest) {
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
    const { userId, company_name, ico, district, ai_extractions_limit } = body

    if (!userId || !company_name) {
      return NextResponse.json(
        { error: 'UserId a název firmy jsou povinné' },
        { status: 400 }
      )
    }

    // Fetch current user data (for audit log)
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        company_name,
        ico: ico || null,
        district: district || null,
        ai_extractions_limit: ai_extractions_limit || 10,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Nepodařilo se upravit profil: ${updateError.message}`)
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin upravil uživatele: ${currentUser?.email}`,
      table_name: 'profiles',
      record_id: userId,
      old_data: currentUser,
      new_data: { company_name, ico, district, ai_extractions_limit },
    })

    return NextResponse.json({
      success: true,
      message: 'Uživatel byl upraven',
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}
