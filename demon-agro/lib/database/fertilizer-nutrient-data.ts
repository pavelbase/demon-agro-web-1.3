/**
 * Načtení obsahů živin z číselníku hnojiv
 *
 * Hnojivo v evidenci se pozná dvěma způsoby: podle evidenčního čísla z registru,
 * nebo – u normativů statkových hnojiv a u záznamů z importů – podle názvu.
 * Modul načte obsahy pro celou dávku položek najednou a nabídne párování,
 * které zkusí obojí.
 *
 * Pod jedním názvem vede číselník i více registrací téhož hnojiva (obnovy,
 * různí výrobci) a jejich údaje se v úplnosti liší – u kapalných hnojiv má
 * část záznamů zástupnou měrnou hmotnost 1 kg/l. Lookup proto drží všechny
 * varianty a vybírá se až podle jednotky, ve které je dávka zapsaná.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  isPlaceholderDensity,
  isVolumetricUnit,
  normalizeFertilizerName,
  type FertilizerNutrientContent,
} from '@/lib/utils/fertilizer-nutrients'

type Client = SupabaseClient<any, 'public', any>

const COLUMNS =
  'catalog_id, evidence_number, name, name_key, unit_type, is_normative, is_excrement, is_organic, nitrogen_category, product_kind, n_percent, p2o5_percent, k2o_percent, cao_percent, mgo_percent, s_percent, density_kg_l, valid_from'

export interface FertilizerCatalogRow {
  /** Identifikátor hnojiva v číselníku ÚKZÚZ – posílá se v exportu do EPH */
  catalog_id: number
  evidence_number: string | null
  name: string
  name_key: string
  unit_type: string | null
  is_normative: boolean
  is_excrement: boolean
  is_organic: boolean
  nitrogen_category: string | null
  product_kind: string | null
  n_percent: number | null
  p2o5_percent: number | null
  k2o_percent: number | null
  cao_percent: number | null
  mgo_percent: number | null
  s_percent: number | null
  density_kg_l: number | null
  valid_from: string | null
}

export interface FertilizerNutrientLookup {
  byEvidence: Map<string, FertilizerCatalogRow>
  byNameKey: Map<string, FertilizerCatalogRow[]>
}

function toContent(row: FertilizerCatalogRow): FertilizerNutrientContent {
  return {
    name: row.name,
    evidenceNumber: row.evidence_number,
    isNormative: row.is_normative,
    unitType: row.unit_type === 'H' || row.unit_type === 'O' ? row.unit_type : null,
    densityKgL: row.density_kg_l !== null ? Number(row.density_kg_l) : null,
    nPercent: row.n_percent !== null ? Number(row.n_percent) : null,
    p2o5Percent: row.p2o5_percent !== null ? Number(row.p2o5_percent) : null,
    k2oPercent: row.k2o_percent !== null ? Number(row.k2o_percent) : null,
    nitrogenCategory: row.nitrogen_category,
    productKind: row.product_kind,
    isExcrement: row.is_excrement ?? false,
  }
}

/** Dotazy se dělí na dávky, aby seznam hodnot nepřetáhl délku URL. */
async function fetchInChunks(
  supabase: Client,
  column: 'evidence_number' | 'name_key',
  values: string[]
): Promise<FertilizerCatalogRow[]> {
  const unique = Array.from(new Set(values.filter((value) => value.length > 0)))
  if (unique.length === 0) return []

  const rows: FertilizerCatalogRow[] = []
  const chunkSize = 150

  for (let i = 0; i < unique.length; i += chunkSize) {
    const { data, error } = await supabase
      .from('fert_nutrients')
      .select(COLUMNS)
      .in(column, unique.slice(i, i + chunkSize))

    if (error) {
      console.error('Chyba při načítání obsahů živin:', error)
      continue
    }

    rows.push(...((data ?? []) as unknown as FertilizerCatalogRow[]))
  }

  return rows
}

export async function loadFertilizerNutrients(
  supabase: Client,
  keys: { evidenceNumbers?: (string | null | undefined)[]; names?: (string | null | undefined)[] }
): Promise<FertilizerNutrientLookup> {
  const evidenceNumbers = (keys.evidenceNumbers ?? []).filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  )
  const nameKeys = (keys.names ?? [])
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map(normalizeFertilizerName)

  const [byEvidenceRows, byNameRows] = await Promise.all([
    fetchInChunks(supabase, 'evidence_number', evidenceNumbers),
    fetchInChunks(supabase, 'name_key', nameKeys),
  ])

  const byEvidence = new Map<string, FertilizerCatalogRow>()
  for (const row of byEvidenceRows) {
    if (row.evidence_number) byEvidence.set(row.evidence_number, row)
  }

  const byNameKey = new Map<string, FertilizerCatalogRow[]>()
  const seen = new Set<string>()

  for (const row of [...byEvidenceRows, ...byNameRows]) {
    const identity = `${row.evidence_number ?? ''}|${row.name}|${row.valid_from ?? ''}`
    if (seen.has(identity)) continue
    seen.add(identity)

    const list = byNameKey.get(row.name_key) ?? []
    list.push(row)
    byNameKey.set(row.name_key, list)
  }

  return { byEvidence, byNameKey }
}

function declaresNutrients(row: FertilizerCatalogRow): boolean {
  return row.n_percent !== null || row.p2o5_percent !== null || row.k2o_percent !== null
}

/** Zástupnou měrnou hmotnost má u téhož hnojiva často jiná registrace změřenou. */
function densityIsUsable(row: FertilizerCatalogRow): boolean {
  return !isPlaceholderDensity(row.density_kg_l)
}

/**
 * Obsah živin pro položku evidence.
 *
 * Vazba na registraci je nejpřesnější, ale některé registrace obsah živin
 * neuvádějí a u dávky v litrech je bez skutečné měrné hmotnosti přívod dusíku
 * podhodnocený. Přednost proto dostane úplnější záznam téhož hnojiva.
 */
export function resolveCatalogRow(
  lookup: FertilizerNutrientLookup,
  item: { fertEvidenceNumber?: string | null; productName: string; unit?: string }
): FertilizerCatalogRow | null {
  const byEvidence = item.fertEvidenceNumber
    ? lookup.byEvidence.get(item.fertEvidenceNumber) ?? null
    : null
  const variants = lookup.byNameKey.get(normalizeFertilizerName(item.productName)) ?? []

  const candidates = byEvidence ? [byEvidence, ...variants] : variants
  if (candidates.length === 0) return null

  // Bez známé jednotky se řídíme tím, jak se hnojivo obvykle dávkuje
  const needsDensity = item.unit
    ? isVolumetricUnit(item.unit)
    : candidates.some((row) => row.unit_type === 'O')

  const score = (row: FertilizerCatalogRow): number =>
    (declaresNutrients(row) ? 8 : 0) +
    (!needsDensity || densityIsUsable(row) ? 4 : 0) +
    (byEvidence && row.evidence_number === byEvidence.evidence_number ? 2 : 0) +
    (row.is_normative ? 1 : 0)

  return candidates.reduce((current, candidate) => {
    const difference = score(candidate) - score(current)
    if (difference !== 0) return difference > 0 ? candidate : current
    return (candidate.valid_from ?? '') > (current.valid_from ?? '') ? candidate : current
  })
}

export function resolveNutrientContent(
  lookup: FertilizerNutrientLookup,
  item: { fertEvidenceNumber?: string | null; productName: string; unit?: string }
): FertilizerNutrientContent | null {
  const row = resolveCatalogRow(lookup, item)
  return row ? toContent(row) : null
}
