import Link from 'next/link'
import { ChevronLeft, ChevronRight, Leaf, Sprout, History } from 'lucide-react'
import { fertKindLabel } from '@/lib/constants/fertilizers'
import type { FertProductSearchResult } from '@/lib/types/database'

interface FertProductsTableProps {
  products: FertProductSearchResult[]
  page: number
  pageCount: number
  /** Query string s aktivními filtry (bez parametru strana) pro odkazy stránkování */
  baseQuery: string
}

function formatDate(value: string | null): string {
  if (!value) return '–'
  return new Date(value).toLocaleDateString('cs-CZ')
}

function isExpiringSoon(validUntil: string | null): boolean {
  if (!validUntil) return false
  const end = new Date(validUntil).getTime()
  const now = Date.now()
  return end > now && end - now < 1000 * 60 * 60 * 24 * 180
}

/**
 * Výsledky vyhledávání hnojiv.
 *
 * Renderuje se na serveru – stránkování i řazení řeší databázová funkce,
 * takže se do prohlížeče posílá jen aktuální stránka výsledků.
 */
export function FertProductsTable({
  products,
  page,
  pageCount,
  baseQuery,
}: FertProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Sprout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Žádné hnojivo neodpovídá zadání
        </h2>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Zkuste zadat jen část názvu nebo jméno výrobce, případně rozšířit hledání
          vypnutím filtru platných výrobků.
        </p>
      </div>
    )
  }

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams(baseQuery)
    if (targetPage > 1) params.set('strana', String(targetPage))
    const search = params.toString()
    return search ? `/portal/hnojiva-por/hnojiva?${search}` : '/portal/hnojiva-por/hnojiva'
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Hnojivo</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Druh</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategorie N</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Výrobce</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Režim</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                Platnost do
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.evidence_number} className="hover:bg-amber-50/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/portal/hnojiva-por/hnojiva/${encodeURIComponent(product.evidence_number)}`}
                    className="font-semibold text-gray-900 hover:text-amber-700"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                    <span>ev. č. {product.evidence_number}</span>
                    {product.registration_number && <span>reg. č. {product.registration_number}</span>}
                    {!product.is_valid && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        neplatné
                      </span>
                    )}
                    {!product.is_latest && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        starší obnova
                      </span>
                    )}
                    {product.organic_farming && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                        <Leaf className="h-3 w-3" />
                        eko
                      </span>
                    )}
                    {product.versions_count > 1 && (
                      <span
                        className="inline-flex items-center gap-1 text-gray-400"
                        title={`${product.versions_count} záznamů se stejným registračním číslem`}
                      >
                        <History className="h-3 w-3" />
                        {product.versions_count}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-xs">
                  {fertKindLabel(product.product_kind)}
                  {product.product_type && product.product_type !== 'Netypový výrobek' && (
                    <span className="block text-xs text-gray-500">typ {product.product_type}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{product.nitrogen_category || '–'}</td>
                <td className="px-4 py-3 text-gray-600">{product.manufacturer || '–'}</td>
                <td className="px-4 py-3 text-gray-600">{product.regime || '–'}</td>
                <td
                  className={`px-4 py-3 whitespace-nowrap ${
                    isExpiringSoon(product.valid_until)
                      ? 'text-amber-700 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {product.valid_until ? formatDate(product.valid_until) : 'bez omezení'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            Stránka {page} z {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                scroll={false}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Předchozí
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-400 border border-gray-200 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
                Předchozí
              </span>
            )}
            {page < pageCount ? (
              <Link
                href={pageHref(page + 1)}
                scroll={false}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Další
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-400 border border-gray-200 rounded-lg">
                Další
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
