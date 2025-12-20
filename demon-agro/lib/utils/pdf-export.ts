// PDF Export utility for Fertilization Plans
// Uses jsPDF + jspdf-autotable for professional PDF generation

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { 
  Parcel, 
  SoilAnalysis,
  PhCategory,
  NutrientCategory,
} from '@/lib/types/database'
import type { FertilizationPlan, Warning } from './fertilization-plan'

// ============================================================================
// TYPES
// ============================================================================

interface PDFExportOptions {
  includeChart?: boolean
  language?: 'cs' | 'en'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#4A7C59', // Demon Agro green
  secondary: '#5C4033', // Brown
  lightGray: '#F5F5F5',
  darkGray: '#666666',
  text: '#333333',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
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

/**
 * Get Czech label for pH category
 */
function getPhCategoryLabel(category: PhCategory | null | undefined): string {
  if (!category) return '-'
  const labels: Record<PhCategory, string> = {
    EK: 'Extrémně kyselý',
    SK: 'Silně kyselý',
    N: 'Neutrální',
    SZ: 'Slabě zásaditý',
    EZ: 'Extrémně zásaditý',
  }
  return labels[category] || category
}

/**
 * Get Czech label for nutrient category
 */
function getNutrientCategoryLabel(category: NutrientCategory | null | undefined): string {
  if (!category) return '-'
  const labels: Record<NutrientCategory, string> = {
    N: 'Nízký',
    VH: 'Velmi hluboko',
    D: 'Dobrý',
    V: 'Vysoký',
    VV: 'Velmi vysoký',
  }
  return labels[category] || category
}

/**
 * Get color for category severity
 */
function getCategoryColor(category: string): string {
  if (category.includes('Nízký') || category.includes('Velmi hluboko')) return COLORS.error
  if (category.includes('Vysoký') || category.includes('Velmi vysoký')) return COLORS.warning
  return COLORS.success
}

/**
 * Get severity icon
 */
function getSeverityIcon(severity: 'info' | 'warning' | 'error'): string {
  const icons = {
    info: 'ℹ',
    warning: '⚠',
    error: '✖',
  }
  return icons[severity] || '•'
}

/**
 * Format date in Czech format
 */
function formatCzechDate(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Format number with Czech locale
 */
function formatNumber(num: number, decimals: number = 1): string {
  return num.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Get soil type label
 */
function getSoilTypeLabel(soilType: string): string {
  const labels: Record<string, string> = {
    L: 'Lehká',
    S: 'Střední',
    T: 'Těžká',
  }
  return labels[soilType] || soilType
}

/**
 * Get culture label
 */
function getCultureLabel(culture: string): string {
  const labels: Record<string, string> = {
    orna: 'Orná půda',
    ttp: 'Travní trvalý porost',
  }
  return labels[culture] || culture
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

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export Fertilization Plan to PDF
 * 
 * @param plan - The fertilization plan
 * @param parcel - The parcel information
 * @param analysis - The soil analysis
 * @param options - Export options
 * @returns PDF Blob for download
 */
export async function exportFertilizationPlanPDF(
  plan: FertilizationPlan,
  parcel: Parcel,
  analysis: SoilAnalysis,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { includeChart = true, language = 'cs' } = options

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

  // Logo placeholder (would be replaced with actual logo)
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
  doc.text('Plán hnojení', pageWidth / 2, currentY + 10, { align: 'center' })

  // Generation date
  doc.setFontSize(FONTS.small)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.darkGray)
  doc.text(
    `Vygenerováno: ${formatCzechDate(new Date())}`,
    pageWidth - margin,
    currentY + 5,
    { align: 'right' }
  )

  currentY += 25

  // =========================================================================
  // 2. PARCEL INFORMATION
  // =========================================================================

  doc.setFillColor(COLORS.lightGray)
  doc.rect(margin, currentY, pageWidth - 2 * margin, 35, 'F')

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('Informace o pozemku', margin + 5, currentY + 7)

  currentY += 12

  doc.setFontSize(FONTS.body)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.text)

  const parcelInfo = [
    ['Název/Kód:', `${parcel.name}${parcel.code ? ` (${parcel.code})` : ''}`],
    ['Výměra:', `${formatNumber(parcel.area, 2)} ha`],
    ['Půdní druh:', getSoilTypeLabel(parcel.soil_type)],
    ['Kultura:', getCultureLabel(parcel.culture)],
    ['Cílový rok:', plan.target_year],
  ]

  parcelInfo.forEach(([label, value], index) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin + 5, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 40, currentY)
    currentY += 5
  })

  currentY += 10

  // =========================================================================
  // 3. CURRENT SOIL STATE (TABLE)
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('Aktuální stav půdy', margin, currentY)

  currentY += 2

