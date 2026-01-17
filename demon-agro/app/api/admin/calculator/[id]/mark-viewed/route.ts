import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update calculator submission
    const { error } = await supabase
      .from('calculator_usage')
      .update({ viewed_by_admin: true })
      .eq('id', params.id)

    if (error) {
      console.error('Error marking calculator as viewed:', error)
      return NextResponse.json(
        { error: 'Nepodařilo se označit jako prohlédnuté' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in mark-viewed API:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}



