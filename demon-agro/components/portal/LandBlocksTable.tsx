'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  ChevronDown,
  ChevronRight,
  Droplets,
  Loader2,
  Map,
  Mountain,
  Search,
  Trash2,
} from 'lucide-react'
import type { LandBlock } from '@/lib/types/database'
import {
  erosionClassLabel,
  farmingModeLabel,
  lpisCultureLabel,
} from '@/lib/constants/land-blocks'
import { deleteLandBlock, saveLandBlockBpej } from '@/lib/actions/land-blocks'

interface LandBlocksTableProps {
  blocks: LandBlock[]
}

function formatNumber(value: number | null, digits = 2): string {
  if (value === null || value === undefined) return '–'
  return Number(value).toLocaleString('cs-CZ', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function formatBool(value: boolean | null): string {
  if (value === null || value === undefined) return '–'
  return value ? 'ano' : 'ne'
}

function formatDate(value: string | null): string {
  if (!value) return '–'
  return new Date(value).toLocaleDateString('cs-CZ')
}

/**
 * Seznam dílů půdních bloků s legislativními atributy.
 *
 * Filtrování běží v prohlížeči nad již načtenými daty – evidence má jednotky až
 * stovky DPB, takže reaguje okamžitě a psaní do hledání nic nepřerušuje.
 */
export function LandBlocksTable({ blocks }: LandBlocksTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [culture, setCulture] = useState('')
  const [onlyNvz, setOnlyNvz] = useState(false)
  const [onlyErosion, setOnlyErosion] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()

  const cultures = useMemo(() => {
    const set = new Set<string>()
    blocks.forEach((block) => {
      if (block.culture) set.add(block.culture)
    })
    return Array.from(set).sort()
  }, [blocks])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return blocks.filter((block) => {
      if (culture && block.culture !== culture) return false
      if (onlyNvz && !block.nitrate_vulnerable_zone) return false
      if (onlyErosion && (!block.erosion_class || block.erosion_class === 'NEO')) return false

      if (!needle) return true
      return (
        block.dpb_code.toLowerCase().includes(needle) ||
        block.square_code.toLowerCase().includes(needle) ||
        (block.cadastral_area ?? '').toLowerCase().includes(needle)
      )
    })
  }, [blocks, search, culture, onlyNvz, onlyErosion])

  const filteredArea = filtered.reduce((sum, block) => sum + (Number(block.area) || 0), 0)

  const handleDelete = (block: LandBlock) => {
    const confirmed = window.confirm(
      `Smazat DPB ${block.dpb_code} (${formatNumber(block.area)} ha) z evidence?`
    )
    if (!confirmed) return

    setDeletingId(block.id)
    startDeleting(async () => {
      const result = await deleteLandBlock(block.id)
      setDeletingId(null)

      if (!result.success) {
        toast.error(result.error ?? 'DPB se nepodařilo smazat')
        return
      }

      toast.success(`DPB ${block.dpb_code} smazán`)
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg bg-white shadow-md">
      {/* Filtry – bez debounce, filtruje se lokálně */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kód DPB, čtverec nebo katastrální území"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <select
          value={culture}
          onChange={(event) => setCulture(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">Všechny kultury</option>
          {cultures.map((code) => (
            <option key={code} value={code}>
              {lpisCultureLabel(code)}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onlyNvz}
            onChange={(event) => setOnlyNvz(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Jen zranitelná oblast
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onlyErosion}
            onChange={(event) => setOnlyErosion(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Jen erozně ohrožené
        </label>
      </div>

      {filtered.length !== blocks.length && (
        <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-600">
          Zobrazeno {filtered.length} z {blocks.length} DPB ({formatNumber(filteredArea)} ha)
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <Map className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-900">Žádný DPB neodpovídá filtru</p>
          <p className="mt-1 text-sm text-gray-600">Zkuste zrušit filtry nebo změnit hledaný text.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-8 px-2 py-3" />
                <th className="px-4 py-3 text-left font-semibold text-gray-700">DPB</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Katastrální území
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Výměra</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kultura</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Půda</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Omezení</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((block) => {
                const isOpen = expanded === block.id
                const erosionRisk = Boolean(block.erosion_class && block.erosion_class !== 'NEO')

                return (
                  <Fragment key={block.id}>
                    <tr
                      className="cursor-pointer transition-colors hover:bg-amber-50/50"
                      onClick={() => setExpanded(isOpen ? null : block.id)}
                    >
                      <td className="px-2 py-3 text-gray-400">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{block.dpb_code}</span>
                        <span className="ml-2 text-xs text-gray-500">{block.square_code}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{block.cadastral_area ?? '–'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
                        {formatNumber(block.area)} ha
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lpisCultureLabel(block.culture)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {block.soil_kind ?? '–'}
                        {block.slope_degrees !== null && (
                          <span className="ml-1 text-xs text-gray-500">
                            {formatNumber(block.slope_degrees, 1)}°
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {block.nitrate_vulnerable_zone && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                              <Droplets className="h-3 w-3" />
                              ZOD {block.application_zone ?? ''}
                            </span>
                          )}
                          {erosionRisk && (
                            <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-800">
                              <Mountain className="h-3 w-3" />
                              {block.erosion_class}
                            </span>
                          )}
                          {block.farming_mode === 'EKO' && (
                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
                              EKO
                            </span>
                          )}
                          {block.water_distance_m !== null && block.water_distance_m <= 25 && (
                            <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-xs font-medium text-cyan-800">
                              {formatNumber(block.water_distance_m, 0)} m od vody
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDelete(block)
                          }}
                          disabled={isDeleting && deletingId === block.id}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Smazat DPB ${block.dpb_code}`}
                        >
                          {isDeleting && deletingId === block.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-gray-50">
                        <td />
                        <td colSpan={7} className="px-4 py-4">
                          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
                            <Detail label="Výměra bez krajinných prvků">
                              {formatNumber(block.area_without_features)} ha
                            </Detail>
                            <Detail label="Obvod">{formatNumber(block.perimeter_m, 0)} m</Detail>
                            <Detail label="Režim hospodaření">
                              {farmingModeLabel(block.farming_mode)}
                            </Detail>
                            <Detail label="Zranitelná oblast dusíkem">
                              {formatBool(block.nitrate_vulnerable_zone)}
                            </Detail>
                            <Detail label="Aplikační pásmo">
                              {block.application_zone ?? '–'}
                            </Detail>
                            <Detail label="Erozní ohroženost">
                              {erosionClassLabel(block.erosion_class)}
                            </Detail>
                            <Detail label="Druh půdy">
                              {block.soil_kind ?? '–'}
                              {block.soil_type ? ` (${block.soil_type})` : ''}
                            </Detail>
                            <Detail label="Sklonitost">
                              {formatNumber(block.slope_degrees, 2)} °
                            </Detail>
                            <Detail label="Vzdálenost od vody">
                              {formatNumber(block.water_distance_m, 2)} m
                            </Detail>
                            <Detail label="Meliorace">{formatBool(block.drainage)}</Detail>
                            <Detail label="LFA/ANC">
                              {block.lfa_type ?? '–'}
                              {block.lfa_area_text ? ` – ${block.lfa_area_text}` : ''}
                            </Detail>
                            <Detail label="ZCHÚ">
                              {block.protected_area_type ?? '–'}
                              {block.protected_area_ha
                                ? ` (${formatNumber(block.protected_area_ha)} ha)`
                                : ''}
                            </Detail>
                            <Detail label="Ochranné pásmo ZCHÚ">
                              {formatNumber(block.buffer_zone_ha)} ha
                            </Detail>
                            <Detail label="Environmentálně citlivé TTP">
                              {formatNumber(block.ect_ha)} ha
                            </Detail>
                            <Detail label="AEKO/ALS">{block.aeko_als ?? '–'}</Detail>
                            <Detail label="Ekologické zemědělství od">
                              {formatDate(block.organic_from)}
                            </Detail>
                            <Detail label="Přechodné období od">
                              {formatDate(block.organic_conversion_from)}
                            </Detail>
                            <Detail label="Data z LPIS">
                              {formatDate(block.imported_at)}
                              {block.source_file ? ` – ${block.source_file}` : ''}
                            </Detail>
                          </dl>

                          {block.nitrate_vulnerable_zone && <BpejForm block={block} />}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const YIELD_LEVEL_NOTES: Record<number, string> = {
  1: 'nižší výnosy – nižší limity přívodu dusíku',
  2: 'zbytkové zařazení všech ostatních BPEJ',
  3: 'nejvyšší výnosy – nejvyšší limity přívodu dusíku',
}

/**
 * Zadání BPEJ u dílu půdního bloku ve zranitelné oblasti.
 *
 * Sestava z LPIS klimatický region ani výnosovou hladinu neuvádí, přitom na nich
 * stojí období zákazu hnojení a limit přívodu dusíku k plodině. Obojí je v kódu
 * BPEJ, který uživatel najde ve veřejném registru půdy, proto se zadává jen ten.
 */
function BpejForm({ block }: { block: LandBlock }) {
  const router = useRouter()
  const [code, setCode] = useState(block.bpej_code ?? '')
  const [isSaving, startSaving] = useTransition()

  const handleSave = () => {
    startSaving(async () => {
      const result = await saveLandBlockBpej(block.id, code)

      if (!result.success) {
        toast.error(result.error ?? 'Zařazení se nepodařilo uložit')
        return
      }

      const derived = result.classification
      toast.success(
        derived?.bpejCode
          ? `DPB ${block.dpb_code}: klimatický region ${derived.climaticRegion}, výnosová hladina ${derived.yieldLevel}` +
              (result.recheckedApplications
                ? ` – přepočítáno ${result.recheckedApplications} aplikací`
                : '')
          : `DPB ${block.dpb_code}: zařazení podle BPEJ smazáno`
      )
      router.refresh()
    })
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor={`bpej-${block.id}`}
            className="block text-xs font-medium text-gray-700"
          >
            Kód BPEJ
          </label>
          <input
            id={`bpej-${block.id}`}
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="např. 5.29.01"
            className="mt-1 w-36 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {isSaving ? 'Ukládám…' : 'Uložit zařazení'}
        </button>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-gray-500">
            Klimatický region:{' '}
            <span className="font-medium text-gray-900">{block.climatic_region ?? '–'}</span>
          </span>
          <span className="text-gray-500">
            Výnosová hladina:{' '}
            <span className="font-medium text-gray-900">{block.yield_level ?? '–'}</span>
            {block.yield_level !== null && (
              <span className="ml-1 text-xs text-gray-500">
                ({YIELD_LEVEL_NOTES[block.yield_level]})
              </span>
            )}
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {block.climatic_region === null
          ? 'Bez BPEJ nelze určit období zákazu hnojení a limit přívodu dusíku se počítá z výchozí výnosové hladiny 2.'
          : 'Aplikační pásmo zůstává z LPIS, z BPEJ se bere klimatický region a výnosová hladina. Změna přepočítá kontroly u aplikací na tomto DPB.'}
      </p>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{children}</dd>
    </div>
  )
}
