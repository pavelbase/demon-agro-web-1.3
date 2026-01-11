// Excel Export utility for Démon Agro Portal
// Uses SheetJS (xlsx) library for Excel generation

import * as XLSX from 'xlsx'
import type { 
  Parcel, 
  SoilAnalysis,
  LimingRequest,
  LimingRequestItem,
  LimingProduct,
  PhCategory,
  NutrientCategory,
  SoilType,
  Culture,
} from '@/lib/types/database'
import type { FertilizationPlan } from './fertilization-plan'

// ============================================================================
// TYPES
// ============================================================================

interface ParcelWithAnalysis extends Parcel {
  latest_analysis?: SoilAnalysis | null
}

interface LimingRequestWithDetails extends LimingRequest {
  items?: (LimingRequestItem & { 
    parcel?: Parcel | null
    product?: LimingProduct | null
  })[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Czech label for soil type
 */
function getSoilTypeLabel(soilType: SoilType): string {
  const labels: Record<SoilType, string> = {
    L: 'Lehká',
    S: 'Střední',
    T: 'Těžká',
  }
  return labels[soilType] || soilType
}

/**
 * Get Czech label for culture
 */
function getCultureLabel(culture: Culture): string {
  const labels: Record<Culture, string> = {
    orna: 'Orná půda',
    ttp: 'TTP',
  }
  return labels[culture] || culture
}

/**
 * Get Czech label for pH category
 */
function getPhCategoryLabel(category: PhCategory | null | undefined): string {
  if (!category) return '-'
  const labels: Record<PhCategory, string> = {
    extremne_kysela: 'Extrémně kyselá',
    silne_kysela: 'Silně kyselá',
    slabe_kysela: 'Slabě kyselá',
    neutralni: 'Neutrální',
    slabe_alkalicka: 'Slabě alkalická',
    alkalicka: 'Alkalická',
  }
  return labels[category] || category
}

/**
 * Get Czech label for nutrient category
 */
function getNutrientCategoryLabel(category: NutrientCategory | null | undefined): string {
  if (!category) return '-'
  const labels: Record<NutrientCategory, string> = {
    nizky: 'Nízký',
    vyhovujici: 'Vyhovující',
    dobry: 'Dobrý',
    vysoky: 'Vysoký',
    velmi_vysoky: 'Velmi vysoký',
  }
  return labels[category] || category
}

/**
 * Format number in Czech locale
 */
function formatNumber(num: number | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format date in Czech locale
 */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('cs-CZ')
}

/**
 * Calculate K:Mg ratio
 */
function calculateKMgRatio(k: number | null, mg: number | null): string {
  if (!k || !mg || mg === 0) return '-'
  const ratio = k / mg
  return formatNumber(ratio, 2)
}

/**
 * Get lime type label
 */
function getLimeTypeLabel(limeType: string): string {
  const labels: Record<string, string> = {
    calcitic: 'Vápenatý',
    dolomite: 'Dolomitický',
    either: 'Libovolný',
  }
  return labels[limeType] || limeType
}

/**
 * Create workbook and return buffer for download
 */
function workbookToBuffer(workbook: XLSX.WorkBook): Buffer {
  const buffer = XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    cellStyles: true,
  })
  return buffer
}

/**
 * Download buffer as Excel file
 */
