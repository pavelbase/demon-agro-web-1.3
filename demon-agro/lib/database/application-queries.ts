/**
 * Databázové dotazy nad evidencí použití hnojiv a POR
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Application,
  ApplicationCheckStatus,
  ApplicationItemKind,
  ApplicationWithDetails,
  ApplicationsSummary,
  Crop,
  CropParcel,
  LandBlock,
  ParcelCrop,
} from '@/lib/types/database'
import type { CheckFinding } from '@/lib/utils/application-checks'

export interface ApplicationFilters {
  season?: number
  parcelId?: string
  status?: ApplicationCheckStatus
  /** Hledání podle názvu parcely, plodiny nebo produktu */
  query?: string
  /**
   * Evidenční kniha zobrazuje jen schválené záznamy – zápisy z pole do ní
   * patří až po schválení. 'vse' se hodí jen tam, kde se pracuje s oběma
   * stavy najednou (např. počet aplikací u parcely před smazáním).
   */
  recordStatus?: 'ceka' | 'schvaleno' | 'vse'
}

const APPLICATION_SELECT = `
  *,
  items:application_items(*),
  parcel:crop_parcels(id, name, area, block_code, land_block_id),
  parcel_crop:parcel_crops(id, crop_name, season, sowing_date, harvest_date)
`

/** Aplikace uživatele včetně položek, parcely a osevu. */
export async function getApplications(
  filters: ApplicationFilters = {}
): Promise<ApplicationWithDetails[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('user_id', user.id)
    .order('application_date', { ascending: false })

  const recordStatus = filters.recordStatus ?? 'schvaleno'
  if (recordStatus !== 'vse') query = query.eq('record_status', recordStatus)
  if (filters.parcelId) query = query.eq('crop_parcel_id', filters.parcelId)
  if (filters.status) query = query.eq('check_status', filters.status)

  const { data, error } = await query

  if (error) {
    console.error('Chyba při načítání evidence aplikací:', error)
    return []
  }

  let applications = (data ?? []) as unknown as ApplicationWithDetails[]

  // Sezóna a fulltext se filtrují až nad načtenými daty – jde o vazby na
  // vnořené tabulky, kde by dotaz byl méně čitelný než filtr v paměti
  if (filters.season) {
    applications = applications.filter(
      (application) => application.parcel_crop?.season === filters.season
    )
  }

  if (filters.query) {
    const needle = filters.query.trim().toLowerCase()
    applications = applications.filter((application) => {
      const haystack = [
        application.parcel?.name,
        application.parcel?.block_code,
        application.parcel_crop?.crop_name,
        ...application.items.map((item) => item.product_name),
        ...application.items.map((item) => item.target_pest),
      ]
      return haystack.some((value) => value?.toLowerCase().includes(needle))
    })
  }

  // Položky ve stabilním pořadí
  applications.forEach((application) => {
    application.items.sort((a, b) => a.position - b.position)
  })

  return applications
}

export async function getApplication(id: string): Promise<ApplicationWithDetails | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Chyba při načítání aplikace:', error)
    return null
  }

  if (!data) return null

  const application = data as unknown as ApplicationWithDetails
  application.items.sort((a, b) => a.position - b.position)
  return application
}

/** Souhrn nad načtenými aplikacemi pro přehled. */
export function summarizeApplications(
  applications: ApplicationWithDetails[]
): ApplicationsSummary {
  const seasons = new Set<number>()
  let errorCount = 0
  let warningCount = 0
  let uncheckedCount = 0
  let porItemCount = 0
  let fertilizerItemCount = 0
  let treatedArea = 0

  for (const application of applications) {
    if (application.parcel_crop?.season) seasons.add(application.parcel_crop.season)
    if (application.check_status === 'error') errorCount++
    if (application.check_status === 'warning') warningCount++
    if (application.check_status === 'unchecked') uncheckedCount++
    treatedArea += Number(application.applied_area) || 0

    for (const item of application.items) {
      if (item.kind === 'hnojivo') fertilizerItemCount++
      else porItemCount++
    }
  }

  return {
    count: applications.length,
    seasonCount: seasons.size,
    errorCount,
    warningCount,
    uncheckedCount,
    porItemCount,
    fertilizerItemCount,
    treatedArea,
  }
}

/** Zjištění kontrol uložená u aplikace. */
export function readFindings(application: Application): CheckFinding[] {
  if (!Array.isArray(application.check_findings)) return []
  return application.check_findings as unknown as CheckFinding[]
}

export type CropParcelWithBlock = CropParcel & {
  land_block: LandBlock | null
  crops?: ParcelCrop[]
}

/** Evidenční parcely včetně napojeného DPB a osevů. */
export async function getCropParcels(): Promise<CropParcelWithBlock[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('crop_parcels')
    .select('*, land_block:land_blocks(*), crops:parcel_crops(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Chyba při načítání evidenčních parcel:', error)
    return []
  }

  const parcels = (data ?? []) as unknown as CropParcelWithBlock[]
  parcels.forEach((parcel) => {
    parcel.crops?.sort((a, b) => b.season - a.season)
  })

  return parcels
}

