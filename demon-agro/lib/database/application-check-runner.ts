/**
 * Spuštění kontrol nad evidencí
 *
 * Kontrolní engine (lib/utils/application-checks.ts) je čistý – tenhle modul mu
 * z databáze složí kontext: parcelu a její díl půdního bloku, osev, registr POR
 * a číselníky akčního programu nitrátové směrnice.
 *
 * Používá ho ukládání aplikace, hromadný přepočet v portálu i dávkový skript,
 * aby evidence byla posuzovaná všude stejně. Podklady se načítají hromadně pro
 * celou dávku, takže kontrola stovek aplikací zvládne jednotky dotazů.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  loadCropCatalog,
  loadPorRegistryForChecks,
} from '@/lib/database/application-check-data'
import { loadNitrateDirectiveCatalog } from '@/lib/database/nitrate-directive-data'
import {
  cropLimitCandidates,
  sumNitrogen,
  type NitrogenGroup,
  type NitrogenItem,
  type YieldLevel,
} from '@/lib/utils/nitrate-directive'
import {
  resolveCheckStatus,
  runApplicationChecks,
  type CheckFinding,
  type CheckInput,
  type CheckItemInput,
  type CheckLandBlock,
  type NitrateContext,
} from '@/lib/utils/application-checks'
import type { ApplicationCheckStatus } from '@/lib/types/database'

type Client = SupabaseClient<any, 'public', any>

const APPLICATION_COLUMNS = `id, application_date, applied_area, crop_parcel_id, parcel_crop_id, source,
   items:application_items(kind, product_name, por_item_id, dose, unit, target_pest, n_kg_ha, nitrogen_group, is_livestock_manure, position),
   parcel:crop_parcels(id, name, area, land_block:land_blocks(dpb_code, area, nitrate_vulnerable_zone, application_zone, erosion_class, water_distance_m, slope_degrees, climatic_region, yield_level)),
   parcel_crop:parcel_crops(id, crop_name, season, sowing_date, harvest_date)`

export interface CheckedApplication {
  id: string
  applicationDate: string
  parcelName: string
  status: ApplicationCheckStatus
  findings: CheckFinding[]
}

export interface CheckRunResult {
  statuses: Record<string, ApplicationCheckStatus>
  findings: Record<string, CheckFinding[]>
  applications: CheckedApplication[]
}

interface HistoryEntry {
  id: string
  date: string
  items: { porItemId: number | null; productName: string }[]
  /** Přívod dusíku aplikace – vstup do limitů akčního programu */
  nitrogen: NitrogenItem[]
}

const EMPTY_RESULT: CheckRunResult = { statuses: {}, findings: {}, applications: [] }

/**
 * Zkontroluje evidenci a uloží zjištění k záznamům.
 *
 * @param applicationIds konkrétní aplikace; null zkontroluje celou evidenci uživatele
 * @param options.persist false u náhledů a suchých běhů skriptu
 */
export async function runChecksForApplications(
  supabase: Client,
  userId: string,
  applicationIds: string[] | null,
  options: { persist?: boolean } = {}
): Promise<CheckRunResult> {
  if (applicationIds !== null && applicationIds.length === 0) return EMPTY_RESULT

  const query = supabase.from('applications').select(APPLICATION_COLUMNS).eq('user_id', userId)
  const { data, error } = await (applicationIds ? query.in('id', applicationIds) : query)

  if (error || !data) {
    console.error('Chyba při načítání aplikací pro kontrolu:', error)
    return EMPTY_RESULT
  }

  const [cropCatalog, nitrateCatalog] = await Promise.all([
    loadCropCatalog(supabase),
    loadNitrateDirectiveCatalog(supabase),
  ])

  const porItemIds = data.flatMap((application: any) =>
    (application.items ?? [])
      .map((item: any) => item.por_item_id)
      .filter((id: number | null): id is number => id !== null)
  )
  const porRegistry = await loadPorRegistryForChecks(supabase, porItemIds)

  const historyByCrop = await loadHistory(supabase, userId, data)
  const cropNameByParcelSeason = await loadRotations(supabase, userId, data)

  const applications: CheckedApplication[] = []
  const statuses: Record<string, ApplicationCheckStatus> = {}
  const findingsById: Record<string, CheckFinding[]> = {}

  for (const application of data as any[]) {
    const parcel = application.parcel
    const block = parcel?.land_block

    const landBlock: CheckLandBlock | null = block
      ? {
          dpbCode: block.dpb_code,
          area: Number(block.area),
          nitrateVulnerableZone: block.nitrate_vulnerable_zone,
          applicationZone: block.application_zone,
          erosionClass: block.erosion_class,
          waterDistanceM: block.water_distance_m !== null ? Number(block.water_distance_m) : null,
          slopeDegrees: block.slope_degrees !== null ? Number(block.slope_degrees) : null,
          climaticRegion: block.climatic_region,
          yieldLevel: (block.yield_level as YieldLevel | null) ?? null,
        }
      : null

    const cropName = application.parcel_crop?.crop_name ?? null
    const crop = cropName ? cropCatalog.get(cropName.toLowerCase()) ?? null : null
    const season = application.parcel_crop?.season ?? null

    const items: CheckItemInput[] = (application.items ?? [])
      .slice()
      .sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => ({
        kind: item.kind,
        productName: item.product_name,
        porItemId: item.por_item_id,
        dose: Number(item.dose),
        unit: item.unit,
        targetPest: item.target_pest,
        nKgHa: item.n_kg_ha !== null ? Number(item.n_kg_ha) : null,
        nitrogenGroup: item.nitrogen_group as NitrogenGroup | null,
        isLivestockManure: item.is_livestock_manure ?? false,
      }))

    const history = (historyByCrop.get(application.parcel_crop_id) ?? []).filter(
      (entry) => entry.id !== application.id
    )

    const previousCropName =
      season !== null
        ? cropNameByParcelSeason.get(`${application.crop_parcel_id}|${season - 1}`) ?? null
        : null

    const nitrate: NitrateContext = {
      banPeriods: nitrateCatalog.banPeriods,
      postHarvestLimits: nitrateCatalog.postHarvestLimits,
      postHarvestMethods: nitrateCatalog.postHarvestMethods,
      cropLimits: crop?.nitrateLimitKey
        ? cropLimitCandidates(nitrateCatalog.cropLimits, crop.nitrateLimitKey)
        : [],
      otherNitrogen: sumNitrogen(history.flatMap((entry) => entry.nitrogen)),
      // Podzimní hnojení k osevu je hnojení v roce před sklizní
      otherAutumnNitrogen: sumNitrogen(
        history
          .filter((entry) => season !== null && Number(entry.date.slice(0, 4)) === season - 1)
          .flatMap((entry) => entry.nitrogen)
      ),
      previousCropCategory: previousCropName
        ? cropCatalog.get(previousCropName.toLowerCase())?.category ?? null
        : null,
    }

    const checkInput: CheckInput = {
      applicationDate: application.application_date,
      appliedArea: Number(application.applied_area),
      source: application.source,
      parcel: { name: parcel?.name ?? '—', area: Number(parcel?.area ?? 0) },
      landBlock,
      parcelCrop: application.parcel_crop
        ? {
            cropName: cropName ?? '',
            crop,
            season,
            sowingDate: application.parcel_crop.sowing_date,
            harvestDate: application.parcel_crop.harvest_date,
          }
        : null,
      items,
      otherApplications: history.map((entry) => ({ date: entry.date, items: entry.items })),
      porRegistry,
      nitrate,
    }

    const findings = runApplicationChecks(checkInput)
    const status = resolveCheckStatus(findings)

    statuses[application.id] = status
    findingsById[application.id] = findings
    applications.push({
      id: application.id,
      applicationDate: application.application_date,
      parcelName: parcel?.name ?? '—',
      status,
      findings,
    })
  }

  if (options.persist !== false) {
    await persistFindings(supabase, userId, applications)
  }

  return { statuses, findings: findingsById, applications }
}

