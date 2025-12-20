'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'

// ============================================================================
// SPLIT PARCEL
// ============================================================================

export interface SplitParcelPart {
  name: string
  area: number
}

export interface SplitParcelData {
  parcelId: string
  parts: SplitParcelPart[]
}

export async function splitParcel(data: SplitParcelData) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // 1. Validate user and fetch original parcel
    const { data: originalParcel, error: fetchError } = await supabase
      .from('parcels')
      .select('*')
      .eq('id', data.parcelId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalParcel) {
      return { error: 'Pozemek nebyl nalezen nebo nemáte oprávnění' }
    }

    // 2. Validate parts (2-5 parts, sum of areas equals original)
    if (data.parts.length < 2 || data.parts.length > 5) {
      return { error: 'Počet nových částí musí být 2-5' }
    }

    const totalArea = data.parts.reduce((sum, part) => sum + part.area, 0)
    const areaDiff = Math.abs(totalArea - originalParcel.area)
    
    if (areaDiff > 0.01) {
      // Allow 0.01 ha tolerance
      return {
        error: `Součet výměr (${totalArea.toFixed(2)} ha) musí být roven původní výměře (${originalParcel.area.toFixed(2)} ha)`,
      }
    }

    // 3. Fetch latest analysis
    const { data: analyses } = await supabase
      .from('soil_analyses')
      .select('*')
      .eq('parcel_id', data.parcelId)
      .order('date', { ascending: false })
      .limit(1)

    const latestAnalysis = analyses?.[0] || null

    // 4. Fetch fertilization history
    const { data: fertilizationHistory } = await supabase
      .from('fertilization_history')
      .select('*')
      .eq('parcel_id', data.parcelId)
      .order('date', { ascending: false })

    // 5. Archive original parcel
    const { error: archiveError } = await supabase
      .from('parcels')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', data.parcelId)

    if (archiveError) {
      return { error: 'Nepodařilo se archivovat původní pozemek' }
    }

    // 6. Create new parcels
    const newParcels: Array<typeof originalParcel> = []

    for (const part of data.parts) {
      const { data: newParcel, error: insertError } = await supabase
        .from('parcels')
        .insert({
          user_id: user.id,
          name: part.name,
          area: part.area,
          cadastral_number: originalParcel.cadastral_number,
          soil_type: originalParcel.soil_type,
          culture: originalParcel.culture,
          notes: `Rozděleno z pozemku: ${originalParcel.name}`,
          status: 'active',
          source_parcel_id: originalParcel.id,
        })
        .select()
        .single()

      if (insertError || !newParcel) {
        // Rollback by restoring original parcel
        await supabase
          .from('parcels')
          .update({ status: 'active' })
          .eq('id', data.parcelId)

        return { error: `Nepodařilo se vytvořit část: ${part.name}` }
      }

      newParcels.push(newParcel)

      // 7. Copy latest analysis to new parcel (same values - no recalculation)
      if (latestAnalysis) {
        await supabase.from('soil_analyses').insert({
          parcel_id: newParcel.id,
          user_id: user.id,
          date: latestAnalysis.date,
          ph: latestAnalysis.ph,
          ph_category: latestAnalysis.ph_category,
          phosphorus: latestAnalysis.phosphorus,
          phosphorus_category: latestAnalysis.phosphorus_category,
          potassium: latestAnalysis.potassium,
          potassium_category: latestAnalysis.potassium_category,
          magnesium: latestAnalysis.magnesium,
          magnesium_category: latestAnalysis.magnesium_category,
          calcium: latestAnalysis.calcium,
          calcium_category: latestAnalysis.calcium_category,
          nitrogen: latestAnalysis.nitrogen,
          lab_name: latestAnalysis.lab_name,
          notes: `Zkopírováno z pozemku: ${originalParcel.name}`,
        })
      }

      // 8. Copy fertilization history
      if (fertilizationHistory && fertilizationHistory.length > 0) {
        const fertRecords = fertilizationHistory.map((fert) => ({
          parcel_id: newParcel.id,
          user_id: user.id,
          date: fert.date,
          product_name: fert.product_name,
          quantity: fert.quantity,
          unit: fert.unit,
          nitrogen: fert.nitrogen,
          phosphorus: fert.phosphorus,
          potassium: fert.potassium,
          magnesium: fert.magnesium,
          calcium: fert.calcium,
          notes: fert.notes,
        }))

        await supabase.from('fertilization_history').insert(fertRecords)
      }
    }

    // 9. Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Pozemek rozdělen: ${originalParcel.name} → ${data.parts.map(p => p.name).join(', ')}`,
      table_name: 'parcels',
      record_id: originalParcel.id,
      old_data: originalParcel,
      new_data: newParcels,
    })

    // 10. Revalidate
    revalidatePath('/portal/pozemky')
    revalidatePath(`/portal/pozemky/${data.parcelId}`)

    return {
      success: true,
      message: `Pozemek "${originalParcel.name}" byl rozdělen na ${data.parts.length} částí`,
      newParcels,
    }
  } catch (error) {
    console.error('Split parcel error:', error)
    return { error: 'Došlo k chybě při rozdělení pozemku' }
  }
}

