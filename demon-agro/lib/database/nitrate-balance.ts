/**
 * Bilance dusíku pro akční program nitrátové směrnice
 *
 * Kontroly u aplikace hlídají jednotlivý zápis, tenhle modul sečte, jak na tom
 * hospodářství je jako celek: kolik dusíku šlo ke každému osevu proti limitu
 * z přílohy 3 a kolik dusíku ze statkových hnojiv připadá na hektar zemědělské
 * půdy podniku (limit 170 kg N/ha, § 8 NV 262/2012).
 *
 * Přívod dusíku se počítá na hektar osetý, ne na hektar parcely – aplikace
 * na část parcely proto vstupuje poměrem ošetřené výměry.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { loadNitrateDirectiveCatalog } from '@/lib/database/nitrate-directive-data'
import {
  assessCropLimit,
  cropLimitCandidates,
  EMPTY_NITROGEN_SUPPLY,
  LIVESTOCK_NITROGEN_LIMIT_KG_HA,
  parseApplicationZone,
  sumNitrogen,
  type ApplicationZone,
  type NitrogenItem,
  type NitrogenSupply,
  type ResolvedCropLimit,
  type YieldLevel,
} from '@/lib/utils/nitrate-directive'

export interface CropStandBalance {
  parcelCropId: string
  parcelId: string
  parcelName: string
  cropName: string
  season: number
  /** Výměra osevu (ha) – výměra parcely */
  area: number
  dpbCode: string | null
  nitrateVulnerableZone: boolean
  applicationZone: ApplicationZone | null
  climaticRegion: number | null
  yieldLevel: YieldLevel | null
  supply: NitrogenSupply
  /** Přívod dusíku evidovaný na podzim před sklizňovým rokem */
  autumnSupply: NitrogenSupply
  /** Limit, který jistě platí; null když varianta plodiny nebo hladina není jednoznačná */
  limit: ResolvedCropLimit | null
  /** Rozpětí limitů, které mohou platit, když limit není jednoznačný */
  limitRange: { minKgNHa: number; maxKgNHa: number; uncertainty: string[] } | null
  /** Podíl vyčerpání limitu (1 = přesně na limitu); jen u jednoznačného limitu */
  usage: number | null
  /** Stav vůči limitu: jisté překročení, neověřitelné, v pořádku, bez limitu */
  limitStatus: 'over' | 'unverifiable' | 'ok' | 'none'
  applicationCount: number
  /** Aspoň jedna položka nemá doložený přívod dusíku */
  hasMissingNitrogen: boolean
}

export interface FarmNitrogenBalance {
  /** Zemědělská půda podniku podle LPIS (ha) */
  farmArea: number
  /** Zemědělská půda ve zranitelných oblastech (ha) */
  nvzArea: number
  /** Dusík ze statkových hnojiv celkem (kg) */
  livestockNitrogenKg: number
  /** Průměr na hektar zemědělské půdy (kg N/ha) */
  livestockPerHectare: number
  limitKgNHa: number
}

export interface NitrateBalance {
  season: number | null
  seasons: number[]
  stands: CropStandBalance[]
  farm: FarmNitrogenBalance
  /** Osevy, které překračují i nejvyšší z limitů, jež mohou platit */
  overLimitCount: number
  /** Osevy, u nichž stav vůči limitu nelze ověřit (chybí BPEJ nebo upřesnění plodiny) */
  unverifiableCount: number
  /** Osevy, u nichž limit nelze určit (příloha 3 plodinu neuvádí) */
  withoutLimitCount: number
}

type Client = SupabaseClient<any, 'public', any>

/** Rozpracovaný osev – položky se sčítají až po projití celé evidence */
interface StandAccumulator {
  cropId: number | null
  items: NitrogenItem[]
  autumnItems: NitrogenItem[]
  stand: CropStandBalance
}

const EMPTY_FARM: FarmNitrogenBalance = {
  farmArea: 0,
  nvzArea: 0,
  livestockNitrogenKg: 0,
  livestockPerHectare: 0,
  limitKgNHa: LIVESTOCK_NITROGEN_LIMIT_KG_HA,
}

