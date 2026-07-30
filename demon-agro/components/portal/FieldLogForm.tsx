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
 * obrazovka velkých tlačítek, žádné vedlejší funkce portálu. Zapisuje se jen
 * parcela, produkt a dávka – zbytek (výměra, osev) se doplní z parcely a
 * schvalovatel to v klidu zkontroluje.
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

type Step = 'parcela' | 'produkt' | 'davka' | 'souhrn' | 'hotovo'

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

export function FieldLogForm({
  parcels,
  recentProducts,
}: {
  parcels: FieldParcel[]
  recentProducts: RecentProduct[]
}) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()

  const [step, setStep] = useState<Step>('parcela')
  const [parcelId, setParcelId] = useState('')
  const [date, setDate] = useState(today())
  const [items, setItems] = useState<FieldItem[]>([])
  const [draft, setDraft] = useState<FieldItem | null>(null)
  const [appliedArea, setAppliedArea] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  const parcel = parcels.find((candidate) => candidate.id === parcelId) ?? null

  const resetForNextEntry = () => {
    setStep('parcela')
    setParcelId('')
    setDate(today())
    setItems([])
    setDraft(null)
    setAppliedArea('')
    setNotes('')
    setError(null)
  }

  const handleSelectParcel = (selected: FieldParcel) => {
    setParcelId(selected.id)
    setAppliedArea(String(selected.area))
    setStep('produkt')
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
    setItems((current) => [...current.filter((item) => item.key !== draft.key), draft])
    setDraft(null)
    setStep('souhrn')
  }

  const handleSave = () => {
    if (!parcel || items.length === 0) return
    setError(null)

    startSaving(async () => {
      const result = await saveFieldLog({
        cropParcelId: parcel.id,
        applicationDate: date,
        appliedArea: Number(appliedArea) > 0 ? Number(appliedArea) : null,
        notes: notes.trim() || null,
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

      setSavedCount((count) => count + 1)
      setStep('hotovo')
      router.refresh()
    })
  }

  if (parcels.length === 0) {
    return (
      <Shell title="Zápis z pole" onClose={() => router.push('/portal/hnojiva-por/evidence')}>
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900">Nemáte založené parcely</h2>
          <p className="mt-2 text-sm text-gray-600">
            Zápis z pole se vede na parcelách. Založte je v kanceláři, pak už stačí na poli jen
            vybrat parcelu a produkt.
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

  return (
    <Shell
      title={step === 'hotovo' ? 'Uloženo' : 'Zápis z pole'}
      subtitle={parcel && step !== 'hotovo' ? parcel.name : undefined}
      onClose={() => router.push('/portal/hnojiva-por/evidence')}
      onBack={
        step === 'produkt'
          ? () => setStep('parcela')
          : step === 'davka'
            ? () => {
                setDraft(null)
                setStep(items.length > 0 ? 'souhrn' : 'produkt')
              }
            : step === 'souhrn'
              ? () => setStep('produkt')
              : undefined
      }
    >
      {step === 'parcela' && <ParcelStep parcels={parcels} onSelect={handleSelectParcel} />}

      {step === 'produkt' && (
        <ProductStep
          recentProducts={recentProducts}
          onSelect={handleSelectProduct}
          onCancel={items.length > 0 ? () => setStep('souhrn') : undefined}
        />
      )}

      {step === 'davka' && draft && (
        <DoseStep
          item={draft}
          area={Number(appliedArea) || parcel?.area || 0}
          onChange={(patch) => setDraft({ ...draft, ...patch })}
          onConfirm={handleConfirmDose}
        />
      )}

      {step === 'souhrn' && parcel && (
        <SummaryStep
          parcel={parcel}
          date={date}
          onDateChange={setDate}
          items={items}
          appliedArea={appliedArea}
          onAppliedAreaChange={setAppliedArea}
          notes={notes}
          onNotesChange={setNotes}
          onRemoveItem={(key) => {
            const next = items.filter((item) => item.key !== key)
            setItems(next)
            if (next.length === 0) setStep('produkt')
          }}
          onEditItem={(item) => {
            setDraft(item)
            setStep('davka')
          }}
          onAddItem={() => setStep('produkt')}
          onSave={handleSave}
          isSaving={isSaving}
          error={error}
        />
      )}

      {step === 'hotovo' && (
        <DoneStep savedCount={savedCount} onNext={resetForNextEntry} onClose={() => router.push('/portal/hnojiva-por/schvaleni')} />
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

// ============================================================================
// KROK 1 – PARCELA
// ============================================================================

function ParcelStep({
  parcels,
  onSelect,
}: {
  parcels: FieldParcel[]
  onSelect: (parcel: FieldParcel) => void
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

  return (
    <>
      <StepTitle>Kde jste?</StepTitle>

      {parcels.length > 6 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Hledat parcelu"
            className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-11 pr-4 text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
      )}

      <div className="space-y-2">
        {visible.map((parcel) => (
          <button
            key={parcel.id}
            type="button"
            onClick={() => onSelect(parcel)}
            className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm active:bg-amber-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-gray-900">{parcel.name}</p>
              <p className="truncate text-sm text-gray-500">
                {parcel.area.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha
                {parcel.cropName ? ` · ${parcel.cropName}` : ''}
                {parcel.blockCode ? ` · DPB ${parcel.blockCode}` : ''}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
          </button>
        ))}

        {visible.length === 0 && (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">
            Žádná parcela neodpovídá hledání.
          </p>
        )}
      </div>
    </>
  )
}

// ============================================================================
// KROK 2 – PRODUKT
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
      <StepTitle>Co jste aplikoval?</StepTitle>

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
                    naposledy {product.dose.toLocaleString('cs-CZ')} {product.unit}
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
          Zpět na souhrn
        </button>
      )}
    </>
  )
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
// KROK 3 – DÁVKA
// ============================================================================

function DoseStep({
  item,
  area,
  onChange,
  onConfirm,
}: {
  item: FieldItem
  area: number
  onChange: (patch: Partial<FieldItem>) => void
  onConfirm: () => void
}) {
  const dose = Number(item.dose)
  const total = dose > 0 && area > 0 ? dose * area : null

  return (
    <>
      <StepTitle>Jaká dávka?</StepTitle>

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

        {total !== null && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Na {area.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha celkem{' '}
            <strong className="font-semibold text-gray-800">
              {total.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })}{' '}
              {item.unit.replace('/ha', '')}
            </strong>
          </p>
        )}
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
// KROK 4 – SOUHRN A ODESLÁNÍ
// ============================================================================

function SummaryStep({
  parcel,
  date,
  onDateChange,
  items,
  appliedArea,
  onAppliedAreaChange,
  notes,
  onNotesChange,
  onRemoveItem,
  onEditItem,
  onAddItem,
  onSave,
  isSaving,
  error,
}: {
  parcel: FieldParcel
  date: string
  onDateChange: (value: string) => void
  items: FieldItem[]
  appliedArea: string
  onAppliedAreaChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  onRemoveItem: (key: string) => void
  onEditItem: (item: FieldItem) => void
  onAddItem: () => void
  onSave: () => void
  isSaving: boolean
  error: string | null
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <StepTitle>Zkontrolujte a odešlete</StepTitle>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <MapPin className="h-6 w-6 text-amber-700" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">{parcel.name}</p>
            <p className="truncate text-sm text-gray-500">
              {Number(appliedArea || parcel.area).toLocaleString('cs-CZ', {
                maximumFractionDigits: 2,
              })}{' '}
              ha{parcel.cropName ? ` · ${parcel.cropName}` : ''}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
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

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <KindIcon kind={item.kind} />
            <button
              type="button"
              onClick={() => onEditItem(item)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-base font-semibold text-gray-900">{item.productName}</p>
              <p className="text-sm text-gray-500">
                {Number(item.dose).toLocaleString('cs-CZ')} {item.unit}
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
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-600 active:bg-gray-50"
      >
        <Plus className="h-5 w-5" />
        Přidat další produkt
      </button>

      {showDetails ? (
        <div className="mt-3 space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Ošetřená výměra (ha)
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={appliedArea}
              onChange={(event) => onAppliedAreaChange(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
            />
            {Number(appliedArea) > parcel.area + 0.01 && (
              <span className="mt-1 block text-sm text-red-600">
                Víc než výměra parcely ({parcel.area} ha)
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Poznámka</span>
            <input
              type="text"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Např. jen část pozemku, počasí…"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
            />
          </label>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 underline underline-offset-4"
        >
          Upravit výměru nebo přidat poznámku
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
        Zápis se uloží a počká na schválení. Do evidence hnojiv a POR se propíše až po něm.
      </p>
    </>
  )
}

// ============================================================================
// KROK 5 – HOTOVO
// ============================================================================

function DoneStep({
  savedCount,
  onNext,
  onClose,
}: {
  savedCount: number
  onNext: () => void
  onClose: () => void
}) {
  return (
    <div className="pt-6 text-center">
      <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-700" />
      </span>
      <h2 className="text-xl font-bold text-gray-900">Zápis uložen</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
        Čeká na schválení. Do evidence hnojiv a POR se propíše, až ho projdete v kanceláři.
      </p>
      {savedCount > 1 && (
        <p className="mt-1 text-sm text-gray-500">Zápisů v tomto sezení: {savedCount}</p>
      )}

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