/** Ostatní aplikace týchž osevů – opakované použití přípravku i součty dusíku. */
async function loadHistory(
  supabase: Client,
  userId: string,
  applications: any[]
): Promise<Map<string, HistoryEntry[]>> {
  const parcelCropIds = Array.from(
    new Set(
      applications
        .map((application) => application.parcel_crop_id)
        .filter((id: string | null): id is string => id !== null)
    )
  )

  const byCrop = new Map<string, HistoryEntry[]>()
  if (parcelCropIds.length === 0) return byCrop

  const { data } = await supabase
    .from('applications')
    .select(
      'id, application_date, parcel_crop_id, items:application_items(por_item_id, product_name, kind, n_kg_ha, nitrogen_group, is_livestock_manure)'
    )
    .eq('user_id', userId)
    .in('parcel_crop_id', parcelCropIds)

  for (const application of (data ?? []) as any[]) {
    const list = byCrop.get(application.parcel_crop_id) ?? []
    list.push({
      id: application.id,
      date: application.application_date,
      items: (application.items ?? []).map((item: any) => ({
        porItemId: item.por_item_id,
        productName: item.product_name,
      })),
      nitrogen: (application.items ?? [])
        .filter((item: any) => item.kind === 'hnojivo')
        .map((item: any) => ({
          nitrogenGroup: item.nitrogen_group as NitrogenGroup | null,
          isLivestockManure: item.is_livestock_manure ?? false,
          nKgHa: item.n_kg_ha !== null ? Number(item.n_kg_ha) : null,
        })),
    })
    byCrop.set(application.parcel_crop_id, list)
  }

  return byCrop
}

/** Osevní sled parcel – předplodina rozhoduje o limitu dávky po sklizni. */
async function loadRotations(
  supabase: Client,
  userId: string,
  applications: any[]
): Promise<Map<string, string>> {
  const parcelIds = Array.from(
    new Set(applications.map((application) => application.crop_parcel_id).filter(Boolean))
  )

  const byParcelSeason = new Map<string, string>()
  if (parcelIds.length === 0) return byParcelSeason

  const { data } = await supabase
    .from('parcel_crops')
    .select('crop_parcel_id, season, crop_name')
    .eq('user_id', userId)
    .in('crop_parcel_id', parcelIds)

  for (const rotation of (data ?? []) as any[]) {
    byParcelSeason.set(`${rotation.crop_parcel_id}|${rotation.season}`, rotation.crop_name)
  }

  return byParcelSeason
}

/** Zápis po dávkách, aby velké přepočty nezahltily spojení. */
async function persistFindings(
  supabase: Client,
  userId: string,
  applications: CheckedApplication[]
): Promise<void> {
  const checkedAt = new Date().toISOString()
  const batchSize = 25

  for (let i = 0; i < applications.length; i += batchSize) {
    const batch = applications.slice(i, i + batchSize)
    await Promise.all(
      batch.map((application) =>
        supabase
          .from('applications')
          .update({
            check_status: application.status,
            check_findings: application.findings as unknown as never,
            checked_at: checkedAt,
          })
          .eq('id', application.id)
          .eq('user_id', userId)
      )
    )
  }
}
