'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Eye, ArrowUpDown, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { calculateOneTimeProductSplit, type OneTimeProductSplitResult, type LimeProduct as EngineLimeProduct } from '@/lib/utils/liming-calculator'
import type { SoilAnalysis, SoilType, Culture, NutrientCategory } from '@/lib/types/database'
import type { LimingPDFData, LimingTableRow } from '@/lib/utils/liming-pdf-export-v2'
import { categorizeNutrient } from '@/lib/utils/soil-categories'

// Krátké popisky kultury pro tabulku/PDF (na rozdíl od CULTURE_LABELS v
// lib/constants/database.ts, které jsou plné - "Orná půda", "Travní trvalý porost")
const KULTURA_SHORT_LABEL: Record<Culture, string> = {
  orna: 'Orná',
  ttp: 'TTP',
  chmelnice: 'Chmelnice',
}

interface ParcelWithAnalysis {
  id: string
  name: string
  code: string | null
  area: number
  soil_type: SoilType
  culture: Culture
  notes: string | null
  latest_analysis: SoilAnalysis | null
}

interface LimingProduct {
  id: string
  name: string
  cao_content: number
  mgo_content: number
  type: 'calcitic' | 'dolomite' | 'both'
  price_per_ton?: number | null
}

interface TabulkovyPrehledVapneniProps {
  parcels: ParcelWithAnalysis[]
  limingProducts: LimingProduct[]
  userProfile: {
    full_name: string | null
    company_name: string | null
  } | null
}

// Rozšířený typ pro řádek tabulky s vypočtenými hodnotami
interface TableRow {
  parcel: ParcelWithAnalysis
  analysis: SoilAnalysis | null
  potrebaCaoTHa: number
  potrebaCaoCelkem: number
  produktSplit: OneTimeProductSplitResult | null
  stav: {
    status: 'ok' | 'udrzba' | 'doporuceno' | 'urgentni' | 'chybi_rozbor'
    color: string
    icon: string
    label: string
  }
  kMgRatio: {
    value: number | null
    formatted: string
    color: string
    note: string
  }
}

const SOIL_TYPE_LABELS: Record<SoilType, string> = {
  'L': 'Lehká',
  'S': 'Střední',
  'T': 'Těžká',
}

// UPDATED 2026-01-04: Now using Czech characters in PDF (V2 supports them!)
const SOIL_TYPE_LABELS_PDF: Record<SoilType, string> = {
  'L': 'Lehká',
  'S': 'Střední',
  'T': 'Těžká',
}

type SortField = 'kod' | 'ph' | 'potreba_cao' | 'vymera'
type SortDirection = 'asc' | 'desc'

// ============================================================
// FUNKCE PRO BAREVNÉ ZOBRAZENÍ ŽIVIN (podle metodiky zdravotní karty)
// ============================================================

/**
 * Získá barvu textu podle kategorie živiny
 * Používá stejnou metodiku jako ParcelHealthCard
 */
function getNutrientTextColor(category: NutrientCategory | null): string {
  if (!category) return 'text-gray-600'
  
  switch (category) {
    case 'nizky':
      return 'text-red-500' // Červená - Nízký
    case 'vyhovujici':
      return 'text-orange-500' // Oranžová - Vyhovující
    case 'dobry':
      return 'text-green-500' // Zelená - Dobrý
    case 'vysoky':
      return 'text-blue-500' // Modrá - Vysoký
    case 'velmi_vysoky':
      return 'text-purple-500' // Fialová - Velmi vysoký
    default:
      return 'text-gray-600'
  }
}