// ============================================================================
// MERGE PARCELS
// ============================================================================

export interface MergeData {
  parcelIds: string[]
  newName: string
}

export async function mergeParcels(data: MergeData) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // 1. Validate input
    if (data.parcelIds.length < 2) {
      return { error: 'Musíte vybrat alespoň 2 pozemky ke sloučení' }
    }

    if (!data.newName || data.newName.trim().length === 0) {
      return { error: 'Zadejte název nového pozemku' }
    }

    // 2. Fetch all parcels
    const { data: parcels, error: fetchError } = await supabase
      .from('parcels')
      .select('*')
      .in('id', data.parcelIds)
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (fetchError || !parcels || parcels.length !== data.parcelIds.length) {
      return { error: 'Některé pozemky nebyly nalezeny nebo nemáte oprávnění' }
    }

    // 3. Calculate total area
    const totalArea = parcels.reduce((sum, p) => sum + p.area, 0)

    // 4. Fetch latest analyses for all parcels
    const analysesPromises = parcels.map((p) =>
      supabase
        .from('soil_analyses')
        .select('*')
        .eq('parcel_id', p.id)
        .order('date', { ascending: false })
        .limit(1)
        .then((res) => ({ parcelId: p.id, analysis: res.data?.[0] || null }))
    )

    const analysesResults = await Promise.all(analysesPromises)

    // 5. Calculate weighted average analysis
    let mergedAnalysis: Partial<SoilAnalysis> | null = null

    const analysesWithData = analysesResults.filter((r) => r.analysis !== null)

    if (analysesWithData.length > 0) {
      const totalWeight = analysesWithData.reduce((sum, r) => {
        const parcel = parcels.find((p) => p.id === r.parcelId)
        return sum + (parcel?.area || 0)
      }, 0)

      const weightedPh = analysesWithData.reduce((sum, r) => {
        const parcel = parcels.find((p) => p.id === r.parcelId)!
        return sum + (r.analysis!.ph * parcel.area)
      }, 0) / totalWeight

      const weightedP = analysesWithData.reduce((sum, r) => {
        const parcel = parcels.find((p) => p.id === r.parcelId)!
        return sum + (r.analysis!.phosphorus * parcel.area)
      }, 0) / totalWeight

      const weightedK = analysesWithData.reduce((sum, r) => {
        const parcel = parcels.find((p) => p.id === r.parcelId)!
        return sum + (r.analysis!.potassium * parcel.area)
      }, 0) / totalWeight

      const weightedMg = analysesWithData.reduce((sum, r) => {
        const parcel = parcels.find((p) => p.id === r.parcelId)!
        return sum + (r.analysis!.magnesium * parcel.area)
      }, 0) / totalWeight

      mergedAnalysis = {
        ph: Math.round(weightedPh * 10) / 10,
        phosphorus: Math.round(weightedP),
        potassium: Math.round(weightedK),
        magnesium: Math.round(weightedMg),
      }
    }

    // 6. Archive all original parcels
    const { error: archiveError } = await supabase
      .from('parcels')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .in('id', data.parcelIds)

    if (archiveError) {
      return { error: 'Nepodařilo se archivovat původní pozemky' }
    }

    // 7. Use first parcel as template
    const templateParcel = parcels[0]

    // 8. Create merged parcel
    const { data: newParcel, error: insertError } = await supabase
      .from('parcels')
      .insert({
        user_id: user.id,
        name: data.newName,
        area: totalArea,
        cadastral_number: templateParcel.cadastral_number,
        soil_type: templateParcel.soil_type,
        culture: templateParcel.culture,
        notes: `Sloučeno z pozemků: ${parcels.map(p => p.name).join(', ')}`,
        status: 'active',
        source_parcel_id: templateParcel.id,
      })
      .select()
      .single()

    if (insertError || !newParcel) {
      // Rollback
      await supabase
        .from('parcels')
        .update({ status: 'active' })
        .in('id', data.parcelIds)

      return { error: 'Nepodařilo se vytvořit sloučený pozemek' }
    }

    // 9. Create weighted average analysis
    if (mergedAnalysis) {
      await supabase.from('soil_analyses').insert({
        parcel_id: newParcel.id,
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ph: mergedAnalysis.ph!,
        phosphorus: mergedAnalysis.phosphorus!,
        potassium: mergedAnalysis.potassium!,
        magnesium: mergedAnalysis.magnesium!,
        lab_name: 'Vážený průměr',
        notes: `Vážený průměr rozborů původních pozemků`,
      })
    }

    // 10. Merge fertilization history
    const allFertilization = await Promise.all(
      data.parcelIds.map((id) =>
        supabase
          .from('fertilization_history')
          .select('*')
          .eq('parcel_id', id)
          .then((res) => res.data || [])
      )
    )

    const flattenedFertilization = allFertilization.flat()

    if (flattenedFertilization.length > 0) {
      const fertRecords = flattenedFertilization.map((fert) => ({
        parcel_id: newParcel.id,
        user_id: user.id,
        date: fert.date,
        product_name: fert.product_name,
        quantity: fert.quantity,
        unit: fert.unit,
        nitrogen: fert.nitrogen,
        phosphorus: fert.phosphorus,
        potassium: fert.potassium,
        magnesium: fert.magnesium,
        calcium: fert.calcium,
        notes: fert.notes,
      }))

      await supabase.from('fertilization_history').insert(fertRecords)
    }

    // 11. Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Pozemky sloučeny: ${parcels.map(p => p.name).join(', ')} → ${data.newName}`,
      table_name: 'parcels',
      record_id: newParcel.id,
      old_data: parcels,
      new_data: newParcel,
    })

    // 12. Revalidate
    revalidatePath('/portal/pozemky')
    data.parcelIds.forEach((id) => revalidatePath(`/portal/pozemky/${id}`))

    return {
      success: true,
      message: `${parcels.length} pozemků bylo sloučeno do "${data.newName}"`,
      newParcel,
    }
  } catch (error) {
    console.error('Merge parcels error:', error)
    return { error: 'Došlo k chybě při sloučení pozemků' }
  }
}

