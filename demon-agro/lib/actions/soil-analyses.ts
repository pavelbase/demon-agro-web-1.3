'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { categorizeNutrient, categorizePh } from '@/lib/utils/soil-categories'

export type SoilAnalysisActionResult = {
  success: boolean
  error?: string
  data?: any
}

export type CreateSoilAnalysisData = {
  parcelId: string
  analysisDate: string
  ph: number
  p: number
  k: number
  mg: number
  ca?: number
  s?: number
  soilType: 'L' | 'S' | 'T'
}

/**
 * Create a new soil analysis manually
 */
export async function createSoilAnalysis(data: CreateSoilAnalysisData): Promise<SoilAnalysisActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    // Verify parcel ownership
    const { data: parcel } = await supabase
      .from('parcels')
      .select('id, user_id, name')
      .eq('id', data.parcelId)
      .eq('user_id', user.id)
      .single()

    if (!parcel) {
      return {
        success: false,
        error: 'Pozemek nenalezen nebo nemáte oprávnění',
      }
    }

    // Categorize values
    const phCategory = categorizePh(data.ph)
    const pCategory = categorizeNutrient('P', data.p, data.soilType)
    const kCategory = categorizeNutrient('K', data.k, data.soilType)
    const mgCategory = categorizeNutrient('Mg', data.mg, data.soilType)
    const caCategory = data.ca ? categorizeNutrient('Ca', data.ca, data.soilType) : null
    const sCategory = data.s ? categorizeNutrient('S', data.s, data.soilType) : null

    // Create soil analysis
    const { data: analysis, error } = await supabase
      .from('soil_analyses')
      .insert({
        parcel_id: data.parcelId,
        analysis_date: data.analysisDate,
        ph: data.ph,
        ph_category: phCategory,
        p: data.p,
        p_category: pCategory,
        k: data.k,
        k_category: kCategory,
        mg: data.mg,
        mg_category: mgCategory,
        ca: data.ca || null,
        ca_category: caCategory,
        s: data.s || null,
        s_category: sCategory,
        ai_extracted: false,
        user_validated: true,
        is_current: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Create soil analysis error:', error)
      return {
        success: false,
        error: 'Nepodařilo se vytvořit rozbor. Zkuste to prosím znovu.',
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Ručně přidán rozbor půdy: ${parcel.name}`,
      table_name: 'soil_analyses',
      record_id: analysis.id,
      new_data: analysis,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')
    revalidatePath(`/portal/pozemky/${data.parcelId}`)

    return {
      success: true,
      data: analysis,
    }
  } catch (error) {
    console.error('Create soil analysis error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

