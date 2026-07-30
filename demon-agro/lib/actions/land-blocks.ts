'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { loadBpejRules } from '@/lib/database/nitrate-directive-data'
import { classifyBpej, parseBpejCode } from '@/lib/utils/nitrate-directive'
import type { LandBlockImportResult, LandBlockInsert } from '@/lib/types/database'

/**
 * Import dílů půdních bloků ze sestavy "Informativní údaje o DPB" (LPIS)
 *
 * Soubor parsuje klient (kvůli náhledu před uložením), server proto přijatá
 * data znovu validuje. Klíčem je kombinace čtverec + kód DPB, takže opakovaný
 * import stejné sestavy záznamy aktualizuje.
 */

const landBlockSchema = z.object({
  square_code: z.string().min(1).max(50),
  dpb_code: z.string().min(1).max(50),
  cadastral_area: z.string().max(200).nullable(),
  area: z.number().positive().max(100000),
  area_without_features: z.number().min(0).max(100000).nullable(),
  perimeter_m: z.number().min(0).nullable(),
  culture: z.string().max(10).nullable(),
  farming_mode: z.string().max(20).nullable(),
  organic_conversion_from: z.string().nullable(),
  organic_from: z.string().nullable(),
  nitrate_vulnerable_zone: z.boolean().nullable(),
  application_zone: z.string().max(20).nullable(),
  erosion_class: z.string().max(20).nullable(),
  soil_kind: z.string().max(50).nullable(),
  soil_type: z.enum(['L', 'S', 'T']).nullable(),
  slope_degrees: z.number().min(0).max(90).nullable(),
  water_distance_m: z.number().min(0).nullable(),
  drainage: z.boolean().nullable(),
  lfa_type: z.string().max(50).nullable(),
  lfa_area_text: z.string().max(200).nullable(),
  protected_area_type: z.string().max(100).nullable(),
  protected_area_ha: z.number().min(0).nullable(),
  buffer_zone_ha: z.number().min(0).nullable(),
  ect_ha: z.number().min(0).nullable(),
  aeko_als: z.string().max(200).nullable(),
})

const importSchema = z.object({
  sourceFile: z.string().min(1).max(255),
  /** true = DPB, které v souboru nejsou, se z evidence smažou */
  removeMissing: z.boolean().default(false),
  rows: z.array(landBlockSchema).min(1, 'Soubor neobsahuje žádný platný DPB').max(5000),
})

export type LandBlockImportPayload = z.input<typeof importSchema>

export async function importLandBlocks(
  payload: LandBlockImportPayload
): Promise<LandBlockImportResult> {
  const parsed = importSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Neplatná data importu',
    }
  }

  const { sourceFile, removeMissing, rows } = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Uživatel není přihlášen' }
    }

    const { data: existing, error: existingError } = await supabase
      .from('land_blocks')
      .select('id, square_code, dpb_code')
      .eq('user_id', user.id)

    if (existingError) {
      console.error('Chyba při načítání existujících DPB:', existingError)
      return { success: false, error: 'Nepodařilo se načíst stávající evidenci DPB' }
    }

    const existingKeys = new Set(
      (existing ?? []).map((block) => `${block.square_code}|${block.dpb_code}`)
    )
    const importedKeys = new Set(rows.map((row) => `${row.square_code}|${row.dpb_code}`))

    const updated = rows.filter((row) =>
      existingKeys.has(`${row.square_code}|${row.dpb_code}`)
    ).length
    const created = rows.length - updated

    const records: LandBlockInsert[] = rows.map((row) => ({
      ...row,
      user_id: user.id,
      source_file: sourceFile,
      imported_at: new Date().toISOString(),
    }))

    const { error: upsertError } = await supabase
      .from('land_blocks')
      .upsert(records, { onConflict: 'user_id,square_code,dpb_code' })

    if (upsertError) {
      console.error('Chyba při ukládání DPB:', upsertError)
      return { success: false, error: `Uložení DPB se nepodařilo: ${upsertError.message}` }
    }

    let skipped = 0

    if (removeMissing) {
      const obsoleteIds = (existing ?? [])
        .filter((block) => !importedKeys.has(`${block.square_code}|${block.dpb_code}`))
        .map((block) => block.id)

      if (obsoleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('land_blocks')
          .delete()
          .eq('user_id', user.id)
          .in('id', obsoleteIds)

        if (deleteError) {
          console.error('Chyba při mazání neaktuálních DPB:', deleteError)
        } else {
          skipped = obsoleteIds.length
        }
      }
    }

    await supabase.from('land_block_imports').insert({
      user_id: user.id,
      source_file: sourceFile,
      rows_total: rows.length,
      rows_created: created,
      rows_updated: updated,
    })

    revalidatePath('/portal/hnojiva-por/pozemky')

    return { success: true, created, updated, skipped }
  } catch (error) {
    console.error('Neočekávaná chyba importu DPB:', error)
    return { success: false, error: 'Import se nepodařilo dokončit' }
  }
}