// ============================================================================
// ARCHIVE PARCEL
// ============================================================================

export async function archiveParcel(parcelId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // 1. Verify ownership
    const { data: parcel, error: fetchError } = await supabase
      .from('parcels')
      .select('*')
      .eq('id', parcelId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !parcel) {
      return { error: 'Pozemek nebyl nalezen nebo nemáte oprávnění' }
    }

    if (parcel.status === 'archived') {
      return { error: 'Pozemek je již archivován' }
    }

    // 2. Archive parcel
    const { error: updateError } = await supabase
      .from('parcels')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', parcelId)

    if (updateError) {
      return { error: 'Nepodařilo se archivovat pozemek' }
    }

    // 3. Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Pozemek archivován: ${parcel.name}`,
      table_name: 'parcels',
      record_id: parcelId,
      old_data: parcel,
      new_data: { ...parcel, status: 'archived' },
    })

    // 4. Revalidate
    revalidatePath('/portal/pozemky')
    revalidatePath(`/portal/pozemky/${parcelId}`)

    return {
      success: true,
      message: `Pozemek "${parcel.name}" byl archivován`,
    }
  } catch (error) {
    console.error('Archive parcel error:', error)
    return { error: 'Došlo k chybě při archivaci pozemku' }
  }
}

// ============================================================================
// RESTORE FROM ARCHIVE
// ============================================================================

export async function restoreParcel(parcelId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // 1. Verify ownership
    const { data: parcel, error: fetchError } = await supabase
      .from('parcels')
      .select('*')
      .eq('id', parcelId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !parcel) {
      return { error: 'Pozemek nebyl nalezen nebo nemáte oprávnění' }
    }

    if (parcel.status === 'active') {
      return { error: 'Pozemek je již aktivní' }
    }

    // 2. Restore parcel
    const { error: updateError } = await supabase
      .from('parcels')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', parcelId)

    if (updateError) {
      return { error: 'Nepodařilo se obnovit pozemek' }
    }

    // 3. Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Pozemek obnoven z archivu: ${parcel.name}`,
      table_name: 'parcels',
      record_id: parcelId,
      old_data: parcel,
      new_data: { ...parcel, status: 'active' },
    })

    // 4. Revalidate
    revalidatePath('/portal/pozemky')
    revalidatePath(`/portal/pozemky/${parcelId}`)

    return {
      success: true,
      message: `Pozemek "${parcel.name}" byl obnoven`,
    }
  } catch (error) {
    console.error('Restore parcel error:', error)
    return { error: 'Došlo k chybě při obnovení pozemku' }
  }
}
