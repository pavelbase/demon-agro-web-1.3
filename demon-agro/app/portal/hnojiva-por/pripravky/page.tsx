import { SprayCan } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { searchPorProducts, getPorRegistryInfo } from '@/lib/database/por-queries'
import { PorSearchFilters } from '@/components/portal/PorSearchFilters'
import { PorProductsTable } from '@/components/portal/PorProductsTable'
import { POR_PAGE_SIZE } from '@/lib/constants/por'

interface PripravkyPageProps {
  searchParams?: {
    q?: string
    funkce?: string
    plodina?: string
    platne?: string
    eko?: string
    strana?: string
  }
}

/**
 * Katalog přípravků na ochranu rostlin (služba: Hnojiva a POR)
 *
 * Vyhledávání nad registrem ÚKZÚZ (tabulky por_*). Filtry jsou v URL, samotné
 * hledání běží v databázi, takže se do prohlížeče posílá vždy jen jedna
 * stránka výsledků – registr má téměř 6 000 přípravků.
 */
export default async function PripravkyPage({ searchParams }: PripravkyPageProps) {
  await requireAuth()

  const query = searchParams?.q ?? ''
  const biologicalFunction = searchParams?.funkce ?? ''
  const crop = searchParams?.plodina ?? ''
  const onlyAuthorized = searchParams?.platne !== '0'
  const organicOnly = searchParams?.eko === '1'
  const page = Math.max(1, parseInt(searchParams?.strana ?? '1', 10) || 1)

  const [{ products, total, pageCount }, registryInfo] = await Promise.all([
    searchPorProducts({
      query,
      biologicalFunction,
      crop,
      onlyAuthorized,
      organicOnly,
      page,
    }),
    getPorRegistryInfo(),
  ])

  const baseParams = new URLSearchParams()
  if (query) baseParams.set('q', query)
  if (biologicalFunction) baseParams.set('funkce', biologicalFunction)
  if (crop) baseParams.set('plodina', crop)
  if (!onlyAuthorized) baseParams.set('platne', '0')
  if (organicOnly) baseParams.set('eko', '1')

  const rangeFrom = total === 0 ? 0 : (page - 1) * POR_PAGE_SIZE + 1
  const rangeTo = Math.min(page * POR_PAGE_SIZE, total)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <SprayCan className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Katalog přípravků</h1>
          <p className="text-gray-600 mt-1">
            Registr přípravků na ochranu rostlin ÚKZÚZ – {registryInfo.authorizedCount.toLocaleString('cs-CZ')}{' '}
            přípravků s platnou registrací z celkem {registryInfo.totalCount.toLocaleString('cs-CZ')}
            {registryInfo.exportedOn && (
              <>
                {' '}
                (stav registru k{' '}
                {new Date(registryInfo.exportedOn).toLocaleDateString('cs-CZ')})
              </>
            )}
          </p>
        </div>
      </div>

      <PorSearchFilters
        query={query}
        biologicalFunction={biologicalFunction}
        crop={crop}
        onlyAuthorized={onlyAuthorized}
        organicOnly={organicOnly}
      />

      {total > 0 && (
        <p className="mb-3 text-sm text-gray-600">
          Zobrazeno {rangeFrom}–{rangeTo} z {total.toLocaleString('cs-CZ')} přípravků
        </p>
      )}

      <PorProductsTable
        products={products}
        page={page}
        pageCount={pageCount}
        baseQuery={baseParams.toString()}
      />
    </div>
  )
}
