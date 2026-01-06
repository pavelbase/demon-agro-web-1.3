/**
 * PROFESSIONAL LIMING PLAN PDF GENERATOR - REWRITTEN
 * Hard-coded layout with text sanitization fallback
 * 
 * Changes:
 * - removeAccents() function to prevent corrupted text
 * - Forced visual layout with doc.rect() for green cards
 * - Exact coordinate positioning
 * - No dependency on custom fonts
 * - Company logo integration with fallback
 * - Yearly summary table
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
}

interface YearlySummary {
  year: number
  totalTons: number
  totalCost: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOGO_URL = '/logo.png'

// ============================================================================
// TEXT SANITIZATION - THE FAILSAFE
// ============================================================================

/**
 * Remove Czech accents to prevent corrupted output when custom font fails
 * "Střední" -> "Stredni"
 * "neurčena" -> "neurcena"
 */
function removeAccents(str: string): string {
  const accentsMap: Record<string, string> = {
    'á': 'a', 'Á': 'A',
    'č': 'c', 'Č': 'C',
    'ď': 'd', 'Ď': 'D',
    'é': 'e', 'É': 'E',
    'ě': 'e', 'Ě': 'E',
    'í': 'i', 'Í': 'I',
    'ň': 'n', 'Ň': 'N',
    'ó': 'o', 'Ó': 'O',
    'ř': 'r', 'Ř': 'R',
    'š': 's', 'Š': 'S',
    'ť': 't', 'Ť': 'T',
    'ú': 'u', 'Ú': 'U',
    'ů': 'u', 'Ů': 'U',
    'ý': 'y', 'Ý': 'Y',
    'ž': 'z', 'Ž': 'Z',
  }
  
  return str.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮŮÝŽ]/g, (char) => accentsMap[char] || char)
}

// ============================================================================
// IMAGE HELPER
// ============================================================================

/**
 * Load image and convert to Base64
 * Returns null if loading fails
 */
async function getImageBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn('Failed to load logo:', error)
    return null
  }
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

function formatPrice(amount: number): string {
  if (amount === 0) return 'na dotaz'
  return new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' Kc'
}

function calculateEstimatedCost(pricePerTon: number | null, totalDose: number): number {
  if (!pricePerTon || pricePerTon === 0) return 0
  return pricePerTon * totalDose
}

function getSoilTypeLabel(soilType: string): string {
  const labels: Record<string, string> = {
    L: 'Lehka',
    S: 'Stredni',
    T: 'Tezka',
  }
  return labels[soilType] || soilType
}

function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    jaro: 'Jaro',
    leto: 'Leto',
    podzim: 'Podzim',
  }
  return labels[season] || season
}

// ============================================================================
// YEARLY SUMMARY CALCULATION
// ============================================================================

function calculateYearlySummary(plans: LimingPlan[]): YearlySummary[] {
  const summaryMap = new Map<number, YearlySummary>()
  
  plans.forEach(plan => {
    plan.applications.forEach(app => {
      const year = app.year
      const tons = app.total_dose
      const cost = calculateEstimatedCost(app.product_price_per_ton, app.total_dose)
      
      if (!summaryMap.has(year)) {
        summaryMap.set(year, { year, totalTons: 0, totalCost: 0 })
      }
      
      const summary = summaryMap.get(year)!
      summary.totalTons += tons
      summary.totalCost += cost
    })
  })
  
  // Sort by year
  return Array.from(summaryMap.values()).sort((a, b) => a.year - b.year)
}

// ============================================================================
// MAIN EXPORT FUNCTION - FORCED VISUAL LAYOUT
// ============================================================================

