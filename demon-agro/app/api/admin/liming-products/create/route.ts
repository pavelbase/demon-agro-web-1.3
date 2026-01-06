import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function POST(request: NextRequest) {
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
    const { 
      name, 
      type, 
      cao_content, 
      mgo_content, 
      reactivity, 
      is_active,
      moisture_content,
      particles_over_1mm,
      particles_under_05mm,
      particles_009_05mm,
      price_per_ton
    } = body

    const { data, error } = await supabase
      .from('liming_products')
      .insert({
        name,
        type,
        cao_content,
        mgo_content,
        reactivity,
        is_active,
        moisture_content,
        particles_over_1mm,
        particles_under_05mm,
        particles_009_05mm,
        price_per_ton,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Vytvořil produkt vápnění: ${name}`,
      table_name: 'liming_products',
      record_id: data.id,
    })

    return NextResponse.json({ success: true, product: data })
  } catch (error) {
    console.error('Create liming product error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit produkt' },
      { status: 500 }
    )
  }
}
