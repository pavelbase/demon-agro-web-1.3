'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParcelInsert } from '@/lib/types/database'
import { categorizeNutrient, categorizePh } from '@/lib/utils/soil-categories'

export type ParcelActionResult = {
  success: boolean
  error?: string
  data?: any
}

export type CreateParcelWithAnalysisData = Omit<ParcelInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  // Optional soil analysis fields
  hasAnalysis?: boolean
  analysisDate?: string
  ph?: number
  p?: number
  k?: number
  mg?: number
  ca?: number
  s?: number
}

/**
 * Create a new parcel
 */
export async function createParcel(data: CreateParcelWithAnalysisData): Promise<ParcelActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    // Extract soil analysis data if provided
    const { hasAnalysis, analysisDate, ph, p, k, mg, ca, s, ...parcelData } = data

    // Check if parcel with same code already exists (only if code is provided)
    if (parcelData.code && parcelData.code.trim() !== '') {
      const { data: existingParcel } = await supabase
        .from('parcels')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('code', parcelData.code.trim())
        .eq('status', 'active')
        .maybeSingle()

      if (existingParcel) {
        return {
          success: false,
          error: `Pozemek s kódem "${parcelData.code}" už existuje (${existingParcel.name}). Každý pozemek musí mít jedinečný kód.`,
        }
      }
    }

    // Create parcel
    const { data: parcel, error } = await supabase
      .from('parcels')
      .insert({
        ...parcelData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Create parcel error:', error)
      return {
        success: false,
        error: 'Nepodařilo se vytvořit pozemek. Zkuste to prosím znovu.',
      }
    }

    // If soil analysis data is provided, create it
    if (hasAnalysis && ph !== undefined && p !== undefined && k !== undefined && mg !== undefined) {
      const phCategory = categorizePh(ph)
      const pCategory = categorizeNutrient('P', p, parcelData.soil_type || 'S')
      const kCategory = categorizeNutrient('K', k, parcelData.soil_type || 'S')
      const mgCategory = categorizeNutrient('Mg', mg, parcelData.soil_type || 'S')
      const caCategory = ca ? categorizeNutrient('Ca', ca, parcelData.soil_type || 'S') : null
      const sCategory = s ? categorizeNutrient('S', s, parcelData.soil_type || 'S') : null

      const { error: analysisError } = await supabase
        .from('soil_analyses')
        .insert({
          parcel_id: parcel.id,
          analysis_date: analysisDate || new Date().toISOString().split('T')[0],
          ph,
          ph_category: phCategory,
          p,
          p_category: pCategory,
          k,
          k_category: kCategory,
          mg,
          mg_category: mgCategory,
          ca: ca || null,
          ca_category: caCategory,
          s: s || null,
          s_category: sCategory,
          ai_extracted: false,
          user_validated: true,
          is_current: true,
        })

      if (analysisError) {
        console.error('Create soil analysis error:', analysisError)
        // Don't fail the whole operation, just log it
        console.warn('Pozemek byl vytvořen, ale rozbor se nepodařilo uložit')
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Vytvořen pozemek: ${parcelData.name}${hasAnalysis ? ' (s rozborem půdy)' : ''}`,
      table_name: 'parcels',
      record_id: parcel.id,
      new_data: parcel,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')

    return {
      success: true,
      data: parcel,
    }
  } catch (error) {
    console.error('Create parcel error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Update a parcel
 */
export async function updateParcel(id: string, data: Partial<Omit<ParcelInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ParcelActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    // Check ownership
    const { data: existingParcel } = await supabase
      .from('parcels')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!existingParcel || existingParcel.user_id !== user.id) {
      return {
        success: false,
        error: 'Pozemek nenalezen nebo nemáte oprávnění',
      }
    }

    // Check if parcel with same code already exists (only if code is being changed and is not empty)
    if (data.code && data.code.trim() !== '') {
      const { data: duplicateParcel } = await supabase
        .from('parcels')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('code', data.code.trim())
        .eq('status', 'active')
        .neq('id', id) // Exclude current parcel
        .maybeSingle()

      if (duplicateParcel) {
        return {
          success: false,
          error: `Pozemek s kódem "${data.code}" už existuje (${duplicateParcel.name}). Každý pozemek musí mít jedinečný kód.`,
        }
      }
    }

    const { data: parcel, error } = await supabase
      .from('parcels')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update parcel error:', error)
      return {
        success: false,
        error: 'Nepodařilo se aktualizovat pozemek. Zkuste to prosím znovu.',
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Aktualizován pozemek: ${parcel.name}`,
      table_name: 'parcels',
      record_id: parcel.id,
      new_data: parcel,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')
    revalidatePath(`/portal/pozemky/${id}`)

    return {
      success: true,
      data: parcel,
    }
  } catch (error) {
    console.error('Update parcel error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Delete (archive) a parcel
 */
export async function deleteParcel(id: string): Promise<ParcelActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    // Check ownership
    const { data: existingParcel } = await supabase
      .from('parcels')
      .select('id, user_id, name')
      .eq('id', id)
      .single()

    if (!existingParcel || existingParcel.user_id !== user.id) {
      return {
        success: false,
        error: 'Pozemek nenalezen nebo nemáte oprávnění',
      }
    }

    // Soft delete by adding a deleted_at timestamp or archive flag
    // For now, we'll actually delete (can be changed to soft delete later)
    const { error } = await supabase
      .from('parcels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete parcel error:', error)
      return {
        success: false,
        error: 'Nepodařilo se smazat pozemek. Zkuste to prosím znovu.',
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Smazán pozemek: ${existingParcel.name}`,
      table_name: 'parcels',
      record_id: id,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Delete parcel error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}
