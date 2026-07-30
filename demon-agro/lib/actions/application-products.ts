'use server'

import { createClient } from '@/lib/supabase/server'
import {
  loadCropCatalog,
  loadPorRegistryForChecks,
} from '@/lib/database/application-check-data'
import {
  loadFertilizerNutrients,
  resolveNutrientContent,
} from '@/lib/database/fertilizer-nutrient-data'
import { findUsagesForCrop } from '@/lib/utils/application-checks'
import type { FertilizerNutrientContent } from '@/lib/utils/fertilizer-nutrients'
import type { ApplicationItemKind } from '@/lib/types/database'

/**
 * Vyhledávání produktů do evidence a nápověda z registru
 *
 * Formulář evidence potřebuje dvě věci: najít hnojivo nebo přípravek v registru
 * a hned zobrazit, co registr pro zvolenou plodinu povoluje (cílové organismy,
 * rozmezí dávek, ochrannou lhůtu). Uživatel tak vidí omezení už při zápisu,
 * ne až po uložení.
 */

export interface ProductSearchResult {
  kind: ApplicationItemKind
  name: string
  porItemId: number | null
  fertEvidenceNumber: string | null
  /** Doplňující popis do nabídky – funkce přípravku nebo typ hnojiva */
  description: string | null
  isValid: boolean
  validUntil: string | null
  /** Obsah živin z číselníku hnojiv – slouží k dopočtu přívodu N, P₂O₅ a K₂O */
  nutrients: FertilizerNutrientContent | null
}

export async function searchApplicationProducts(query: string): Promise<ProductSearchResult[]> {
  const needle = query.trim()
  if (needle.length < 2) return []

  const supabase = await createClient()
  const pattern = `%${needle}%`

  const [por, fert, normative] = await Promise.all([
    supabase
      .from('por_products')
      .select('item_id, name, biological_function, is_authorized, valid_until, use_until')
      .ilike('name', pattern)
      .order('is_authorized', { ascending: false })
      .order('name')
      .limit(12),
    supabase
      .from('fert_products')
      .select('evidence_number, name, product_kind, product_type, is_valid, valid_until')
      .ilike('name', pattern)
      .eq('is_latest', true)
      .order('is_valid', { ascending: false })
      .order('name')
      .limit(12),
    // Normativy statkových hnojiv a rostlinných zbytků nejsou v registru,
    // do evidence se ale zapisují stejně jako kupovaná hnojiva
    supabase
      .from('fert_nutrients')
      .select('name, product_kind, nitrogen_category')
      .eq('is_normative', true)
      .ilike('name', pattern)
      .order('name')
      .limit(8),
  ])

  const results: ProductSearchResult[] = []

  for (const product of por.data ?? []) {
    const isAdjuvant = /adjuvant|pomocn/i.test(product.biological_function ?? '')
    results.push({
      kind: isAdjuvant ? 'pomocna' : 'por',
      name: product.name,
      porItemId: product.item_id,
      fertEvidenceNumber: null,
      description: product.biological_function,
      isValid: product.is_authorized ?? false,
      validUntil: product.use_until ?? product.valid_until,
      nutrients: null,
    })
  }

  const fertilizers = [...(fert.data ?? []), ...(normative.data ?? [])]

  // Obsahy živin pro nalezená hnojiva jedním dotazem
  const lookup = await loadFertilizerNutrients(supabase, {
    evidenceNumbers: (fert.data ?? []).map((product) => product.evidence_number),
    names: fertilizers.map((product) => product.name),
  })

  for (const product of fert.data ?? []) {
    results.push({
      kind: /pomocn/i.test(product.product_kind ?? '') ? 'pomocna' : 'hnojivo',
      name: product.name,
      porItemId: null,
      fertEvidenceNumber: product.evidence_number,
      description: [product.product_type, product.product_kind].filter(Boolean).join(' · ') || null,
      isValid: product.is_valid ?? false,
      validUntil: product.valid_until,
      nutrients: resolveNutrientContent(lookup, {
        fertEvidenceNumber: product.evidence_number,
        productName: product.name,
      }),
    })
  }

  for (const product of normative.data ?? []) {
    // Statková hnojiva a rostlinné zbytky vazbu na registr nemají
    results.push({
      kind: 'hnojivo',
      name: product.name,
      porItemId: null,
      fertEvidenceNumber: null,
      description: ['normativ', product.product_kind, product.nitrogen_category]
        .filter(Boolean)
        .join(' · '),
      isValid: true,
      validUntil: null,
      nutrients: resolveNutrientContent(lookup, { productName: product.name }),
    })
  }

  // Přesnější shody na začátku názvu jako první
  const lower = needle.toLowerCase()
  return results
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(lower) ? 0 : 1
      const bStarts = b.name.toLowerCase().startsWith(lower) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      if (a.isValid !== b.isValid) return a.isValid ? -1 : 1
      return a.name.localeCompare(b.name, 'cs')
    })
    .slice(0, 15)
}

export interface UsageHint {
  /** Registrovaná použití pro zvolenou plodinu */
  usages: {
    pest: string | null
    doseMin: number | null
    doseMax: number | null
    unit: string | null
    protectionPeriodDays: number | null
  }[]
  /** Plodina není v registrovaném použití přípravku */
  cropNotRegistered: boolean
  /** Plodinu nelze porovnat (není v číselníku nebo je bez plodiny) */
  cropNotComparable: boolean
  registeredCrops: string[]
  validUntil: string | null
  useUntil: string | null
  beeRisk: boolean
  waterBufferRestriction: boolean
}

/** Co registr povoluje pro daný přípravek a plodinu. */
export async function getUsageHint(porItemId: number, cropName: string | null): Promise<UsageHint> {
  const supabase = await createClient()

  const registry = await loadPorRegistryForChecks(supabase, [porItemId])
  const product = registry[porItemId]

  const empty: UsageHint = {
    usages: [],
    cropNotRegistered: false,
    cropNotComparable: true,
    registeredCrops: [],
    validUntil: null,
    useUntil: null,
    beeRisk: false,
    waterBufferRestriction: false,
  }

  if (!product) return empty

  const base: UsageHint = {
    ...empty,
    registeredCrops: Array.from(new Set(product.usages.map((usage) => usage.crop))).slice(0, 12),
    validUntil: product.validUntil,
    useUntil: product.useUntil,
    beeRisk: product.beeRisk,
    waterBufferRestriction: product.waterBufferRestriction,
  }

  if (!cropName) return base

  const catalog = await loadCropCatalog(supabase)
  const crop = catalog.get(cropName.toLowerCase())

  if (!crop || crop.registryAliases.length === 0) return base

  const usages = findUsagesForCrop(product, crop)

  return {
    ...base,
    cropNotComparable: false,
    cropNotRegistered: usages.length === 0 && product.usages.length > 0,
    usages: usages.map((usage) => ({
      pest: usage.pest,
      doseMin: usage.doseMin,
      doseMax: usage.doseMax,
      unit: usage.unit,
      protectionPeriodDays: usage.protectionPeriodDays,
    })),
  }
}
