// PDF Export utility for Liming Plans
// Uses jsPDF + jspdf-autotable for professional PDF generation

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Add support for Czech characters
// Import font with Czech character support if available
// Note: jsPDF default fonts have limited Unicode support

// ============================================================================
// TYPES
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
  language?: 'cs' | 'en'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#16A34A', // green-600
  secondary: '#84CC16', // lime-500
  text: '#1F2937', // gray-800
  darkGray: '#6B7280', // gray-500
  lightGray: '#F3F4F6', // gray-100
  border: '#E5E7EB', // gray-200
  success: '#10B981', // green-500
  warning: '#F59E0B', // yellow-500
  danger: '#EF4444', // red-500
}

const FONTS = {
  title: 18,
  heading: 14,
  subheading: 12,
  body: 10,
  small: 8,
}

// ============================================================================
// HELPER FUNCTIONS
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

function getSoilTypeLabel(soilType: string): string {
  const labels: Record<string, string> = {
    L: 'Lehka',
    S: 'Stredni',
    T: 'Tezka',
  }
  return labels[soilType] || soilType
}

function getLandUseLabel(landUse: string): string {
  const labels: Record<string, string> = {
    orna: 'Orna puda',
    ttp: 'TTP (trvaly travni porost)',
  }
  return labels[landUse] || landUse
}

function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    jaro: 'Jaro',
    leto: 'Leto',
    podzim: 'Podzim',
  }
  return labels[season] || season
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planned: 'Naplanovano',
    ordered: 'Objednano',
    applied: 'Aplikovano',
    cancelled: 'Zruseno',
  }
  return labels[status] || status
}

function formatPrice(amount: number): string {
  if (amount === 0) return 'individualni'
  // Format without spaces to avoid jsPDF rendering issues
  const formatted = Math.round(amount).toString()
  return `${formatted} Kc`
}

function calculateEstimatedCost(pricePerTon: number | null, totalDose: number): number {
  if (!pricePerTon || pricePerTon === 0) return 0
  return pricePerTon * totalDose
}

// ============================================================================
// MAIN EXPORT FUNCTION - Single Plan
// ============================================================================

/**
 * Export single Liming Plan to PDF
 */
