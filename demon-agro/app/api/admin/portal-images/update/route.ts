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
    const { imageId, title, description, is_active } = body

    const { data, error } = await supabase
      .from('portal_images')
      .update({
        title,
        description: description || null,
        is_active,
      })
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Upravil obrázek portálu: ${title}`,
      table_name: 'portal_images',
      record_id: imageId,
    })

    return NextResponse.json({ success: true, image: data })
  } catch (error) {
    console.error('Update image error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se upravit obrázek' },
      { status: 500 }
    )
  }
}
