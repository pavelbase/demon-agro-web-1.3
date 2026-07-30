/**
 * Databázové dotazy nad díly půdních bloků (DPB) uživatele
 *
 * Data pochází z importu sestavy "Informativní údaje o DPB" (LPIS) a slouží
 * službě Hnojiva a POR. S tabulkou `parcels` (vápnění) nemají vazbu.
 */

import { createClient } from '@/lib/supabase/server'
import type { LandBlock, LandBlockImport, LandBlockSummary } from '@/lib/types/database'

/** Vrátí všechny DPB přihlášeného uživatele setřezené podle katastru a kódu. */
export async function getLandBlocks(): Promise<LandBlock[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('land_blocks')
    .select('*')
    .eq('user_id', user.id)
    .order('cadastral_area', { ascending: true })
    .order('dpb_code', { ascending: true })

  if (error) {
    console.error('Chyba při načítání DPB:', error)
    return []
  }

  return data ?? []
}

/** Poslední import DPB – kvůli informaci o aktuálnosti dat z LPIS. */
export async function getLastLandBlockImport(): Promise<LandBlockImport | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('land_block_imports')
    .select('*')
    .eq('user_id', user.id)
    .order('imported_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Chyba při načítání historie importů DPB:', error)
    return null
  }

  return data
}

/**
 * Spočítá souhrn nad již načtenými DPB – kolik ploch leží ve zranitelné
 * oblasti dusíkem a kolik je erozně ohrožených, protože to určuje omezení
 * hnojení a aplikace přípravků.
 */
export function summarizeLandBlocks(
  blocks: LandBlock[],
  lastImport: LandBlockImport | null
): LandBlockSummary {
  const byCulture = new Map<string, { area: number; count: number }>()

  let totalArea = 0
  let nvzCount = 0
  let nvzArea = 0
  let erosionCount = 0

  for (const block of blocks) {
    const area = Number(block.area) || 0
    totalArea += area

    if (block.nitrate_vulnerable_zone) {
      nvzCount++
      nvzArea += area
    }

    if (block.erosion_class && block.erosion_class !== 'NEO') {
      erosionCount++
    }

    const culture = block.culture ?? '–'
    const current = byCulture.get(culture) ?? { area: 0, count: 0 }
    byCulture.set(culture, { area: current.area + area, count: current.count + 1 })
  }

  const culturesByArea = Array.from(byCulture.entries())
    .map(([culture, value]) => ({ culture, ...value }))
    .sort((a, b) => b.area - a.area)

  return {
    count: blocks.length,
    totalArea,
    nvzCount,
    nvzArea,
    erosionCount,
    culturesByArea,
    lastImportedAt: lastImport?.imported_at ?? null,
    lastSourceFile: lastImport?.source_file ?? null,
  }
}