export async function exportLimingPlanPDF(
  plan: LimingPlan,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { includePrice = true } = options

  // Initialize PDF (A4, portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let currentY = margin

  // =========================================================================
  // 1. HEADER
  // =========================================================================

  // Logo placeholder
  doc.setFillColor(COLORS.primary)
  doc.rect(margin, currentY, 30, 15, 'F')
  doc.setFontSize(FONTS.small)
  doc.setTextColor(255, 255, 255)
  doc.text('DÉMON', margin + 15, currentY + 7.5, { align: 'center' })
  doc.text('AGRO', margin + 15, currentY + 11, { align: 'center' })

  // Title
  doc.setFontSize(FONTS.title)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'bold')
  doc.text('Plan vapneni', pageWidth / 2, currentY + 10, { align: 'center' })

  // Generation date
  doc.setFontSize(FONTS.small)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.darkGray)
  doc.text(
    `Vygenerovano: ${formatCzechDate(new Date())}`,
    pageWidth - margin,
    currentY + 5,
    { align: 'right' }
  )

  currentY += 25

  // =========================================================================
  // 2. PARCEL INFORMATION
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Informace o pozemku', margin, currentY)

  currentY += 8

  const parcelData = [
    ['Nazev/Kod', `${plan.parcel.name}${plan.parcel.code ? ` (${plan.parcel.code})` : ''}`],
    ['Vymera', `${formatNumber(plan.parcel.area)} ha`],
    ['Pudni druh', getSoilTypeLabel(plan.soil_type)],
    ['Vyuziti', getLandUseLabel(plan.land_use)],
    ['Kultura', plan.parcel.culture || '-'],
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Parametr', 'Hodnota']],
    body: parcelData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontSize: FONTS.body,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: FONTS.body,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
    },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // =========================================================================
  // 3. LIMING NEED SUMMARY
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Potreba vapneni', margin, currentY)

  currentY += 8

  const needData = [
    ['Aktualni pH', formatNumber(plan.current_ph, 1)],
    ['Cilove pH', formatNumber(plan.target_ph, 1)],
    ['Rozdil pH', `+${formatNumber(plan.target_ph - plan.current_ph, 1)}`],
    ['Potreba CaO (t/ha)', formatNumber(plan.total_cao_need_per_ha)],
    ['Celkova potreba CaO (t)', formatNumber(plan.total_cao_need)],
    ['Pocet aplikaci', plan.applications.length.toString()],
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Parametr', 'Hodnota']],
    body: needData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontSize: FONTS.body,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: FONTS.body,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
    },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // Check if we need a new page
  if (currentY > pageHeight - 100) {
    doc.addPage()
    currentY = margin
  }

  // =========================================================================
  // 4. APPLICATION SCHEDULE
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Casovy plan aplikaci', margin, currentY)

  currentY += 8

  // Sort applications by year and season
  const sortedApps = [...plan.applications].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    const seasonOrder = { jaro: 1, leto: 2, podzim: 3 }
    return seasonOrder[a.season] - seasonOrder[b.season]
  })

  const applicationHeaders = [
    'Rok',
    'Obdobi',
    'Produkt',
    'Davka\n(t/ha)',
    'Celkem\n(t)',
    'CaO\n(t/ha)',
    'MgO\n(t/ha)',
    'pH\n(pred->po)',
    'Stav',
  ]

  if (includePrice) {
    applicationHeaders.push('Cena\n(Kč)')
  }

    const applicationData = sortedApps.map((app) => {
      const caoContent = app.cao_content || 0
      const mgoContent = app.mgo_content || 0
      const row = [
        app.year.toString(),
        getSeasonLabel(app.season),
        `${app.product_name}\n${formatNumber(caoContent, 0)}% CaO, ${formatNumber(mgoContent, 0)}% MgO`,
        formatNumber(app.dose_per_ha),
        formatNumber(app.total_dose, 1),
        formatNumber(app.cao_per_ha),
        formatNumber(app.mgo_per_ha),
        `${formatNumber(app.ph_before, 1)} -> ${formatNumber(app.ph_after, 1)}`,
        getStatusLabel(app.status),
      ]

      if (includePrice) {
        const cost = calculateEstimatedCost(app.product_price_per_ton, app.total_dose)
        row.push(formatPrice(cost))
      }

      return row
    })

  // Calculate totals
  const totalDose = sortedApps.reduce((sum, app) => sum + app.total_dose, 0)
  const totalCao = sortedApps.reduce((sum, app) => sum + (app.cao_per_ha * plan.parcel.area), 0)
  const totalMgo = sortedApps.reduce((sum, app) => sum + (app.mgo_per_ha * plan.parcel.area), 0)
  const totalCost = sortedApps.reduce(
    (sum, app) => sum + calculateEstimatedCost(app.product_price_per_ton, app.total_dose),
    0
  )

  const totalsRow = [
    '',
    '',
    'CELKEM:',
    '',
    formatNumber(totalDose, 1),
    formatNumber(totalCao / plan.parcel.area),
    formatNumber(totalMgo / plan.parcel.area),
    '',
    '',
  ]

  if (includePrice) {
    totalsRow.push(formatPrice(totalCost))
  }

  applicationData.push(totalsRow)

  autoTable(doc, {
    startY: currentY,
    head: [applicationHeaders],
    body: applicationData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontSize: FONTS.small,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: FONTS.small,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 14 },
      2: { cellWidth: 30 },
      3: { halign: 'right', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 15 },
      5: { halign: 'right', cellWidth: 15 },
      6: { halign: 'right', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 20 },
      8: { halign: 'center', cellWidth: 20 },
      9: includePrice ? { halign: 'right', cellWidth: 25 } : {},
    },
    didParseCell: function (data) {
      // Bold the totals row
      if (data.row.index === applicationData.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = COLORS.border
      }
    },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // =========================================================================
  // 5. APPLICATION NOTES (if any)
  // =========================================================================

  const appsWithNotes = sortedApps.filter((app) => app.notes)
  if (appsWithNotes.length > 0) {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage()
      currentY = margin
    }

    doc.setFontSize(FONTS.heading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.text)
    doc.text('Poznámky k aplikacím', margin, currentY)

    currentY += 8

    const notesData = appsWithNotes.map((app) => [
      `${app.year} - ${getSeasonLabel(app.season).replace(/[🌱☀️🍂]/g, '').trim()}`,
      app.notes || '',
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Aplikace', 'Poznámka']],
      body: notesData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: '#ffffff',
        fontSize: FONTS.body,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: FONTS.small,
        textColor: COLORS.text,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10
  }

  // =========================================================================
  // 6. RECOMMENDATIONS
  // =========================================================================

  // Check if we need a new page
  if (currentY > pageHeight - 80) {
    doc.addPage()
    currentY = margin
  }

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('💡 Doporučení', margin, currentY)

  currentY += 8

  // Background box for recommendations
  doc.setFillColor(240, 249, 255) // light blue
  doc.setDrawColor(COLORS.border)
  doc.rect(margin, currentY, pageWidth - 2 * margin, 40, 'FD')

  currentY += 5

  doc.setFontSize(FONTS.body)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.text)

  const recommendations = [
    '• Kontrolní půdní rozbor provádějte 1 rok po každé aplikaci vápna',
    '• Dodržujte minimální interval 3 let mezi aplikacemi',
    '• Vápnění provádějte nejlépe na podzim po sklizni (srpen - listopad)',
    '• Aplikovanou dávku lze upravit dle aktuálních potřeb a stavu půdy',
    '• Po aplikaci vápna zapravte do půdy do hloubky 15-20 cm',
  ]

  recommendations.forEach((rec, index) => {
    doc.text(rec, margin + 3, currentY + 5 + index * 6)
  })

  currentY += 50

  // =========================================================================
  // 7. FOOTER
  // =========================================================================

  addFooter(doc, pageWidth, pageHeight, margin)

  // =========================================================================
  // GENERATE BLOB
  // =========================================================================

  const blob = doc.output('blob')
  return blob
}

