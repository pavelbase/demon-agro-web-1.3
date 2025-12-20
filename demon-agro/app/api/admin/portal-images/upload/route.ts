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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'Soubor je povinný' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `portal/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portal-images')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portal-images')
      .getPublicUrl(filePath)

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('portal_images')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const displayOrder = (maxOrder?.display_order || 0) + 1

    // Insert into DB
    const { data, error } = await supabase
      .from('portal_images')
      .insert({
        title,
        description: description || null,
        image_url: publicUrl,
        display_order: displayOrder,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Nahrál obrázek portálu: ${title}`,
      table_name: 'portal_images',
      record_id: data.id,
    })

    return NextResponse.json({ success: true, image: data })
  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se nahrát obrázek' },
      { status: 500 }
    )
  }
}
