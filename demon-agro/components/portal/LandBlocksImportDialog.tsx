'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import {
  parseLandBlocksSheet,
  type LandBlockParseResult,
  type SheetRow,
} from '@/lib/utils/land-block-parser'
import { importLandBlocks } from '@/lib/actions/land-blocks'
import { lpisCultureLabel } from '@/lib/constants/land-blocks'

interface LandBlocksImportDialogProps {
  /** Počet DPB, které už uživatel v evidenci má – kvůli nabídce úklidu */
  existingCount: number
}

/**
 * Import sestavy "Informativní údaje o DPB" z Portálu farmáře.
 *
 * Soubor se čte v prohlížeči, aby uživatel viděl náhled ještě před uložením –
 * knihovna xlsx se proto načítá dynamicky až při vybrání souboru. Server data
 * znovu validuje (viz lib/actions/land-blocks.ts).
 */
export function LandBlocksImportDialog({ existingCount }: LandBlocksImportDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, startSaving] = useTransition()
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<LandBlockParseResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [removeMissing, setRemoveMissing] = useState(false)

  const reset = () => {
    setFileName(null)
    setResult(null)
    setFileError(null)
    setRemoveMissing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const close = () => {
    setIsOpen(false)
    reset()
  }

  const handleFile = async (file: File) => {
    setFileError(null)
    setResult(null)
    setFileName(file.name)

    if (!/\.(xls|xlsx)$/i.test(file.name)) {
      setFileError('Nahrajte soubor ve formátu XLS nebo XLSX z Portálu farmáře.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('Soubor je příliš velký. Maximum je 10 MB.')
      return
    }

    setIsParsing(true)
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      if (!sheet) {
        setFileError('Soubor neobsahuje žádný list s daty.')
        return
      }

      const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
        header: 1,
        defval: null,
        blankrows: false,
      })

      setResult(parseLandBlocksSheet(rows))
    } catch (error) {
      console.error('Chyba při čtení souboru DPB:', error)
      setFileError('Soubor se nepodařilo přečíst. Zkontrolujte, že jde o export z LPIS.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleSave = () => {
    if (!result || result.rows.length === 0 || !fileName) return

    startSaving(async () => {
      const response = await importLandBlocks({
        sourceFile: fileName,
        removeMissing,
        rows: result.rows,
      })

      if (!response.success) {
        toast.error(response.error ?? 'Import se nepodařil')
        return
      }

      const parts = [
        response.created ? `${response.created} nových` : null,
        response.updated ? `${response.updated} aktualizovaných` : null,
        response.skipped ? `${response.skipped} smazaných` : null,
      ].filter(Boolean)

      toast.success(`Evidence DPB uložena: ${parts.join(', ')}`)
      close()
      router.refresh()
    })
  }

  const totalArea = result?.rows.reduce((sum, row) => sum + row.area, 0) ?? 0
  const nvzCount = result?.rows.filter((row) => row.nitrate_vulnerable_zone).length ?? 0

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
      >
        <Upload className="h-4 w-4" />
        {existingCount > 0 ? 'Aktualizovat z LPIS' : 'Importovat z LPIS'}
      </button>
    )
  }

  return (
    <>
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium opacity-60"
      >
        <Upload className="h-4 w-4" />
        {existingCount > 0 ? 'Aktualizovat z LPIS' : 'Importovat z LPIS'}
      </button>

      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
        <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
          {/* Hlavička */}
          <div className="flex items-start justify-between border-b border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <FileSpreadsheet className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Import dílů půdních bloků</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Sestava „Informativní údaje o DPB“ z Portálu farmáře (LPIS)
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
            {/* Kde soubor vzít */}
            <div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium">Kde sestavu získáte</p>
              <p className="mt-1 text-blue-800">
                Portál farmáře → Registr půdy (LPIS) → Tiskové výstupy → Informativní údaje o DPB →
                export do XLS. Soubor obsahuje kromě výměr i zranitelnou oblast dusíkem, aplikační
                pásmo, erozní ohroženost, sklonitost a vzdálenost od vody – tyto údaje rozhodují o
                tom, co a kdy lze na pozemku aplikovat.
              </p>
            </div>

            {/* Výběr souboru */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing || isSaving}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-amber-400 hover:bg-amber-50/50 disabled:opacity-60"
            >
              {isParsing ? (
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {fileName ?? 'Vybrat soubor XLS'}
              </span>
              <span className="text-xs text-gray-500">
                {isParsing ? 'Čtu soubor…' : 'Kliknutím vyberte export z LPIS (max. 10 MB)'}
              </span>
            </button>

            {fileError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {result && result.missingColumns.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Soubor nemá očekávanou strukturu</p>
                  <p className="mt-0.5">
                    Chybí sloupce: {result.missingColumns.join(', ')}. Nahrajte prosím sestavu
                    Informativní údaje o DPB bez úprav.
                  </p>
                </div>
              </div>
            )}

            {result && result.errors.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-medium">
                  {result.errors.length}{' '}
                  {result.errors.length === 1 ? 'řádek nelze načíst' : 'řádků nelze načíst'} – budou
                  přeskočeny
                </p>
                <ul className="mt-1 space-y-0.5 text-amber-800">
                  {result.errors.slice(0, 5).map((error) => (
                    <li key={error.row}>
                      Řádek {error.row}: {error.message}
                    </li>
                  ))}
                  {result.errors.length > 5 && <li>…a další {result.errors.length - 5}</li>}
                </ul>
              </div>
            )}

            {/* Náhled */}
            {result && result.rows.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg bg-green-50 p-3 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-green-900">
                    <CheckCircle2 className="h-4 w-4" />
                    {result.rows.length} DPB k importu
                  </span>
                  <span className="text-green-800">
                    celkem {totalArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha
                  </span>
                  {nvzCount > 0 && (
                    <span className="text-green-800">
                      {nvzCount} ve zranitelné oblasti dusíkem
                    </span>
                  )}
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">DPB</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Katastr
                          </th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700">ha</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Kultura
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">ZOD</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Pásmo</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Eroze</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.rows.slice(0, 8).map((row) => (
                          <tr key={`${row.square_code}-${row.dpb_code}`}>
                            <td className="px-3 py-2 font-medium text-gray-900">{row.dpb_code}</td>
                            <td className="px-3 py-2 text-gray-600">{row.cadastral_area ?? '–'}</td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {row.area.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {lpisCultureLabel(row.culture)}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {row.nitrate_vulnerable_zone === null
                                ? '–'
                                : row.nitrate_vulnerable_zone
                                  ? 'ano'
                                  : 'ne'}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {row.application_zone ?? '–'}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{row.erosion_class ?? '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.rows.length > 8 && (
                    <p className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Náhled prvních 8 z {result.rows.length} DPB
                    </p>
                  )}
                </div>

                {existingCount > 0 && (
                  <label className="mt-4 flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={removeMissing}
                      onChange={(event) => setRemoveMissing(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      Smazat DPB, které v souboru nejsou
                      <span className="block text-xs text-gray-500">
                        Použijte, pokud jde o aktuální celý výpis z LPIS – z evidence zmizí bloky,
                        které už neobhospodařujete. Aktuálně máte v evidenci {existingCount} DPB.
                      </span>
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Patička */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-5">
            <button
              onClick={close}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 disabled:opacity-60"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              disabled={!result || result.rows.length === 0 || isSaving || isParsing}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Ukládám…' : `Importovat ${result?.rows.length ?? 0} DPB`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
