'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CheckCircle2, Loader2, Plus, Save } from 'lucide-react'
import { getUsageHint, type ProductSearchResult } from '@/lib/actions/application-products'
import { saveApplication, type SaveApplicationPayload } from '@/lib/actions/applications'
import type { CheckFinding } from '@/lib/utils/application-checks'
import type { ApplicationItemKind } from '@/lib/types/database'
import {
  emptyItem,
  FindingsList,
  ItemRow,
  type ItemState,
} from '@/components/portal/ApplicationItemRow'

export interface FormParcel {
  id: string
  name: string
  area: number
  blockCode: string | null
  landBlockNote: string | null
  crops: {
    id: string
    cropName: string
    season: number
    sowingDate: string | null
    harvestDate: string | null
    /** Výměra osevu, pokud se liší od výměry parcely */
    area: number | null
  }[]
}

export interface FormApplication {
  id: string
  cropParcelId: string
  parcelCropId: string | null
  applicationDate: string
  appliedArea: number
  mode: 'skutecnost' | 'plan'
  method: string | null
  notes: string | null
  items: {
    kind: ApplicationItemKind
    productName: string
    porItemId: number | null
    fertEvidenceNumber: string | null
    dose: number
    unit: string
    targetPest: string | null
    nKgHa: number | null
    batch: string | null
  }[]
}

interface ApplicationFormProps {
  parcels: FormParcel[]
  application?: FormApplication
  /** Upravovaný záznam je zápis z pole čekající na schválení */
  pendingFieldLog?: boolean
}

/**
 * Formulář aplikace hnojiv a POR
 *
 * Produkt se vybírá z registru, takže záznam má vazbu na registrační číslo.
 * Po výběru přípravku se hned zobrazí, co registr pro zvolenou plodinu
 * povoluje – cílové organismy, rozmezí dávek a ochrannou lhůtu –, takže
 * uživatel vidí omezení při zápisu, ne až po uložení.
 */