// ============================================================================
// MAIN EXPORT FUNCTION - Multiple Plans
// ============================================================================

/**
 * Export multiple Liming Plans to single PDF
 */
export async function exportMultipleLimingPlansPDF(
  plans: LimingPlan[],
  userInfo?: { name?: string; company?: string },
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { includePrice = true } = options

  // Initialize PDF (A4, portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let currentY = margin

  // =========================================================================
  // 1. COVER PAGE
  // =========================================================================

  // Logo
  doc.setFillColor(COLORS.primary)
  doc.rect(margin, currentY, 40, 20, 'F')
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(255, 255, 255)
  doc.text('DÉMON', margin + 20, currentY + 10, { align: 'center' })
  doc.text('AGRO', margin + 20, currentY + 15, { align: 'center' })

  currentY += 40

  // Main title
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Plany vapneni', pageWidth / 2, currentY, { align: 'center' })

  currentY += 15

  // Subtitle
  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.darkGray)
  doc.text('Souhrny export vsech planu vapneni', pageWidth / 2, currentY, {
    align: 'center',
  })

  currentY += 30

  // User info
  if (userInfo?.name || userInfo?.company) {
    doc.setFontSize(FONTS.body)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    if (userInfo.company) {
      doc.text(`Spolecnost: ${userInfo.company}`, pageWidth / 2, currentY, {
        align: 'center',
      })
      currentY += 8
    }

    if (userInfo.name) {
      doc.text(`Uzivatel: ${userInfo.name}`, pageWidth / 2, currentY, { align: 'center' })
      currentY += 8
    }
  }

  // Generation date
  currentY += 10
  doc.setFontSize(FONTS.body)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.darkGray)
  doc.text(`Vygenerovano: ${formatCzechDate(new Date())}`, pageWidth / 2, currentY, {
    align: 'center',
  })

  // =========================================================================
  // 2. SUMMARY PAGE
  // =========================================================================

  doc.addPage()
  currentY = margin

  doc.setFontSize(FONTS.title)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Souhrn planu', margin, currentY)

  currentY += 10

  // Statistics
  const totalParcels = plans.length
  const totalArea = plans.reduce((sum, p) => sum + p.parcel.area, 0)
  const totalCaoNeed = plans.reduce((sum, p) => sum + p.total_cao_need, 0)
  const totalApplications = plans.reduce((sum, p) => sum + p.applications.length, 0)
  const totalCost = plans.reduce(
    (sum, p) =>
      sum +
      p.applications.reduce(
        (appSum, app) => appSum + calculateEstimatedCost(app.product_price_per_ton, app.total_dose),
        0
      ),
    0
  )

  const statsData = [
    ['Pocet pozemku s planem', totalParcels.toString()],
    ['Celkova vymera', `${formatNumber(totalArea)} ha`],
    ['Celkova potreba CaO', `${formatNumber(totalCaoNeed)} t`],
    ['Celkovy pocet aplikaci', totalApplications.toString()],
  ]

  if (includePrice && totalCost > 0) {
    statsData.push(['Odhadovana celkova cena', formatPrice(totalCost)])
  }

  autoTable(doc, {
    startY: currentY,
    body: statsData,
    theme: 'plain',
    bodyStyles: {
      fontSize: FONTS.heading,
      textColor: COLORS.text,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 'auto', fontStyle: 'bold', textColor: COLORS.primary, fontSize: 16 },
    },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // =========================================================================
  // 3. PLANS OVERVIEW TABLE
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Seznam pozemku', margin, currentY)

  currentY += 8

  const overviewHeaders = [
    '#',
    'Pozemek',
    'Vymera\n(ha)',
    'pH',
    'Potreba CaO\n(t)',
    'Aplikaci',
  ]

  if (includePrice) {
    overviewHeaders.push('Cena\n(Kč)')
  }

    const overviewData = plans.map((plan, index) => {
    const cost = plan.applications.reduce(
      (sum, app) => sum + calculateEstimatedCost(app.product_price_per_ton, app.total_dose),
      0
    )

    const row = [
      (index + 1).toString(),
      `${plan.parcel.name}\n${plan.parcel.code}`,
      formatNumber(plan.parcel.area),
      `${formatNumber(plan.current_ph, 1)} -> ${formatNumber(plan.target_ph, 1)}`,
      formatNumber(plan.total_cao_need),
      plan.applications.length.toString(),
    ]

    if (includePrice) {
      row.push(formatPrice(cost))
    }

    return row
  })

  autoTable(doc, {
    startY: currentY,
    head: [overviewHeaders],
    body: overviewData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontSize: FONTS.body,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: FONTS.small,
      textColor: COLORS.text,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { halign: 'right', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'center', cellWidth: 20 },
      6: includePrice ? { halign: 'right', cellWidth: 25 } : {},
    },
  })

  // =========================================================================
  // 4. INDIVIDUAL PLANS (detailed)
  // =========================================================================

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]

    // Add new page for each plan
    doc.addPage()
    currentY = margin

    // Plan number and parcel name
    doc.setFontSize(FONTS.title)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.text)
    doc.text(`Plan ${i + 1}: ${plan.parcel.name}`, margin, currentY)

    currentY += 10

    // Parcel info
    const parcelData = [
      ['Nazev/Kod', `${plan.parcel.name}${plan.parcel.code ? ` (${plan.parcel.code})` : ''}`],
      ['Vymera', `${formatNumber(plan.parcel.area)} ha`],
      ['Pudni druh', getSoilTypeLabel(plan.soil_type)],
      ['Vyuziti', getLandUseLabel(plan.land_use)],
      ['Kultura', plan.parcel.culture || '-'],
    ]

    autoTable(doc, {
      startY: currentY,
      body: parcelData,
      theme: 'plain',
      bodyStyles: {
        fontSize: FONTS.body,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: COLORS.darkGray },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10

    // Liming need
    doc.setFontSize(FONTS.subheading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.text)
    doc.text('Potreba vapneni', margin, currentY)

    currentY += 6

    const needData = [
      ['Aktualni pH', formatNumber(plan.current_ph, 1)],
      ['Cilove pH', formatNumber(plan.target_ph, 1)],
      ['Rozdil pH', `+${formatNumber(plan.target_ph - plan.current_ph, 1)}`],
      ['Potreba CaO (t/ha)', formatNumber(plan.total_cao_need_per_ha)],
      ['Celkova potreba CaO (t)', formatNumber(plan.total_cao_need)],
      ['Pocet aplikaci', plan.applications.length.toString()],
    ]

    autoTable(doc, {
      startY: currentY,
      body: needData,
      theme: 'striped',
      bodyStyles: {
        fontSize: FONTS.body,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto', fontStyle: 'bold', textColor: COLORS.primary },
      },
      margin: { left: margin, right: margin },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10

    // Applications
    doc.setFontSize(FONTS.subheading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.text)
    doc.text('Casovy plan aplikaci', margin, currentY)

    currentY += 6

    const sortedApps = [...plan.applications].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      const seasonOrder = { jaro: 1, leto: 2, podzim: 3 }
      return seasonOrder[a.season] - seasonOrder[b.season]
    })

    const applicationHeaders = [
      'Rok',
      'Obdobi',
      'Produkt',
      'Davka\n(t/ha)',
      'Celkem\n(t)',
      'CaO\n(t/ha)',
      'pH\n(pred->po)',
    ]

    if (includePrice) {
      applicationHeaders.push('Cena')
    }

    const applicationData = sortedApps.map((app) => {
      const caoContent = app.cao_content || 0
      const mgoContent = app.mgo_content || 0
      const row = [
        app.year.toString(),
        getSeasonLabel(app.season),
        `${app.product_name}\n${formatNumber(caoContent, 0)}% CaO, ${formatNumber(mgoContent, 0)}% MgO`,
        formatNumber(app.dose_per_ha),
        formatNumber(app.total_dose, 1),
        formatNumber(app.cao_per_ha),
        `${formatNumber(app.ph_before, 1)} -> ${formatNumber(app.ph_after, 1)}`,
      ]

      if (includePrice) {
        const cost = calculateEstimatedCost(app.product_price_per_ton, app.total_dose)
        row.push(formatPrice(cost))
      }

      return row
    })

    autoTable(doc, {
      startY: currentY,
      head: [applicationHeaders],
      body: applicationData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: '#ffffff',
        fontSize: FONTS.small,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: FONTS.small,
        textColor: COLORS.text,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray,
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 16 },
        2: { cellWidth: 35 },
        3: { halign: 'right', cellWidth: 16 },
        4: { halign: 'right', cellWidth: 16 },
        5: { halign: 'right', cellWidth: 16 },
        6: { halign: 'center', cellWidth: 22 },
        7: includePrice ? { halign: 'right', cellWidth: 'auto' } : {},
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 5
  }

  // =========================================================================
  // 5. FOOTER ON ALL PAGES
  // =========================================================================

  addFooter(doc, pageWidth, pageHeight, margin)

  // =========================================================================
  // GENERATE BLOB
  // =========================================================================

  const blob = doc.output('blob')
  return blob
}

// ============================================================================
// HELPER FUNCTIONS - Footer
// ============================================================================

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
  const footerY = pageHeight - 25

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Separator line
    doc.setDrawColor(COLORS.darkGray)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY, pageWidth - margin, footerY)

    // Footer text
    doc.setFontSize(FONTS.small)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.darkGray)
    doc.text('Vygenerovano portalem Demon Agro', pageWidth / 2, footerY + 5, {
      align: 'center',
    })

    doc.setFontSize(FONTS.small - 1)
    doc.text('base@demonagro.cz | +420 731 734 907', pageWidth / 2, footerY + 9, {
      align: 'center',
    })

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(FONTS.small - 1)
    doc.text(
      'Disclaimer: Tento plan ma orientacni charakter. Konecne davky konzultujte s odborni',
      pageWidth / 2,
      footerY + 13,
      { align: 'center' }
    )

    // Page numbers
    doc.setFontSize(FONTS.small - 1)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.darkGray)
    doc.text(`Strana ${i} z ${pageCount}`, pageWidth - margin, pageHeight - 10, {
      align: 'right',
    })
  }
}

// ============================================================================
// DOWNLOAD FUNCTIONS
// ============================================================================

/**
 * Download PDF file with a given filename
 */
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

/**
 * Generate filename for single plan PDF
 */
export function generateLimingPlanFilename(parcelName: string): string {
  const date = new Date().toISOString().split('T')[0]
  const safeName = parcelName.replace(/[^a-zA-Z0-9]/g, '_')
  return `Plan_vapneni_${safeName}_${date}.pdf`
}

/**
 * Generate filename for multiple plans PDF
 */
export function generateMultipleLimingPlansFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `Plany_vapneni_${date}.pdf`
}
