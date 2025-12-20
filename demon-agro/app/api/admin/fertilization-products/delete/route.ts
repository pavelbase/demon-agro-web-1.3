import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function DELETE(request: NextRequest) {
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
    const { productId } = body

    const { error } = await supabase
      .from('fertilization_products')
      .delete()
      .eq('id', productId)

    if (error) throw error

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Smazal produkt hnojení`,
      table_name: 'fertilization_products',
      record_id: productId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete fertilization product error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat produkt' },
      { status: 500 }
    )
  }
}