export default function TabulkovyPrehledVapneni({
  parcels,
  limingProducts,
  userProfile,
}: TabulkovyPrehledVapneniProps) {
  // Stavy pro filtrování a řazení
  const [sortField, setSortField] = useState<SortField>('kod')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterPouzeVapneni, setFilterPouzeVapneni] = useState(false)
  const [filterPudniDruh, setFilterPudniDruh] = useState<'all' | SoilType>('all')
  const [filterStav, setFilterStav] = useState<'all' | 'urgentni' | 'doporuceno' | 'udrzba' | 'ok' | 'chybi_rozbor'>('all')

  // ============================================================
  // FUNKCE PRO VÝPOČET STAVU POZEMKU
  // ============================================================
  
  function getStavPozemku(parcel: ParcelWithAnalysis, analysis: SoilAnalysis | null, potrebaCao: number): TableRow['stav'] {
    if (!analysis) {
      return { status: 'chybi_rozbor', color: 'text-gray-500', icon: '⚪', label: 'Chybí rozbor' }
    }
    
    if (potrebaCao === 0) {
      return { status: 'ok', color: 'text-green-600', icon: '✓', label: 'OK' }
    } else if (analysis.ph < 5.0) {
      return { status: 'urgentni', color: 'text-red-600', icon: '⚠', label: 'Urgentní' }
    } else if (analysis.ph < 5.5) {
      return { status: 'doporuceno', color: 'text-orange-600', icon: '!', label: 'Doporučeno' }
    } else {
      return { status: 'udrzba', color: 'text-yellow-600', icon: '○', label: 'Údržba' }
    }
  }

  // ============================================================
  // FUNKCE PRO K/MG POMĚR
  // ============================================================
  
  function getKMgStatus(k: number, mg: number): TableRow['kMgRatio'] {
    if (!k || !mg || mg === 0) {
      return { value: null, formatted: '-', color: 'text-gray-400', note: '' }
    }
    
    const ratio = k / mg
    const ratioFormatted = ratio.toFixed(2)
    
    // Metodika shodná s ParcelHealthCard - optimální rozsah: 1.5 - 2.5
    if (ratio >= 1.5 && ratio <= 2.5) {
      return { value: ratio, formatted: ratioFormatted, color: 'text-green-600', note: 'optimální' }
    } else if (ratio >= 1.2 && ratio < 1.5) {
      return { value: ratio, formatted: ratioFormatted, color: 'text-yellow-600', note: '+ K' }
    } else if (ratio > 2.5 && ratio <= 3.5) {
      return { value: ratio, formatted: ratioFormatted, color: 'text-yellow-600', note: '+ Mg' }
    } else {
      // Kritický nepoměr: < 1.2 nebo > 3.5
      return { value: ratio, formatted: ratioFormatted, color: 'text-red-600', note: ratio < 1.2 ? '+ K' : '+ Mg' }
    }
  }

  // ============================================================
  // ENGINE: JEDNORÁZOVÝ ROZPIS DOLOMIT/VÁPENEC DLE STAVU Mg A K/Mg
  // ============================================================
  // Najdeme aktivní produkty "Dolomit mletý" a "Vápenec mletý" (resp. první
  // aktivní produkt daného typu, pokud jich je v systému víc)

  const dolomitProduct: EngineLimeProduct | null = useMemo(() => {
    const p = limingProducts.find(p => p.type === 'dolomite')
    return p ? { id: p.id, name: p.name, type: p.type, caoContent: p.cao_content, mgoContent: p.mgo_content } : null
  }, [limingProducts])

  const vapenecProduct: EngineLimeProduct | null = useMemo(() => {
    const p = limingProducts.find(p => p.type === 'calcitic' || p.type === 'both')
    return p ? { id: p.id, name: p.name, type: p.type, caoContent: p.cao_content, mgoContent: p.mgo_content } : null
  }, [limingProducts])

  // ============================================================
  // PŘÍPRAVA DAT PRO TABULKU
  // ============================================================
  
  const tableData: TableRow[] = useMemo(() => {
    return parcels.map(parcel => {
      const analysis = parcel.latest_analysis
      // Kultura pozemku (orná/TTP/chmelnice) - engine si sám ověří a případně
      // zaloguje warning, pokud by hodnota chyběla nebo byla neznámá.
      const landUse = parcel.culture

      // Jednorázový rozpis dle našeho enginu (Dolomit na Mg, Vápenec na zbytek CaO)
      const produktSplit = analysis
        ? calculateOneTimeProductSplit(
            {
              currentPh: analysis.ph,
              currentMg: analysis.mg,
              currentK: analysis.k,
              soilType: parcel.soil_type,
              landUse,
              area: parcel.area,
            },
            dolomitProduct,
            vapenecProduct,
            parcel.id
          )
        : null

      const potrebaCaoTHa = produktSplit?.totalCaoNeedTHa || 0
      const potrebaCaoCelkem = produktSplit?.totalCaoNeedCelkem || 0
      
      // Stav pozemku
      const stav = getStavPozemku(parcel, analysis, potrebaCaoTHa)
      
      // K/Mg poměr
      const kMgRatio = analysis 
        ? getKMgStatus(analysis.k, analysis.mg)
        : { value: null, formatted: '-', color: 'text-gray-400', note: '' }
      
      return {
        parcel,
        analysis,
        potrebaCaoTHa,
        potrebaCaoCelkem,
        produktSplit,
        stav,
        kMgRatio,
      }
    })
  }, [parcels, dolomitProduct, vapenecProduct])

  // ============================================================
  // FILTROVÁNÍ
  // ============================================================
  
  const filteredData = useMemo(() => {
    let filtered = [...tableData]
    
    // Filtr: pouze pozemky vyžadující vápnění
    if (filterPouzeVapneni) {
      filtered = filtered.filter(row => row.stav.status !== 'ok' && row.stav.status !== 'chybi_rozbor')
    }
    
    // Filtr: půdní druh
    if (filterPudniDruh !== 'all') {
      filtered = filtered.filter(row => row.parcel.soil_type === filterPudniDruh)
    }
    
    // Filtr: stav
    if (filterStav !== 'all') {
      filtered = filtered.filter(row => row.stav.status === filterStav)
    }
    
    return filtered
  }, [tableData, filterPouzeVapneni, filterPudniDruh, filterStav])

  // ============================================================
  // ŘAZENÍ
  // ============================================================
  
  const sortedData = useMemo(() => {
    const sorted = [...filteredData]
    
    sorted.sort((a, b) => {
      let compareValue = 0
      
      switch (sortField) {
        case 'kod':
          compareValue = a.parcel.name.localeCompare(b.parcel.name)
          break
        case 'ph':
          compareValue = (a.analysis?.ph || 999) - (b.analysis?.ph || 999)
          break
        case 'potreba_cao':
          compareValue = a.potrebaCaoTHa - b.potrebaCaoTHa
          break
        case 'vymera':
          compareValue = a.parcel.area - b.parcel.area
          break
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue
    })
    
    return sorted
  }, [filteredData, sortField, sortDirection])

  // ============================================================
  // FUNKCE PRO ZMĚNU ŘAZENÍ
  // ============================================================
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // ============================================================
  // STATISTIKY
  // ============================================================
  
  const stats = useMemo(() => {
    const celkemPozemku = filteredData.length
    const celkovaVymera = filteredData.reduce((sum, row) => sum + row.parcel.area, 0)
    const prumernePh = filteredData.filter(row => row.analysis).length > 0
      ? filteredData.filter(row => row.analysis).reduce((sum, row) => sum + (row.analysis?.ph || 0), 0) / filteredData.filter(row => row.analysis).length
      : 0
    const celkovaPotrebaCao = filteredData.reduce((sum, row) => sum + row.potrebaCaoCelkem, 0)
    const pozemkuKVapneni = filteredData.filter(row => row.potrebaCaoTHa > 0).length
    const pozemkuOk = filteredData.filter(row => row.stav.status === 'ok').length
    const celkemDolomitTun = filteredData.reduce((sum, row) => sum + (row.produktSplit?.dolomitCelkem || 0), 0)
    const celkemVapenecTun = filteredData.reduce((sum, row) => sum + (row.produktSplit?.vapenecCelkem || 0), 0)
    const celkemProduktuTun = celkemDolomitTun + celkemVapenecTun
    
    return {
      celkemPozemku,
      celkovaVymera,
      prumernePh,
      celkovaPotrebaCao,
      pozemkuKVapneni,
      pozemkuOk,
      celkemDolomitTun,
      celkemVapenecTun,
      celkemProduktuTun,
    }
  }, [filteredData])

  // ============================================================
  // PDF EXPORT
  // ============================================================
  
  const handleExportPDF = async () => {
    try {
      toast.loading('Generuji PDF...', { id: 'pdf-export' })

      // Načteno dynamicky – jspdf je těžká knihovna, nemá smysl ji stahovat, dokud uživatel export nevyžádá
      const { exportLimingRecommendationsPDF, downloadLimingPDF, generateLimingFilename } =
        await import('@/lib/utils/liming-pdf-export-v2')

      // Připravit data pro PDF (s českými znaky - V2 je podporuje!)
      const pdfRows: LimingTableRow[] = sortedData.map(row => ({
        kultura: KULTURA_SHORT_LABEL[row.parcel.culture] || row.parcel.culture,
        pozemek: row.parcel.name,
        kodPozemku: row.parcel.code || undefined,
        vymera: row.parcel.area.toFixed(2),
        druh: SOIL_TYPE_LABELS_PDF[row.parcel.soil_type],
        rokRozboru: row.analysis ? new Date(row.analysis.analysis_date).getFullYear().toString() : '-',
        ph: row.analysis ? row.analysis.ph.toFixed(1) : '-',
        ca: row.analysis?.ca ? row.analysis.ca.toString() : '-',
        mg: row.analysis ? row.analysis.mg.toFixed(0) : '-',
        k: row.analysis ? row.analysis.k.toFixed(0) : '-',
        p: row.analysis ? row.analysis.p.toFixed(0) : '-',
        s: row.analysis?.s ? row.analysis.s.toString() : '-',
        kMgRatio: row.kMgRatio.formatted + (row.kMgRatio.note ? ` (${row.kMgRatio.note})` : ''),
        potrebaCaoTHa: row.potrebaCaoTHa > 0 ? row.potrebaCaoTHa.toFixed(2) : '-',
        potrebaCaoCelkem: row.potrebaCaoCelkem > 0 ? row.potrebaCaoCelkem.toFixed(2) : '-',
        dolomit: row.produktSplit && row.produktSplit.dolomitCelkem > 0.01 ? row.produktSplit.dolomitCelkem.toFixed(1) : '-',
        vapenec: row.produktSplit && row.produktSplit.vapenecCelkem > 0.01 ? row.produktSplit.vapenecCelkem.toFixed(1) : '-',
        produktCelkem: row.produktSplit && row.produktSplit.produktCelkemTun > 0.01 ? row.produktSplit.produktCelkemTun.toFixed(1) : '-',
        doplnitK2O: row.produktSplit?.doplnitK2OKgHa ? row.produktSplit.doplnitK2OKgHa.toFixed(0) : '-',
        stav: row.stav.label, // ✅ Zachovat české znaky!
      }))

      const pdfData: LimingPDFData = {
        companyName: userProfile?.company_name || userProfile?.full_name || 'Nepojmenovaný podnik',
        totalParcels: stats.celkemPozemku,
        totalArea: stats.celkovaVymera,
        averagePh: stats.prumernePh,
        totalCaoNeed: stats.celkovaPotrebaCao,
        parcelsToLime: stats.pozemkuKVapneni,
        parcelsOk: stats.pozemkuOk,
        totalDolomit: stats.celkemDolomitTun,
        totalVapenec: stats.celkemVapenecTun,
        totalProdukt: stats.celkemProduktuTun,
        dolomitProductName: dolomitProduct?.name,
        vapenecProductName: vapenecProduct?.name,
        rows: pdfRows,
      }

      // Generovat PDF
      const blob = await exportLimingRecommendationsPDF(pdfData)
      
      // Stáhnout PDF
      const filename = generateLimingFilename(pdfData.companyName)
      downloadLimingPDF(blob, filename)

      toast.success('✅ PDF úspěšně vygenerováno', { id: 'pdf-export' })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('❌ Chyba při generování PDF', { id: 'pdf-export' })
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="space-y-6">
      {/* Filtry */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Checkbox: Pouze pozemky vyžadující vápnění */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterPouzeVapneni}
              onChange={(e) => setFilterPouzeVapneni(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Pouze pozemky vyžadující vápnění</span>
          </label>
          
          {/* Dropdown: Půdní druh */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Půdní druh</label>
            <select
              value={filterPudniDruh}
              onChange={(e) => setFilterPudniDruh(e.target.value as typeof filterPudniDruh)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Všechny</option>
              <option value="L">Lehká</option>
              <option value="S">Střední</option>
              <option value="T">Těžká</option>
            </select>
          </div>
          
          {/* Dropdown: Stav */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Stav</label>
            <select
              value={filterStav}
              onChange={(e) => setFilterStav(e.target.value as typeof filterStav)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Všechny</option>
              <option value="urgentni">Urgentní</option>
              <option value="doporuceno">Doporučeno</option>
              <option value="udrzba">Údržba</option>
              <option value="ok">OK</option>
              <option value="chybi_rozbor">Chybí rozbor</option>
            </select>
          </div>
          
          {/* Tlačítko Export PDF */}
          <div className="flex items-end">
            <button
              onClick={handleExportPDF}
              disabled={sortedData.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportovat PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabulka */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabulka s horizontálním a vertikálním scrollem */}
        <div className="liming-table-container">
            <table className="w-full text-sm border-collapse" style={{ minWidth: '1800px' }}>
              <thead className="bg-gray-100">
                <tr className="border-b-2 border-gray-300">
                  <th className="liming-sticky-col liming-sticky-col-1 px-3 py-3 text-left font-semibold text-gray-700 bg-gray-100 border-r border-gray-300">
                    Kultura
                  </th>
                  <th className="liming-sticky-col liming-sticky-col-2 px-3 py-3 text-left font-semibold text-gray-700 bg-gray-100 border-r border-gray-300">
                    Pozemek
                  </th>
                  <th 
                    className="liming-sticky-col liming-sticky-col-3 px-3 py-3 text-left font-semibold text-gray-700 bg-gray-100 border-r border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('kod')}
                  >
                    <div className="flex items-center gap-2">
                      Kód pozemku
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="liming-sticky-col liming-sticky-col-4 px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('vymera')}
                    style={{ boxShadow: 'inset -4px 0 6px -4px rgba(0, 0, 0, 0.2)', width: '90px' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Výměra (ha)
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">Druh</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">Rok</th>
                  <th 
                    className="px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('ph')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      pH
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">Ca<br/>(mg/kg)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">Mg<br/>(mg/kg)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">K<br/>(mg/kg)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">P<br/>(mg/kg)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">S<br/>(mg/kg)</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">K/Mg</th>
                  <th 
                    className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap"
                    onClick={() => handleSort('potreba_cao')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      CaO<br/>(t/ha)
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">CaO<br/>celkem (t)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-blue-50 whitespace-nowrap" title="Jednorázové množství Dolomitu mletého potřebné k doplnění hořčíku">Dolomit<br/>(t)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-blue-50 whitespace-nowrap" title="Jednorázové množství Vápence mletého k doplnění zbývající potřeby CaO">Vápenec<br/>(t)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-blue-100 whitespace-nowrap" title="Celkové jednorázové množství produktu (Dolomit + Vápenec) k nápravě pH do optima">Produkt<br/>celkem (t)</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100 whitespace-nowrap" title="Informativní doporučení doplnění draslíku s ohledem na poměr K/Mg (mimo vápenné produkty)">Doplnit K₂O<br/>(kg/ha)</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">Stav</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">Akce</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={21} className="px-4 py-12 text-center text-gray-500">
                    {filterPouzeVapneni || filterPudniDruh !== 'all' || filterStav !== 'all' 
                      ? 'Žádné pozemky neodpovídají filtru'
                      : 'Zatím nemáte žádné pozemky'}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => (
                  <tr 
                    key={row.parcel.id} 
                    className={`border-b border-gray-200 liming-table-row ${idx % 2 === 0 ? 'liming-row-even' : 'liming-row-odd'}`}
                  >
                    <td className={`liming-sticky-col liming-sticky-col-1 px-3 py-3 text-gray-700 border-r border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {KULTURA_SHORT_LABEL[row.parcel.culture] || row.parcel.culture}
                    </td>
                    <td className={`liming-sticky-col liming-sticky-col-2 px-3 py-3 border-r border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <Link 
                        href={`/portal/pozemky/${row.parcel.id}`}
                        className="text-green-600 hover:text-green-700 font-medium hover:underline"
                      >
                        {row.parcel.name}
                      </Link>
                    </td>
                    <td className={`liming-sticky-col liming-sticky-col-3 px-3 py-3 text-gray-700 border-r border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {row.parcel.code || <span className="text-gray-400">-</span>}
                    </td>
                    <td className={`liming-sticky-col liming-sticky-col-4 px-3 py-3 text-center text-gray-700 font-semibold ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {row.parcel.area.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-700 whitespace-nowrap">{SOIL_TYPE_LABELS[row.parcel.soil_type]}</td>
                    <td className="px-3 py-3 text-center text-gray-700">
                      {row.analysis ? new Date(row.analysis.analysis_date).getFullYear() : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {row.analysis ? (
                        <span className={`font-semibold ${row.analysis.ph < 5.5 ? 'text-red-600' : row.analysis.ph < 6.0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {row.analysis.ph.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {row.analysis?.ca ? (
                        <span className={`font-semibold ${getNutrientTextColor(categorizeNutrient('Ca', row.analysis.ca, row.parcel.soil_type))}`}>
                          {row.analysis.ca}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {row.analysis?.mg ? (
                        <span className={`font-semibold ${getNutrientTextColor(categorizeNutrient('Mg', row.analysis.mg, row.parcel.soil_type, row.parcel.culture))}`}>
                          {row.analysis.mg.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {row.analysis?.k ? (
                        <span className={`font-semibold ${getNutrientTextColor(categorizeNutrient('K', row.analysis.k, row.parcel.soil_type, row.parcel.culture))}`}>
                          {row.analysis.k.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {row.analysis?.p ? (
                        <span className={`font-semibold ${getNutrientTextColor(categorizeNutrient('P', row.analysis.p, row.parcel.soil_type, row.parcel.culture))}`}>
                          {row.analysis.p.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {row.analysis?.s ? (
                        <span className={`font-semibold ${getNutrientTextColor(categorizeNutrient('S', row.analysis.s, row.parcel.soil_type))}`}>
                          {row.analysis.s}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-medium ${row.kMgRatio.color}`}>
                        {row.kMgRatio.formatted}
                        {row.kMgRatio.note && (
                          <span className="text-xs ml-1">({row.kMgRatio.note})</span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700 font-medium">
                      {row.potrebaCaoTHa > 0 ? row.potrebaCaoTHa.toFixed(2) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700 font-medium">
                      {row.potrebaCaoCelkem > 0 ? row.potrebaCaoCelkem.toFixed(2) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700 bg-blue-50/50">
                      {row.produktSplit && row.produktSplit.dolomitCelkem > 0.01
                        ? row.produktSplit.dolomitCelkem.toFixed(1)
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700 bg-blue-50/50">
                      {row.produktSplit && row.produktSplit.vapenecCelkem > 0.01
                        ? row.produktSplit.vapenecCelkem.toFixed(1)
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-900 font-semibold bg-blue-50">
                      {row.produktSplit && row.produktSplit.produktCelkemTun > 0.01
                        ? row.produktSplit.produktCelkemTun.toFixed(1)
                        : <span className="text-gray-400 font-normal">-</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700">
                      {row.produktSplit?.doplnitK2OKgHa
                        ? row.produktSplit.doplnitK2OKgHa.toFixed(0)
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 ${row.stav.color} font-medium whitespace-nowrap`}>
                        <span>{row.stav.icon}</span>
                        <span className="text-xs">{row.stav.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/portal/pozemky/${row.parcel.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Zobrazit detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Souhrn pod tabulkou */}
      {sortedData.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-6 border-t-4 border-gray-400 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Celkem pozemků</p>
              <p className="text-2xl font-bold text-gray-900">{stats.celkemPozemku}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Celková výměra</p>
              <p className="text-2xl font-bold text-gray-900">{stats.celkovaVymera.toFixed(2)} ha</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Průměrné pH</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.prumernePh > 0 ? stats.prumernePh.toFixed(1) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Celková potřeba CaO</p>
              <p className="text-2xl font-bold text-gray-900">{stats.celkovaPotrebaCao.toFixed(1)} t</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pozemků k vápnění</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pozemkuKVapneni}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pozemků OK</p>
              <p className="text-2xl font-bold text-green-600">{stats.pozemkuOk}</p>
            </div>
          </div>

          {/* Jednorázové množství produktu k nápravě pH do optima */}
          <div className="pt-4 border-t border-gray-300">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Celkové jednorázové množství k nápravě pH do optima (dle typu půdy a stavu Mg)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {dolomitProduct?.name || 'Dolomit'} (na doplnění Mg)
                </p>
                <p className="text-2xl font-bold text-blue-700">{stats.celkemDolomitTun.toFixed(1)} t</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {vapenecProduct?.name || 'Vápenec'} (na zbytek CaO)
                </p>
                <p className="text-2xl font-bold text-blue-700">{stats.celkemVapenecTun.toFixed(1)} t</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Produkt celkem</p>
                <p className="text-2xl font-bold text-blue-900">{stats.celkemProduktuTun.toFixed(1)} t</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Pokud je hořčík nízký/vyhovující, engine spočítá jednorázové množství {dolomitProduct?.name.toLowerCase() || 'dolomitu'} potřebné
              k doplnění Mg a zbytek potřeby CaO dorovná levnějším {vapenecProduct?.name.toLowerCase() || 'vápencem'}. Pokud je hořčík dobrý/vysoký,
              použije se pouze {vapenecProduct?.name.toLowerCase() || 'vápenec'}. Sloupec &quot;Doplnit K₂O&quot; je informativní doporučení
              s ohledem na poměr K/Mg (draslík není součástí vápenných produktů).
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