export interface LandBlockBpejResult {
  success: boolean
  error?: string
  /** Co z kódu BPEJ vyplynulo – pro potvrzení uživateli */
  classification?: {
    bpejCode: string | null
    climaticRegion: number | null
    yieldLevel: number | null
    derivedZone: string | null
    lpisZone: string | null
  }
  /** Kontroly se přepočítaly, protože zařazení pozemku mění jejich výsledek */
  recheckedApplications?: number
}

const bpejSchema = z.object({
  id: z.string().uuid(),
  // Prázdná hodnota zařazení u DPB smaže
  bpejCode: z
    .string()
    .max(20)
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length === 0 || value.length === 5, {
      message: 'Kód BPEJ má pět číslic',
    }),
})

/**
 * Uloží u DPB kód BPEJ a zařazení, které z něj plyne.
 *
 * LPIS v sestavě uvádí aplikační pásmo, ale ne klimatický region ani výnosovou
 * hladinu – bez nich kontrola nedokáže rozhodnout o období zákazu hnojení a
 * limit přívodu dusíku počítá z výchozí hladiny. Obojí je v kódu BPEJ, proto
 * stačí zadat ten a zbytek se odvodí z příloh 2 a 3 NV 262/2012.
 */
export async function saveLandBlockBpej(
  id: string,
  bpejCode: string
): Promise<LandBlockBpejResult> {
  const parsed = bpejSchema.safeParse({ id, bpejCode })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatný kód BPEJ' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { data: block, error: blockError } = await supabase
      .from('land_blocks')
      .select('id, dpb_code, slope_degrees, application_zone')
      .eq('id', parsed.data.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (blockError || !block) {
      return { success: false, error: 'Díl půdního bloku nebyl nalezen' }
    }

    const bpej = parseBpejCode(parsed.data.bpejCode)

    if (!bpej) {
      const { error } = await supabase
        .from('land_blocks')
        .update({ bpej_code: null, climatic_region: null, yield_level: null })
        .eq('id', block.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Chyba při mazání BPEJ u DPB:', error)
        return { success: false, error: 'Zařazení se nepodařilo uložit' }
      }

      revalidatePath('/portal/hnojiva-por/pozemky')
      return {
        success: true,
        classification: {
          bpejCode: null,
          climaticRegion: null,
          yieldLevel: null,
          derivedZone: null,
          lpisZone: block.application_zone,
        },
      }
    }

    const rules = await loadBpejRules(supabase)
    const classification = classifyBpej(
      rules,
      bpej,
      block.slope_degrees !== null ? Number(block.slope_degrees) : null
    )

    const { error } = await supabase
      .from('land_blocks')
      .update({
        bpej_code: bpej.code,
        climatic_region: classification.climaticRegion,
        yield_level: classification.yieldLevel,
      })
      .eq('id', block.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Chyba při ukládání BPEJ u DPB:', error)
      return { success: false, error: 'Zařazení se nepodařilo uložit' }
    }

    // Termíny i limity se počítají ze zařazení pozemku, evidence proto potřebuje přepočet
    const applicationIds = await applicationsOnBlock(supabase, user.id, block.id)

    if (applicationIds.length > 0) {
      const { recheckApplications } = await import('@/lib/actions/applications')
      await recheckApplications(applicationIds)
    }

    revalidatePath('/portal/hnojiva-por/pozemky')
    revalidatePath('/portal/hnojiva-por/evidence')

    return {
      success: true,
      classification: {
        bpejCode: bpej.code,
        climaticRegion: classification.climaticRegion,
        yieldLevel: classification.yieldLevel,
        derivedZone: classification.applicationZone,
        lpisZone: block.application_zone,
      },
      recheckedApplications: applicationIds.length,
    }
  } catch (error) {
    console.error('Neočekávaná chyba ukládání BPEJ:', error)
    return { success: false, error: 'Zařazení se nepodařilo uložit' }
  }
}

/** Aplikace evidované na parcelách daného dílu půdního bloku. */
async function applicationsOnBlock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  landBlockId: string
): Promise<string[]> {
  const { data: parcels } = await supabase
    .from('crop_parcels')
    .select('id')
    .eq('user_id', userId)
    .eq('land_block_id', landBlockId)

  const parcelIds = (parcels ?? []).map((row) => row.id)
  if (parcelIds.length === 0) return []

  const { data: applications } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', userId)
    .in('crop_parcel_id', parcelIds)

  return (applications ?? []).map((row) => row.id)
}

/** Smaže jeden DPB z evidence uživatele. */
export async function deleteLandBlock(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Uživatel není přihlášen' }
    }

    const { error } = await supabase
      .from('land_blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Chyba při mazání DPB:', error)
      return { success: false, error: 'DPB se nepodařilo smazat' }
    }

    revalidatePath('/portal/hnojiva-por/pozemky')
    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba mazání DPB:', error)
    return { success: false, error: 'DPB se nepodařilo smazat' }
  }
}
