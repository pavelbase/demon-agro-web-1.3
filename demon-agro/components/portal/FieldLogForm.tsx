'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  Search,
  Send,
  Sprout,
  SprayCan,
  Trash2,
  X,
} from 'lucide-react'
import {
  searchApplicationProducts,
  type ProductSearchResult,
} from '@/lib/actions/application-products'
import { saveFieldLog } from '@/lib/actions/field-log'
import type { RecentProduct } from '@/lib/database/application-queries'
import type { ApplicationItemKind } from '@/lib/types/database'

/**
 * Zápis aplikace přímo z pole
 *
 * Ovládá se jedním palcem v kabině: každý krok je jedna otázka a jedna
 * obrazovka velkých tlačítek, žádné vedlejší funkce portálu.
 *
 * Pořadí kroků kopíruje práci, ne evidenci: nejdřív se namíchá nádrž nebo
 * naplní rozmetadlo (co a v jaké dávce), teprve pak se objíždějí pozemky.
 * Pozemků se proto vybírá víc najednou a z jednoho zápisu vznikne jeden
 * záznam evidence na každý z nich.
 */

export interface FieldParcel {
  id: string
  name: string
  area: number
  blockCode: string | null
  cropName: string | null
}

interface FieldItem {
  key: string
  kind: ApplicationItemKind
  productName: string
  porItemId: number | null
  fertEvidenceNumber: string | null
  dose: string
  unit: string
}

type Step = 'produkt' | 'davka' | 'pozemky' | 'souhrn' | 'hotovo'

const UNITS = ['l/ha', 'kg/ha', 'g/ha', 'ml/ha', 't/ha']