export function ApplicationForm({
  parcels,
  application,
  pendingFieldLog = false,
}: ApplicationFormProps) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()

  const [parcelId, setParcelId] = useState(application?.cropParcelId ?? parcels[0]?.id ?? '')
  const [parcelCropId, setParcelCropId] = useState(application?.parcelCropId ?? '')
  const [applicationDate, setApplicationDate] = useState(
    application?.applicationDate ?? new Date().toISOString().slice(0, 10)
  )
  const [appliedArea, setAppliedArea] = useState(
    application ? String(application.appliedArea) : String(parcels[0]?.area ?? '')
  )
  const [mode, setMode] = useState<'skutecnost' | 'plan'>(application?.mode ?? 'skutecnost')
  const [method, setMethod] = useState(application?.method ?? '')
  const [notes, setNotes] = useState(application?.notes ?? '')
  const [items, setItems] = useState<ItemState[]>(
    application?.items.map((item) => ({
      key: crypto.randomUUID(),
      kind: item.kind,
      productName: item.productName,
      porItemId: item.porItemId,
      fertEvidenceNumber: item.fertEvidenceNumber,
      dose: String(item.dose),
      unit: item.unit,
      targetPest: item.targetPest ?? '',
      nKgHa: item.nKgHa !== null ? String(item.nKgHa) : '',
      batch: item.batch ?? '',
      hint: null,
      hintLoading: false,
      nutrients: null,
    })) ?? [emptyItem()]
  )
  const [findings, setFindings] = useState<CheckFinding[]>([])

  const parcel = parcels.find((candidate) => candidate.id === parcelId) ?? null
  const parcelCrop = parcel?.crops.find((crop) => crop.id === parcelCropId) ?? null

  // Výchozí osev: nejnovější sezóna vybrané parcely
  useEffect(() => {
    if (!parcel) return
    if (parcelCropId && parcel.crops.some((crop) => crop.id === parcelCropId)) return
    setParcelCropId(parcel.crops[0]?.id ?? '')
  }, [parcel, parcelCropId])

  const updateItem = (key: string, patch: Partial<ItemState>) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  /** Nápověda z registru se načítá pro vybraný přípravek a plodinu osevu. */
  const loadHint = async (key: string, porItemId: number | null, cropName: string | null) => {
    if (!porItemId) {
      updateItem(key, { hint: null, hintLoading: false })
      return
    }

    updateItem(key, { hintLoading: true })
    const hint = await getUsageHint(porItemId, cropName)
    updateItem(key, { hint, hintLoading: false })
  }

  // Změna plodiny mění registrovaná použití u všech položek
  useEffect(() => {
    items.forEach((item) => {
      if (item.porItemId) loadHint(item.key, item.porItemId, parcelCrop?.cropName ?? null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcelCrop?.cropName])

  const handleSelectProduct = (key: string, product: ProductSearchResult) => {
    updateItem(key, {
      kind: product.kind,
      productName: product.name,
      porItemId: product.porItemId,
      fertEvidenceNumber: product.fertEvidenceNumber,
      nutrients: product.nutrients,
      // Kapalná hnojiva se dávkují objemově
      unit:
        product.kind === 'hnojivo'
          ? product.nutrients?.unitType === 'O'
            ? 'l/ha'
            : 'kg/ha'
          : 'l/ha',
    })
    loadHint(key, product.porItemId, parcelCrop?.cropName ?? null)
  }

  /** @param approve u zápisu z pole rovnou propíše záznam do evidence */
  const submit = (approve: boolean) => {
    const payload: SaveApplicationPayload = {
      id: application?.id,
      recordStatus: approve ? 'schvaleno' : undefined,
      cropParcelId: parcelId,
      parcelCropId: parcelCropId || null,
      applicationDate,
      appliedArea: Number(appliedArea),
      mode,
      method: method || null,
      notes: notes || null,
      items: items.map((item) => ({
        kind: item.kind,
        productName: item.productName,
        porItemId: item.porItemId,
        fertEvidenceNumber: item.fertEvidenceNumber,
        dose: Number(item.dose),
        unit: item.unit,
        targetPest: item.targetPest || null,
        nKgHa: item.nKgHa ? Number(item.nKgHa) : null,
        batch: item.batch || null,
      })),
    }

    startSaving(async () => {
      const result = await saveApplication(payload)

      if (!result.success) {
        toast.error(result.error ?? 'Aplikaci se nepodařilo uložit')
        return
      }

      setFindings(result.findings ?? [])

      if (approve) {
        toast.success('Zápis schválen a propsán do evidence')
        router.push('/portal/hnojiva-por/schvaleni')
        return
      }

      const errors = (result.findings ?? []).filter((finding) => finding.severity === 'error').length
      if (errors > 0) {
        toast.success(`Aplikace uložena, kontrola našla ${errors} chyb – zkontrolujte zjištění`, {
          icon: '⚠️',
        })
      } else {
        toast.success('Aplikace uložena')
      }

      router.refresh()
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submit(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {pendingFieldLog && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            <strong className="font-semibold">Zápis z pole čeká na schválení.</strong> Doplňte, co
            se v provozu nezadávalo – osev, cílový organismus, způsob aplikace – a schválením ho
            propíšete do evidence.
          </p>
        </div>
      )}

      {/* Parcela, osev, datum */}
      <div className="rounded-lg bg-white p-5 shadow-md">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Parcela a termín
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Parcela</span>
            <select
              value={parcelId}
              onChange={(event) => {
                const next = parcels.find((candidate) => candidate.id === event.target.value)
                setParcelId(event.target.value)
                setParcelCropId('')
                if (next) setAppliedArea(String(next.area))
              }}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {parcels.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                  {candidate.blockCode ? ` (DPB ${candidate.blockCode})` : ''}
                </option>
              ))}
            </select>
            {parcel && (
              <span className="mt-1 block text-xs text-gray-500">
                Výměra parcely {parcel.area} ha
                {parcel.landBlockNote ? ` · ${parcel.landBlockNote}` : ''}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Osev (plodina)</span>
            <select
              value={parcelCropId}
              onChange={(event) => setParcelCropId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Bez osevu</option>
              {parcel?.crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.cropName} – sezóna {crop.season}
                </option>
              ))}
            </select>
            {parcelCrop && (
              <span className="mt-1 block text-xs text-gray-500">
                {parcelCrop.sowingDate
                  ? `Setí ${new Date(parcelCrop.sowingDate).toLocaleDateString('cs-CZ')}`
                  : 'Termín setí nezadaný'}
                {' · '}
                {parcelCrop.harvestDate
                  ? `sklizeň ${new Date(parcelCrop.harvestDate).toLocaleDateString('cs-CZ')}`
                  : 'termín sklizně nezadaný'}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Datum aplikace</span>
            <input
              type="date"
              value={applicationDate}
              onChange={(event) => setApplicationDate(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Ošetřená výměra (ha)
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={appliedArea}
              onChange={(event) => setAppliedArea(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            {parcel && Number(appliedArea) > parcel.area + 0.01 && (
              <span className="mt-1 block text-xs text-red-600">
                Výměra převyšuje parcelu ({parcel.area} ha)
              </span>
            )}
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Mód</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as 'skutecnost' | 'plan')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="skutecnost">Skutečnost</option>
              <option value="plan">Plán</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Způsob aplikace</span>
            <input
              type="text"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              placeholder="Vlastní zařízení, služba…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Poznámka</span>
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Položky */}
      <div className="rounded-lg bg-white p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Hnojiva a přípravky
            {items.length > 1 && (
              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal normal-case text-gray-600">
                tankmix
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, emptyItem()])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Přidat položku
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <ItemRow
              key={item.key}
              item={item}
              index={index}
              canRemove={items.length > 1}
              cropName={parcelCrop?.cropName ?? null}
              harvestDate={parcelCrop?.harvestDate ?? null}
              applicationDate={applicationDate}
              totalArea={Number(appliedArea)}
              onChange={(patch) => updateItem(item.key, patch)}
              onSelectProduct={(product) => handleSelectProduct(item.key, product)}
              onRemove={() =>
                setItems((current) => current.filter((candidate) => candidate.key !== item.key))
              }
            />
          ))}
        </div>
      </div>

      {/* Výsledek kontrol po uložení */}
      {findings.length > 0 && (
        <div className="rounded-lg bg-white p-5 shadow-md">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Zjištění kontroly
          </h2>
          <FindingsList findings={findings} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              pendingFieldLog ? '/portal/hnojiva-por/schvaleni' : '/portal/hnojiva-por/evidence'
            )
          }
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {pendingFieldLog ? 'Zpět na schvalování' : 'Zpět na evidenci'}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            pendingFieldLog
              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {application ? 'Uložit změny' : 'Uložit aplikaci'}
        </button>
        {pendingFieldLog && (
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Uložit a schválit
          </button>
        )}
      </div>
    </form>
  )
}
