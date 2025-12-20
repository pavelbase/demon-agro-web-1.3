import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function DELETE(request: NextRequest) {
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
    const { imageId } = body

    // Get image to delete from storage
    const { data: image } = await supabase
      .from('portal_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (image) {
      // Extract path from URL
      const url = new URL(image.image_url)
      const path = url.pathname.split('/').slice(-2).join('/')
      
      // Delete from storage
      await supabase.storage
        .from('portal-images')
        .remove([path])
    }

    // Delete from DB
    const { error } = await supabase
      .from('portal_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Smazal obrázek portálu`,
      table_name: 'portal_images',
      record_id: imageId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat obrázek' },
      { status: 500 }
    )
  }
}