export function downloadExcel(buffer: Buffer, filename: string): void {
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// 1. EXPORT PARCELS TO EXCEL
// ============================================================================

/**
 * Export parcels list to Excel
 * 
 * @param parcels - Array of parcels with optional latest analysis
 * @returns Buffer for Excel file download
 */
export function exportParcelsExcel(parcels: ParcelWithAnalysis[]): Buffer {
  // Prepare data rows
  const data = parcels.map((parcel) => {
    const analysis = parcel.latest_analysis

    return {
      'Název pozemku': parcel.name,
      'Kód pozemku (LPIS)': parcel.code || '-',
      'Výměra (ha)': parcel.area,
      'Typ půdy': getSoilTypeLabel(parcel.soil_type),
      'Kultura': getCultureLabel(parcel.culture),
      'pH': analysis?.ph ? formatNumber(analysis.ph, 2) : '-',
      'Fosfor P (mg/kg)': analysis?.p ? formatNumber(analysis.p, 0) : '-',
      'Stav P': analysis?.p_category ? getNutrientCategoryLabel(analysis.p_category) : '-',
      'Draslík K (mg/kg)': analysis?.k ? formatNumber(analysis.k, 0) : '-',
      'Stav K': analysis?.k_category ? getNutrientCategoryLabel(analysis.k_category) : '-',
      'Hořčík Mg (mg/kg)': analysis?.mg ? formatNumber(analysis.mg, 0) : '-',
      'Stav Mg': analysis?.mg_category ? getNutrientCategoryLabel(analysis.mg_category) : '-',
      'Vápník Ca (mg/kg)': analysis?.ca ? formatNumber(analysis.ca, 0) : '-',
      'Stav Ca': analysis?.ca_category ? getNutrientCategoryLabel(analysis.ca_category) : '-',
      'Síra S (mg/kg)': analysis?.s ? formatNumber(analysis.s, 0) : '-',
      'Stav S': analysis?.s_category ? getNutrientCategoryLabel(analysis.s_category) : '-',
      'Datum rozboru': analysis ? formatDate(analysis.analysis_date) : '-',
    }
  })

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Set column widths
  const colWidths = [
    { wch: 25 }, // Název pozemku
    { wch: 18 }, // Kód pozemku
    { wch: 12 }, // Výměra
    { wch: 12 }, // Typ půdy
    { wch: 15 }, // Kultura
    { wch: 8 },  // pH
    { wch: 16 }, // Fosfor P
    { wch: 12 }, // Stav P
    { wch: 16 }, // Draslík K
    { wch: 12 }, // Stav K
    { wch: 16 }, // Hořčík Mg
    { wch: 12 }, // Stav Mg
    { wch: 16 }, // Vápník Ca
    { wch: 12 }, // Stav Ca
    { wch: 16 }, // Síra S
    { wch: 12 }, // Stav S
    { wch: 15 }, // Datum rozboru
  ]
  worksheet['!cols'] = colWidths

  // Style header row (bold)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
      }
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pozemky')

  return workbookToBuffer(workbook)
}

// ============================================================================
// 2. EXPORT FERTILIZATION PLAN TO EXCEL
// ============================================================================

/**
 * Export fertilization plan to Excel (multiple sheets)
 * 
 * @param plan - Fertilization plan
 * @param parcel - Parcel information
 * @param analysis - Soil analysis
 * @returns Buffer for Excel file download
 */
