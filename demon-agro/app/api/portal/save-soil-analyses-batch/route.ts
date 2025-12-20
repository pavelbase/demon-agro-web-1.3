import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AnalysisInput {
  // Parcel info
  parcelId?: string // existing parcel ID
  createNewParcel?: boolean
  parcelName?: string
  parcelArea?: number
  parcelCadastralNumber?: string
  parcelSoilType?: string
  parcelCulture?: 'orna' | 'ttp'
  
  // Analysis data
  analysis_date: string
  ph: number
  phosphorus: number
  potassium: number
  magnesium: number
  calcium?: number | null
  nitrogen?: number | null
  lab_name?: string | null
  methodology?: string | null
  notes?: string | null
  pdfUrl: string
}

interface BatchSaveRequest {
  userId: string
  analyses: AnalysisInput[]
}

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

    const { userId, analyses } = await request.json() as BatchSaveRequest

    // Verify user matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!analyses || analyses.length === 0) {
      return NextResponse.json(
        { error: 'Žádné rozbory k uložení' },
        { status: 400 }
      )
    }

    const results = {
      parcelsCreated: 0,
      analysesCreated: 0,
      errors: [] as string[],
      createdParcelIds: [] as string[],
      createdAnalysisIds: [] as string[],
    }

    // Process each analysis
    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i]
      
      try {
        let parcelId = analysis.parcelId

        // Create new parcel if needed
        if (analysis.createNewParcel) {
          if (!analysis.parcelName || !analysis.parcelArea) {
            results.errors.push(`Rozbor ${i + 1}: Chybí název nebo výměra pozemku`)
            continue
          }

          const { data: newParcel, error: parcelError } = await supabase
            .from('parcels')
            .insert({
              user_id: userId,
              name: analysis.parcelName,
              area: analysis.parcelArea,
              cadastral_number: analysis.parcelCadastralNumber || null,
              soil_type: analysis.parcelSoilType || null,
              culture: analysis.parcelCulture || 'orna',
              status: 'active',
            })
            .select('id')
            .single()

          if (parcelError) {
            results.errors.push(`Rozbor ${i + 1}: Chyba při vytváření pozemku - ${parcelError.message}`)
            continue
          }

          parcelId = newParcel.id
          results.parcelsCreated++
          results.createdParcelIds.push(parcelId)
        }

        // Validate parcel ID
        if (!parcelId) {
          results.errors.push(`Rozbor ${i + 1}: Chybí ID pozemku`)
          continue
        }

        // Verify parcel ownership
        const { data: parcel, error: parcelCheckError } = await supabase
          .from('parcels')
          .select('id')
          .eq('id', parcelId)
          .eq('user_id', userId)
          .single()

        if (parcelCheckError || !parcel) {
          results.errors.push(`Rozbor ${i + 1}: Pozemek nenalezen nebo nemáte oprávnění`)
          continue
        }

        // Create soil analysis
        const { data: newAnalysis, error: analysisError } = await supabase
          .from('soil_analyses')
          .insert({
            parcel_id: parcelId,
            user_id: userId,
            analysis_date: analysis.analysis_date,
            ph: analysis.ph,
            phosphorus: analysis.phosphorus,
            potassium: analysis.potassium,
            magnesium: analysis.magnesium,
            calcium: analysis.calcium || null,
            nitrogen: analysis.nitrogen || null,
            lab_name: analysis.lab_name || null,
            methodology: analysis.methodology || null,
            notes: analysis.notes || null,
            pdf_url: analysis.pdfUrl,
            status: 'active',
          })
          .select('id')
          .single()

        if (analysisError) {
          results.errors.push(`Rozbor ${i + 1}: Chyba při ukládání rozboru - ${analysisError.message}`)
          continue
        }

        results.analysesCreated++
        results.createdAnalysisIds.push(newAnalysis.id)

      } catch (error) {
        console.error(`Error processing analysis ${i + 1}:`, error)
        results.errors.push(`Rozbor ${i + 1}: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Úspěšně vytvořeno: ${results.parcelsCreated} pozemků, ${results.analysesCreated} rozborů`,
    })

  } catch (error) {
    console.error('Batch save error:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při hromadném ukládání',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}
