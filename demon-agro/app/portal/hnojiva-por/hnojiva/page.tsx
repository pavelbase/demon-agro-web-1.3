import { Sprout } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { searchFertProducts, getFertRegistryInfo } from '@/lib/database/fert-queries'
import { FertSearchFilters } from '@/components/portal/FertSearchFilters'
import { FertProductsTable } from '@/components/portal/FertProductsTable'
import { FERT_PAGE_SIZE } from '@/lib/constants/fertilizers'

interface HnojivaPageProps {
  searchParams?: {
    q?: string
    druh?: string
    dusik?: string
    rezim?: string
    platne?: string
    historie?: string
    eko?: string
    strana?: string
  }
}

/**
 * Katalog hnojiv (služba: Hnojiva a POR)
 *
 * Vyhledávání nad registrem hnojiv ÚKZÚZ (tabulka fert_products). Filtry jsou
 * v URL, samotné hledání běží v databázi, takže se do prohlížeče posílá vždy
 * jen jedna stránka výsledků – registr má přes 8 000 záznamů.
 */
export default async function HnojivaPage({ searchParams }: HnojivaPageProps) {
  await requireAuth()

  const query = searchParams?.q ?? ''
  const productKind = searchParams?.druh ?? ''
  const nitrogenCategory = searchParams?.dusik ?? ''
  const regime = searchParams?.rezim ?? ''
  const onlyValid = searchParams?.platne !== '0'
  const onlyLatest = searchParams?.historie !== '1'
  const organicOnly = searchParams?.eko === '1'
  const page = Math.max(1, parseInt(searchParams?.strana ?? '1', 10) || 1)

  const [{ products, total, pageCount }, registryInfo] = await Promise.all([
    searchFertProducts({
      query,
      productKind,
      nitrogenCategory,
      regime,
      onlyValid,
      onlyLatest,
      organicOnly,
      page,
    }),
    getFertRegistryInfo(),
  ])

  const baseParams = new URLSearchParams()
  if (query) baseParams.set('q', query)
  if (productKind) baseParams.set('druh', productKind)
  if (nitrogenCategory) baseParams.set('dusik', nitrogenCategory)
  if (regime) baseParams.set('rezim', regime)
  if (!onlyValid) baseParams.set('platne', '0')
  if (!onlyLatest) baseParams.set('historie', '1')
  if (organicOnly) baseParams.set('eko', '1')

  const rangeFrom = total === 0 ? 0 : (page - 1) * FERT_PAGE_SIZE + 1
  const rangeTo = Math.min(page * FERT_PAGE_SIZE, total)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Sprout className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Katalog hnojiv</h1>
          <p className="text-gray-600 mt-1">
            Registr hnojiv ÚKZÚZ – {registryInfo.validCount.toLocaleString('cs-CZ')} platných
            výrobků z celkem {registryInfo.totalCount.toLocaleString('cs-CZ')} záznamů
            {registryInfo.exportedOn && (
              <>
                {' '}
                (stav registru k {new Date(registryInfo.exportedOn).toLocaleDateString('cs-CZ')})
              </>
            )}
          </p>
        </div>
      </div>

      <FertSearchFilters
        query={query}
        productKind={productKind}
        nitrogenCategory={nitrogenCategory}
        regime={regime}
        onlyValid={onlyValid}
        onlyLatest={onlyLatest}
        organicOnly={organicOnly}
      />

      {total > 0 && (
        <p className="mb-3 text-sm text-gray-600">
          Zobrazeno {rangeFrom}–{rangeTo} z {total.toLocaleString('cs-CZ')} hnojiv
        </p>
      )}

      <FertProductsTable
        products={products}
        page={page}
        pageCount={pageCount}
        baseQuery={baseParams.toString()}
      />
    </div>
  )
}
