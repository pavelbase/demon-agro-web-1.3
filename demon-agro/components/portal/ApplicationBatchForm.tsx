'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Layers,
  Loader2,
  Plus,
  Save,
} from 'lucide-react'
import { getUsageHint, type ProductSearchResult } from '@/lib/actions/application-products'
import {
  saveApplicationsBatch,
  type BatchTargetResult,
  type SaveApplicationsBatchPayload,
} from '@/lib/actions/applications'
import type { ApplicationCheckStatus } from '@/lib/types/database'
import {
  emptyItem,
  FindingsList,
  ItemRow,
  type ItemState,
} from '@/components/portal/ApplicationItemRow'
import type { FormParcel } from '@/components/portal/ApplicationForm'

interface ApplicationBatchFormProps {
  parcels: FormParcel[]
}

/** Parcela s osevem vybrané plodiny – jeden řádek výběru. */
interface CropTarget {
  parcelCropId: string
  cropParcelId: string
  parcelName: string
  blockCode: string | null
  landBlockNote: string | null
  parcelArea: number
  defaultArea: number
  sowingDate: string | null
  harvestDate: string | null
}

interface CropGroup {
  key: string
  cropName: string
  season: number
  targets: CropTarget[]
  totalArea: number
}

const STATUS_STYLES: Record<ApplicationCheckStatus, { label: string; className: string }> = {
  error: { label: 'Chyba', className: 'bg-red-100 text-red-700' },
  warning: { label: 'Varování', className: 'bg-amber-100 text-amber-700' },
  info: { label: 'Poznámka', className: 'bg-blue-100 text-blue-700' },
  ok: { label: 'V pořádku', className: 'bg-green-100 text-green-700' },
  unchecked: { label: 'Nezkontrolováno', className: 'bg-gray-100 text-gray-600' },
}

/** Osevy se seskupí podle plodiny a sezóny – to je jednotka souhrnného zadání. */
function buildGroups(parcels: FormParcel[]): CropGroup[] {
  const groups = new Map<string, CropGroup>()

  for (const parcel of parcels) {
    for (const crop of parcel.crops) {
      const key = `${crop.season}::${crop.cropName}`
      const group = groups.get(key) ?? {
        key,
        cropName: crop.cropName,
        season: crop.season,
        targets: [],
        totalArea: 0,
      }

      group.targets.push({
        parcelCropId: crop.id,
        cropParcelId: parcel.id,
        parcelName: parcel.name,
        blockCode: parcel.blockCode,
        landBlockNote: parcel.landBlockNote,
        parcelArea: parcel.area,
        defaultArea: crop.area ?? parcel.area,
        sowingDate: crop.sowingDate,
        harvestDate: crop.harvestDate,
      })

      groups.set(key, group)
    }
  }

  const list = Array.from(groups.values())

  for (const group of list) {
    group.targets.sort((a, b) => a.parcelName.localeCompare(b.parcelName, 'cs'))
    group.totalArea = group.targets.reduce((sum, target) => sum + target.defaultArea, 0)
  }

  return list.sort(
    (a, b) => b.season - a.season || a.cropName.localeCompare(b.cropName, 'cs')
  )
}

/**
 * Souhrnné zadání aplikace
 *
 * Jeden postřik nebo hnojení proběhne v jeden den na všech pozemcích s danou
 * plodinou. Formulář proto zapisuje jednu sadu produktů na vybrané parcely
 * najednou – evidenční kniha ale musí vést každou parcelu zvlášť, takže
 * vznikne samostatný záznam na parcelu s vlastní výměrou a vlastním
 * výsledkem kontrol (omezení DPB i termíny osevu se mezi parcelami liší).
 */
