/**
 * Databázové dotazy nad registrem přípravků na ochranu rostlin (POR)
 *
 * Zdrojem dat jsou tabulky por_*, které se plní importem oficiálního exportu
 * ÚKZÚZ (scripts/import-por-registry.ts). Data jsou pouze pro čtení.
 */

import { createClient } from '@/lib/supabase/server'
import { POR_PAGE_SIZE } from '@/lib/constants/por'
import type {
  PorProduct,
  PorActiveSubstance,
  PorUsage,
  PorDosage,
  PorProductAttribute,
  PorDecision,
  PorPest,
  PorCrop,
  PorProductSearchResult,
  PorSearchFilters,
} from '@/lib/types/database'

export interface PorSearchResponse {
  products: PorProductSearchResult[]
  total: number
  page: number
  pageCount: number
}

/**
 * Vyhledá přípravky podle názvu, registračního čísla nebo účinné látky
 * s možností filtrovat biologickou funkci, plodinu a platnost registrace.
 *
 * Vyhledávání běží v databázové funkci search_por_products, která využívá
 * trigramové indexy a vrací i celkový počet shod pro stránkování.
 */
export async function searchPorProducts(
  filters: PorSearchFilters
): Promise<PorSearchResponse> {
  const supabase = await createClient()
  const page = Math.max(1, filters.page ?? 1)

  const { data, error } = await supabase.rpc('search_por_products', {
    p_query: filters.query?.trim() || null,
    p_function: filters.biologicalFunction?.trim() || null,
    p_crop: filters.crop?.trim() || null,
    p_only_authorized: filters.onlyAuthorized ?? true,
    p_organic_only: filters.organicOnly ?? false,
    p_limit: POR_PAGE_SIZE,
    p_offset: (page - 1) * POR_PAGE_SIZE,
  })

  if (error) {
    console.error('Chyba při vyhledávání přípravků POR:', error)
    return { products: [], total: 0, page, pageCount: 0 }
  }

  const products = (data ?? []) as PorProductSearchResult[]
  const total = products[0]?.total_count ?? 0

  return {
    products,
    total,
    page,
    pageCount: Math.ceil(total / POR_PAGE_SIZE),
  }
}

export interface PorProductDetail {
  product: PorProduct
  /** Id posledního (aktuálního) rozhodnutí – navazující údaje se filtrují podle něj */
  currentDecisionId: number | null
  substances: PorActiveSubstance[]
  usages: PorUsage[]
  dosages: PorDosage[]
  attributes: PorProductAttribute[]
  decisions: PorDecision[]
  pests: PorPest[]
  crops: PorCrop[]
}

/**
 * Vrátí přípravek se všemi navazujícími údaji z registru.
 *
 * Registr obsahuje navazující řádky pro každé rozhodnutí zvlášť, takže
 * u přípravků s delší historií registrace by se použití i klasifikace
 * několikrát opakovaly. Proto se přednostně zobrazují údaje k poslednímu
 * rozhodnutí; pokud u něj chybí, použijí se všechny a odstraní se duplicity.
 */
export async function getPorProductDetail(
  itemId: number
): Promise<PorProductDetail | null> {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('por_products')
    .select('*')
    .eq('item_id', itemId)
    .single()

  if (error || !product) {
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání přípravku POR:', error)
    }
    return null
  }

  const { data: decisions } = await supabase
    .from('por_decisions')
    .select('*')
    .eq('product_item_id', itemId)
    .order('valid_from', { ascending: false, nullsFirst: false })
    .order('decision_id', { ascending: false })

  const allDecisions = (decisions ?? []) as PorDecision[]
  const currentDecisionId = allDecisions[0]?.decision_id ?? null

  const [substances, usages, dosages, attributes, pests, crops] = await Promise.all([
    fetchForDecision<PorActiveSubstance>(supabase, 'por_active_substances', itemId, currentDecisionId, 'name_cs'),
    fetchForDecision<PorUsage>(supabase, 'por_usages', itemId, currentDecisionId, 'crop'),
    fetchForDecision<PorDosage>(supabase, 'por_dosages', itemId, currentDecisionId, 'crop'),
    fetchForDecision<PorProductAttribute>(supabase, 'por_product_attributes', itemId, currentDecisionId, 'attribute'),
    fetchForDecision<PorPest>(supabase, 'por_pests', itemId, currentDecisionId, 'pest_name'),
    fetchForDecision<PorCrop>(supabase, 'por_crops', itemId, currentDecisionId, 'crop_name'),
  ])

  return {
    product: product as PorProduct,
    currentDecisionId,
    substances: dedupe(substances, (s) => `${s.name_cs}|${s.amount_text ?? ''}|${s.unit ?? ''}`),
    usages: dedupe(usages, (u) => `${u.crop ?? ''}|${u.pest ?? ''}|${u.dose_text ?? ''}|${u.application_notes ?? ''}`),
    dosages: dedupe(dosages, (d) => `${d.crop ?? ''}|${d.pest ?? ''}|${d.dose_full_text ?? d.dose_text ?? ''}`),
    attributes: dedupe(attributes, (a) => `${a.attribute}|${a.abbreviation ?? ''}|${a.meaning ?? ''}`),
    decisions: allDecisions,
    pests: dedupe(pests, (p) => `${p.pest_name ?? ''}|${p.ppp_code ?? ''}`),
    crops: dedupe(crops, (c) => `${c.crop_name ?? ''}|${c.crop_code ?? ''}`),
  }
}

/**
 * Načte navazující řádky k poslednímu rozhodnutí. Když u něj žádné nejsou
 * (rozhodnutí měnilo např. jen etiketu), vrátí řádky ze všech rozhodnutí.
 */
async function fetchForDecision<T>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  itemId: number,
  decisionId: number | null,
  orderBy: string
): Promise<T[]> {
  if (decisionId !== null) {
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('product_item_id', itemId)
      .eq('decision_id', decisionId)
      .order(orderBy, { nullsFirst: false })

    if (data && data.length > 0) return data as T[]
  }

  const { data } = await supabase
    .from(table)
    .select('*')
    .eq('product_item_id', itemId)
    .order(orderBy, { nullsFirst: false })

  return (data ?? []) as T[]
}

function dedupe<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    const k = key(row)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Počet přípravků v registru a datum posledního importu – pro hlavičku katalogu */
export async function getPorRegistryInfo(): Promise<{
  authorizedCount: number
  totalCount: number
  exportedOn: string | null
}> {
  const supabase = await createClient()

  const [{ count: totalCount }, { count: authorizedCount }, { data: lastImport }] =
    await Promise.all([
      supabase.from('por_products').select('*', { count: 'exact', head: true }),
      supabase
        .from('por_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_authorized', true),
      supabase
        .from('por_imports')
        .select('exported_on')
        .order('imported_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  return {
    authorizedCount: authorizedCount ?? 0,
    totalCount: totalCount ?? 0,
    exportedOn: lastImport?.exported_on ?? null,
  }
}
