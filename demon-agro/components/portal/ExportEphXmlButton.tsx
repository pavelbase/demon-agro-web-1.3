'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode2,
  Loader2,
  X,
} from 'lucide-react'
import { buildEphExport, saveSzrId } from '@/lib/actions/eph-export'
import type { EphExportResult } from '@/lib/database/eph-export'

interface ExportEphXmlButtonProps {
  /** Identifikátor subjektu ze SZR uložený u profilu */
  defaultSzrId: string | null
  /** Roky, ve kterých uživatel eviduje aplikace – pro rychlou volbu období */
  years: number[]
}

/**
 * Export evidence do souboru pro Portál farmáře (EPH).
 *
 * Soubor sestavuje server, protože k němu potřebuje číselník hnojiv, číselník
 * plodin a atributy dílů půdních bloků. Než se stáhne, ukáže se, kolik aplikací
 * do něj šlo a co případně chybí – neúplný záznam se do hlášení nedostane.
 */
export function ExportEphXmlButton({ defaultSzrId, years }: ExportEphXmlButtonProps) {
  const currentYear = new Date().getFullYear()
  const defaultYear = years[0] ?? currentYear

  const [isOpen, setIsOpen] = useState(false)
  const [szr, setSzr] = useState(defaultSzrId ?? '')
  const [from, setFrom] = useState(`${defaultYear}-01-01`)
  const [to, setTo] = useState(`${defaultYear}-12-31`)
  const [result, setResult] = useState<EphExportResult | null>(null)
  const [isWorking, startWorking] = useTransition()

  const close = () => {
    setIsOpen(false)
    setResult(null)
  }

  const selectYear = (year: number) => {
    setFrom(`${year}-01-01`)
    setTo(`${year}-12-31`)
    setResult(null)
  }

  const handlePrepare = () => {
    startWorking(async () => {
      if (szr.trim() !== (defaultSzrId ?? '')) {
        const saved = await saveSzrId(szr)
        if (!saved.success) {
          toast.error(saved.error ?? 'Identifikátor se nepodařilo uložit')
          return
        }
      }

      const response = await buildEphExport({ from, to })

      if (!response.success || !response.data) {
        toast.error(response.error ?? 'Export se nepodařilo sestavit')
        return
      }

      setResult(response.data)
    })
  }

  const handleDownload = () => {
    if (!result?.xml) return

    const blob = new Blob([result.xml], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <FileCode2 className="h-4 w-4" />
        Export do EPH
      </button>
    )
  }

  const blocking = result?.problems.filter((problem) => problem.severity === 'blocking') ?? []

  return (
    <>
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 opacity-60"
      >
        <FileCode2 className="h-4 w-4" />
        Export do EPH
      </button>

      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-start justify-between border-b border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <FileCode2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Export evidence do EPH</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Soubor XML pro import do Evidence přípravků a hnojiv na Portálu farmáře
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Zavřít"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-5">
            <div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium">Kam soubor nahrát</p>
              <p className="mt-1 text-blue-800">
                Portál farmáře → Evidence přípravků a hnojiv → Import dat z komerčního softwaru.
                Exportují se jen skutečně provedené a schválené aplikace; plány a zápisy z pole
                čekající na schválení se do hlášení neposílají.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="eph-szr"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Identifikátor subjektu ze SZR
                </label>
                <input
                  id="eph-szr"
                  type="text"
                  inputMode="numeric"
                  value={szr}
                  onChange={(event) => {
                    setSzr(event.target.value)
                    setResult(null)
                  }}
                  placeholder="např. 1000123456"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  disabled={isWorking}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Najdete ho na Portálu farmáře v kartě subjektu. Uloží se k profilu, příště už ho
                  zadávat nebudete.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="eph-from"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Období od
                  </label>
                  <input
                    id="eph-from"
                    type="date"
                    value={from}
                    onChange={(event) => {
                      setFrom(event.target.value)
                      setResult(null)
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500"
                    disabled={isWorking}
                  />
                </div>
                <div>
                  <label htmlFor="eph-to" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Období do
                  </label>
                  <input
                    id="eph-to"
                    type="date"
                    value={to}
                    onChange={(event) => {
                      setTo(event.target.value)
                      setResult(null)
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500"
                    disabled={isWorking}
                  />
                </div>
              </div>

              {years.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Rychlá volba:</span>
                  {years.slice(0, 5).map((year) => (
                    <button
                      key={year}
                      onClick={() => selectYear(year)}
                      disabled={isWorking}
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="mt-5 space-y-4">
                <div
                  className={`rounded-lg p-4 text-sm ${
                    result.xml
                      ? 'bg-green-50 text-green-900'
                      : 'bg-amber-50 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.xml ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        {result.xml
                          ? `K exportu připraveno ${result.exportedApplications} aplikací`
                          : 'Za zvolené období není co exportovat'}
                      </p>
                      {result.xml && (
                        <p className="mt-0.5">
                          {result.parcels} parcel · {result.fertilizerItems} položek hnojiv ·{' '}
                          {result.productItems} položek přípravků
                        </p>
                      )}
                      {result.skippedApplications > 0 && (
                        <p className="mt-0.5">
                          {result.skippedApplications}{' '}
                          {result.skippedApplications === 1 ? 'aplikace' : 'aplikací'} do souboru
                          nešlo – viz níže.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {blocking.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-900">
                      Co je potřeba v evidenci doplnit
                    </p>
                    <ul className="mt-2 space-y-2.5">
                      {blocking.map((problem) => (
                        <li key={problem.message} className="text-sm text-red-800">
                          <p>
                            {problem.message}{' '}
                            <span className="whitespace-nowrap font-medium">
                              ({problem.count}×)
                            </span>
                          </p>
                          {problem.examples.length > 0 && (
                            <p className="mt-0.5 text-xs text-red-700">
                              Např. {problem.examples.join('; ')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-5">
            <button
              onClick={close}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Zavřít
            </button>

            {result?.xml ? (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                <Download className="h-4 w-4" />
                Stáhnout soubor
              </button>
            ) : (
              <button
                onClick={handlePrepare}
                disabled={isWorking}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
              >
                {isWorking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Připravuji…
                  </>
                ) : (
                  'Zkontrolovat a připravit'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