export function ApplicationBatchForm({ parcels }: ApplicationBatchFormProps) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()

  const groups = useMemo(() => buildGroups(parcels), [parcels])

  const [groupKey, setGroupKey] = useState(groups[0]?.key ?? '')
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().slice(0, 10))
  const [mode, setMode] = useState<'skutecnost' | 'plan'>('skutecnost')
  const [method, setMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ItemState[]>([emptyItem()])
  const [areas, setAreas] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<BatchTargetResult[] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const group = groups.find((candidate) => candidate.key === groupKey) ?? null

  // Změna plodiny vybere všechny její parcely – postřik se obvykle udělá na celou plodinu
  useEffect(() => {
    if (!group) return
    setSelected(new Set(group.targets.map((target) => target.parcelCropId)))
    setAreas(
      Object.fromEntries(
        group.targets.map((target) => [target.parcelCropId, String(target.defaultArea)])
      )
    )
    setResults(null)
  }, [group])

  const selectedTargets = (group?.targets ?? []).filter((target) =>
    selected.has(target.parcelCropId)
  )
  const totalArea = selectedTargets.reduce(
    (sum, target) => sum + (Number(areas[target.parcelCropId]) || 0),
    0
  )

  // Ochranná lhůta se hodnotí proti nejbližší sklizni z vybraných parcel
  const earliestHarvest = selectedTargets.reduce<string | null>(
    (earliest, target) =>
      target.harvestDate && (earliest === null || target.harvestDate < earliest)
        ? target.harvestDate
        : earliest,
    null
  )
  const missingHarvest = selectedTargets.filter((target) => !target.harvestDate).length

  const updateItem = (key: string, patch: Partial<ItemState>) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

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
      if (item.porItemId) loadHint(item.key, item.porItemId, group?.cropName ?? null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.cropName])

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
    loadHint(key, product.porItemId, group?.cropName ?? null)
  }

  const toggleTarget = (parcelCropId: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(parcelCropId)) next.delete(parcelCropId)
      else next.add(parcelCropId)
      return next
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!group) return

    if (selectedTargets.length === 0) {
      toast.error('Vyberte alespoň jednu parcelu')
      return
    }

    const payload: SaveApplicationsBatchPayload = {
      applicationDate,
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
      targets: selectedTargets.map((target) => ({
        cropParcelId: target.cropParcelId,
        parcelCropId: target.parcelCropId,
        appliedArea: Number(areas[target.parcelCropId]) || target.defaultArea,
      })),
    }

    startSaving(async () => {
      const result = await saveApplicationsBatch(payload)

      if (!result.success) {
        toast.error(result.error ?? 'Aplikace se nepodařilo uložit')
        return
      }

      setResults(result.results ?? [])

      const summary = [
        `Zapsáno ${result.created} aplikací`,
        result.errorCount ? `${result.errorCount} s chybou` : null,
        result.warningCount ? `${result.warningCount} s varováním` : null,
      ]
        .filter(Boolean)
        .join(', ')

      toast.success(summary, { icon: result.errorCount ? '⚠️' : undefined })
      router.refresh()
    })
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-md">
        <Layers className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Nejdřív zadejte osevy</h2>
        <p className="mx-auto mb-6 max-w-lg text-sm text-gray-600">
          Souhrnné zadání vychází z plodiny – vybere všechny parcely, na kterých je v dané sezóně
          vedená. Bez osevů nemá co nabídnout.
        </p>
        <Link
          href="/portal/hnojiva-por/parcely"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          <Layers className="h-4 w-4" />
          Parcely a osevy
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plodina a termín */}
      <div className="rounded-lg bg-white p-5 shadow-md">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Plodina a termín
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-700">Plodina a sezóna</span>
            <select
              value={groupKey}
              onChange={(event) => setGroupKey(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {groups.map((candidate) => (
                <option key={candidate.key} value={candidate.key}>
                  {candidate.cropName} – sezóna {candidate.season} ({candidate.targets.length}{' '}
                  {candidate.targets.length === 1 ? 'parcela' : 'parcel'},{' '}
                  {candidate.totalArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha)
                </option>
              ))}
            </select>
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
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
              placeholder="Zapíše se ke každé parcele"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Výběr parcel */}
      <div className="rounded-lg bg-white p-5 shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Parcely
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal normal-case text-gray-600">
              {selectedTargets.length} z {group?.targets.length ?? 0} ·{' '}
              {totalArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set((group?.targets ?? []).map((t) => t.parcelCropId)))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Vybrat vše
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Odebrat vše
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="w-10 px-2 py-2" />
                <th className="px-3 py-2">Parcela</th>
                <th className="px-3 py-2">Omezení DPB</th>
                <th className="px-3 py-2">Sklizeň</th>
                <th className="px-3 py-2 text-right">Ošetřená výměra (ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(group?.targets ?? []).map((target) => {
                const isSelected = selected.has(target.parcelCropId)
                const areaValue = areas[target.parcelCropId] ?? String(target.defaultArea)
                const overParcel = Number(areaValue) > target.parcelArea + 0.01

                return (
                  <tr
                    key={target.parcelCropId}
                    className={isSelected ? 'bg-amber-50/40' : 'text-gray-500'}
                  >
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTarget(target.parcelCropId)}
                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{target.parcelName}</p>
                      <p className="text-xs text-gray-500">
                        {target.blockCode ? `DPB ${target.blockCode}` : 'bez DPB'} ·{' '}
                        {target.parcelArea} ha
                      </p>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {target.landBlockNote ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {target.harvestDate
                        ? new Date(target.harvestDate).toLocaleDateString('cs-CZ')
                        : 'nezadaná'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={areaValue}
                        onChange={(event) =>
                          setAreas((current) => ({
                            ...current,
                            [target.parcelCropId]: event.target.value,
                          }))
                        }
                        disabled={!isSelected}
                        className={`w-28 rounded-lg border px-2 py-1.5 text-right text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 ${
                          overParcel && isSelected
                            ? 'border-red-300 text-red-700'
                            : 'border-gray-300 focus:border-green-500'
                        }`}
                      />
                      {overParcel && isSelected && (
                        <p className="mt-1 text-xs text-red-600">
                          nad výměru parcely ({target.parcelArea} ha)
                        </p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Společné položky */}
      <div className="rounded-lg bg-white p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Hnojiva a přípravky
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal normal-case text-gray-600">
              {items.length > 1 ? 'tankmix · ' : ''}stejné pro všechny vybrané parcely
            </span>
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
              cropName={group?.cropName ?? null}
              harvestDate={earliestHarvest}
              harvestNote={
                selectedTargets.length > 1 ? 'nejbližší sklizeň z vybraných parcel' : undefined
              }
              applicationDate={applicationDate}
              totalArea={totalArea}
              onChange={(patch) => updateItem(item.key, patch)}
              onSelectProduct={(product) => handleSelectProduct(item.key, product)}
              onRemove={() =>
                setItems((current) => current.filter((candidate) => candidate.key !== item.key))
              }
            />
          ))}
        </div>

        {missingHarvest > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            U {missingHarvest} vybraných parcel není zadaný termín sklizně – ochrannou lhůtu tam
            nelze ověřit. Doplnit ho můžete v{' '}
            <Link href="/portal/hnojiva-por/parcely" className="font-medium text-amber-700 underline">
              parcelách a osevech
            </Link>
            .
          </p>
        )}
      </div>

      {/* Výsledek zápisu */}
      {results && results.length > 0 && (
        <div className="rounded-lg bg-white p-5 shadow-md">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Zapsané aplikace a kontroly
            </h2>
            <Link
              href="/portal/hnojiva-por/evidence"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              <ClipboardList className="h-4 w-4" />
              Otevřít evidenci
            </Link>
          </div>

          <ul className="divide-y divide-gray-100">
            {results.map((result) => {
              const statusStyle = STATUS_STYLES[result.checkStatus]
              const isOpen = expanded === result.applicationId

              return (
                <li key={result.applicationId} className="py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : result.applicationId)}
                      disabled={result.findings.length === 0}
                      className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-0"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      {result.parcelName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.appliedArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.className}`}
                    >
                      {result.checkStatus === 'ok' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {statusStyle.label}
                      {result.findings.length > 0 && ` (${result.findings.length})`}
                    </span>
                    <Link
                      href={`/portal/hnojiva-por/evidence/${result.applicationId}`}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      upravit
                    </Link>
                  </div>

                  {isOpen && result.findings.length > 0 && (
                    <div className="mt-2 pl-7">
                      <FindingsList findings={result.findings} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              setItems([emptyItem()])
              setResults(null)
              setExpanded(null)
            }}
            className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Zapsat další sadu
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/portal/hnojiva-por/evidence')}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Zpět na evidenci
        </button>
        <button
          type="submit"
          disabled={isSaving || selectedTargets.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Zapsat na {selectedTargets.length}{' '}
          {selectedTargets.length === 1 ? 'parcelu' : selectedTargets.length < 5 ? 'parcely' : 'parcel'}
        </button>
      </div>
    </form>
  )
}
