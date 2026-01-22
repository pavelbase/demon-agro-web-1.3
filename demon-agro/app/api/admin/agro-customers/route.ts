import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

/**
 * GET /api/admin/agro-customers
 * Získat seznam všech zákazníků AgroManažeru
 * Pouze pro adminy
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
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

    // Fetch all customers ordered by created_at DESC
    const { data: customers, error } = await supabase
      .from('agro_customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Nepodařilo se načíst zákazníky: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      customers: customers || [],
      count: customers?.length || 0,
    })
  } catch (error) {
    console.error('Get agro customers error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}

