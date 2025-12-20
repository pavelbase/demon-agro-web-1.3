import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function GET() {
  try {
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

    // Count new requests
    const { count } = await supabase
      .from('liming_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Count requests error:', error)
    return NextResponse.json({ count: 0 })
  }
}