export interface CropParcelOverview {
  id: string
  name: string
  area: number
  blockCode: string | null
  landBlockId: string | null
  landBlock: LandBlock | null
  applicationCount: number
  crops: {
    id: string
    cropId: number | null
    cropName: string
    season: number
    sowingDate: string | null
    harvestDate: string | null
    variety: string | null
    yieldTHa: number | null
    applicationCount: number
  }[]
}

/** Parcely s osevy a počtem evidovaných aplikací pro správu parcel. */
export async function getCropParcelsOverview(): Promise<CropParcelOverview[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const [parcels, applications] = await Promise.all([
    getCropParcels(),
    supabase
      .from('applications')
      .select('crop_parcel_id, parcel_crop_id')
      .eq('user_id', user.id)
      .eq('record_status', 'schvaleno'),
  ])

  const byParcel = new Map<string, number>()
  const byCrop = new Map<string, number>()

  for (const application of applications.data ?? []) {
    byParcel.set(application.crop_parcel_id, (byParcel.get(application.crop_parcel_id) ?? 0) + 1)
    if (application.parcel_crop_id) {
      byCrop.set(application.parcel_crop_id, (byCrop.get(application.parcel_crop_id) ?? 0) + 1)
    }
  }

  return parcels.map((parcel) => ({
    id: parcel.id,
    name: parcel.name,
    area: Number(parcel.area),
    blockCode: parcel.block_code,
    landBlockId: parcel.land_block_id,
    landBlock: parcel.land_block,
    applicationCount: byParcel.get(parcel.id) ?? 0,
    crops: (parcel.crops ?? []).map((crop) => ({
      id: crop.id,
      cropId: crop.crop_id,
      cropName: crop.crop_name,
      season: crop.season,
      sowingDate: crop.sowing_date,
      harvestDate: crop.harvest_date,
      variety: crop.variety,
      yieldTHa: crop.yield_t_ha !== null ? Number(crop.yield_t_ha) : null,
      applicationCount: byCrop.get(crop.id) ?? 0,
    })),
  }))
}

// ============================================================================
// ZÁPISY Z POLE ČEKAJÍCÍ NA SCHVÁLENÍ
// ============================================================================

/** Zápisy z provozu, které ještě nejsou v evidenční knize – nejnovější první. */
export async function getPendingFieldLogs(): Promise<ApplicationWithDetails[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('user_id', user.id)
    .eq('record_status', 'ceka')
    .order('application_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Chyba při načítání zápisů z pole:', error)
    return []
  }

  const applications = (data ?? []) as unknown as ApplicationWithDetails[]
  applications.forEach((application) => {
    application.items.sort((a, b) => a.position - b.position)
  })

  return applications
}

/** Počet čekajících zápisů pro upozornění v evidenci a v navigaci. */
export async function countPendingFieldLogs(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { count, error } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('record_status', 'ceka')

  if (error) {
    console.error('Chyba při počítání zápisů z pole:', error)
    return 0
  }

  return count ?? 0
}

export interface RecentProduct {
  kind: ApplicationItemKind
  productName: string
  porItemId: number | null
  fertEvidenceNumber: string | null
  dose: number
  unit: string
}

/**
 * Produkty z posledních aplikací uživatele.
 *
 * Na poli je vyhledávání v registru na mobilu to nejpomalejší – hospodář ale
 * obvykle jezdí pár týdnů dokola s toutéž kombinací. Poslední použití proto
 * nabídneme jedním klepnutím i s dávkou, kterou tehdy zapsal.
 */
export async function getRecentProducts(limit = 8): Promise<RecentProduct[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('application_items')
    .select('kind, product_name, por_item_id, fert_evidence_number, dose, unit, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(120)

  if (error) {
    console.error('Chyba při načítání naposledy použitých produktů:', error)
    return []
  }

  const seen = new Map<string, RecentProduct>()

  for (const item of data ?? []) {
    if (seen.size >= limit) break
    if (seen.has(item.product_name)) continue

    seen.set(item.product_name, {
      kind: item.kind,
      productName: item.product_name,
      porItemId: item.por_item_id,
      fertEvidenceNumber: item.fert_evidence_number,
      dose: Number(item.dose),
      unit: item.unit,
    })
  }

  return Array.from(seen.values())
}

/** Číselník plodin. */
export async function getCrops(): Promise<Crop[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Chyba při načítání číselníku plodin:', error)
    return []
  }

  return data ?? []
}

/** Sezóny, ve kterých uživatel má evidenci – pro přepínač v přehledu. */
export async function getEvidenceSeasons(): Promise<number[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('parcel_crops')
    .select('season')
    .eq('user_id', user.id)

  if (error) {
    console.error('Chyba při načítání sezón evidence:', error)
    return []
  }

  return Array.from(new Set((data ?? []).map((row) => row.season))).sort((a, b) => b - a)
}
