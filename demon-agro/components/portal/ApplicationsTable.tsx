'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { ApplicationCheckStatus, ApplicationWithDetails } from '@/lib/types/database'
import type { CheckFinding, CheckSeverity } from '@/lib/utils/application-checks'
import { deleteApplication, recheckApplications } from '@/lib/actions/applications'

interface ApplicationsTableProps {
  applications: ApplicationWithDetails[]
  parcels: { id: string; name: string }[]
  seasons: number[]
  /** Předvolená parcela – z odkazu z bilance dusíku */
  initialParcelId?: string
}

const KIND_LABELS: Record<string, string> = {
  hnojivo: 'hnojivo',
  por: 'POR',
  pomocna: 'pomocná látka',
}

const STATUS_STYLES: Record<ApplicationCheckStatus, { label: string; className: string }> = {
  error: { label: 'Chyba', className: 'bg-red-100 text-red-700' },
  warning: { label: 'Varování', className: 'bg-amber-100 text-amber-700' },
  info: { label: 'Poznámka', className: 'bg-blue-100 text-blue-700' },
  ok: { label: 'V pořádku', className: 'bg-green-100 text-green-700' },
  unchecked: { label: 'Nezkontrolováno', className: 'bg-gray-100 text-gray-600' },
}

function formatNumber(value: number | string | null, digits = 2): string {
  if (value === null || value === undefined) return '–'
  return Number(value).toLocaleString('cs-CZ', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('cs-CZ')
}

function readFindings(application: ApplicationWithDetails): CheckFinding[] {
  return Array.isArray(application.check_findings)
    ? (application.check_findings as unknown as CheckFinding[])
    : []
}

const SEVERITY_ICON: Record<CheckSeverity, React.ReactNode> = {
  error: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />,
  info: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
}

/**
 * Přehled evidence aplikací se stavem kontrol.
 *
 * Filtruje se v prohlížeči nad načtenou evidencí – i několik set aplikací tak
 * reaguje okamžitě a psaní do hledání se nepřerušuje dotazem na server.
 */
export function ApplicationsTable({
  applications,
  parcels,
  seasons,
  initialParcelId = '',
}: ApplicationsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [season, setSeason] = useState('')
  const [parcelId, setParcelId] = useState(initialParcelId)
  const [status, setStatus] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()
  const [isChecking, startChecking] = useTransition()

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return applications.filter((application) => {
      if (season && String(application.parcel_crop?.season ?? '') !== season) return false
      if (parcelId && application.crop_parcel_id !== parcelId) return false
      if (status && application.check_status !== status) return false
      if (!needle) return true

      const haystack = [
        application.parcel?.name,
        application.parcel?.block_code,
        application.parcel_crop?.crop_name,
        ...application.items.map((item) => item.product_name),
        ...application.items.map((item) => item.target_pest),
      ]

      return haystack.some((value) => value?.toLowerCase().includes(needle))
    })
  }, [applications, search, season, parcelId, status])

  const filteredArea = filtered.reduce(
    (sum, application) => sum + (Number(application.applied_area) || 0),
    0
  )

  const handleDelete = (application: ApplicationWithDetails) => {
    const confirmed = window.confirm(
      `Smazat aplikaci z ${formatDate(application.application_date)} na parcele ${application.parcel?.name}?`
    )
    if (!confirmed) return

    setDeletingId(application.id)
    startDeleting(async () => {
      const result = await deleteApplication(application.id)
      setDeletingId(null)

      if (!result.success) {
        toast.error(result.error ?? 'Aplikaci se nepodařilo smazat')
        return
      }

      toast.success('Aplikace smazána')
      router.refresh()
    })
  }

  const handleRecheck = () => {
    startChecking(async () => {
      const result = await recheckApplications()

      if (!result.success) {
        toast.error(result.error ?? 'Kontrolu se nepodařilo dokončit')
        return
      }

      toast.success(
        `Zkontrolováno ${result.checked} aplikací – ${result.errors} chyb, ${result.warnings} varování`
      )
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg bg-white shadow-md">
      {/* Filtry */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Parcela, blok, plodina, přípravek nebo hnojivo"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <select
          value={season}
          onChange={(event) => setSeason(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          <option value="">Všechny sezóny</option>
          {seasons.map((value) => (
            <option key={value} value={value}>
              Sezóna {value}
            </option>
          ))}
        </select>

        <select
          value={parcelId}
          onChange={(event) => setParcelId(event.target.value)}
          className="max-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          <option value="">Všechny parcely</option>
          {parcels.map((parcel) => (
            <option key={parcel.id} value={parcel.id}>
              {parcel.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          <option value="">Všechny stavy</option>
          <option value="error">Jen chyby</option>
          <option value="warning">Jen varování</option>
          <option value="info">Jen poznámky</option>
          <option value="ok">Bez zjištění</option>
          <option value="unchecked">Nezkontrolované</option>
        </select>

        <button
          type="button"
          onClick={handleRecheck}
          disabled={isChecking}
          className="inline-flex items-center gap-2 rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-60"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Spustit kontrolu
        </button>
      </div>

      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600">
        {filtered.length} z {applications.length} aplikací ·{' '}
        {formatNumber(filteredArea)} ha ošetřené výměry
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="px-3 py-3 text-left font-medium text-gray-600">Datum</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Parcela / DPB</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Plodina</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600">Výměra</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Aplikováno</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Kontrola</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  Žádná aplikace neodpovídá filtru.
                </td>
              </tr>
            )}

            {filtered.map((application) => {
              const findings = readFindings(application)
              const isOpen = expanded === application.id
              const statusStyle = STATUS_STYLES[application.check_status]

              return (
                <Fragment key={application.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : application.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label={isOpen ? 'Skrýt detail' : 'Zobrazit detail'}
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-900">
                      {formatDate(application.application_date)}
                      {application.mode === 'plan' && (
                        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                          plán
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900">{application.parcel?.name}</div>
                      {application.parcel?.block_code && (
                        <div className="text-xs text-gray-500">
                          DPB {application.parcel.block_code}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {application.parcel_crop?.crop_name ?? '–'}
                      {application.parcel_crop?.season && (
                        <div className="text-xs text-gray-500">
                          sezóna {application.parcel_crop.season}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-gray-700">
                      {formatNumber(application.applied_area)} ha
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {application.items.map((item) => (
                          <span
                            key={item.id}
                            className={`rounded px-1.5 py-0.5 text-xs ${
                              item.kind === 'hnojivo'
                                ? 'bg-green-50 text-green-700'
                                : item.kind === 'por'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                            title={`${KIND_LABELS[item.kind]} · ${formatNumber(item.dose, 3)} ${item.unit}`}
                          >
                            {item.product_name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.className}`}
                      >
                        {application.check_status === 'ok' && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {statusStyle.label}
                        {findings.length > 0 && ` (${findings.length})`}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/portal/hnojiva-por/evidence/${application.id}`}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600"
                          title="Upravit aplikaci"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(application)}
                          disabled={isDeleting && deletingId === application.id}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Smazat aplikaci"
                        >
                          {isDeleting && deletingId === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                          {/* Položky */}
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Položky aplikace
                            </h4>
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="text-left text-gray-500">
                                  <th className="py-1 pr-3">Produkt</th>
                                  <th className="py-1 pr-3">Druh</th>
                                  <th className="py-1 pr-3 text-right">Dávka</th>
                                  <th className="py-1 pr-3 text-right">Celkem</th>
                                  <th className="py-1 pr-3">Cílový organismus</th>
                                  <th className="py-1 text-right">N kg/ha</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {application.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-1.5 pr-3 font-medium text-gray-900">
                                      {item.por_item_id ? (
                                        <Link
                                          href={`/portal/hnojiva-por/pripravky/${item.por_item_id}`}
                                          className="hover:text-green-600 hover:underline"
                                        >
                                          {item.product_name}
                                        </Link>
                                      ) : item.fert_evidence_number ? (
                                        <Link
                                          href={`/portal/hnojiva-por/hnojiva/${encodeURIComponent(item.fert_evidence_number)}`}
                                          className="hover:text-green-600 hover:underline"
                                        >
                                          {item.product_name}
                                        </Link>
                                      ) : (
                                        item.product_name
                                      )}
                                    </td>
                                    <td className="py-1.5 pr-3 text-gray-600">
                                      {KIND_LABELS[item.kind]}
                                    </td>
                                    <td className="py-1.5 pr-3 text-right text-gray-700">
                                      {formatNumber(item.dose, 3)} {item.unit}
                                    </td>
                                    <td className="py-1.5 pr-3 text-right text-gray-700">
                                      {item.total_amount !== null
                                        ? `${formatNumber(item.total_amount, 3)} ${item.unit.replace('/ha', '')}`
                                        : '–'}
                                    </td>
                                    <td className="py-1.5 pr-3 text-gray-600">
                                      {item.target_pest ?? '–'}
                                    </td>
                                    <td className="py-1.5 text-right text-gray-700">
                                      {item.n_kg_ha !== null ? (
                                        formatNumber(item.n_kg_ha, 1)
                                      ) : item.kind === 'hnojivo' ? (
                                        <span
                                          className="text-red-700"
                                          title="Přívod dusíku není doložen – doplňte ho podle etikety nebo dodacího listu"
                                        >
                                          chybí
                                        </span>
                                      ) : (
                                        '–'
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <NutrientSummary items={application.items} />

                            {application.notes && (
                              <p className="mt-3 text-xs text-gray-600">
                                <span className="font-medium">Poznámka:</span> {application.notes}
                              </p>
                            )}
                          </div>

                          {/* Zjištění kontrol */}
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Kontrola
                              {application.checked_at && (
                                <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">
                                  {new Date(application.checked_at).toLocaleString('cs-CZ')}
                                </span>
                              )}
                            </h4>

                            {findings.length === 0 ? (
                              <p className="flex items-center gap-2 text-xs text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                {application.check_status === 'unchecked'
                                  ? 'Aplikace ještě nebyla zkontrolovaná.'
                                  : 'Kontrola neodhalila žádný problém.'}
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {findings.map((finding, index) => (
                                  <li
                                    key={`${finding.code}-${index}`}
                                    className="flex gap-2 rounded border border-gray-200 bg-white p-2"
                                  >
                                    {SEVERITY_ICON[finding.severity]}
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-gray-900">
                                        {finding.title}
                                      </p>
                                      {finding.detail && (
                                        <p className="mt-0.5 text-xs text-gray-600">
                                          {finding.detail}
                                        </p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
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
  )
}

/**
 * Přívod živin z hnojiv aplikace.
 *
 * Dusík je vstupem do limitů akčního programu, proto se sčítá i tam, kde je
 * jediné hnojivo – uživatel tak vidí totéž číslo, se kterým počítá kontrola.
 */
function NutrientSummary({ items }: { items: ApplicationWithDetails['items'] }) {
  const fertilizers = items.filter((item) => item.kind === 'hnojivo')
  if (fertilizers.length === 0) return null

  const sum = (pick: (item: (typeof fertilizers)[number]) => number | null) =>
    fertilizers.reduce((total, item) => total + Number(pick(item) ?? 0), 0)

  const nitrogen = sum((item) => item.n_kg_ha)
  const phosphorus = sum((item) => item.p2o5_kg_ha)
  const potassium = sum((item) => item.k2o_kg_ha)
  const incomplete = fertilizers.some((item) => item.n_kg_ha === null)

  if (nitrogen === 0 && phosphorus === 0 && potassium === 0 && !incomplete) return null

  return (
    <p className="mt-2 text-xs text-gray-600">
      <span className="font-medium">Přívod živin:</span> {formatNumber(nitrogen, 1)} kg N/ha ·{' '}
      {formatNumber(phosphorus, 1)} kg P₂O₅/ha · {formatNumber(potassium, 1)} kg K₂O/ha
      {incomplete && (
        <span className="ml-1 text-red-700">
          (neúplné – u položky chybí doložený přívod)
        </span>
      )}
    </p>
  )
}
