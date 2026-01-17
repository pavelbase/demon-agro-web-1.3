'use client'

/**
 * Kalkulačka ekonomických ztrát z kyselé půdy
 * 
 * Komponenta zobrazuje:
 * 1. Ovládací panel s parametry (náklady na hnojiva, tržby, cena vápnění)
 * 2. Přehledové karty s celkovými statistikami
 * 3. Tabulku s detaily jednotlivých pozemků
 * 4. Možnost exportu a řazení
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingDown,
  TrendingUp,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  FileDown,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react'
import { calculateFarmSummary, type PozemekZtrata } from '@/lib/utils/kalkulacka-ztrat'
import { generateKalkulackaZtratPDF } from '@/lib/utils/kalkulacka-ztrat-pdf-export'
import { SOIL_TYPE_LABELS } from '@/lib/constants/database'

interface KalkulackaZtratProps {
  pozemky: Array<{
    id: string
    nazev: string
    kod: string | null
    vymera_ha: number
    typ_pudy: string
    ph: number
  }>
}

type SortField = 'nazev' | 'vymera' | 'ph' | 'ztrata' | 'navratnost'
type SortDirection = 'asc' | 'desc'

export function KalkulackaZtrat({ pozemky }: KalkulackaZtratProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  // Parametry výpočtu
  const [fertilizerCost, setFertilizerCost] = useState(8000) // Kč/ha/rok
  const [revenuePerHa, setRevenuePerHa] = useState(35000) // Kč/ha/rok
  const [limingCostPerTon, setLimingCostPerTon] = useState(800) // Kč/t

  // Řazení tabulky
  const [sortField, setSortField] = useState<SortField>('ztrata')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // ============================================================================
  // VÝPOČTY
  // ============================================================================

  const summary = useMemo(() => {
    if (pozemky.length === 0) return null
    return calculateFarmSummary(pozemky, fertilizerCost, revenuePerHa, limingCostPerTon)
  }, [pozemky, fertilizerCost, revenuePerHa, limingCostPerTon])

  // Seřazené pozemky podle vybraného kritéria
  const sortedPozemky = useMemo(() => {
    if (!summary) return []

    const sorted = [...summary.pozemky]

    sorted.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortField) {
        case 'nazev':
          aVal = a.nazev.toLowerCase()
          bVal = b.nazev.toLowerCase()
          break
        case 'vymera':
          aVal = a.vymeraHa
          bVal = b.vymeraHa
          break
        case 'ph':
          aVal = a.aktualnePh
          bVal = b.aktualnePh
          break
        case 'ztrata':
          aVal = a.celkovaZtrataKcHa
          bVal = b.celkovaZtrataKcHa
          break
        case 'navratnost':
          aVal = a.navratnostMesice
          bVal = b.navratnostMesice
          break
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal, 'cs')
          : bVal.localeCompare(aVal, 'cs')
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })

    return sorted
  }, [summary, sortField, sortDirection])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleExportPDF = async () => {
    if (!summary) return

    // Prepare data for PDF export
    const pdfData = {
      // Parameters
      fertilizerCost,
      revenuePerHa,
      limingCostPerTon,
      
      // Summary data
      totalLoss: summary.celkovaZtrata,  // FIX: Corrected property name
      totalLimingCost: summary.celkoveNakladyVapneni,
      averageROI: summary.prumernaNavratnost,
      averagePh: summary.prumernePh,
      criticalParcels: summary.pozemky.filter(p => p.aktualnePh < 5.5).length,  // FIX: Calculate critical parcels
      totalArea: summary.celkovaVymera,
      
      // Detailed rows
      rows: summary.pozemky.map((p) => {
        const pozemekData = pozemky.find(poz => poz.id === p.pozemekId)
        return {
          kod: pozemekData?.kod || null,
          nazev: p.nazev,
          vymeraHa: p.vymeraHa,
          typPudy: p.typPudy,
          aktualnePh: p.aktualnePh,
          cilovePh: p.cilovePh,
          efektivita: p.efektivita,
          celkovaZtrataKcHa: p.celkovaZtrataKcHa,
          celkovaZtrataPozemek: p.celkovaZtrataPozemek,
          nakladyVapneni: p.nakladyVapneni,
          potrebaCaoTHa: p.potrebaCaoTHa,
          potrebaVapenceTHa: p.potrebaVapenceTHa,
          navratnostMesice: p.navratnostMesice,
        }
      }),
    }

    await generateKalkulackaZtratPDF(pdfData)
  }

  // ============================================================================
  // RENDER - PRÁZDNÝ STAV
  // ============================================================================

  if (pozemky.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Žádné pozemky s rozbory
        </h3>
        <p className="text-gray-600 mb-6">
          Pro použití kalkulačky potřebujete pozemky s provedenými rozbory půdy (zejména
          pH).
        </p>
        <a
          href="/portal/pozemky"
          className="inline-flex items-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Přejít na pozemky
        </a>
      </div>
    )
  }

  if (!summary) return null

  // ============================================================================
  // RENDER - HLAVNÍ KOMPONENTA
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ========== OVLÁDACÍ PANEL ========== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-primary-green" />
          <h2 className="text-lg font-semibold text-gray-900">Parametry výpočtu</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Náklady na hnojiva */}
          <div>
            <label htmlFor="fertilizer-cost" className="block text-sm font-medium text-gray-700 mb-2">
              Roční náklady na hnojiva
            </label>
            <div className="relative">
              <input
                id="fertilizer-cost"
                type="number"
                min="0"
                step="100"
                value={fertilizerCost}
                onChange={(e) => {
                  const value = e.target.valueAsNumber
                  setFertilizerCost(isNaN(value) ? 0 : Math.max(0, value))
                }}
                className="w-full pl-4 pr-28 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:ml-1"
                style={{
                  MozAppearance: 'textfield',
                }}
              />
              <span className="absolute right-[46px] top-2.5 text-gray-500 text-xs pointer-events-none">
                Kč/ha/rok
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Typicky 6 000 - 12 000 Kč/ha</p>
          </div>

          {/* Tržby z pozemku */}
          <div>
            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
              Roční tržby z pozemku
            </label>
            <div className="relative">
              <input
                id="revenue"
                type="number"
                min="0"
                step="1000"
                value={revenuePerHa}
                onChange={(e) => {
                  const value = e.target.valueAsNumber
                  setRevenuePerHa(isNaN(value) ? 0 : Math.max(0, value))
                }}
                className="w-full pl-4 pr-28 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:ml-1"
                style={{
                  MozAppearance: 'textfield',
                }}
              />
              <span className="absolute right-[46px] top-2.5 text-gray-500 text-xs pointer-events-none">
                Kč/ha/rok
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Typicky 25 000 - 50 000 Kč/ha</p>
          </div>

          {/* Cena vápnění */}
          <div>
            <label htmlFor="liming-cost" className="block text-sm font-medium text-gray-700 mb-2">
              Cena vápnění (vápenec)
            </label>
            <div className="relative">
              <input
                id="liming-cost"
                type="number"
                min="0"
                step="50"
                value={limingCostPerTon}
                onChange={(e) => {
                  const value = e.target.valueAsNumber
                  setLimingCostPerTon(isNaN(value) ? 0 : Math.max(0, value))
                }}
                className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:ml-1"
                style={{
                  MozAppearance: 'textfield',
                }}
              />
              <span className="absolute right-[46px] top-2.5 text-gray-500 text-xs pointer-events-none">Kč/t</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Typicky 600 - 1 200 Kč/t (včetně aplikace)
            </p>
          </div>
        </div>
      </div>

      {/* ========== PŘEHLEDOVÉ KARTY ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Celková ztráta */}
        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <span className="text-xs font-medium text-red-600">ROK</span>
          </div>
          <div className="text-2xl font-bold text-red-700 mb-1">
            {summary.celkovaZtrata.toLocaleString('cs-CZ', {
              maximumFractionDigits: 0,
            })}{' '}
            Kč
          </div>
          <div className="text-sm text-red-600">Celková roční ztráta</div>
          <div className="text-xs text-red-500 mt-2">
            Hnojiva: {summary.celkovaZtrataHnojiva.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
            <br />
            Výnos: {summary.celkovaZtrataVynos.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
          </div>
        </div>

        {/* Náklady na vápnění */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">JEDNORÁZOVÉ</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {summary.celkoveNakladyVapneni.toLocaleString('cs-CZ', {
              maximumFractionDigits: 0,
            })}{' '}
            Kč
          </div>
          <div className="text-sm text-blue-600">Náklady na vápnění</div>
        </div>

        {/* Návratnost */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <span className="text-xs font-medium text-green-600">PRŮMĚR</span>
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {summary.prumernaNavratnost.toFixed(0)} měsíců
          </div>
          <div className="text-sm text-green-600">Návratnost investice</div>
        </div>

        {/* Průměrné pH */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Info className="h-8 w-8 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">STAV</span>
          </div>
          <div className="text-2xl font-bold text-orange-700 mb-1">
            pH {summary.prumernePh.toFixed(1)}
          </div>
          <div className="text-sm text-orange-600">
            Průměrné pH ({summary.celkovaVymera.toFixed(1)} ha)
          </div>
        </div>
      </div>

      {/* ========== TABULKA S POZEMKY ========== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Detail pozemků ({summary.pocetPozemku})
            </h2>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nazev')}
                >
                  <div className="flex items-center gap-2">
                    Pozemek
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vymera')}
                >
                  <div className="flex items-center gap-2">
                    Výměra & Typ
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('ph')}
                >
                  <div className="flex items-center gap-2">
                    pH
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efektivita
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('ztrata')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Ztráta/rok
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vápnění
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('navratnost')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Návratnost
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPozemky.map((pozemek) => {
                const pozemekData = pozemky.find(p => p.id === pozemek.pozemekId)
                const kod = pozemekData?.kod
                
                return (
                  <tr key={pozemek.pozemekId} className="hover:bg-gray-50">
                    {/* Sloupec 1: Pozemek (KÓD primární, název sekundární) */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {kod ? (
                          <>
                            <Link 
                              href={`/portal/pozemky/${pozemek.pozemekId}`}
                              className="text-sm font-semibold text-primary-green hover:text-green-700 hover:underline inline-flex items-center gap-1"
                            >
                              {kod}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <div className="text-xs text-gray-500">
                              {pozemek.nazev}
                            </div>
                          </>
                        ) : (
                          <>
                            <Link 
                              href={`/portal/pozemky/${pozemek.pozemekId}`}
                              className="text-sm font-semibold text-primary-green hover:text-green-700 hover:underline inline-flex items-center gap-1"
                            >
                              {pozemek.nazev}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <div className="text-xs text-gray-400 italic">
                              (bez kódu)
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Sloupec 2: Výměra & Typ */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 font-medium">
                        {pozemek.vymeraHa.toFixed(2)} ha
                      </div>
                      <div className="text-xs text-gray-500" title={SOIL_TYPE_LABELS[pozemek.typPudy]}>
                        {pozemek.typPudy} ({SOIL_TYPE_LABELS[pozemek.typPudy]})
                      </div>
                    </td>

                    {/* Sloupec 3: pH */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            pozemek.aktualnePh < 5.5
                              ? 'text-red-600'
                              : pozemek.aktualnePh < 6.5
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {pozemek.aktualnePh.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          → {pozemek.cilovePh.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Sloupec 4: Efektivita */}
                    <td className="px-4 py-3 text-center">
                      <div
                        className={`text-sm font-semibold ${
                          pozemek.efektivita < 0.7
                            ? 'text-red-600'
                            : pozemek.efektivita < 0.9
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {(pozemek.efektivita * 100).toFixed(0)}%
                      </div>
                    </td>

                    {/* Sloupec 5: Ztráta/rok */}
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm font-semibold text-red-600">
                        {pozemek.celkovaZtrataPozemek.toLocaleString('cs-CZ', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        Kč
                      </div>
                      <div className="text-xs text-gray-500">
                        {pozemek.celkovaZtrataKcHa.toLocaleString('cs-CZ', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        Kč/ha
                      </div>
                    </td>

                    {/* Sloupec 6: Vápnění */}
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {pozemek.nakladyVapneni.toLocaleString('cs-CZ', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        Kč
                      </div>
                      <div className="text-xs text-gray-500">
                        {pozemek.potrebaCaoTHa.toFixed(1)} t CaO/ha
                      </div>
                    </td>

                    {/* Sloupec 7: Návratnost */}
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`text-sm font-semibold ${
                          pozemek.navratnostMesice <= 12
                            ? 'text-green-600'
                            : pozemek.navratnostMesice <= 24
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}
                      >
                        {pozemek.navratnostMesice} měs.
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== INFORMAČNÍ BOX ========== */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">Jak interpretovat výsledky:</p>
            <ul className="space-y-1 text-blue-800">
              <li>
                <strong>Efektivita hnojiv:</strong> Při nižším pH rostliny využívají živiny
                hůře (při pH 5.0 pouze ~65%)
              </li>
              <li>
                <strong>Ztráta výnosu:</strong> Kyselá půda přímo snižuje výnosy (až o 20-30%
                při pH &lt; 5.0)
              </li>
              <li>
                <strong>Návratnost:</strong> Ukazuje, za kolik měsíců se vrátí investice do
                vápnění
              </li>
              <li>
                <strong>Priorita:</strong> Pozemky s nejvyšší ztrátou a nejkratší návratností
                vápnit přednostně
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

