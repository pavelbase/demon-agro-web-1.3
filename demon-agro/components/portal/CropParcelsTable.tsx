'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react'
import type { CropParcelOverview } from '@/lib/database/application-queries'
import {
  deleteCropParcel,
  deleteParcelCrop,
  saveCropParcel,
  saveParcelCrop,
} from '@/lib/actions/crop-parcels'

interface CropParcelsTableProps {
  parcels: CropParcelOverview[]
  landBlocks: { id: string; dpbCode: string; area: number; cadastralArea: string | null }[]
  crops: { id: number; name: string }[]
}

function formatNumber(value: number | null, digits = 2): string {
  if (value === null || value === undefined) return '–'
  return Number(value).toLocaleString('cs-CZ', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('cs-CZ') : '–'
}

const currentSeason = (() => {
  const now = new Date()
  return now.getMonth() + 1 >= 8 ? now.getFullYear() + 1 : now.getFullYear()
})()

/**
 * Správa evidenčních parcel a osevů
 *
 * Termíny setí a sklizně tady nejsou jen popisné údaje – z nich vychází kontrola
 * ochranných lhůt a to, jestli datum aplikace k plodině vůbec patří. Po jejich
 * změně se dotčené aplikace automaticky překontrolují.
 */
export function CropParcelsTable({ parcels, landBlocks, crops }: CropParcelsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNewParcel, setShowNewParcel] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return parcels

    return parcels.filter(
      (parcel) =>
        parcel.name.toLowerCase().includes(needle) ||
        (parcel.blockCode ?? '').toLowerCase().includes(needle) ||
        parcel.crops.some((crop) => crop.cropName.toLowerCase().includes(needle))
    )
  }, [parcels, search])

  const handleDeleteParcel = (parcel: CropParcelOverview) => {
    if (!window.confirm(`Smazat parcelu ${parcel.name}?`)) return

    startTransition(async () => {
      const result = await deleteCropParcel(parcel.id)
      if (!result.success) {
        toast.error(result.error ?? 'Parcelu se nepodařilo smazat')
        return
      }
      toast.success('Parcela smazána')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white shadow-md">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Parcela, kód DPB nebo plodina"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowNewParcel((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Nová parcela
          </button>
        </div>

        {showNewParcel && (
          <ParcelForm
            landBlocks={landBlocks}
            onDone={() => {
              setShowNewParcel(false)
              router.refresh()
            }}
            onCancel={() => setShowNewParcel(false)}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-2 py-3" />
                <th className="px-3 py-3 text-left font-medium text-gray-600">Parcela</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Díl půdního bloku</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Výměra</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600">Osevy</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Aplikací</th>
                <th className="px-3 py-3 text-right font-medium text-gray-600">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Žádná parcela neodpovídá filtru.
                  </td>
                </tr>
              )}

              {filtered.map((parcel) => {
                const isOpen = expanded === parcel.id
                const latest = parcel.crops[0]
                const missingDates = parcel.crops.filter(
                  (crop) => !crop.harvestDate && crop.applicationCount > 0
                ).length

                return (
                  <Fragment key={parcel.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : parcel.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label={isOpen ? 'Skrýt osevy' : 'Zobrazit osevy'}
                        >
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900">{parcel.name}</td>
                      <td className="px-3 py-3 text-gray-700">
                        {parcel.blockCode ? (
                          <>
                            {parcel.blockCode}
                            {!parcel.landBlockId && (
                              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                                není v LPIS
                              </span>
                            )}
                            {parcel.landBlock?.nitrate_vulnerable_zone && (
                              <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                                ZOD
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-700">nepřiřazen</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-gray-700">
                        {formatNumber(parcel.area)} ha
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {parcel.crops.length === 0 ? (
                          <span className="text-amber-700">žádný osev</span>
                        ) : (
                          <>
                            {latest.cropName} ({latest.season})
                            {parcel.crops.length > 1 && (
                              <span className="text-gray-500"> +{parcel.crops.length - 1}</span>
                            )}
                          </>
                        )}
                        {missingDates > 0 && (
                          <span
                            className="ml-2 inline-flex items-center gap-1 text-xs text-amber-700"
                            title="Bez termínu sklizně nelze ověřit ochranné lhůty"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {missingDates}× chybí sklizeň
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700">
                        {parcel.applicationCount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteParcel(parcel)}
                          disabled={isPending}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Smazat parcelu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-4">
                          <ParcelCropsEditor parcel={parcel} crops={crops} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// NOVÁ PARCELA
// ============================================================================

function ParcelForm({
  landBlocks,
  onDone,
  onCancel,
}: {
  landBlocks: CropParcelsTableProps['landBlocks']
  onDone: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [landBlockId, setLandBlockId] = useState('')
  const [area, setArea] = useState('')
  const [isSaving, startSaving] = useTransition()

  const selectedBlock = landBlocks.find((block) => block.id === landBlockId)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startSaving(async () => {
      const result = await saveCropParcel({
        name,
        area: Number(area),
        landBlockId: landBlockId || null,
      })

      if (!result.success) {
        toast.error(result.error ?? 'Parcelu se nepodařilo uložit')
        return
      }

      toast.success('Parcela založena')
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-200 bg-amber-50/50 p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">Název parcely</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="např. Hliník 2"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-medium text-gray-700">Díl půdního bloku</span>
          <select
            value={landBlockId}
            onChange={(event) => {
              setLandBlockId(event.target.value)
              const block = landBlocks.find((candidate) => candidate.id === event.target.value)
              if (block && !area) setArea(String(block.area))
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          >
            <option value="">Bez vazby na LPIS</option>
            {landBlocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.dpbCode} – {block.area} ha
                {block.cadastralArea ? ` (${block.cadastralArea})` : ''}
              </option>
            ))}
          </select>
          {selectedBlock && (
            <span className="mt-1 block text-xs text-gray-500">
              Parcela může být menší než DPB – zadejte skutečně obhospodařovanou výměru.
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">Výměra (ha)</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Založit parcelu
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white"
        >
          Zrušit
        </button>
      </div>
    </form>
  )
}

// ============================================================================
// OSEVY PARCELY
// ============================================================================

function ParcelCropsEditor({
  parcel,
  crops,
}: {
  parcel: CropParcelOverview
  crops: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [showNew, setShowNew] = useState(parcel.crops.length === 0)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Osevy parcely {parcel.name}
        </h4>
        <button
          type="button"
          onClick={() => setShowNew((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Přidat osev
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-2 py-2 text-left font-medium">Plodina</th>
              <th className="px-2 py-2 text-left font-medium">Sezóna</th>
              <th className="px-2 py-2 text-left font-medium">Setí</th>
              <th className="px-2 py-2 text-left font-medium">Sklizeň</th>
              <th className="px-2 py-2 text-left font-medium">Odrůda</th>
              <th className="px-2 py-2 text-right font-medium">Výnos t/ha</th>
              <th className="px-2 py-2 text-right font-medium">Aplikací</th>
              <th className="px-2 py-2 text-right font-medium">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {showNew && (
              <CropRow
                parcelId={parcel.id}
                crops={crops}
                onDone={() => {
                  setShowNew(false)
                  router.refresh()
                }}
              />
            )}

            {parcel.crops.map((crop) => (
              <CropRow
                key={crop.id}
                parcelId={parcel.id}
                crops={crops}
                crop={crop}
                onDone={() => router.refresh()}
              />
            ))}

            {parcel.crops.length === 0 && !showNew && (
              <tr>
                <td colSpan={8} className="px-2 py-4 text-center text-gray-500">
                  Parcela nemá žádný osev. Bez plodiny nelze kontrolovat registrované použití
                  přípravků.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Termín sklizně je potřeba pro kontrolu ochranných lhůt, termín setí pro posouzení, jestli
        aplikace patří k této plodině. Po uložení se dotčené aplikace automaticky překontrolují.
      </p>
    </div>
  )
}

function CropRow({
  parcelId,
  crops,
  crop,
  onDone,
}: {
  parcelId: string
  crops: { id: number; name: string }[]
  crop?: CropParcelOverview['crops'][number]
  onDone: () => void
}) {
  const [cropName, setCropName] = useState(crop?.cropName ?? '')
  const [season, setSeason] = useState(String(crop?.season ?? currentSeason))
  const [sowingDate, setSowingDate] = useState(crop?.sowingDate ?? '')
  const [harvestDate, setHarvestDate] = useState(crop?.harvestDate ?? '')
  const [variety, setVariety] = useState(crop?.variety ?? '')
  const [yieldTHa, setYieldTHa] = useState(crop?.yieldTHa !== null && crop?.yieldTHa !== undefined ? String(crop.yieldTHa) : '')
  const [isSaving, startSaving] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  const isDirty =
    cropName !== (crop?.cropName ?? '') ||
    season !== String(crop?.season ?? currentSeason) ||
    sowingDate !== (crop?.sowingDate ?? '') ||
    harvestDate !== (crop?.harvestDate ?? '') ||
    variety !== (crop?.variety ?? '') ||
    yieldTHa !== (crop?.yieldTHa !== null && crop?.yieldTHa !== undefined ? String(crop.yieldTHa) : '')

  const handleSave = () => {
    if (!cropName) {
      toast.error('Vyberte plodinu')
      return
    }

    startSaving(async () => {
      const result = await saveParcelCrop({
        id: crop?.id,
        cropParcelId: parcelId,
        cropId: crops.find((candidate) => candidate.name === cropName)?.id ?? null,
        cropName,
        season: Number(season),
        sowingDate: sowingDate || null,
        harvestDate: harvestDate || null,
        variety: variety || null,
        yieldTHa: yieldTHa ? Number(yieldTHa) : null,
      })

      if (!result.success) {
        toast.error(result.error ?? 'Osev se nepodařilo uložit')
        return
      }

      toast.success(
        result.recheckedApplications
          ? `Osev uložen, překontrolováno ${result.recheckedApplications} aplikací`
          : 'Osev uložen'
      )
      onDone()
    })
  }

  const handleDelete = () => {
    if (!crop) return
    if (crop.applicationCount > 0) {
      if (
        !window.confirm(
          `Osev má ${crop.applicationCount} evidovaných aplikací. Po smazání u nich zůstane prázdná plodina. Pokračovat?`
        )
      ) {
        return
      }
    }

    startDeleting(async () => {
      const result = await deleteParcelCrop(crop.id)
      if (!result.success) {
        toast.error(result.error ?? 'Osev se nepodařilo smazat')
        return
      }
      toast.success('Osev smazán')
      onDone()
    })
  }

  const inputClass =
    'w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-green-500 focus:outline-none'

  return (
    <tr className={crop ? '' : 'bg-amber-50/50'}>
      <td className="px-2 py-1.5">
        <select
          value={cropName}
          onChange={(event) => setCropName(event.target.value)}
          className={inputClass}
        >
          <option value="">— vyberte —</option>
          {crops.map((candidate) => (
            <option key={candidate.id} value={candidate.name}>
              {candidate.name}
            </option>
          ))}
          {cropName && !crops.some((candidate) => candidate.name === cropName) && (
            <option value={cropName}>{cropName} (mimo číselník)</option>
          )}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          min="2000"
          max="2100"
          value={season}
          onChange={(event) => setSeason(event.target.value)}
          className={`${inputClass} w-20`}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="date"
          value={sowingDate}
          onChange={(event) => setSowingDate(event.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="date"
          value={harvestDate}
          onChange={(event) => setHarvestDate(event.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="text"
          value={variety}
          onChange={(event) => setVariety(event.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          step="0.01"
          min="0"
          value={yieldTHa}
          onChange={(event) => setYieldTHa(event.target.value)}
          className={`${inputClass} text-right`}
        />
      </td>
      <td className="px-2 py-1.5 text-right text-gray-600">{crop?.applicationCount ?? 0}</td>
      <td className="whitespace-nowrap px-2 py-1.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || (!isDirty && !!crop)}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 disabled:opacity-30"
            title={crop ? 'Uložit změny' : 'Uložit osev'}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </button>
          {crop && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              title="Smazat osev"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
