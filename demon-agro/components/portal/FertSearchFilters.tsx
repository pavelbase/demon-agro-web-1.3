'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Search, X, Loader2, SlidersHorizontal } from 'lucide-react'
import {
  FERT_PRODUCT_KINDS,
  FERT_NITROGEN_CATEGORIES,
  FERT_REGIMES,
  fertKindLabel,
} from '@/lib/constants/fertilizers'

interface FertSearchFiltersProps {
  query: string
  productKind: string
  nitrogenCategory: string
  regime: string
  onlyValid: boolean
  onlyLatest: boolean
  organicOnly: boolean
}

/**
 * Filtry vyhledávání hnojiv.
 *
 * Stav filtrů je držený v URL, aby výsledky šly odkazovat i obnovit stránku
 * a aby samotné vyhledávání zůstalo na serveru. Textové pole se odesílá
 * se zpožděním, přepínače okamžitě; každá změna vrací stránkování na začátek.
 */
export function FertSearchFilters({
  query,
  productKind,
  nitrogenCategory,
  regime,
  onlyValid,
  onlyLatest,
  organicOnly,
}: FertSearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [queryInput, setQueryInput] = useState(query)

  // Co jsme naposledy poslali do URL. Odpověď serveru na vlastní hledání se
  // nesmí vracet do textového pole – uživatel mezitím píše dál a přepsáním
  // by se ztratily znaky napsané během čekání.
  const submittedQuery = useRef(query)

  // Synchronizace jen při změně URL zvenčí (zpět/vpřed v prohlížeči, odkaz)
  useEffect(() => {
    if (query === submittedQuery.current) return
    submittedQuery.current = query
    setQueryInput(query)
  }, [query])

  const applyFilters = useCallback(
    (next: Partial<FertSearchFiltersProps>) => {
      // Základem je hodnota z pole, ne z URL – změna selectu tak odešle
      // i text, který uživatel právě rozepsal a ještě nebyl odeslán.
      const merged = {
        query: queryInput,
        productKind,
        nitrogenCategory,
        regime,
        onlyValid,
        onlyLatest,
        organicOnly,
        ...next,
      }

      const nextQuery = merged.query.trim()
      submittedQuery.current = nextQuery

      const params = new URLSearchParams()
      if (nextQuery) params.set('q', nextQuery)
      if (merged.productKind) params.set('druh', merged.productKind)
      if (merged.nitrogenCategory) params.set('dusik', merged.nitrogenCategory)
      if (merged.regime) params.set('rezim', merged.regime)
      if (!merged.onlyValid) params.set('platne', '0')
      if (!merged.onlyLatest) params.set('historie', '1')
      if (merged.organicOnly) params.set('eko', '1')

      const search = params.toString()
      startTransition(() => {
        router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
      })
    },
    [
      queryInput,
      productKind,
      nitrogenCategory,
      regime,
      onlyValid,
      onlyLatest,
      organicOnly,
      pathname,
      router,
    ]
  )

  // Textové pole – odeslání až po pauze v psaní. Porovnává se s hodnotou
  // v URL po trimu, aby psaní mezer nespouštělo hledání dokola.
  useEffect(() => {
    if (queryInput.trim() === query) return

    const timeout = setTimeout(() => applyFilters({ query: queryInput }), 400)
    return () => clearTimeout(timeout)
  }, [queryInput, query, applyFilters])

  const resetFilters = () => {
    setQueryInput('')
    applyFilters({
      query: '',
      productKind: '',
      nitrogenCategory: '',
      regime: '',
      onlyValid: true,
      onlyLatest: true,
      organicOnly: false,
    })
  }

  const hasActiveFilters =
    query || productKind || nitrogenCategory || regime || !onlyValid || !onlyLatest || organicOnly

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid gap-3 lg:grid-cols-[2fr_1.5fr_1fr_1fr]">
        {/* Fulltext – název, evidenční/registrační číslo, výrobce, žadatel */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Název, evidenční číslo, výrobce…"
            aria-label="Hledat hnojivo"
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600 animate-spin" />
          )}
        </div>

        {/* Druh */}
        <select
          value={productKind}
          onChange={(e) => applyFilters({ productKind: e.target.value })}
          aria-label="Druh hnojiva"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        >
          <option value="">Všechny druhy</option>
          {FERT_PRODUCT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {fertKindLabel(kind)}
            </option>
          ))}
        </select>

        {/* Kategorie N */}
        <select
          value={nitrogenCategory}
          onChange={(e) => applyFilters({ nitrogenCategory: e.target.value })}
          aria-label="Kategorie dusíku"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        >
          <option value="">Kategorie N: vše</option>
          {FERT_NITROGEN_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Režim */}
        <select
          value={regime}
          onChange={(e) => applyFilters({ regime: e.target.value })}
          aria-label="Režim uvedení na trh"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        >
          <option value="">Všechny režimy</option>
          {FERT_REGIMES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 text-gray-500">
          <SlidersHorizontal className="h-4 w-4" />
          Filtry:
        </span>

        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
          <input
            type="checkbox"
            checked={onlyValid}
            onChange={(e) => applyFilters({ onlyValid: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Jen platné výrobky
        </label>

        <label
          className="flex items-center gap-2 cursor-pointer text-gray-700"
          title="Obnovy registrace jsou v registru samostatné záznamy se stejným registračním číslem"
        >
          <input
            type="checkbox"
            checked={!onlyLatest}
            onChange={(e) => applyFilters({ onlyLatest: !e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Včetně starších obnov registrace
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(e) => applyFilters({ organicOnly: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Pro ekologické zemědělství
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 ml-auto"
          >
            <X className="h-4 w-4" />
            Zrušit filtry
          </button>
        )}
      </div>
    </div>
  )
}
