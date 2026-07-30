/**
 * Načtení číselníků akčního programu nitrátové směrnice
 *
 * Výklad pravidel je v lib/utils/nitrate-directive.ts, tenhle modul k němu jen
 * načte hodnoty z přílohy 2 a 3 NV 262/2012. Číselníky jsou malé (do dvou set
 * řádků) a společné pro všechny uživatele, proto se načítají celé jedním
 * dotazem na tabulku a drží se po dobu požadavku.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ApplicationZone,
  BanPeriod,
  BpejRule,
  CropNitrogenLimit,
  InfiltrationRisk,
  NitrogenFertilizerGroup,
  PostHarvestLimit,
  PostHarvestMethod,
  YieldLevel,
} from '@/lib/utils/nitrate-directive'

type Client = SupabaseClient<any, 'public', any>

export interface NitrateDirectiveCatalog {
  banPeriods: BanPeriod[]
  postHarvestMethods: Map<number, PostHarvestMethod>
  postHarvestLimits: PostHarvestLimit[]
  cropLimits: Map<string, CropNitrogenLimit>
}

export const EMPTY_NITRATE_CATALOG: NitrateDirectiveCatalog = {
  banPeriods: [],
  postHarvestMethods: new Map(),
  postHarvestLimits: [],
  cropLimits: new Map(),
}

function toBanPeriod(row: any): BanPeriod {
  return {
    id: row.id,
    climaticRegionFrom: row.climatic_region_from,
    climaticRegionTo: row.climatic_region_to,
    fertilizerGroup: row.fertilizer_group as NitrogenFertilizerGroup,
    variant: row.variant,
    banFromMonth: row.ban_from_month,
    banFromDay: row.ban_from_day,
    banToMonth: row.ban_to_month,
    banToDay: row.ban_to_day,
    isConditional: row.is_conditional,
    note: row.note,
  }
}

function toBpejRule(row: any): BpejRule {
  return {
    id: row.id,
    ruleKind: row.rule_kind,
    result: row.result,
    climaticRegions: (row.climatic_regions ?? []).map(Number),
    hpjCodes: (row.hpj_codes ?? []).map(Number),
    detailCodes: row.detail_codes ?? null,
    slopeCondition: row.slope_condition,
    note: row.note,
  }
}

function toPostHarvestLimit(row: any): PostHarvestLimit {
  return {
    id: row.id,
    methodNumber: row.method_number,
    applicationZone: row.application_zone as ApplicationZone,
    infiltrationRisk: row.infiltration_risk as InfiltrationRisk | null,
    fertilizerGroup: row.fertilizer_group,
    limitKgNHa: Number(row.limit_kg_n_ha),
    note: row.note,
  }
}

/** Hladiny se skládají z dvojic výnos–limit; prázdné se vynechají. */
function toCropLimit(row: any): CropNitrogenLimit {
  const levels: CropNitrogenLimit['levels'] = []

  const push = (
    level: YieldLevel,
    limit: unknown,
    referenceYield: unknown,
    yieldFrom: unknown,
    yieldTo: unknown
  ) => {
    if (limit === null || limit === undefined) return
    levels.push({
      level,
      limitKgNHa: Number(limit),
      referenceYield: referenceYield !== null && referenceYield !== undefined ? Number(referenceYield) : null,
      yieldFrom: yieldFrom !== null && yieldFrom !== undefined ? Number(yieldFrom) : null,
      yieldTo: yieldTo !== null && yieldTo !== undefined ? Number(yieldTo) : null,
    })
  }

  // Limit v hladině 1 se vztahuje k uvedenému výnosu, v hladině 2 k hornímu
  // okraji rozmezí a v hladině 3 k výnosu o 30 % vyššímu (poznámka pod tab. 4)
  push(1, row.level1_limit_kg_n_ha, row.level1_yield, null, row.level1_yield)
  push(2, row.level2_limit_kg_n_ha, row.level2_yield_to, row.level2_yield_from, row.level2_yield_to)
  push(
    3,
    row.level3_limit_kg_n_ha,
    row.level3_yield_over !== null ? Number(row.level3_yield_over) * 1.3 : null,
    row.level3_yield_over,
    null
  )

  return {
    cropKey: row.crop_key,
    cropLabel: row.crop_label,
    sourceTable: row.source_table,
    yieldUnit: row.yield_unit,
    levels,
    flatLimitKgNHa: row.flat_limit_kg_n_ha !== null ? Number(row.flat_limit_kg_n_ha) : null,
    perCalendarYear: row.per_calendar_year,
    note: row.note,
  }
}

/**
 * Načte číselníky nitrátové směrnice.
 *
 * Volá se jednou za kontrolní běh nebo render přehledu; hodnoty se mění jen
 * novelou předpisu, ale drží se v paměti volajícího, ne v globální cache –
 * modul používají i dávkové skripty mimo běh Next.js.
 */
export async function loadNitrateDirectiveCatalog(
  supabase: Client
): Promise<NitrateDirectiveCatalog> {
  const [ban, methods, limits, crops] = await Promise.all([
    supabase.from('nitrate_ban_periods').select('*').order('id'),
    supabase.from('nitrate_post_harvest_methods').select('*').order('method_number'),
    supabase.from('nitrate_post_harvest_limits').select('*').order('id'),
    supabase.from('nitrate_crop_limits').select('*'),
  ])

  const failed = [ban, methods, limits, crops].find((result) => result.error)
  if (failed?.error) {
    console.error('Chyba při načítání číselníků nitrátové směrnice:', failed.error)
    return EMPTY_NITRATE_CATALOG
  }

  return {
    banPeriods: (ban.data ?? []).map(toBanPeriod),
    postHarvestMethods: new Map(
      (methods.data ?? []).map((row: any) => [
        row.method_number,
        { methodNumber: row.method_number, label: row.label, note: row.note },
      ])
    ),
    postHarvestLimits: (limits.data ?? []).map(toPostHarvestLimit),
    cropLimits: new Map((crops.data ?? []).map((row: any) => [row.crop_key, toCropLimit(row)])),
  }
}

/**
 * Pravidla zařazení BPEJ.
 *
 * Načítají se samostatně – kontroly pracují se zařazením už uloženým u DPB,
 * pravidla potřebuje jen jeho odvození při zadání kódu BPEJ.
 */
export async function loadBpejRules(supabase: Client): Promise<BpejRule[]> {
  const { data, error } = await supabase.from('nitrate_bpej_rules').select('*').order('id')

  if (error) {
    console.error('Chyba při načítání zařazení BPEJ:', error)
    return []
  }

  return (data ?? []).map(toBpejRule)
}
