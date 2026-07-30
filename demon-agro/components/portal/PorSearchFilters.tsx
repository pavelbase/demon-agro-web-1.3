'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Search, X, Loader2, SlidersHorizontal } from 'lucide-react'
import { POR_BIOLOGICAL_FUNCTIONS } from '@/lib/constants/por'

interface PorSearchFiltersProps {
  query: string
  biologicalFunction: string
  crop: string
  onlyAuthorized: boolean
  organicOnly: boolean
}

/**
 * Filtry vyhledávání přípravků POR.
 *
 * Stav filtrů je držený v URL, aby výsledky šly odkazovat i obnovit stránku
 * a aby samotné vyhledávání zůstalo na serveru. Textová pole se odesílají
 * se zpožděním, přepínače okamžitě; každá změna vrací stránkování na začátek.
 */
export function PorSearchFilters({
  query,
  biologicalFunction,
  crop,
  onlyAuthorized,
  organicOnly,
}: PorSearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [queryInput, setQueryInput] = useState(query)
  const [cropInput, setCropInput] = useState(crop)

  // Co jsme naposledy poslali do URL. Odpověď serveru na vlastní hledání se
  // nesmí vracet do textového pole – uživatel mezitím píše dál a přepsáním
  // by se ztratily znaky napsané během čekání.
  const submittedQuery = useRef(query)
  const submittedCrop = useRef(crop)

  // Synchronizace jen při změně URL zvenčí (zpět/vpřed v prohlížeči, odkaz)
  useEffect(() => {
    if (query === submittedQuery.current) return
    submittedQuery.current = query
    setQueryInput(query)
  }, [query])

  useEffect(() => {
    if (crop === submittedCrop.current) return
    submittedCrop.current = crop
    setCropInput(crop)
  }, [crop])

  const applyFilters = useCallback(
    (next: Partial<PorSearchFiltersProps>) => {
      // Základem jsou hodnoty z polí, ne z URL – změna selectu tak odešle
      // i text, který uživatel právě rozepsal a ještě nebyl odeslán.
      const merged = {
        query: queryInput,
        biologicalFunction,
        crop: cropInput,
        onlyAuthorized,
        organicOnly,
        ...next,
      }

      const nextQuery = merged.query.trim()
      const nextCrop = merged.crop.trim()
      submittedQuery.current = nextQuery
      submittedCrop.current = nextCrop

      const params = new URLSearchParams()
      if (nextQuery) params.set('q', nextQuery)
      if (merged.biologicalFunction) params.set('funkce', merged.biologicalFunction)
      if (nextCrop) params.set('plodina', nextCrop)
      if (!merged.onlyAuthorized) params.set('platne', '0')
      if (merged.organicOnly) params.set('eko', '1')

      const search = params.toString()
      startTransition(() => {
        router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
      })
    },
    [
      queryInput,
      cropInput,
      biologicalFunction,
      onlyAuthorized,
      organicOnly,
      pathname,
      router,
    ]
  )

  // Textová pole – odeslání až po pauze v psaní. Porovnává se s hodnotou
  // v URL po trimu, aby psaní mezer nespouštělo hledání dokola.
  useEffect(() => {
    if (queryInput.trim() === query && cropInput.trim() === crop) return

    const timeout = setTimeout(() => {
      applyFilters({ query: queryInput, crop: cropInput })
    }, 400)

    return () => clearTimeout(timeout)
  }, [queryInput, cropInput, query, crop, applyFilters])

  const resetFilters = () => {
    setQueryInput('')
    setCropInput('')
    applyFilters({
      query: '',
      biologicalFunction: '',
      crop: '',
      onlyAuthorized: true,
      organicOnly: false,
    })
  }

  const hasActiveFilters =
    query || biologicalFunction || crop || !onlyAuthorized || organicOnly

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        {/* Fulltext – název, registrační číslo, účinná látka */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Název, registrační číslo nebo účinná látka…"
            aria-label="Hledat přípravek"
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600 animate-spin" />
          )}
        </div>

        {/* Biologická funkce */}
        <select
          value={biologicalFunction}
          onChange={(e) => applyFilters({ biologicalFunction: e.target.value })}
          aria-label="Biologická funkce"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        >
          <option value="">Všechny funkce</option>
          {POR_BIOLOGICAL_FUNCTIONS.map((fn) => (
            <option key={fn} value={fn}>
              {fn}
            </option>
          ))}
        </select>

        {/* Plodina */}
        <input
          type="search"
          value={cropInput}
          onChange={(e) => setCropInput(e.target.value)}
          placeholder="Plodina (např. pšenice)"
          aria-label="Plodina"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 text-gray-500">
          <SlidersHorizontal className="h-4 w-4" />
          Filtry:
        </span>

        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
          <input
            type="checkbox"
            checked={onlyAuthorized}
            onChange={(e) => applyFilters({ onlyAuthorized: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Jen platná registrace
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
