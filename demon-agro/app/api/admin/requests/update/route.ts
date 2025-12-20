import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { requestId, status, admin_notes, quote_amount } = body

    // Fetch current request (for audit)
    const { data: currentRequest } = await supabase
      .from('liming_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    // Update request
    const { data, error } = await supabase
      .from('liming_requests')
      .update({
        status,
        admin_notes,
        quote_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw error

    // Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Upravil poptávku: ${status}`,
      table_name: 'liming_requests',
      record_id: requestId,
      old_data: currentRequest,
      new_data: { status, admin_notes, quote_amount },
    })

    return NextResponse.json({ success: true, request: data })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se upravit poptávku' },
      { status: 500 }
    )
  }
}
