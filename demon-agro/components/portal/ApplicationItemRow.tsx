'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  searchApplicationProducts,
  type ProductSearchResult,
  type UsageHint,
} from '@/lib/actions/application-products'
import {
  evaluateDoseAgainstUsages,
  formatDose,
  type CheckFinding,
  type CheckSeverity,
} from '@/lib/utils/application-checks'
import {
  computeNutrientSupply,
  formatNutrientContent,
  type FertilizerNutrientContent,
} from '@/lib/utils/fertilizer-nutrients'
import type { ApplicationItemKind } from '@/lib/types/database'

/**
 * Řádek položky aplikace (hnojivo / přípravek / pomocná látka)
 *
 * Sdílí ho zápis jedné aplikace i souhrnné zadání na více parcel, aby se
 * produkt vybíral z registru a nápověda k registrovanému použití se chovala
 * v obou případech stejně.
 */

export interface ItemState {
  key: string
  kind: ApplicationItemKind
  productName: string
  porItemId: number | null
  fertEvidenceNumber: string | null
  dose: string
  unit: string
  targetPest: string
  nKgHa: string
  batch: string
  hint: UsageHint | null
  hintLoading: boolean
  /** Obsah živin z číselníku hnojiv – přívod N, P₂O₅ a K₂O se z něj dopočítá */
  nutrients: FertilizerNutrientContent | null
}

export const UNITS = ['l/ha', 'kg/ha', 'g/ha', 'ml/ha', 't/ha']

export const KIND_LABELS: Record<ApplicationItemKind, string> = {
  hnojivo: 'Hnojivo',
  por: 'Přípravek',
  pomocna: 'Pomocná látka',
}

export const SEVERITY_STYLES: Record<CheckSeverity, { icon: React.ReactNode; className: string }> = {
  error: {
    icon: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
    className: 'border-red-200 bg-red-50',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />,
    className: 'border-amber-200 bg-amber-50',
  },
  info: {
    icon: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
    className: 'border-blue-200 bg-blue-50',
  },
}

export function emptyItem(): ItemState {
  return {
    key: crypto.randomUUID(),
    kind: 'por',
    productName: '',
    porItemId: null,
    fertEvidenceNumber: null,
    dose: '',
    unit: 'l/ha',
    targetPest: '',
    nKgHa: '',
    batch: '',
    hint: null,
    hintLoading: false,
    nutrients: null,
  }
}