export function exportFertilizationPlanExcel(
  plan: FertilizationPlan,
  parcel: Parcel,
  analysis: SoilAnalysis
): Buffer {
  const workbook = XLSX.utils.book_new()

  // =========================================================================
  // SHEET 1: PARCEL INFORMATION
  // =========================================================================

  const parcelData = [
    ['PLÁN HNOJENÍ', ''],
    ['', ''],
    ['Informace o pozemku', ''],
    ['Název/Kód', `${parcel.name}${parcel.code ? ` (${parcel.code})` : ''}`],
    ['Výměra', `${formatNumber(parcel.area, 2)} ha`],
    ['Půdní druh', getSoilTypeLabel(parcel.soil_type)],
    ['Kultura', getCultureLabel(parcel.culture)],
    ['Cílový rok', plan.target_year],
    ['Typ plánu', plan.plan_type === 'simple' ? 'Jednoduchý' : plan.plan_type === 'detailed' ? 'Detailní' : 'Pokročilý'],
    ['Typ uživatele', `Typ ${plan.user_type}`],
    ['', ''],
    ['Aktuální stav půdy', ''],
    ['pH', analysis.ph ? formatNumber(analysis.ph, 2) : '-', getPhCategoryLabel(analysis.ph_category)],
    ['Fosfor (P)', analysis.phosphorus ? `${analysis.phosphorus} mg/kg` : '-', getNutrientCategoryLabel(analysis.phosphorus_category)],
    ['Draslík (K)', analysis.potassium ? `${analysis.potassium} mg/kg` : '-', getNutrientCategoryLabel(analysis.potassium_category)],
    ['Hořčík (Mg)', analysis.magnesium ? `${analysis.magnesium} mg/kg` : '-', getNutrientCategoryLabel(analysis.magnesium_category)],
    ['Vápník (Ca)', analysis.calcium ? `${analysis.calcium} mg/kg` : '-', getNutrientCategoryLabel(analysis.calcium_category)],
    ['', ''],
    ['Rozbor', ''],
    ['Laboratoř', analysis.lab_name || '-'],
    ['Datum rozboru', formatDate(analysis.date)],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(parcelData)
  ws1['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(workbook, ws1, 'Info o pozemku')

  // =========================================================================
  // SHEET 2: RECOMMENDATIONS
  // =========================================================================

  const recommendationsData: any[][] = [
    ['DOPORUČENÍ', '', ''],
    ['', '', ''],
  ]

  // Liming recommendations
  if (plan.recommended_lime_kg_ha > 0) {
    recommendationsData.push(
      ['Vápnění', '', ''],
      ['Potřeba CaO', `${formatNumber(plan.recommended_lime_kg_ha / 1000, 2)} t/ha`, `${formatNumber((plan.recommended_lime_kg_ha / 1000) * parcel.area, 2)} t celkem`],
      ['Typ vápna', getLimeTypeLabel(plan.recommended_lime_type), ''],
      ['Důvod', plan.lime_reasoning || '-', ''],
      ['', '', ''],
    )
  }

  // Nutrient recommendations
  recommendationsData.push(
    ['Doporučené dávky živin', '', ''],
    ['Živina', 'Na hektar', 'Celkem na pozemek'],
    ['Fosfor (P₂O₅)', `${formatNumber(plan.recommended_nutrients.p2o5, 0)} kg/ha`, `${formatNumber(plan.recommended_nutrients.p2o5 * parcel.area, 0)} kg`],
    ['Draslík (K₂O)', `${formatNumber(plan.recommended_nutrients.k2o, 0)} kg/ha`, `${formatNumber(plan.recommended_nutrients.k2o * parcel.area, 0)} kg`],
    ['Hořčík (MgO)', `${formatNumber(plan.recommended_nutrients.mgo, 0)} kg/ha`, `${formatNumber(plan.recommended_nutrients.mgo * parcel.area, 0)} kg`],
    ['Síra (S)', `${formatNumber(plan.recommended_nutrients.s, 0)} kg/ha`, `${formatNumber(plan.recommended_nutrients.s * parcel.area, 0)} kg`],
    ['', '', ''],
  )

  // K:Mg ratio
  if (plan.km_ratio) {
    recommendationsData.push(
      ['K:Mg poměr', formatNumber(plan.km_ratio, 2), plan.km_ratio_corrected ? '(korigováno)' : ''],
      ['', '', ''],
    )
  }

  // Warnings
  if (plan.warnings.length > 0) {
    recommendationsData.push(
      ['Upozornění a doporučení', '', ''],
    )
    plan.warnings.forEach((warning) => {
      recommendationsData.push([
        warning.severity === 'error' ? '❌' : warning.severity === 'warning' ? '⚠️' : 'ℹ️',
        warning.message,
        warning.recommendation || '',
      ])
    })
  }

  const ws2 = XLSX.utils.aoa_to_sheet(recommendationsData)
  ws2['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(workbook, ws2, 'Doporučení')

  // =========================================================================
  // SHEET 3: PREDICTIONS (only for Type C)
  // =========================================================================

  if (plan.predictions) {
    const predictionsData: any[][] = [
      ['PREDIKCE VÝVOJE ŽIVIN (4 ROKY)', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Rok', 'pH', 'P (mg/kg)', 'K (mg/kg)', 'Mg (mg/kg)', 'S (mg/kg)'],
    ]

    plan.predictions.years.forEach((year, index) => {
      predictionsData.push([
        year,
        formatNumber(plan.predictions!.ph[index], 2),
        formatNumber(plan.predictions!.p[index], 0),
        formatNumber(plan.predictions!.k[index], 0),
        formatNumber(plan.predictions!.mg[index], 0),
        formatNumber(plan.predictions!.s[index], 0),
      ])
    })

    predictionsData.push(
      ['', '', '', '', '', ''],
      ['Poznámka: Predikce jsou orientační a předpokládají pravidelné hnojení.', '', '', '', '', ''],
    )

    const ws3 = XLSX.utils.aoa_to_sheet(predictionsData)
    ws3['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(workbook, ws3, 'Predikce')
  }

  return workbookToBuffer(workbook)
}

// ============================================================================
// 3. EXPORT LIMING REQUEST TO EXCEL
// ============================================================================

/**
 * Export liming request to Excel (for admin/calculation)
 * 
 * @param request - Liming request
 * @returns Buffer for Excel file download
 */
export function exportLimingRequestExcel(request: LimingRequestWithDetails): Buffer {
  const workbook = XLSX.utils.book_new()

  // =========================================================================
  // SHEET 1: REQUEST OVERVIEW
  // =========================================================================

  const overviewData = [
    ['POPTÁVKA VÁPNĚNÍ', ''],
    ['', ''],
    ['Číslo poptávky', `#${request.id.slice(0, 8)}`],
    ['Datum vytvoření', formatDate(request.created_at)],
    ['Status', request.status],
    ['', ''],
    ['Kontaktní údaje', ''],
    ['Jméno', request.contact_name],
    ['Email', request.contact_email],
    ['Telefon', request.contact_phone || '-'],
    ['', ''],
    ['Dodání', ''],
    ['Preferovaný termín', request.delivery_period || '-'],
    ['Poznámka', request.notes || '-'],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(overviewData)
  ws1['!cols'] = [{ wch: 25 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(workbook, ws1, 'Přehled')

  // =========================================================================
  // SHEET 2: ITEMS LIST
  // =========================================================================

  if (request.items && request.items.length > 0) {
    const itemsData: any[][] = [
      ['POLOŽKY POPTÁVKY', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Pozemek', 'Produkt', 'Výměra (ha)', 'Množství (t)', 'CaO (%)', 'MgO (%)'],
    ]

    let totalArea = 0
    let totalQuantity = 0

    request.items.forEach((item) => {
      const parcelName = item.parcel?.name || 'N/A'
      const productName = item.product?.name || 'N/A'
      const area = item.parcel?.area || 0
      const quantity = item.quantity_tons
      const cao = item.product?.cao_content || 0
      const mgo = item.product?.mgo_content || 0

      totalArea += area
      totalQuantity += quantity

      itemsData.push([
        parcelName,
        productName,
        formatNumber(area, 2),
        formatNumber(quantity, 2),
        formatNumber(cao, 0),
        formatNumber(mgo, 0),
      ])
    })

    // Add totals row
    itemsData.push(
      ['', '', '', '', '', ''],
      ['CELKEM', '', formatNumber(totalArea, 2), formatNumber(totalQuantity, 2), '', ''],
    )

    const ws2 = XLSX.utils.aoa_to_sheet(itemsData)
    ws2['!cols'] = [
      { wch: 30 }, // Pozemek
      { wch: 30 }, // Produkt
      { wch: 15 }, // Výměra
      { wch: 15 }, // Množství
      { wch: 12 }, // CaO
      { wch: 12 }, // MgO
    ]
    XLSX.utils.book_append_sheet(workbook, ws2, 'Položky')
  }

  // =========================================================================
  // SHEET 3: CALCULATION TEMPLATE (for admin)
  // =========================================================================

  const calcData: any[][] = [
    ['KALKULACE CENY', '', ''],
    ['', '', ''],
    ['Položka', 'Množství', 'Jednotková cena', 'Celková cena'],
  ]

  if (request.items && request.items.length > 0) {
    request.items.forEach((item) => {
      const productName = item.product?.name || 'N/A'
      const quantity = item.quantity_tons

      calcData.push([
        productName,
        `${formatNumber(quantity, 2)} t`,
        '', // Admin vyplní
        '', // Vypočítá se automaticky (pokud admin použije Excel vzorec)
      ])
    })

    calcData.push(
      ['', '', '', ''],
      ['Doprava', '', '', ''],
      ['Aplikace', '', '', ''],
      ['', '', '', ''],
      ['CELKEM BEZ DPH', '', '', ''],
      ['DPH 21%', '', '', ''],
      ['CELKEM S DPH', '', '', ''],
    )
  }

  const ws3 = XLSX.utils.aoa_to_sheet(calcData)
  ws3['!cols'] = [
    { wch: 35 }, // Položka
    { wch: 15 }, // Množství
    { wch: 20 }, // Jednotková cena
    { wch: 20 }, // Celková cena
  ]
  XLSX.utils.book_append_sheet(workbook, ws3, 'Kalkulace')

  return workbookToBuffer(workbook)
}

// ============================================================================
// FILENAME GENERATORS
// ============================================================================

/**
 * Generate filename for parcels export
 */
export function generateParcelsFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `demon-agro-pozemky-${date}.xlsx`
}

/**
 * Generate filename for fertilization plan export
 */
export function generatePlanExcelFilename(parcel: Parcel, targetYear: string): string {
  const safeName = parcel.name.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  return `Plan_hnojeni_${safeName}_${targetYear}_${date}.xlsx`
}

/**
 * Generate filename for liming request export
 */
export function generateRequestFilename(requestId: string): string {
  const shortId = requestId.slice(0, 8)
  const date = new Date().toISOString().split('T')[0]
  return `Poptavka_${shortId}_${date}.xlsx`
}