const KIND_LABELS: Record<ApplicationItemKind, string> = {
  hnojivo: 'Hnojivo',
  por: 'Přípravek',
  pomocna: 'Pomocná látka',
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function shiftDays(days: number): string {
  const value = new Date()
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

function defaultUnit(kind: ApplicationItemKind, isLiquid: boolean): string {
  if (kind !== 'hnojivo') return 'l/ha'
  return isLiquid ? 'l/ha' : 'kg/ha'
}

function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString('cs-CZ', { maximumFractionDigits: digits })
}

export function FieldLogForm({
  parcels,
  recentProducts,
}: {
  parcels: FieldParcel[]
  recentProducts: RecentProduct[]
}) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()

  const [step, setStep] = useState<Step>('produkt')
  const [items, setItems] = useState<FieldItem[]>([])
  const [draft, setDraft] = useState<FieldItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // Výměra se mění jen tam, kde se nejelo přes celý pozemek
  const [areaOverrides, setAreaOverrides] = useState<Record<string, string>>({})
  const [date, setDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState(0)

  const selectedParcels = selectedIds
    .map((id) => parcels.find((parcel) => parcel.id === id))
    .filter((parcel): parcel is FieldParcel => !!parcel)

  /** Co je v poli výměry – rozepsaná hodnota se nesmí přepisovat pod rukama */
  const areaInputOf = (parcel: FieldParcel) => areaOverrides[parcel.id] ?? String(parcel.area)

  /** Výměra pro výpočty a uložení; rozepsané nebo nesmyslné zadání padá na celý pozemek */
  const areaOf = (parcel: FieldParcel) => {
    const value = Number(areaOverrides[parcel.id] ?? parcel.area)
    return Number.isFinite(value) && value > 0 ? value : parcel.area
  }

  const totalArea = selectedParcels.reduce((sum, parcel) => sum + areaOf(parcel), 0)

  const resetForNextEntry = () => {
    setStep('produkt')
    setItems([])
    setDraft(null)
    setSelectedIds([])
    setAreaOverrides({})
    setDate(today())
    setNotes('')
    setError(null)
  }

  const handleSelectProduct = (product: {
    kind: ApplicationItemKind
    name: string
    porItemId: number | null
    fertEvidenceNumber: string | null
    unit?: string
    dose?: string
  }) => {
    setDraft({
      key: crypto.randomUUID(),
      kind: product.kind,
      productName: product.name,
      porItemId: product.porItemId,
      fertEvidenceNumber: product.fertEvidenceNumber,
      dose: product.dose ?? '',
      unit: product.unit ?? defaultUnit(product.kind, false),
    })
    setStep('davka')
  }

  const handleConfirmDose = () => {
    if (!draft || Number(draft.dose) <= 0) return
    setItems((current) => {
      const exists = current.some((item) => item.key === draft.key)
      return exists
        ? current.map((item) => (item.key === draft.key ? draft : item))
        : [...current, draft]
    })
    setDraft(null)
    setStep('pozemky')
  }

  const handleRemoveItem = (key: string) => {
    const next = items.filter((item) => item.key !== key)
    setItems(next)
    if (next.length === 0) setStep('produkt')
  }

  const handleSave = () => {
    if (selectedParcels.length === 0 || items.length === 0) return
    setError(null)

    startSaving(async () => {
      const result = await saveFieldLog({
        applicationDate: date,
        notes: notes.trim() || null,
        parcels: selectedParcels.map((parcel) => ({
          cropParcelId: parcel.id,
          appliedArea: areaOf(parcel),
        })),
        items: items.map((item) => ({
          kind: item.kind,
          productName: item.productName,
          porItemId: item.porItemId,
          fertEvidenceNumber: item.fertEvidenceNumber,
          dose: Number(item.dose),
          unit: item.unit,
        })),
      })

      if (!result.success) {
        setError(result.error ?? 'Zápis se nepodařilo uložit')
        return
      }

      setLastSaved(result.created ?? selectedParcels.length)
      setStep('hotovo')
      router.refresh()
    })
  }

  if (parcels.length === 0) {
    return (
      <Shell title="Zápis z pole" onClose={() => router.push('/portal/hnojiva-por/evidence')}>
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900">Nemáte založené pozemky</h2>
          <p className="mt-2 text-sm text-gray-600">
            Zápis z pole se vede na parcelách. Založte je v kanceláři, pak už stačí na poli jen
            vybrat produkt a pozemky.
          </p>
          <button
            type="button"
            onClick={() => router.push('/portal/hnojiva-por/parcely')}
            className="mt-5 w-full rounded-xl bg-amber-600 px-4 py-4 text-base font-semibold text-white"
          >
            Přejít na parcely
          </button>
        </div>
      </Shell>
    )
  }

  const subtitle =
    step === 'hotovo'
      ? undefined
      : selectedParcels.length > 0
        ? `${items.length} ${items.length === 1 ? 'produkt' : 'produkty'} · ${selectedParcels.length} ${selectedParcels.length === 1 ? 'pozemek' : 'pozemků'} · ${formatNumber(totalArea, 1)} ha`
        : items.length > 0
          ? items.map((item) => item.productName).join(' + ')
          : undefined

  return (
    <Shell
      title={step === 'hotovo' ? 'Uloženo' : 'Zápis z pole'}
      subtitle={subtitle}
      onClose={() => router.push('/portal/hnojiva-por/evidence')}
      onBack={
        step === 'davka'
          ? () => {
              setDraft(null)
              setStep(items.length > 0 ? 'pozemky' : 'produkt')
            }
          : step === 'pozemky'
            ? () => setStep('produkt')
            : step === 'souhrn'
              ? () => setStep('pozemky')
              : undefined
      }
    >
      {step === 'produkt' && (
        <ProductStep
          recentProducts={recentProducts}
          onSelect={handleSelectProduct}
          onCancel={items.length > 0 ? () => setStep('pozemky') : undefined}
        />
      )}

      {step === 'davka' && draft && (
        <DoseStep
          item={draft}
          onChange={(patch) => setDraft({ ...draft, ...patch })}
          onConfirm={handleConfirmDose}
        />
      )}

      {step === 'pozemky' && (
        <ParcelStep
          parcels={parcels}
          items={items}
          selectedIds={selectedIds}
          totalArea={totalArea}
          onToggle={(id) =>
            setSelectedIds((current) =>
              current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
            )
          }
          onToggleAll={() =>
            setSelectedIds((current) =>
              current.length === parcels.length ? [] : parcels.map((parcel) => parcel.id)
            )
          }
          onAddItem={() => setStep('produkt')}
          onEditItem={(item) => {
            setDraft(item)
            setStep('davka')
          }}
          onRemoveItem={handleRemoveItem}
          onContinue={() => setStep('souhrn')}
        />
      )}

      {step === 'souhrn' && (
        <SummaryStep
          items={items}
          parcels={selectedParcels}
          areaOf={areaOf}
          areaInputOf={areaInputOf}
          onAreaChange={(id, value) =>
            setAreaOverrides((current) => ({ ...current, [id]: value }))
          }
          totalArea={totalArea}
          date={date}
          onDateChange={setDate}
          notes={notes}
          onNotesChange={setNotes}
          onSave={handleSave}
          isSaving={isSaving}
          error={error}
        />
      )}

      {step === 'hotovo' && (
        <DoneStep
          created={lastSaved}
          onNext={resetForNextEntry}
          onClose={() => router.push('/portal/hnojiva-por/schvaleni')}
        />
      )}
    </Shell>
  )
}

// ============================================================================
// RÁM OBRAZOVKY
// ============================================================================

function Shell({
  title,
  subtitle,
  children,
  onClose,
  onBack,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
  onBack?: () => void
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-100">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-amber-600 px-3 py-3 text-white shadow-md">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Zpět"
            className="rounded-lg p-2.5 hover:bg-amber-700 active:bg-amber-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        ) : (
          <span className="w-11" />
        )}

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-base font-semibold leading-tight">{title}</p>
          {subtitle && <p className="truncate text-xs text-amber-100">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Ukončit zápis"
          className="rounded-lg p-2.5 hover:bg-amber-700 active:bg-amber-800"
        >
          <X className="h-6 w-6" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 p-3 pb-8">{children}</main>
    </div>
  )
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 px-1 text-lg font-semibold text-gray-900">{children}</h2>
}

