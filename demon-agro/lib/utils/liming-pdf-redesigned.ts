/**
 * REDESIGNED PDF EXPORT FOR LIMING PLANS
 * Professional Agronomy Report with proper Czech encoding
 * 
 * Features:
 * - Proper Czech character support
 * - Professional layout with color scheme
 * - Executive summary on cover page
 * - Individual field blocks with green headers
 * - pH visualization
 * - Zebra-striped tables
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// TYPES (Keep existing structure)
// ============================================================================

export interface LimingApplication {
  id: string
  year: number
  season: 'jaro' | 'leto' | 'podzim'
  sequence_order: number
  product_name: string
  cao_content: number
  mgo_content: number
  dose_per_ha: number
  total_dose: number
  cao_per_ha: number
  mgo_per_ha: number
  ph_before: number
  ph_after: number
  mg_after: number | null
  notes: string | null
  status: 'planned' | 'ordered' | 'applied' | 'cancelled'
  product_price_per_ton: number | null
}

export interface LimingPlan {
  id: string
  parcel_id: string
  current_ph: number
  target_ph: number
  soil_type: 'L' | 'S' | 'T'
  land_use: 'orna' | 'ttp'
  total_ca_need: number
  total_cao_need: number
  total_ca_need_per_ha: number
  total_cao_need_per_ha: number
  status: string
  created_at: string
  parcel: {
    name: string
    code: string
    area: number
    soil_type: string
    culture?: string
  }
  applications: LimingApplication[]
}

export interface PDFExportOptions {
  includePrice?: boolean
}

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  // Primary brand colors
  primaryGreen: [46, 125, 50] as [number, number, number], // #2E7D32
  lightGreen: [200, 230, 201] as [number, number, number], // #C8E6C9
  darkGreen: [27, 94, 32] as [number, number, number], // #1B5E20
  
  // Accent colors
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  darkGray: [97, 97, 97] as [number, number, number], // #616161
  lightGray: [245, 245, 245] as [number, number, number], // #F5F5F5
  mediumGray: [224, 224, 224] as [number, number, number], // #E0E0E0
  
  // Status colors
  warning: [255, 152, 0] as [number, number, number], // #FF9800 (for low pH)
  danger: [211, 47, 47] as [number, number, number], // #D32F2F (for critical pH)
  success: [56, 142, 60] as [number, number, number], // #388E3C
}

const FONTS = {
  logo: 24,
  title: 20,
  heading: 16,
  subheading: 14,
  body: 11,
  small: 9,
  tiny: 8,
}

// ============================================================================
// CZECH CHARACTER MAPPING
// ============================================================================

/**
 * Map database strings to proper Czech terms with diacritics
 */
function mapCzechTerms(text: string): string {
  const mapping: Record<string, string> = {
    // Field names (parcels)
    'neur ena': 'neurčena',
    'neurena': 'neurčena',
    
    // Soil types
    'Lehka': 'Lehká',
    'Stredni': 'Střední', 
    'Tezka': 'Těžká',
    
    // Land use
    'Orna puda': 'Orná půda',
    'orna': 'orná',
    
    // Products
    'Palene vapno': 'Pálené vápno',
    'Vapenec mlety': 'Vápenec mletý',
    'Dolomit mlety': 'Dolomit mletý',
    'Vapenec drceny': 'Vápenec drcený',
    'Dolomit granuly': 'Dolomit granulovaný',
    
    // Seasons
    'Jaro': 'Jaro',
    'Leto': 'Léto',
    'Podzim': 'Podzim',
    
    // General terms
    'potreba': 'potřeba',
    'potreby': 'potřeby',
    'aplikace': 'aplikace',
    'aplikaci': 'aplikací',
    'celkova': 'celková',
    'cilove': 'cílové',
    'aktualni': 'aktuální',
    'vymera': 'výměra',
    'pudni': 'půdní',
  }
  
  let result = text
  for (const [key, value] of Object.entries(mapping)) {
    const regex = new RegExp(key, 'gi')
    result = result.replace(regex, value)
  }
  
  return result
}

