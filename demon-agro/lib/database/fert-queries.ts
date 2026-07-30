/**
 * Databázové dotazy nad registrem hnojiv (ÚKZÚZ)
 *
 * Zdrojem dat je tabulka fert_products, která se plní importem oficiálního
 * exportu registru (scripts/import-fertilizer-registry.ts). Data jsou pouze
 * pro čtení.
 */

import { createClient } from '@/lib/supabase/server'
import { FERT_PAGE_SIZE } from '@/lib/constants/fertilizers'
import type {
  FertNutrient,
  FertProduct,
  FertProductSearchResult,
  FertSearchFilters,
} from '@/lib/types/database'

export interface FertSearchResponse {
  products: FertProductSearchResult[]
  total: number
  page: number
  pageCount: number
}

/**
 * Vyhledá hnojiva podle názvu, evidenčního nebo registračního čísla, výrobce
 * a žadatele s možností filtrovat druh, kategorii dusíku, režim a platnost.
 *
 * Vyhledávání běží v databázové funkci search_fert_products, která využívá
 * trigramové indexy a vrací i celkový počet shod pro stránkování.
 */
export async function searchFertProducts(
  filters: FertSearchFilters
): Promise<FertSearchResponse> {
  const supabase = await createClient()
  const page = Math.max(1, filters.page ?? 1)

  const { data, error } = await supabase.rpc('search_fert_products', {
    p_query: filters.query?.trim() || null,
    p_kind: filters.productKind || null,
    p_nitrogen_category: filters.nitrogenCategory || null,
    p_regime: filters.regime || null,
    p_only_valid: filters.onlyValid ?? true,
    p_only_latest: filters.onlyLatest ?? true,
    p_organic_only: filters.organicOnly ?? false,
    p_limit: FERT_PAGE_SIZE,
    p_offset: (page - 1) * FERT_PAGE_SIZE,
  })

  if (error) {
    console.error('Chyba při vyhledávání hnojiv:', error)
    return { products: [], total: 0, page, pageCount: 0 }
  }

  const products = (data ?? []) as FertProductSearchResult[]
  const total = products[0]?.total_count ?? 0

  return {
    products,
    total,
    page,
    pageCount: Math.ceil(total / FERT_PAGE_SIZE),
  }
}

export interface FertProductDetail {
  product: FertProduct
  /** Obsah živin z číselníku hnojiv – registr ÚKZÚZ ho neuvádí */
  nutrients: FertNutrient | null
  /** Ostatní záznamy se stejným registračním číslem (obnovy registrace), od nejnovějšího */
  history: FertProduct[]
  /** Výrobky stejného žadatele – rychlá orientace v sortimentu */
  relatedByApplicant: FertProduct[]
}

/**
 * Vrátí hnojivo podle evidenčního čísla včetně historie registrace.
 *
 * Obnovy registrace jsou v registru samostatné záznamy se shodným
 * registračním číslem, takže historii dohledáváme přes něj. U ohlášených
 * a uznávaných výrobků registrační číslo chybí a historie je prázdná.
 */
export async function getFertProductDetail(
  evidenceNumber: string
): Promise<FertProductDetail | null> {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('fert_products')
    .select('*')
    .eq('evidence_number', evidenceNumber)
    .single()

  if (error || !product) {
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání hnojiva:', error)
    }
    return null
  }

  const typedProduct = product as FertProduct

  const [nutrientsResult, historyResult, relatedResult] = await Promise.all([
    supabase
      .from('fert_nutrients')
      .select('*')
      .eq('evidence_number', evidenceNumber)
      .limit(1)
      .maybeSingle(),
    typedProduct.registration_number
      ? supabase
          .from('fert_products')
          .select('*')
          .eq('registration_number', typedProduct.registration_number)
          .neq('evidence_number', evidenceNumber)
          .order('valid_from', { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [] as FertProduct[] }),
    typedProduct.applicant
      ? supabase
          .from('fert_products')
          .select('*')
          .eq('applicant', typedProduct.applicant)
          .eq('is_latest', true)
          .eq('is_valid', true)
          .neq('evidence_number', evidenceNumber)
          .order('name')
          .limit(12)
      : Promise.resolve({ data: [] as FertProduct[] }),
  ])

  return {
    product: typedProduct,
    nutrients: (nutrientsResult.data ?? null) as FertNutrient | null,
    history: (historyResult.data ?? []) as FertProduct[],
    relatedByApplicant: (relatedResult.data ?? []) as FertProduct[],
  }
}

/** Počty hnojiv v registru a datum posledního importu – pro hlavičku katalogu */
export async function getFertRegistryInfo(): Promise<{
  validCount: number
  totalCount: number
  exportedOn: string | null
}> {
  const supabase = await createClient()

  const [{ count: totalCount }, { count: validCount }, { data: lastImport }] =
    await Promise.all([
      supabase.from('fert_products').select('*', { count: 'exact', head: true }),
      supabase
        .from('fert_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_valid', true)
        .eq('is_latest', true),
      supabase
        .from('fert_imports')
        .select('exported_on')
        .order('imported_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  return {
    validCount: validCount ?? 0,
    totalCount: totalCount ?? 0,
    exportedOn: lastImport?.exported_on ?? null,
  }
}
