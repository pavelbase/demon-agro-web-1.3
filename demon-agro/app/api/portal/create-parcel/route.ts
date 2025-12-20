import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, name, area, cadastral_number, soil_type, culture } = await request.json()

    // Validate required fields
    if (!name || !area) {
      return NextResponse.json(
        { error: 'Název a výměra jsou povinné' },
        { status: 400 }
      )
    }

    // Verify user matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create parcel
    const { data: parcel, error: insertError } = await supabase
      .from('parcels')
      .insert({
        user_id: userId,
        name,
        area,
        cadastral_number: cadastral_number || null,
        soil_type: soil_type || null,
        culture: culture || 'orna',
        status: 'active',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating parcel:', insertError)
      return NextResponse.json(
        { error: 'Chyba při vytváření pozemku' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      parcelId: parcel.id 
    })

  } catch (error) {
    console.error('Create parcel error:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při vytváření pozemku',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}
