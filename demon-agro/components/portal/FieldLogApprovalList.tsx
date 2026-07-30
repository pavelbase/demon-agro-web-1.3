'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Check, Loader2, MapPin, Pencil, Trash2 } from 'lucide-react'
import { approveFieldLogs, discardFieldLogs } from '@/lib/actions/field-log'
import { FindingsList } from '@/components/portal/ApplicationItemRow'
import type { CheckFinding } from '@/lib/utils/application-checks'
import type { ApplicationItemKind } from '@/lib/types/database'

/**
 * Fronta zápisů z pole čekajících na propsání do evidence
 *
 * Zápis z provozu je záměrně stručný, takže se tu kontroluje především to, co
 * obsluha nezadávala – výměra, osev a zjištění kontrol. Schválit jde víc zápisů
 * najednou, protože po dni v poli jich obvykle čeká několik podobných.
 */

export interface PendingFieldLog {
  id: string
  parcelName: string
  cropName: string | null
  applicationDate: string
  appliedArea: number
  parcelArea: number | null
  notes: string | null
  hasCrop: boolean
  findings: CheckFinding[]
  items: {
    kind: ApplicationItemKind
    productName: string
    dose: number
    unit: string
    targetPest: string | null
  }[]
}

export function FieldLogApprovalList({ logs }: { logs: PendingFieldLog[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>(() => logs.map((log) => log.id))

  const allSelected = selected.length === logs.length && logs.length > 0

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )
  }

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveFieldLogs(selected)

      if (!result.success) {
        toast.error(result.error ?? 'Zápisy se nepodařilo schválit')
        return
      }

      toast.success(
        result.approved === 1
          ? 'Zápis propsán do evidence'
          : `${result.approved} zápisů propsáno do evidence`
      )
      setSelected([])
      router.refresh()
    })
  }

  const handleDiscard = () => {
    if (!confirm(`Opravdu smazat ${selected.length} zápisů? Do evidence se nepropíšou.`)) return

    startTransition(async () => {
      const result = await discardFieldLogs(selected)

      if (!result.success) {
        toast.error(result.error ?? 'Zápisy se nepodařilo smazat')
        return
      }

      toast.success('Zápisy smazány')
      setSelected([])
      router.refresh()
    })
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-md">
        <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? [] : logs.map((log) => log.id))}
            className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          Vybráno {selected.length} z {logs.length}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={selected.length === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Smazat
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={selected.length === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Schválit do evidence
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const isSelected = selected.includes(log.id)
          const overArea = log.parcelArea !== null && log.appliedArea > log.parcelArea + 0.01

          return (
            <div
              key={log.id}
              className={`rounded-lg bg-white p-4 shadow-md transition-colors ${
                isSelected ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(log.id)}
                  aria-label={`Vybrat zápis ${log.parcelName}`}
                  className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                    <span className="font-semibold text-gray-900">{log.parcelName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.applicationDate).toLocaleDateString('cs-CZ')}
                      {' · '}
                      {log.appliedArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha
                      {log.cropName ? ` · ${log.cropName}` : ''}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-1">
                    {log.items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="font-medium">{item.productName}</span>{' '}
                        <span className="text-gray-500">
                          {item.dose.toLocaleString('cs-CZ')} {item.unit}
                        </span>
                        {item.kind === 'por' && !item.targetPest && (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                            chybí cílový organismus
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {log.notes && <p className="mt-2 text-sm italic text-gray-500">{log.notes}</p>}

                  {(!log.hasCrop || overArea) && (
                    <ul className="mt-2 space-y-1 text-sm text-amber-700">
                      {!log.hasCrop && <li>Parcela nemá založený osev – doplňte plodinu.</li>}
                      {overArea && (
                        <li>
                          Ošetřená výměra je vyšší než výměra parcely (
                          {log.parcelArea?.toLocaleString('cs-CZ')} ha).
                        </li>
                      )}
                    </ul>
                  )}

                  {log.findings.length > 0 && (
                    <div className="mt-3">
                      <FindingsList findings={log.findings} />
                    </div>
                  )}
                </div>

                <Link
                  href={`/portal/hnojiva-por/evidence/${log.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Doplnit
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