function getSoilTypeLabel(soilType: string): string {
  const labels: Record<string, string> = {
    L: 'Lehká',
    S: 'Střední',
    T: 'Těžká',
  }
  return labels[soilType] || soilType
}

function getLandUseLabel(landUse: string): string {
  const labels: Record<string, string> = {
    orna: 'Orná půda',
    ttp: 'TTP (trvalý travní porost)',
  }
  return labels[landUse] || landUse
}

function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    jaro: 'Jaro',
    leto: 'Léto',
    podzim: 'Podzim',
  }
  return labels[season] || season
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function formatCzechDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace('.', ',')
}

function formatPrice(amount: number): string {
  if (amount === 0) return 'na dotaz'
  return new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' Kč'
}

function calculateEstimatedCost(pricePerTon: number | null, totalDose: number): number {
  if (!pricePerTon || pricePerTon === 0) return 0
  return pricePerTon * totalDose
}

// ============================================================================
// MAIN EXPORT FUNCTION - Multiple Plans
// ============================================================================

export async function exportMultipleLimingPlansPDF(
  plans: LimingPlan[],
  userInfo?: { name?: string; company?: string },
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { includePrice = true } = options

  // Initialize PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Use Helvetica (standard font with better Unicode support)
  doc.setFont('helvetica', 'normal')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let currentY = margin

  // =========================================================================
  // PAGE 1: COVER SHEET
  // =========================================================================

  // Logo Area
  doc.setFillColor(...COLORS.primaryGreen)
  doc.rect(0, 0, pageWidth, 60, 'F')
  
  doc.setFontSize(FONTS.logo)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.white)
  doc.text('DÉMON AGRO', pageWidth / 2, 25, { align: 'center' })
  
  doc.setFontSize(FONTS.title)
  doc.setFont('helvetica', 'normal')
  doc.text('PLÁN VÁPNĚNÍ A ÚPRAVY pH', pageWidth / 2, 40, { align: 'center' })
  
  doc.setFontSize(FONTS.small)
  doc.text('Agronomické doporučení založené na metodice ÚKZÚZ', pageWidth / 2, 50, { 
    align: 'center' 
  })

  currentY = 75

  // Client Info Box
  doc.setDrawColor(...COLORS.mediumGray)
  doc.setLineWidth(0.5)
  doc.rect(margin, currentY, pageWidth - 2 * margin, 35)
  
  currentY += 8
  doc.setFontSize(FONTS.body)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.black)
  
  if (userInfo?.company) {
    doc.text(`Společnost: ${userInfo.company}`, margin + 5, currentY)
    currentY += 7
  }
  
  if (userInfo?.name) {
    doc.text(`Zpracoval: ${userInfo.name}`, margin + 5, currentY)
    currentY += 7
  }
  
  doc.text(`Datum vytvoření: ${formatCzechDate(new Date())}`, margin + 5, currentY)
  currentY += 7
  
  const totalArea = plans.reduce((sum, p) => sum + p.parcel.area, 0)
  doc.text(`Celková výměra: ${formatNumber(totalArea)} ha`, margin + 5, currentY)

  currentY = 120

  // Executive Summary
  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primaryGreen)
  doc.text('SOUHRNNÉ ÚDAJE', margin, currentY)

  currentY += 10

  const totalCaoNeed = plans.reduce((sum, p) => sum + p.total_cao_need, 0)
  const totalApplications = plans.reduce((sum, p) => sum + p.applications.length, 0)
  const totalCost = plans.reduce((sum, p) => 
    sum + p.applications.reduce((appSum, app) => 
      appSum + calculateEstimatedCost(app.product_price_per_ton, app.total_dose), 0
    ), 0
  )

  const summaryData = [
    ['Počet pozemků s plánem', plans.length.toString()],
    ['Celková výměra', `${formatNumber(totalArea)} ha`],
    ['Celková potřeba CaO', `${formatNumber(totalCaoNeed)} t`],
    ['Počet aplikací celkem', totalApplications.toString()],
  ]

  if (includePrice && totalCost > 0) {
    summaryData.push(['Odhadované náklady', formatPrice(totalCost)])
  }

  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: FONTS.subheading,
      cellPadding: 6,
    },
    columnStyles: {
      0: { 
        cellWidth: 70, 
        fontStyle: 'bold',
        textColor: COLORS.darkGray,
      },
      1: { 
        cellWidth: 'auto', 
        fontStyle: 'bold',
        textColor: COLORS.primaryGreen,
        fontSize: 15,
      },
    },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // Table of Contents
  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primaryGreen)
  doc.text('OBSAH', margin, currentY)

  currentY += 10

  const tocData = plans.map((plan, index) => [
    `${index + 1}.`,
    mapCzechTerms(plan.parcel.name),
    `${formatNumber(plan.parcel.area)} ha`,
    `pH ${formatNumber(plan.current_ph, 1)} → ${formatNumber(plan.target_ph, 1)}`,
  ])

  autoTable(doc, {
    startY: currentY,
    body: tocData,
    theme: 'plain',
    styles: {
      fontSize: FONTS.body,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 10, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', textColor: COLORS.primaryGreen },
    },
    margin: { left: margin, right: margin },
  })

  // Disclaimer box
  currentY = pageHeight - 45
  doc.setFillColor(...COLORS.lightGray)
  doc.rect(margin, currentY, pageWidth - 2 * margin, 25, 'F')
  
  currentY += 7
  doc.setFontSize(FONTS.small)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.darkGray)
  doc.text('DŮLEŽITÉ UPOZORNĚNÍ', margin + 5, currentY)
  
  currentY += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(FONTS.tiny)
  const disclaimerLines = [
    'Tento plán má orientační charakter. Výpočty jsou založeny na metodice ÚKZÚZ.',
    'Konečné dávky konzultujte s agronome nebo odborníkem na výživu rostlin.',
    'Doporučujeme provést kontrolní půdní rozbor 1 rok po aplikaci vápna.',
  ]
  disclaimerLines.forEach((line, i) => {
    doc.text(line, margin + 5, currentY + i * 4)
  })

  // =========================================================================
  // SUBSEQUENT PAGES: FIELD DETAILS
  // =========================================================================

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    
    // Add new page for each plan
    doc.addPage()
    currentY = margin

    // =====================================================================
    // FIELD HEADER (Dark Green Background)
    // =====================================================================
    
    doc.setFillColor(...COLORS.primaryGreen)
    doc.rect(0, currentY, pageWidth, 20, 'F')
    
    currentY += 7
    doc.setFontSize(FONTS.heading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.white)
    doc.text(`POZEMEK ${i + 1}: ${mapCzechTerms(plan.parcel.name).toUpperCase()}`, margin, currentY)
    
    currentY += 8
    doc.setFontSize(FONTS.body)
    doc.setFont('helvetica', 'normal')
    const headerInfo = `Kód: ${plan.parcel.code} | Výměra: ${formatNumber(plan.parcel.area)} ha | Půda: ${getSoilTypeLabel(plan.soil_type)}`
    doc.text(headerInfo, margin, currentY)

    currentY += 20

    // =====================================================================
    // FIELD INFO TABLE
    // =====================================================================

    const fieldInfoData = [
      ['Půdní druh', getSoilTypeLabel(plan.soil_type)],
      ['Využití', getLandUseLabel(plan.land_use)],
      ['Kultura', mapCzechTerms(plan.parcel.culture || '-')],
      ['Výměra', `${formatNumber(plan.parcel.area)} ha`],
    ]

    autoTable(doc, {
      startY: currentY,
      body: fieldInfoData,
      theme: 'plain',
      styles: {
        fontSize: FONTS.body,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 45, textColor: COLORS.darkGray },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
      },
      margin: { left: margin, right: pageWidth / 2 },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10

    // =====================================================================
    // pH VISUALIZATION
    // =====================================================================

    doc.setFontSize(FONTS.subheading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primaryGreen)
    doc.text('ÚPRAVA pH', margin, currentY)

    currentY += 10

    // pH Arrow visualization
    const phBoxY = currentY
    const phBoxHeight = 25
    const phBoxWidth = (pageWidth - 2 * margin) / 2

    // Current pH box
    const phColor = plan.current_ph < 5.0 ? COLORS.danger : 
                     plan.current_ph < 5.5 ? COLORS.warning : 
                     COLORS.darkGray
    
    doc.setFillColor(...phColor)
    doc.rect(margin, phBoxY, phBoxWidth - 10, phBoxHeight, 'F')
    
    doc.setFontSize(FONTS.tiny)
    doc.setTextColor(...COLORS.white)
    doc.text('AKTUÁLNÍ pH', margin + (phBoxWidth - 10) / 2, phBoxY + 6, { align: 'center' })
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(formatNumber(plan.current_ph, 1), margin + (phBoxWidth - 10) / 2, phBoxY + 18, { 
      align: 'center' 
    })

    // Arrow
    doc.setDrawColor(...COLORS.darkGray)
    doc.setLineWidth(2)
    const arrowStartX = margin + phBoxWidth - 5
    const arrowY = phBoxY + phBoxHeight / 2
    const arrowEndX = margin + phBoxWidth + 5
    
    doc.line(arrowStartX, arrowY, arrowEndX, arrowY)
    // Arrow head
    doc.line(arrowEndX - 3, arrowY - 2, arrowEndX, arrowY)
    doc.line(arrowEndX - 3, arrowY + 2, arrowEndX, arrowY)

    // Target pH box
    doc.setFillColor(...COLORS.success)
    doc.rect(margin + phBoxWidth + 10, phBoxY, phBoxWidth - 10, phBoxHeight, 'F')
    
    doc.setFontSize(FONTS.tiny)
    doc.setTextColor(...COLORS.white)
    doc.text('CÍLOVÉ pH', margin + phBoxWidth + 10 + (phBoxWidth - 10) / 2, phBoxY + 6, { 
      align: 'center' 
    })
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(formatNumber(plan.target_ph, 1), margin + phBoxWidth + 10 + (phBoxWidth - 10) / 2, 
      phBoxY + 18, { align: 'center' })

    currentY += phBoxHeight + 15

    // Need summary
    const needBoxData = [
      ['Rozdíl pH', `+${formatNumber(plan.target_ph - plan.current_ph, 1)}`],
      ['Potřeba CaO', `${formatNumber(plan.total_cao_need_per_ha)} t/ha`],
      ['Celková potřeba', `${formatNumber(plan.total_cao_need)} t`],
      ['Počet aplikací', plan.applications.length.toString()],
    ]

    autoTable(doc, {
      startY: currentY,
      body: needBoxData,
      theme: 'grid',
      styles: {
        fontSize: FONTS.body,
        cellPadding: 4,
        lineColor: COLORS.mediumGray,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: COLORS.lightGreen,
        textColor: COLORS.black,
      },
      columnStyles: {
        0: { 
          cellWidth: 60,
          fontStyle: 'bold',
          textColor: COLORS.darkGray,
        },
        1: { 
          cellWidth: 'auto',
          fontStyle: 'bold',
          halign: 'right',
          fontSize: FONTS.subheading,
          textColor: COLORS.primaryGreen,
        },
      },
      margin: { left: margin, right: margin },
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Check if we need new page before applications table
    if (currentY > pageHeight - 100) {
      doc.addPage()
      currentY = margin
    }

    // =====================================================================
    // APPLICATION SCHEDULE TABLE
    // =====================================================================

    doc.setFontSize(FONTS.subheading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primaryGreen)
    doc.text('HARMONOGRAM APLIKACÍ', margin, currentY)

    currentY += 10

    // Sort applications
    const sortedApps = [...plan.applications].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      const seasonOrder = { jaro: 1, leto: 2, podzim: 3 }
      return seasonOrder[a.season] - seasonOrder[b.season]
    })

    const appHeaders = ['Rok', 'Období', 'Produkt', 'Dávka (t/ha)', 'Celkem (t)']
    if (includePrice) {
      appHeaders.push('Cena')
    }

    const appData = sortedApps.map((app) => {
      const caoContent = app.cao_content || 0
      const mgoContent = app.mgo_content || 0
      const productDetail = `${mapCzechTerms(app.product_name)}\n${formatNumber(caoContent, 0)}% CaO, ${formatNumber(mgoContent, 0)}% MgO`
      
      const row = [
        app.year.toString(),
        getSeasonLabel(app.season),
        productDetail,
        formatNumber(app.dose_per_ha, 2),
        formatNumber(app.total_dose, 1),
      ]

      if (includePrice) {
        const cost = calculateEstimatedCost(app.product_price_per_ton, app.total_dose)
        row.push(formatPrice(cost))
      }

      return row
    })

    autoTable(doc, {
      startY: currentY,
      head: [appHeaders],
      body: appData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primaryGreen,
        textColor: COLORS.white,
        fontSize: FONTS.body,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: FONTS.body,
        textColor: COLORS.black,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { halign: 'center', cellWidth: 22 },
        2: { cellWidth: 55 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 },
        5: includePrice ? { halign: 'right', cellWidth: 'auto', fontStyle: 'bold' } : {},
      },
      margin: { left: margin, right: margin },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10

    // Application notes if any
    const appsWithNotes = sortedApps.filter((app) => app.notes)
    if (appsWithNotes.length > 0 && currentY < pageHeight - 40) {
      doc.setFontSize(FONTS.body)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.darkGray)
      doc.text('Poznámky:', margin, currentY)

      currentY += 6

      appsWithNotes.forEach((app) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(FONTS.small)
        doc.text(`• ${app.year} - ${getSeasonLabel(app.season)}: ${app.notes}`, 
          margin + 5, currentY)
        currentY += 5
      })
    }
  }

  // =========================================================================
  // FOOTER ON ALL PAGES
  // =========================================================================

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    const footerY = pageHeight - 15
    
    doc.setDrawColor(...COLORS.mediumGray)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)
    
    doc.setFontSize(FONTS.tiny)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.darkGray)
    
    doc.text('Vygenerováno portálem Démon Agro | www.demonagro.cz', 
      pageWidth / 2, footerY, { align: 'center' })
    
    doc.text(`Strana ${i} z ${pageCount}`, pageWidth - margin, footerY, { 
      align: 'right' 
    })
  }

  // =========================================================================
  // GENERATE BLOB
  // =========================================================================

  const blob = doc.output('blob')
  return blob
}

// ============================================================================
// EXPORT SINGLE PLAN
// ============================================================================

export async function exportLimingPlanPDF(
  plan: LimingPlan,
  options: PDFExportOptions = {}
): Promise<Blob> {
  // Wrap single plan in array and use the multiple plans function
  return exportMultipleLimingPlansPDF([plan], undefined, options)
}

// ============================================================================
// DOWNLOAD FUNCTIONS
// ============================================================================

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateLimingPlanFilename(parcelName: string): string {
  const date = new Date().toISOString().split('T')[0]
  const safeName = parcelName.replace(/[^a-zA-Z0-9]/g, '_')
  return `Plan_vapneni_${safeName}_${date}.pdf`
}

export function generateMultipleLimingPlansFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `Plany_vapneni_${date}.pdf`
}



