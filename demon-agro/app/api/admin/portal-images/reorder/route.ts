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
    const { images } = body // Array of { id, display_order }

    // Update all images
    const promises = images.map((img: any) => 
      supabase
        .from('portal_images')
        .update({ display_order: img.display_order })
        .eq('id', img.id)
    )

    await Promise.all(promises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder images error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se změnit pořadí' },
      { status: 500 }
    )
  }
}