export async function exportMultipleLimingPlansPDF(
  plans: LimingPlan[],
  userInfo?: { name?: string; company?: string },
  options: PDFExportOptions = {}
): Promise<Blob> {
  const { includePrice = true } = options

  // Try to load logo
  const logoBase64 = await getImageBase64(LOGO_URL)

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Use standard Helvetica
  doc.setFont('helvetica', 'normal')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  let yPos = margin

  // =========================================================================
  // HEADER FUNCTION (for all pages)
  // =========================================================================

  function addHeader(isFirstPage: boolean = false) {
    // Logo/Brand - DISPLAY ON ALL PAGES
    if (logoBase64) {
      // Add logo image (30mm width, 15mm height - adjust as needed)
      try {
        doc.addImage(logoBase64, 'PNG', margin, margin, 30, 15)
      } catch (error) {
        // Fallback to text if image fails
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(46, 125, 50)
        doc.text('DEMON AGRO', margin, margin + 5)
      }
    } else {
      // Text fallback if logo not loaded
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(46, 125, 50)
      doc.text('DEMON AGRO', margin, margin + 5)
    }

    // Farm Info (Right)
    const rightX = pageWidth - margin
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(117, 117, 117) // Dark gray
    
    if (userInfo?.company) {
      doc.text(removeAccents(userInfo.company), rightX, margin + 3, { align: 'right' })
    }
    doc.text(`Datum: ${formatCzechDate(new Date())}`, rightX, margin + 8, { align: 'right' })
    
    const totalArea = plans.reduce((sum, p) => sum + p.parcel.area, 0)
    doc.text(`Celkova vymera: ${formatNumber(totalArea)} ha`, rightX, margin + 13, { align: 'right' })

    // Green Divider Line (1pt thickness)
    const dividerY = logoBase64 ? margin + 18 : margin + 18
    doc.setDrawColor(46, 125, 50)
    doc.setLineWidth(1)
    doc.line(margin, dividerY, pageWidth - margin, dividerY)

    return dividerY + 8
  }

  // Add header to first page
  yPos = addHeader(true)

  // =========================================================================
  // YEARLY SUMMARY TABLE (Page 1)
  // =========================================================================

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('SOUHRN DLE LET', margin, yPos)

  yPos += 6

  const yearlySummary = calculateYearlySummary(plans)

  if (yearlySummary.length > 0) {
    const summaryHeaders = ['Rok', 'Aplikace celkem (t)']
    if (includePrice) {
      summaryHeaders.push('Cena celkem')
    }

    const summaryData = yearlySummary.map(item => {
      const row = [
        item.year.toString(),
        formatNumber(item.totalTons, 1),
      ]
      if (includePrice) {
        row.push(formatPrice(item.totalCost))
      }
      return row
    })

    autoTable(doc, {
      startY: yPos,
      head: [summaryHeaders],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [46, 125, 50], // Green
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [33, 33, 33],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: includePrice ? { cellWidth: 'auto', fontStyle: 'bold' } : {},
      },
      margin: { left: margin, right: margin },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // =========================================================================
  // EXECUTIVE SUMMARY BOX
  // =========================================================================

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('SOHRNNE UDAJE', margin, yPos)

  yPos += 8

  const totalCaoNeed = plans.reduce((sum, p) => sum + p.total_cao_need, 0)
  const totalLimeTons = plans.reduce((sum, p) =>
    sum + p.applications.reduce((appSum, app) => appSum + app.total_dose, 0), 0
  )
  const totalCost = plans.reduce((sum, p) =>
    sum + p.applications.reduce((appSum, app) =>
      appSum + calculateEstimatedCost(app.product_price_per_ton, app.total_dose), 0
    ), 0
  )

  // Summary Box with Border
  const summaryBoxX = margin
  const summaryBoxY = yPos
  const summaryBoxWidth = pageWidth - 2 * margin
  const summaryBoxHeight = 28

  doc.setDrawColor(189, 189, 189)
  doc.setLineWidth(0.5)
  doc.rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight)

  // Summary content - Line 1
  yPos += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text(`Celkem CaO: ${formatNumber(totalCaoNeed)} t`, margin + 5, yPos)

  // Summary content - Line 2
  yPos += 6
  doc.text(`Aplikacem celkem: ${formatNumber(totalLimeTons)} t vapence`, margin + 5, yPos)

  // Price (right side)
  if (includePrice && totalCost > 0) {
    doc.text(`Celkova cena: ${formatPrice(totalCost)}`, pageWidth - margin - 5, yPos - 3, { 
      align: 'right' 
    })
  }

  yPos = summaryBoxY + summaryBoxHeight + 4

  // PRICE DISCLAIMER
  if (includePrice) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(117, 117, 117)
    doc.text('* Cena je odhadovana bez DPH, dopravy a aplikace', margin, yPos)
    yPos += 8
  } else {
    yPos += 4
  }

  // =========================================================================
  // FIELD CARDS - FORCED VISUAL LAYOUT
  // =========================================================================

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    
    // A. CHECK FOR PAGE BREAK
    const spaceNeeded = 90 // Increased from 70 to accommodate more rows
    if (yPos > pageHeight - spaceNeeded) {
      doc.addPage()
      yPos = addHeader(false)
    }

    // Sort applications
    const sortedApps = [...plan.applications].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      const seasonOrder = { jaro: 1, leto: 2, podzim: 3 }
      return seasonOrder[a.season] - seasonOrder[b.season]
    })

    // =====================================================================
    // B. DRAW GREEN HEADER CARD (FORCED VISUAL)
    // =====================================================================
    
    const headerHeight = 10
    const headerX = margin
    const headerWidth = pageWidth - 2 * margin
    
    // Green filled rectangle
    doc.setFillColor(46, 125, 50) // #2E7D32 Primary Green
    doc.rect(headerX, yPos, headerWidth, headerHeight, 'F')

    // C. WHITE TEXT INSIDE HEADER
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255) // White
    
    const headerText = `Pozemek: ${removeAccents(plan.parcel.name)} | ${plan.parcel.code} | ${formatNumber(plan.parcel.area)} ha`
    doc.text(headerText, headerX + 3, yPos + 7)

    yPos += headerHeight + 6

    // =====================================================================
    // D. INFO ROW (pH Visualizer)
    // =====================================================================
    
    const phStartVal = plan.current_ph
    const phTargetVal = plan.target_ph
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // pH text with conditional coloring
    if (phStartVal < 5.0) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(211, 47, 47) // Alert Red #D32F2F
    } else {
      doc.setTextColor(33, 33, 33) // Text dark
    }
    
    const phText = `pH: ${formatNumber(phStartVal, 1)} -> ${formatNumber(phTargetVal, 1)}`
    doc.text(phText, headerX + 3, yPos)
    
    // Additional info (right side)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(117, 117, 117) // Dark gray
    doc.setFontSize(9)
    const infoText = `Puda: ${getSoilTypeLabel(plan.soil_type)} | Potreba: ${formatNumber(plan.total_cao_need)} t CaO`
    doc.text(infoText, headerX + 65, yPos)

    yPos += 6

    // =====================================================================
    // D2. PLAN SUMMARY INFO (Max dose, Interval, Applications count)
    // =====================================================================
    
    const maxDoseLabel = plan.soil_type === 'L' ? '1.0-1.5 t/ha' : 
                         plan.soil_type === 'S' ? '2.0-3.0 t/ha' : '3.0-3.5 t/ha'
    
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    const planInfoText = `Max. davka: ${maxDoseLabel} | Interval: 3 roky | Aplikace: ${sortedApps.length}x`
    doc.text(planInfoText, headerX + 3, yPos)

    yPos += 8

    // =====================================================================
    // E. THE TABLE (Application Schedule) - WITH ACIDIFICATION ROWS
    // =====================================================================

    const tableHeaders = ['Rok', 'Produkt', 'Davka (t/ha)', 'Celkem (t)', 'pH', 'Doporuceni']
    if (includePrice) {
      tableHeaders.push('Cena')
    }

    // Generate table data with acidification rows between applications
    const tableData: any[] = []
    
    // Annual pH drop rates by soil type
    const ANNUAL_PH_DROP: Record<string, number> = {
      'L': 0.09,
      'S': 0.07,
      'T': 0.04
    }
    
    const phDropPerYear = ANNUAL_PH_DROP[plan.soil_type] || 0.07

    for (let idx = 0; idx < sortedApps.length; idx++) {
      const app = sortedApps[idx]
      const previousApp = idx > 0 ? sortedApps[idx - 1] : null
      const yearsGap = previousApp ? app.year - previousApp.year : 0
      
      // Add acidification rows between applications
      if (idx > 0 && yearsGap > 1) {
        for (let i = 1; i < yearsGap; i++) {
          const yearNumber = previousApp!.year + i
          const phStart = previousApp!.ph_after - (phDropPerYear * (i - 1))
          const phEnd = previousApp!.ph_after - (phDropPerYear * i)
          
          const acidRow = [
            yearNumber.toString(),
            `Prirozena acidifikace pudy (${getSoilTypeLabel(plan.soil_type)})`,
            '-',
            '-',
            `${formatNumber(phStart, 2)} -> ${formatNumber(phEnd, 2)} (${formatNumber(phStart - phEnd, 2)})`,
            '-'
          ]
          
          if (includePrice) {
            acidRow.push('-')
          }
          
          tableData.push(acidRow)
        }
      }
      
      // Add application row
      const caoContent = app.cao_content || 0
      const mgoContent = app.mgo_content || 0
      const productText = `${removeAccents(app.product_name)}\n${formatNumber(caoContent, 0)}% CaO, ${formatNumber(mgoContent, 0)}% MgO`
      const phText = `${formatNumber(app.ph_before, 1)} -> ${formatNumber(app.ph_after, 1)}`
      const noteText = removeAccents(app.notes || '')
      
      const row = [
        app.year.toString(),
        productText,
        formatNumber(app.dose_per_ha, 2),
        formatNumber(app.total_dose, 1),
        phText,
        noteText
      ]

      if (includePrice) {
        const cost = calculateEstimatedCost(app.product_price_per_ton, app.total_dose)
        row.push(formatPrice(cost))
      }

      tableData.push(row)
    }
    
    // Add future projection rows (3 years after last application)
    if (sortedApps.length > 0) {
      const lastApp = sortedApps[sortedApps.length - 1]
      const projectionYears = 3
      
      for (let i = 1; i <= projectionYears; i++) {
        const yearNumber = lastApp.year + i
        const phStart = lastApp.ph_after - (phDropPerYear * (i - 1))
        const phEnd = lastApp.ph_after - (phDropPerYear * i)
        
        const projectionRow = [
          yearNumber.toString(),
          `Prirozena acidifikace pudy (${getSoilTypeLabel(plan.soil_type)}) - projekce`,
          '-',
          '-',
          `${formatNumber(phStart, 2)} -> ${formatNumber(phEnd, 2)} (${formatNumber(phStart - phEnd, 2)})`,
          '-'
        ]
        
        if (includePrice) {
          projectionRow.push('-')
        }
        
        tableData.push(projectionRow)
      }
    }

    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: [255, 255, 255], // White background - Minimalist
        textColor: [46, 125, 50], // Green text
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: 1.5, bottom: 1.5, left: 1, right: 1 },
        lineWidth: 0.1,
        lineColor: [189, 189, 189],
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [33, 33, 33], // Text dark
        cellPadding: { top: 1.5, bottom: 1.5, left: 1, right: 1 },
        lineColor: [245, 245, 245], // Light gray
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { halign: 'right', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 25 },
        5: { cellWidth: 30 },
        6: includePrice ? { 
          halign: 'right', 
          cellWidth: 'auto', 
          fontStyle: 'bold',
          textColor: [46, 125, 50], // Green for price
        } : {},
      },
      didParseCell: function(data) {
        // Style acidification rows with orange background
        const cellText = data.cell.text.join(' ')
        if (cellText.includes('Prirozena acidifikace')) {
          data.cell.styles.fillColor = [255, 245, 230] // Light orange
          data.cell.styles.textColor = [200, 100, 0] // Orange text
          data.cell.styles.fontStyle = 'italic'
        }
      },
      margin: { left: margin, right: margin },
    })

    // Update yPos after table
    yPos = (doc as any).lastAutoTable.finalY + 10

    // Add spacing between field cards
    yPos += 5
  }

  // =========================================================================
  // FOOTER (ALL PAGES)
  // =========================================================================

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    const footerY = pageHeight - 10
    
    // Divider line
    doc.setDrawColor(189, 189, 189)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)
    
    // Footer text
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(117, 117, 117)
    
    doc.text(
      'Vygenerovano portalem Demon Agro | www.demonagro.cz',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    )
    
    doc.text(
      `Strana ${i} z ${pageCount}`,
      pageWidth - margin,
      footerY,
      { align: 'right' }
    )
  }

  const blob = doc.output('blob')
  return blob
}

// ============================================================================
// SINGLE PLAN EXPORT
// ============================================================================

export async function exportLimingPlanPDF(
  plan: LimingPlan,
  options: PDFExportOptions = {}
): Promise<Blob> {
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
