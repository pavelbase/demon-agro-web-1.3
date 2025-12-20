import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, type, manufacturer, composition, acidification_factor, is_active } = body

    const { data, error } = await supabase
      .from('fertilization_products')
      .insert({
        name,
        type,
        manufacturer,
        composition,
        acidification_factor,
        is_active,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Vytvořil produkt hnojení: ${name}`,
      table_name: 'fertilization_products',
      record_id: data.id,
    })

    return NextResponse.json({ success: true, product: data })
  } catch (error) {
    console.error('Create fertilization product error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit produkt' },
      { status: 500 }
    )
  }
}