  const soilStateData = [
    [
      'pH',
      analysis.ph?.toFixed(2) || '-',
      getPhCategoryLabel(analysis.ph_category),
    ],
    [
      'Fosfor (P)',
      analysis.phosphorus ? `${analysis.phosphorus} mg/kg` : '-',
      getNutrientCategoryLabel(analysis.phosphorus_category),
    ],
    [
      'Draslík (K)',
      analysis.potassium ? `${analysis.potassium} mg/kg` : '-',
      getNutrientCategoryLabel(analysis.potassium_category),
    ],
    [
      'Hořčík (Mg)',
      analysis.magnesium ? `${analysis.magnesium} mg/kg` : '-',
      getNutrientCategoryLabel(analysis.magnesium_category),
    ],
    [
      'Vápník (Ca)',
      analysis.calcium ? `${analysis.calcium} mg/kg` : '-',
      getNutrientCategoryLabel(analysis.calcium_category),
    ],
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Parametr', 'Hodnota', 'Kategorie']],
    body: soilStateData,
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
    didParseCell: function (data) {
      // Color code the categories
      if (data.column.index === 2 && data.section === 'body') {
        const category = data.cell.text[0]
        if (category && category !== '-') {
          const color = getCategoryColor(category)
          data.cell.styles.textColor = color
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // Additional soil info
  if (analysis.lab_name || analysis.analysis_date) {
    doc.setFontSize(FONTS.small)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(COLORS.darkGray)
    const infoText = `Rozbor: ${analysis.lab_name || 'N/A'} | Datum: ${
      analysis.analysis_date
        ? new Date(analysis.analysis_date).toLocaleDateString('cs-CZ')
        : 'N/A'
    }`
    doc.text(infoText, margin, currentY)
    currentY += 8
  }

  // =========================================================================
  // 4. LIMING RECOMMENDATION
  // =========================================================================

  if (plan.recommended_lime_kg_ha > 0) {
    doc.setFontSize(FONTS.heading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('Doporučení vápnění', margin, currentY)

    currentY += 7

    doc.setFillColor(255, 250, 240) // Light orange background
    doc.rect(margin, currentY, pageWidth - 2 * margin, 25, 'F')

    currentY += 5

    doc.setFontSize(FONTS.body)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const limingInfo = [
      [
        'Potřeba CaO:',
        `${formatNumber(plan.recommended_lime_kg_ha / 1000, 2)} t/ha (${formatNumber(
          (plan.recommended_lime_kg_ha / 1000) * parcel.area,
          2
        )} t celkem)`,
      ],
      ['Typ vápence:', getLimeTypeLabel(plan.recommended_lime_type)],
    ]

    limingInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, margin + 5, currentY)
      doc.setFont('helvetica', 'normal')
      doc.text(value, margin + 40, currentY)
      currentY += 5
    })

    if (plan.lime_reasoning) {
      currentY += 2
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(FONTS.small)
      doc.setTextColor(COLORS.darkGray)
      const lines = doc.splitTextToSize(
        `Důvod: ${plan.lime_reasoning}`,
        pageWidth - 2 * margin - 10
      )
      doc.text(lines, margin + 5, currentY)
      currentY += lines.length * 4
    }

    currentY += 8
  }

  // =========================================================================
  // 5. NUTRIENT RECOMMENDATIONS (TABLE)
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('Doporučené dávky živin', margin, currentY)

  currentY += 2

  const nutrientData = [
    [
      'Fosfor (P₂O₅)',
      `${formatNumber(plan.recommended_nutrients.p2o5, 0)} kg/ha`,
      `${formatNumber(plan.recommended_nutrients.p2o5 * parcel.area, 0)} kg celkem`,
    ],
    [
      'Draslík (K₂O)',
      `${formatNumber(plan.recommended_nutrients.k2o, 0)} kg/ha`,
      `${formatNumber(plan.recommended_nutrients.k2o * parcel.area, 0)} kg celkem`,
    ],
    [
      'Hořčík (MgO)',
      `${formatNumber(plan.recommended_nutrients.mgo, 0)} kg/ha`,
      `${formatNumber(plan.recommended_nutrients.mgo * parcel.area, 0)} kg celkem`,
    ],
    [
      'Síra (S)',
      `${formatNumber(plan.recommended_nutrients.s, 0)} kg/ha`,
      `${formatNumber(plan.recommended_nutrients.s * parcel.area, 0)} kg celkem`,
    ],
  ]

  autoTable(doc, {
    startY: currentY,
    head: [['Živina', 'Na hektar', 'Celkem na pozemek']],
    body: nutrientData,
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
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // K:Mg ratio info
  if (plan.km_ratio) {
    doc.setFontSize(FONTS.small)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.darkGray)
    const ratioText = `K:Mg poměr: ${formatNumber(plan.km_ratio, 2)}${
      plan.km_ratio_corrected ? ' (korigováno)' : ''
    }`
    doc.text(ratioText, margin, currentY)
    currentY += 8
  }

  // Check if we need a new page for warnings
  if (currentY > pageHeight - 80 && plan.warnings.length > 0) {
    doc.addPage()
    currentY = margin
  }

  // =========================================================================
  // 6. WARNINGS
  // =========================================================================

  if (plan.warnings.length > 0) {
    doc.setFontSize(FONTS.heading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('Upozornění a doporučení', margin, currentY)

    currentY += 7

    plan.warnings.forEach((warning: Warning, index: number) => {
      // Check if we need a new page
      if (currentY > pageHeight - 40) {
        doc.addPage()
        currentY = margin
      }

      // Background color based on severity
      let bgColor: string
      let textColor: string
      switch (warning.severity) {
        case 'error':
          bgColor = '#FEE2E2'
          textColor = COLORS.error
          break
        case 'warning':
          bgColor = '#FEF3C7'
          textColor = COLORS.warning
          break
        default:
          bgColor = '#DBEAFE'
          textColor = '#3B82F6'
      }

      const warningHeight = 15 + (warning.recommendation ? 5 : 0)
      doc.setFillColor(bgColor)
      doc.rect(margin, currentY, pageWidth - 2 * margin, warningHeight, 'F')

      currentY += 5

      // Icon
      doc.setFontSize(FONTS.body)
      doc.setTextColor(textColor)
      doc.text(getSeverityIcon(warning.severity), margin + 3, currentY)

      // Message
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(FONTS.body)
      const messageLines = doc.splitTextToSize(warning.message, pageWidth - 2 * margin - 15)
      doc.text(messageLines, margin + 10, currentY)
      currentY += messageLines.length * 4

      // Recommendation (if exists)
      if (warning.recommendation) {
        currentY += 1
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(FONTS.small)
        doc.setTextColor(COLORS.darkGray)
        const recLines = doc.splitTextToSize(
          `→ ${warning.recommendation}`,
          pageWidth - 2 * margin - 15
        )
        doc.text(recLines, margin + 10, currentY)
        currentY += recLines.length * 3.5
      }

      currentY += 5
    })

    currentY += 5
  }

  // =========================================================================
  // 7. PREDICTIONS (ADVANCED PLAN)
  // =========================================================================

  if (plan.plan_type === 'advanced' && plan.predictions) {
    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      doc.addPage()
      currentY = margin
    }

    doc.setFontSize(FONTS.heading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('4letá predikce (Pokročilý plán)', margin, currentY)

    currentY += 2

    // Create table with predictions
    const predictionData = plan.predictions.years.map((year, index) => [
      year,
      formatNumber(plan.predictions!.ph[index], 2),
      `${formatNumber(plan.predictions!.p[index], 0)} mg/kg`,
      `${formatNumber(plan.predictions!.k[index], 0)} mg/kg`,
      `${formatNumber(plan.predictions!.mg[index], 0)} mg/kg`,
      `${formatNumber(plan.predictions!.s[index], 0)} mg/kg`,
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Rok', 'pH', 'P', 'K', 'Mg', 'S']],
      body: predictionData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: '#ffffff',
        fontSize: FONTS.small,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: FONTS.small,
        textColor: COLORS.text,
      },
      margin: { left: margin, right: margin },
    })

    currentY = (doc as any).lastAutoTable.finalY + 8

    doc.setFontSize(FONTS.small)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(COLORS.darkGray)
    doc.text(
      'Poznámka: Predikce jsou orientační a předpokládají pravidelné hnojení.',
      margin,
      currentY
    )

    currentY += 8
  }

  // =========================================================================
  // 8. FOOTER (on last page)
  // =========================================================================

  // Go to bottom of page
  const footerY = pageHeight - 25

  // Separator line
  doc.setDrawColor(COLORS.darkGray)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY, pageWidth - margin, footerY)

  // Footer text
  doc.setFontSize(FONTS.small)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.darkGray)
  doc.text('Vygenerováno portálem Démon Agro', pageWidth / 2, footerY + 5, {
    align: 'center',
  })

  doc.setFontSize(FONTS.small - 1)
  doc.text('📧 base@demonagro.cz | 📞 +420 731 734 907', pageWidth / 2, footerY + 9, {
    align: 'center',
  })

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(FONTS.small - 1)
  doc.text(
    'Disclaimer: Tento plán má orientační charakter. Konečné dávky konzultujte s odborníkem.',
    pageWidth / 2,
    footerY + 13,
    { align: 'center' }
  )

  // Page numbers on all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(FONTS.small - 1)
    doc.setTextColor(COLORS.darkGray)
    doc.text(
      `Strana ${i} z ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    )
  }

  // =========================================================================
  // GENERATE BLOB
  // =========================================================================

  const blob = doc.output('blob')
  return blob
}

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
 * Generate filename for fertilization plan PDF
 */
export function generatePlanFilename(parcel: Parcel, targetYear: string): string {
  const safeName = parcel.name.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  return `Plan_hnojeni_${safeName}_${targetYear}_${date}.pdf`
}
