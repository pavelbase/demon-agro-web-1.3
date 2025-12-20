import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorizeNutrient, categorizePh } from '@/lib/utils/soil-categories'
import { revalidatePath } from 'next/cache'

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

    const body = await request.json()
    const {
      parcelId,
      userId,
      pdfUrl,
      analysis_date,
      ph,
      phosphorus,
      potassium,
      magnesium,
      calcium,
      nitrogen,
      lab_name,
      notes,
    } = body

    // Validate required fields
    if (!parcelId || !userId || !analysis_date || !ph || !phosphorus || !potassium || !magnesium) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
        { status: 400 }
      )
    }

    // Verify user owns the parcel
    const { data: parcel, error: parcelError } = await supabase
      .from('parcels')
      .select('id, user_id, soil_type')
      .eq('id', parcelId)
      .eq('user_id', userId)
      .single()

    if (parcelError || !parcel) {
      return NextResponse.json(
        { error: 'Pozemek nenalezen nebo nemáte oprávnění' },
        { status: 403 }
      )
    }

    // Categorize values based on soil type
    const soilType = parcel.soil_type
    const ph_category = categorizePh(ph)
    const phosphorus_category = categorizeNutrient('P', phosphorus, soilType)
    const potassium_category = categorizeNutrient('K', potassium, soilType)
    const magnesium_category = categorizeNutrient('Mg', magnesium, soilType)
    const calcium_category = calcium ? categorizeNutrient('Ca', calcium, soilType) : null

    // Insert soil analysis
    const { data: analysis, error: insertError } = await supabase
      .from('soil_analyses')
      .insert({
        parcel_id: parcelId,
        user_id: userId,
        date: analysis_date,
        ph,
        ph_category,
        phosphorus,
        phosphorus_category,
        potassium,
        potassium_category,
        magnesium,
        magnesium_category,
        calcium,
        calcium_category,
        nitrogen,
        pdf_url: pdfUrl || null,
        lab_name: lab_name || null,
        notes: notes || null,
        is_current: true,
        ai_extracted: !!pdfUrl,
        user_validated: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Chyba při ukládání do databáze: ' + insertError.message },
        { status: 500 }
      )
    }

    // Log audit entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'soil_analysis_created',
        entity_type: 'soil_analysis',
        entity_id: analysis.id,
        details: {
          parcel_id: parcelId,
          analysis_date,
          ph,
          has_pdf: !!pdfUrl,
        },
      })

    // Revalidate paths to update UI
    revalidatePath('/portal/pozemky')
    revalidatePath(`/portal/pozemky/${parcelId}`)
    revalidatePath(`/portal/pozemky/${parcelId}/rozbory`)

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      analysis,
    })

  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při ukládání rozboru',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}