function KindIcon({ kind }: { kind: ApplicationItemKind }) {
  return kind === 'hnojivo' ? (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100">
      <Sprout className="h-6 w-6 text-green-700" />
    </span>
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100">
      <SprayCan className="h-6 w-6 text-blue-700" />
    </span>
  )
}

// ============================================================================
// KROK 1 – PRODUKT
// ============================================================================

function ProductStep({
  recentProducts,
  onSelect,
  onCancel,
}: {
  recentProducts: RecentProduct[]
  onSelect: (product: {
    kind: ApplicationItemKind
    name: string
    porItemId: number | null
    fertEvidenceNumber: string | null
    unit?: string
    dose?: string
  }) => void
  onCancel?: () => void
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ProductSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (search.trim().length < 2) {
      setResults([])
      return
    }

    timer.current = setTimeout(async () => {
      setIsSearching(true)
      setResults(await searchApplicationProducts(search))
      setIsSearching(false)
    }, 300)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [search])

  const showRecent = search.trim().length < 2 && recentProducts.length > 0

  return (
    <>
      <StepTitle>Co aplikujete?</StepTitle>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Název hnojiva nebo přípravku"
          className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-11 pr-11 text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {showRecent && (
        <>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Naposledy použité
          </p>
          <div className="mb-4 space-y-2">
            {recentProducts.map((product) => (
              <button
                key={product.productName}
                type="button"
                onClick={() =>
                  onSelect({
                    kind: product.kind,
                    name: product.productName,
                    porItemId: product.porItemId,
                    fertEvidenceNumber: product.fertEvidenceNumber,
                    unit: product.unit,
                    dose: String(product.dose),
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm active:bg-amber-50"
              >
                <KindIcon kind={product.kind} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900">
                    {product.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    naposledy {formatNumber(product.dose, 3)} {product.unit}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="space-y-2">
        {results.map((product) => (
          <button
            key={`${product.porItemId ?? product.fertEvidenceNumber ?? product.name}`}
            type="button"
            onClick={() =>
              onSelect({
                kind: product.kind,
                name: product.name,
                porItemId: product.porItemId,
                fertEvidenceNumber: product.fertEvidenceNumber,
                unit: defaultUnit(product.kind, product.nutrients?.unitType === 'O'),
              })
            }
            className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm active:bg-amber-50"
          >
            <KindIcon kind={product.kind} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-gray-900">{product.name}</p>
              <p className="truncate text-sm text-gray-500">{KIND_LABELS[product.kind]}</p>
            </div>
            {!product.isValid && (
              <span className="shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                neplatná registrace
              </span>
            )}
          </button>
        ))}

        {!isSearching && search.trim().length >= 2 && results.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
            V registru nic neodpovídá. Zkuste zkrácený název.
          </p>
        )}
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-700"
        >
          Zpět na výběr pozemků
        </button>
      )}
    </>
  )
}

// ============================================================================
// KROK 2 – DÁVKA
// ============================================================================

function DoseStep({
  item,
  onChange,
  onConfirm,
}: {
  item: FieldItem
  onChange: (patch: Partial<FieldItem>) => void
  onConfirm: () => void
}) {
  const dose = Number(item.dose)

  return (
    <>
      <StepTitle>Jaká dávka na hektar?</StepTitle>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <KindIcon kind={item.kind} />
          <p className="min-w-0 flex-1 text-base font-semibold text-gray-900">{item.productName}</p>
        </div>

        <input
          type="number"
          inputMode="decimal"
          step="0.001"
          min="0"
          autoFocus
          value={item.dose}
          onChange={(event) => onChange({ dose: event.target.value })}
          placeholder="0"
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-5 text-center text-4xl font-bold tabular-nums text-gray-900 focus:border-amber-500 focus:outline-none"
        />

        <div className="mt-3 grid grid-cols-3 gap-2">
          {UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => onChange({ unit })}
              className={`rounded-xl px-2 py-4 text-base font-semibold transition-colors ${
                item.unit === unit
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!(dose > 0)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-5 text-lg font-semibold text-white disabled:bg-gray-300"
      >
        <Check className="h-6 w-6" />
        Potvrdit
      </button>
    </>
  )
}

// ============================================================================
// KROK 3 – POZEMKY (VÍCE NAJEDNOU)
// ============================================================================

function ParcelStep({
  parcels,
  items,
  selectedIds,
  totalArea,
  onToggle,
  onToggleAll,
  onAddItem,
  onEditItem,
  onRemoveItem,
  onContinue,
}: {
  parcels: FieldParcel[]
  items: FieldItem[]
  selectedIds: string[]
  totalArea: number
  onToggle: (id: string) => void
  onToggleAll: () => void
  onAddItem: () => void
  onEditItem: (item: FieldItem) => void
  onRemoveItem: (key: string) => void
  onContinue: () => void
}) {
  const [search, setSearch] = useState('')

  const needle = search.trim().toLowerCase()
  const visible = needle
    ? parcels.filter((parcel) =>
        [parcel.name, parcel.blockCode, parcel.cropName].some((value) =>
          value?.toLowerCase().includes(needle)
        )
      )
    : parcels

  const allSelected = selectedIds.length === parcels.length && parcels.length > 0

  return (
    <>
      {/* Namíchaná nádrž / naplněné rozmetadlo – zůstává na očích při objíždění */}
      <div className="mb-4 rounded-xl bg-white p-3 shadow-sm">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <KindIcon kind={item.kind} />
              <button
                type="button"
                onClick={() => onEditItem(item)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-base font-semibold text-gray-900">
                  {item.productName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatNumber(Number(item.dose), 3)} {item.unit}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onRemoveItem(item.key)}
                aria-label={`Odebrat ${item.productName}`}
                className="rounded-lg p-3 text-gray-400 active:bg-red-50 active:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 active:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Přidat další produkt do směsi
        </button>
      </div>

      <StepTitle>Na které pozemky?</StepTitle>

      {parcels.length > 6 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Hledat pozemek"
            className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-11 pr-4 text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
      )}

      <button
        type="button"
        onClick={onToggleAll}
        className="mb-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 active:bg-gray-50"
      >
        {allSelected ? 'Zrušit výběr všech' : 'Vybrat všechny pozemky'}
      </button>

      <div className="space-y-2 pb-24">
        {visible.map((parcel) => {
          const isSelected = selectedIds.includes(parcel.id)

          return (
            <button
              key={parcel.id}
              type="button"
              onClick={() => onToggle(parcel.id)}
              aria-pressed={isSelected}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-left shadow-sm transition-colors ${
                isSelected ? 'bg-amber-50 ring-2 ring-amber-500' : 'bg-white'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 ${
                  isSelected ? 'border-amber-600 bg-amber-600' : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <Check className="h-5 w-5 text-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900">{parcel.name}</p>
                <p className="truncate text-sm text-gray-500">
                  {formatNumber(parcel.area)} ha
                  {parcel.cropName ? ` · ${parcel.cropName}` : ''}
                  {parcel.blockCode ? ` · DPB ${parcel.blockCode}` : ''}
                </p>
              </div>
            </button>
          )
        })}

        {visible.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
            Žádný pozemek neodpovídá hledání.
          </p>
        )}
      </div>

      <div className="sticky bottom-0 -mx-3 border-t border-gray-200 bg-white p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <p className="mb-2 text-center text-sm text-gray-600">
          {selectedIds.length === 0 ? (
            'Vyberte alespoň jeden pozemek'
          ) : (
            <>
              Vybráno {selectedIds.length}{' '}
              {selectedIds.length === 1 ? 'pozemek' : selectedIds.length < 5 ? 'pozemky' : 'pozemků'}{' '}
              · <strong className="font-semibold text-gray-900">{formatNumber(totalArea)} ha</strong>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={selectedIds.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-4 text-lg font-semibold text-white disabled:bg-gray-300"
        >
          Pokračovat
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

// ============================================================================
// KROK 4 – SOUHRN A ODESLÁNÍ
// ============================================================================

function SummaryStep({
  items,
  parcels,
  areaOf,
  areaInputOf,
  onAreaChange,
  totalArea,
  date,
  onDateChange,
  notes,
  onNotesChange,
  onSave,
  isSaving,
  error,
}: {
  items: FieldItem[]
  parcels: FieldParcel[]
  areaOf: (parcel: FieldParcel) => number
  areaInputOf: (parcel: FieldParcel) => string
  onAreaChange: (id: string, value: string) => void
  totalArea: number
  date: string
  onDateChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  onSave: () => void
  isSaving: boolean
  error: string | null
}) {
  const [showNotes, setShowNotes] = useState(false)

  return (
    <>
      <StepTitle>Zkontrolujte a odešlete</StepTitle>

      {/* Celková spotřeba – kontrola proti tomu, co se skutečně namíchalo */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Spotřeba na {formatNumber(totalArea)} ha
        </p>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <KindIcon kind={item.kind} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900">
                  {item.productName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatNumber(Number(item.dose), 3)} {item.unit}
                </p>
              </div>
              <p className="shrink-0 text-right text-base font-semibold tabular-nums text-gray-900">
                {formatNumber(Number(item.dose) * totalArea)}{' '}
                <span className="text-sm font-normal text-gray-500">
                  {item.unit.replace('/ha', '')}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Datum */}
      <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Dnes', value: today() },
            { label: 'Včera', value: shiftDays(-1) },
            { label: 'Předevčírem', value: shiftDays(-2) },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDateChange(option.value)}
              className={`rounded-xl px-2 py-3 text-sm font-semibold transition-colors ${
                date === option.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-700 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Pozemky s ošetřenou výměrou */}
      <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Pozemky ({parcels.length}) – upravte výměru, pokud jste nejel celý
        </p>
        <div className="space-y-2">
          {parcels.map((parcel) => {
            const area = areaOf(parcel)
            const partial = area < parcel.area - 0.01

            return (
              <div key={parcel.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-gray-900">{parcel.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {partial ? `z ${formatNumber(parcel.area)} ha` : 'celý pozemek'}
                    {parcel.cropName ? ` · ${parcel.cropName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max={parcel.area}
                    value={areaInputOf(parcel)}
                    onChange={(event) => onAreaChange(parcel.id, event.target.value)}
                    className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-right text-base tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-sm text-gray-500">ha</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showNotes ? (
        <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Poznámka</span>
            <input
              type="text"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Např. počasí, přerušená aplikace…"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
            />
          </label>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 underline underline-offset-4"
        >
          Přidat poznámku
        </button>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-5 text-lg font-semibold text-white disabled:opacity-60"
      >
        {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
        Odeslat zápis
      </button>

      <p className="mt-3 px-2 text-center text-xs text-gray-500">
        Vznikne {parcels.length} {parcels.length === 1 ? 'záznam' : parcels.length < 5 ? 'záznamy' : 'záznamů'}{' '}
        evidence – jeden na každý pozemek. Do sekce Hnojiva a POR se propíšou až po schválení.
      </p>
    </>
  )
}

// ============================================================================
// KROK 5 – HOTOVO
// ============================================================================

function DoneStep({
  created,
  onNext,
  onClose,
}: {
  created: number
  onNext: () => void
  onClose: () => void
}) {
  return (
    <div className="pt-6 text-center">
      <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-700" />
      </span>
      <h2 className="text-xl font-bold text-gray-900">
        {created === 1 ? 'Zápis uložen' : `Uloženo ${created} zápisů`}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
        {created === 1 ? 'Čeká' : 'Čekají'} na schválení. Do evidence hnojiv a POR se{' '}
        {created === 1 ? 'propíše' : 'propíšou'}, až je projdete v kanceláři.
      </p>

      <button
        type="button"
        onClick={onNext}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-5 text-lg font-semibold text-white"
      >
        <Plus className="h-6 w-6" />
        Další zápis
      </button>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-700"
      >
        Přejít na schvalování
      </button>
    </div>
  )
}