export function addDaysIso(date: string, days: number): string {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

export function formatDatePlusDays(date: string, days: number): string {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value.toLocaleDateString('cs-CZ')
}

/** Výpis zjištění kontroly – stejná podoba ve formuláři i v souhrnném zadání. */
export function FindingsList({ findings }: { findings: CheckFinding[] }) {
  return (
    <ul className="space-y-2">
      {findings.map((finding, index) => (
        <li
          key={`${finding.code}-${index}`}
          className={`flex gap-2 rounded border p-3 ${SEVERITY_STYLES[finding.severity].className}`}
        >
          {SEVERITY_STYLES[finding.severity].icon}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{finding.title}</p>
            {finding.detail && <p className="mt-0.5 text-xs text-gray-600">{finding.detail}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}

interface ItemRowProps {
  item: ItemState
  index: number
  canRemove: boolean
  cropName: string | null
  harvestDate: string | null
  applicationDate: string
  /** Text pod nápovědou k ochranné lhůtě – u souhrnného zadání upozorní, že sklizeň je nejbližší z vybraných parcel. */
  harvestNote?: string | null
  /** Celková výměra, na kterou se položka aplikuje – zobrazí spotřebu produktu. */
  totalArea?: number
  onChange: (patch: Partial<ItemState>) => void
  onSelectProduct: (product: ProductSearchResult) => void
  onRemove: () => void
}

export function ItemRow({
  item,
  index,
  canRemove,
  cropName,
  harvestDate,
  applicationDate,
  harvestNote,
  totalArea,
  onChange,
  onSelectProduct,
  onRemove,
}: ItemRowProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hledání se odesílá se zpožděním, aby psaní nespouštělo dotaz na každý znak
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (search.trim().length < 2) {
      setResults([])
      return
    }

    timer.current = setTimeout(async () => {
      setIsSearching(true)
      const found = await searchApplicationProducts(search)
      setResults(found)
      setIsSearching(false)
      setIsOpen(true)
    }, 300)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [search])

  const hint = item.hint
  const dose = Number(item.dose)
  const evaluation =
    hint && dose > 0 ? evaluateDoseAgainstUsages(dose, item.unit, hint.usages) : null
  const protectionDays = hint?.usages.reduce<number | null>(
    (max, usage) =>
      usage.protectionPeriodDays !== null && (max === null || usage.protectionPeriodDays > max)
        ? usage.protectionPeriodDays
        : max,
    null
  )
  const pestOptions = Array.from(
    new Set((hint?.usages ?? []).map((usage) => usage.pest).filter((pest): pest is string => !!pest))
  )

  const consumption =
    totalArea && totalArea > 0 && dose > 0
      ? { amount: dose * totalArea, unit: item.unit.replace('/ha', '') }
      : null

  // Přívod živin se počítá z obsahu v číselníku; ruční zadání má přednost
  const supply =
    item.kind === 'hnojivo' && item.nutrients && dose > 0
      ? computeNutrientSupply(dose, item.unit, item.nutrients)
      : null

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {index + 1}. {KIND_LABELS[item.kind]}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Odebrat položku"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        {/* Výběr produktu z registru */}
        <div className="relative lg:col-span-5">
          <span className="mb-1 block text-sm font-medium text-gray-700">Produkt z registru</span>
          {item.productName ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  {item.porItemId
                    ? `registr POR · ${KIND_LABELS[item.kind]}`
                    : item.fertEvidenceNumber
                      ? `registr hnojiv · ev. č. ${item.fertEvidenceNumber}`
                      : 'bez vazby na registr'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    productName: '',
                    porItemId: null,
                    fertEvidenceNumber: null,
                    hint: null,
                  })
                  setSearch('')
                }}
                className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                změnit
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Název hnojiva nebo přípravku"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {isOpen && results.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {results.map((product) => (
                    <li key={`${product.porItemId ?? product.fertEvidenceNumber}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProduct(product)
                          setIsOpen(false)
                        }}
                        className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {KIND_LABELS[product.kind]}
                            {product.description ? ` · ${product.description}` : ''}
                          </p>
                        </div>
                        {!product.isValid && (
                          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                            neplatná registrace
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <label className="lg:col-span-2">
          <span className="mb-1 block text-sm font-medium text-gray-700">Dávka</span>
          <input
            type="number"
            step="0.001"
            min="0"
            value={item.dose}
            onChange={(event) => onChange({ dose: event.target.value })}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </label>

        <label className="lg:col-span-2">
          <span className="mb-1 block text-sm font-medium text-gray-700">Jednotka</span>
          <select
            value={item.unit}
            onChange={(event) => onChange({ unit: event.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>

        {item.kind === 'hnojivo' ? (
          <label className="lg:col-span-3">
            <span className="mb-1 block text-sm font-medium text-gray-700">Přívod N (kg/ha)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={item.nKgHa}
              onChange={(event) => onChange({ nKgHa: event.target.value })}
              placeholder={
                supply?.nKgHa !== null && supply?.nKgHa !== undefined
                  ? `dopočítá se ${supply.nKgHa}`
                  : 'podle obsahu živin'
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </label>
        ) : (
          <label className="lg:col-span-3">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Cílový organismus
              {item.kind === 'por' && <span className="text-red-500"> *</span>}
            </span>
            <input
              type="text"
              list={`pests-${item.key}`}
              value={item.targetPest}
              onChange={(event) => onChange({ targetPest: event.target.value })}
              placeholder={pestOptions.length > 0 ? 'vyberte z registru' : 'škodlivý organismus'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
            <datalist id={`pests-${item.key}`}>
              {pestOptions.map((pest) => (
                <option key={pest} value={pest} />
              ))}
            </datalist>
          </label>
        )}
      </div>

      {consumption && (
        <p className="mt-2 text-xs text-gray-500">
          Spotřeba na vybranou výměru:{' '}
          <strong className="font-medium text-gray-700">
            {consumption.amount.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })}{' '}
            {consumption.unit}
          </strong>
        </p>
      )}

      {/* Přívod živin z číselníku hnojiv */}
      {item.kind === 'hnojivo' && item.nutrients && (
        <div className="mt-3 border-t border-gray-100 pt-3 text-xs">
          {supply ? (
            <p className="flex flex-wrap items-center gap-1.5 text-gray-600">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                Přívod živin{' '}
                <strong className="font-medium text-gray-800">
                  N {(supply.nKgHa ?? 0).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })}
                  {' · '}P₂O₅{' '}
                  {(supply.p2o5KgHa ?? 0).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })}
                  {' · '}K₂O{' '}
                  {(supply.k2oKgHa ?? 0).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} kg/ha
                </strong>{' '}
                z číselníku ({formatNutrientContent(item.nutrients) ?? 'bez deklarovaných živin'}
                {item.nutrients.densityKgL !== null && item.nutrients.unitType === 'O'
                  ? `, ${item.nutrients.densityKgL} kg/l`
                  : ''}
                ). Vlastní hodnotu zapište do pole Přívod N.
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-gray-500">
              <Info className="h-3.5 w-3.5" />
              {formatNutrientContent(item.nutrients) ?? 'Číselník u hnojiva neuvádí obsah živin'}
              {' – '}
              {item.nutrients.densityKgL === null || Number(item.nutrients.densityKgL) === 1
                ? 'bez věrohodné měrné hmotnosti nelze objemovou dávku přepočítat; přívod N doložte ručně podle etikety nebo dodacího listu'
                : 'zadejte dávku, přívod živin se dopočítá'}
              .
            </p>
          )}
        </div>
      )}

      {/* Nápověda z registru */}
      {item.hintLoading && (
        <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Načítám registrované použití…
        </p>
      )}

      {hint && !item.hintLoading && (
        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-xs">
          {hint.cropNotComparable && cropName && (
            <p className="flex items-center gap-1.5 text-gray-500">
              <Info className="h-3.5 w-3.5" />
              Plodinu „{cropName}" nelze porovnat s registrem – registrované použití nelze ověřit.
            </p>
          )}

          {hint.cropNotRegistered && (
            <p className="flex items-start gap-1.5 font-medium text-red-600">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Registr neuvádí použití pro plodinu {cropName}. Registrované plodiny:{' '}
                {hint.registeredCrops.slice(0, 5).join('; ')}
                {hint.registeredCrops.length > 5 ? ' a další' : ''}.
              </span>
            </p>
          )}

          {evaluation && evaluation.status === 'over' && evaluation.max !== null && (
            <p className="flex items-center gap-1.5 font-medium text-red-600">
              <XCircle className="h-3.5 w-3.5" />
              Dávka nad registrovaným maximem {formatDose(evaluation.max, evaluation.base!)}.
            </p>
          )}

          {evaluation && evaluation.status === 'under' && evaluation.min !== null && (
            <p className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Dávka pod registrovaným minimem {formatDose(evaluation.min, evaluation.base!)}.
            </p>
          )}

          {evaluation && evaluation.status === 'ok' && (
            <p className="flex items-center gap-1.5 text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dávka je v registrovaném rozmezí
              {evaluation.min !== null && evaluation.max !== null
                ? ` ${formatDose(evaluation.min, evaluation.base!)} – ${formatDose(evaluation.max, evaluation.base!)}`
                : ''}
              .
            </p>
          )}

          {protectionDays !== null && protectionDays !== undefined && (
            <p
              className={`flex items-center gap-1.5 ${
                harvestDate &&
                new Date(harvestDate) < new Date(addDaysIso(applicationDate, protectionDays))
                  ? 'font-medium text-red-600'
                  : 'text-gray-600'
              }`}
            >
              <Info className="h-3.5 w-3.5" />
              Ochranná lhůta {protectionDays} dní – sklizeň nejdříve{' '}
              {formatDatePlusDays(applicationDate, protectionDays)}
              {harvestDate &&
                ` (${harvestNote ?? 'plánovaná sklizeň'} ${new Date(harvestDate).toLocaleDateString('cs-CZ')})`}
              .
            </p>
          )}

          {hint.beeRisk && (
            <p className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Přípravek je nebezpečný pro včely – nesmí se aplikovat na kvetoucí porost.
            </p>
          )}

          {hint.waterBufferRestriction && (
            <p className="flex items-center gap-1.5 text-gray-600">
              <Info className="h-3.5 w-3.5" />
              Přípravek má ochrannou vzdálenost od povrchové vody (SPe3) – ověřte pás podle etikety.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
