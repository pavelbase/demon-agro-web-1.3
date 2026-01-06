import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route: Update parcel
 * PATCH /api/portal/parcels/[id]
 * 
 * Umožňuje aktualizaci údajů pozemku (např. soil_type)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // -------------------------------------------------
    // 1. AUTENTIZACE
    // -------------------------------------------------
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // -------------------------------------------------
    // 2. NAČTENÍ DAT Z REQUESTU
    // -------------------------------------------------
    
    const body = await request.json()
    const { soil_type } = body
    
    if (!soil_type) {
      return NextResponse.json(
        { error: 'Chybí povinné pole: soil_type' },
        { status: 400 }
      )
    }
    
    // Validace soil_type
    if (!['L', 'S', 'T'].includes(soil_type)) {
      return NextResponse.json(
        { error: 'Neplatný typ půdy. Povolené hodnoty: L, S, T' },
        { status: 400 }
      )
    }
    
    // -------------------------------------------------
    // 3. OVĚŘENÍ VLASTNICTVÍ POZEMKU
    // -------------------------------------------------
    
    const { data: parcel, error: parcelError } = await supabase
      .from('parcels')
      .select('id, user_id, soil_type')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    
    if (parcelError || !parcel) {
      return NextResponse.json(
        { error: 'Pozemek nenalezen nebo nemáte oprávnění' },
        { status: 403 }
      )
    }
    
    // -------------------------------------------------
    // 4. UPDATE POZEMKU
    // -------------------------------------------------
    
    const { error: updateError } = await supabase
      .from('parcels')
      .update({ 
        soil_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
    
    if (updateError) {
      console.error('Error updating parcel:', updateError)
      return NextResponse.json(
        { error: 'Chyba při aktualizaci pozemku: ' + updateError.message },
        { status: 500 }
      )
    }
    
    // -------------------------------------------------
    // 5. AUDIT LOG
    // -------------------------------------------------
    
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'parcel_updated',
        entity_type: 'parcel',
        entity_id: params.id,
        details: {
          old_soil_type: parcel.soil_type,
          new_soil_type: soil_type,
          updated_from: 'liming_plan_generator'
        }
      })
    
    // -------------------------------------------------
    // 6. VRÁCENÍ ODPOVĚDI
    // -------------------------------------------------
    
    return NextResponse.json({ 
      success: true,
      message: 'Typ půdy byl úspěšně aktualizován'
    })
    
  } catch (error) {
    console.error('Error updating parcel:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při aktualizaci pozemku',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}