/**
 * Bilance dusíku za sezónu.
 *
 * Klient a uživatel se předávají zvenčí, aby stejný výpočet zvládla stránka
 * portálu i skript se servisním klíčem.
 *
 * @param season sklizňový rok; bez něj se vezme nejnovější v evidenci
 */
export async function getNitrateBalance(
  supabase: Client,
  userId: string,
  season?: number
): Promise<NitrateBalance> {
  const empty: NitrateBalance = {
    season: season ?? null,
    seasons: [],
    stands: [],
    farm: EMPTY_FARM,
    overLimitCount: 0,
    unverifiableCount: 0,
    withoutLimitCount: 0,
  }

  const [{ data: applications, error }, { data: blocks }, catalog, cropKeys] = await Promise.all([
    supabase
      .from('applications')
      .select(
        `id, application_date, applied_area, crop_parcel_id, parcel_crop_id,
         items:application_items(kind, n_kg_ha, nitrogen_group, is_livestock_manure),
         parcel:crop_parcels(id, name, area, land_block:land_blocks(dpb_code, nitrate_vulnerable_zone, application_zone, climatic_region, yield_level)),
         parcel_crop:parcel_crops(id, crop_name, crop_id, season)`
      )
      .eq('user_id', userId),
    supabase.from('land_blocks').select('area, nitrate_vulnerable_zone').eq('user_id', userId),
    loadNitrateDirectiveCatalog(supabase),
    loadCropLimitKeys(supabase),
  ])

  if (error || !applications) {
    console.error('Chyba při načítání bilance dusíku:', error)
    return empty
  }

  const seasons = Array.from(
    new Set(
      applications
        .map((application: any) => application.parcel_crop?.season)
        .filter((value: number | undefined): value is number => typeof value === 'number')
    )
  ).sort((a, b) => b - a)

  const selectedSeason = season ?? seasons[0] ?? null

  const byStand = new Map<string, StandAccumulator>()
  let livestockNitrogenKg = 0

  for (const application of applications as any[]) {
    const stand = application.parcel_crop
    const parcel = application.parcel
    const block = parcel?.land_block
    const fertilizers = (application.items ?? []).filter((item: any) => item.kind === 'hnojivo')

    if (fertilizers.length === 0) continue

    // Limit 170 kg N/ha je na kalendářní rok a na celý podnik, nezávisle na osevu
    if (Number(application.application_date.slice(0, 4)) === selectedSeason) {
      const perHectare = sumNitrogen(fertilizers.map(toNitrogenItem)).livestockKgHa
      livestockNitrogenKg += perHectare * Number(application.applied_area ?? 0)
    }

    if (!stand || stand.season !== selectedSeason || !parcel) continue

    const existing = byStand.get(stand.id)
    const entry: StandAccumulator = existing ?? {
      cropId: stand.crop_id,
      items: [],
      autumnItems: [],
      stand: {
        parcelCropId: stand.id,
        parcelId: parcel.id,
        parcelName: parcel.name,
        cropName: stand.crop_name,
        season: stand.season,
        area: Number(parcel.area ?? 0),
        dpbCode: block?.dpb_code ?? null,
        nitrateVulnerableZone: Boolean(block?.nitrate_vulnerable_zone),
        applicationZone: parseApplicationZone(block?.application_zone).zone,
        climaticRegion: block?.climatic_region ?? null,
        yieldLevel: (block?.yield_level as YieldLevel | null) ?? null,
        supply: EMPTY_NITROGEN_SUPPLY,
        autumnSupply: EMPTY_NITROGEN_SUPPLY,
        limit: null,
        limitRange: null,
        usage: null,
        limitStatus: 'none',
        applicationCount: 0,
        hasMissingNitrogen: false,
      },
    }

    entry.stand.applicationCount += 1
    entry.items.push(...fertilizers.map(toNitrogenItem))
    // Dusíkaté hnojivo bez doloženého přívodu znamená, že součet je neúplný
    entry.stand.hasMissingNitrogen ||= fertilizers.some(
      (item: any) => item.n_kg_ha === null && item.nitrogen_group !== 'bez_dusiku'
    )

    // Podzimní hnojení k osevu proběhlo v roce před sklizní
    if (Number(application.application_date.slice(0, 4)) === stand.season - 1) {
      entry.autumnItems.push(...fertilizers.map(toNitrogenItem))
    }

    byStand.set(stand.id, entry)
  }

  const stands: CropStandBalance[] = []
  let overLimitCount = 0
  let unverifiableCount = 0
  let withoutLimitCount = 0

  for (const entry of byStand.values()) {
    const supply = sumNitrogen(entry.items)
    const limitKey = entry.cropId !== null ? cropKeys.get(entry.cropId) ?? null : null
    const assessment = limitKey
      ? assessCropLimit(cropLimitCandidates(catalog.cropLimits, limitKey), entry.stand.yieldLevel)
      : null

    let limitStatus: CropStandBalance['limitStatus']
    if (!assessment) {
      limitStatus = 'none'
      withoutLimitCount += 1
    } else if (
      supply.mineralKgHa > assessment.maxLimitKgNHa ||
      supply.totalKgHa > assessment.maxLimitKgNHa
    ) {
      // Nad nejvyšším z limitů, které mohou platit – překročení bez ohledu na zařazení
      limitStatus = 'over'
      overLimitCount += 1
    } else if (!assessment.certain && supply.totalKgHa > assessment.minLimitKgNHa) {
      limitStatus = 'unverifiable'
      unverifiableCount += 1
    } else {
      limitStatus = 'ok'
    }

    stands.push({
      ...entry.stand,
      supply,
      autumnSupply: sumNitrogen(entry.autumnItems),
      limit: assessment?.certain ?? null,
      limitRange:
        assessment && !assessment.certain
          ? {
              minKgNHa: assessment.minLimitKgNHa,
              maxKgNHa: assessment.maxLimitKgNHa,
              uncertainty: assessment.uncertainty,
            }
          : null,
      usage: assessment?.certain ? supply.totalKgHa / assessment.certain.limitKgNHa : null,
      limitStatus,
    })
  }

  const statusOrder: Record<CropStandBalance['limitStatus'], number> = {
    over: 3,
    unverifiable: 2,
    ok: 1,
    none: 0,
  }
  stands.sort(
    (a, b) =>
      statusOrder[b.limitStatus] - statusOrder[a.limitStatus] ||
      (b.usage ?? -1) - (a.usage ?? -1) ||
      b.supply.totalKgHa - a.supply.totalKgHa ||
      a.parcelName.localeCompare(b.parcelName, 'cs')
  )

  const farmArea = ((blocks ?? []) as any[]).reduce((sum, block) => sum + Number(block.area ?? 0), 0)
  const nvzArea = ((blocks ?? []) as any[])
    .filter((block) => block.nitrate_vulnerable_zone)
    .reduce((sum, block) => sum + Number(block.area ?? 0), 0)

  return {
    season: selectedSeason,
    seasons,
    stands,
    farm: {
      farmArea,
      nvzArea,
      livestockNitrogenKg,
      livestockPerHectare: farmArea > 0 ? livestockNitrogenKg / farmArea : 0,
      limitKgNHa: LIVESTOCK_NITROGEN_LIMIT_KG_HA,
    },
    overLimitCount,
    unverifiableCount,
    withoutLimitCount,
  }
}

function toNitrogenItem(item: any): NitrogenItem {
  return {
    nitrogenGroup: item.nitrogen_group,
    isLivestockManure: item.is_livestock_manure ?? false,
    nKgHa: item.n_kg_ha !== null ? Number(item.n_kg_ha) : null,
  }
}

/** Napárování číselníku plodin na limity přílohy 3. */
async function loadCropLimitKeys(supabase: Client): Promise<Map<number, string>> {
  const { data } = await supabase
    .from('crops')
    .select('id, nitrate_limit_key')
    .not('nitrate_limit_key', 'is', null)

  return new Map((data ?? []).map((row: any) => [row.id as number, row.nitrate_limit_key as string]))
}
