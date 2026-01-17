/**
 * PROFESSIONAL PDF EXPORT FOR LIMING RECOMMENDATIONS - V2
 * ========================================================
 * 
 * CRITICAL FIXES:
 * 1. ✅ Custom font with Czech character support (Roboto)
 * 2. ✅ Correct terminology with diacritics
 * 3. ✅ Professional layout and design
 * 4. ✅ Intelligent recommendations based on data
 * 5. ✅ Color-coded warnings and alerts
 * 
 * @version 2.0
 * @date 2026-01-04
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SoilType } from '@/lib/types/database'
import { categorizeNutrient, type NutrientCategory } from '@/lib/utils/soil-categories'

// ============================================================================
// ROBOTO FONT BASE64 (SUBSET WITH CZECH CHARACTERS)
// ============================================================================
// This is a compressed subset of Roboto-Regular that includes:
// - Basic Latin (A-Z, a-z, 0-9)
// - Latin Extended-A (ěščřžýáíéúůďťň)
// - Common punctuation and symbols
//
// Full Roboto font would be too large for inline inclusion.
// For production, consider loading from CDN or external file.

const ROBOTO_FONT_BASE64 = `
// NOTE: Due to size constraints, this is a placeholder.
// In production, you MUST add the actual Roboto-Regular.ttf as base64
// or load it from a URL. See implementation below.
`

// ============================================================================
// TYPES
// ============================================================================

export interface LimingTableRow {
  kultura: string
  pozemek: string
  kodPozemku?: string
  vymera: string
  druh: string // 'L' | 'S' | 'T' | 'Lehká' | 'Střední' | 'Těžká'
  rokRozboru: string
  ph: string
  ca: string
  mg: string
  k: string
  p: string
  s: string
  kMgRatio: string
  potrebaCaoTHa: string
  potrebaCaoCelkem: string
  stav?: string
}

export interface LimingPDFData {
  companyName: string
  totalParcels: number
  totalArea: number
  averagePh: number
  totalCaoNeed: number
  parcelsToLime: number
  parcelsOk: number
  rows: LimingTableRow[]
}

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  // Primary brand colors
  primary: '#2E7D32',      // Professional dark green
  primaryLight: '#4CAF50', // Light green for accents
  primaryDark: '#1B5E20',  // Very dark green for text
  
  // Secondary colors
  secondary: '#5C4033',    // Brown for earth tones
  
  // Status colors
  success: '#10B981',      // Green - pH OK
  warning: '#F59E0B',      // Orange - pH low
  error: '#EF4444',        // Red - pH critical
  info: '#3B82F6',         // Blue - information
  
  // UI colors
  background: '#F5F5F5',   // Light gray background
  lightGray: '#F5F5F5',    // Alternate row color
  darkGray: '#666666',     // Secondary text
  text: '#333333',         // Main text color
  white: '#FFFFFF',
  border: '#E0E0E0',       // Table borders
}

const FONTS = {
  title: 18,
  heading: 14,
  subheading: 11,
  body: 9,
  small: 7.5,
  tiny: 6.5,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Převod kategorie živiny na RGB barvu pro PDF
 * DŮLEŽITÉ: Musí odpovídat barvám v portálu (TabulkovyPrehledVapneni.tsx)
 */
function getNutrientColorRGB(category: NutrientCategory | null): [number, number, number] {
  if (!category) return [107, 114, 128] // Gray-600
  
  switch (category) {
    case 'nizky':
      return [239, 68, 68] // Red-500 - Nízký
    case 'vyhovujici':
      return [249, 115, 22] // Orange-500 - Vyhovující
    case 'dobry':
      return [34, 197, 94] // Green-500 - Dobrý
    case 'vysoky':
      return [59, 130, 246] // Blue-500 - Vysoký
    case 'velmi_vysoky':
      return [168, 85, 247] // Purple-500 - Velmi vysoký
    default:
      return [107, 114, 128] // Gray-600
  }
}

/**
 * Převod řetězce půdního typu na SoilType enum
 * 'Lehká' | 'Střední' | 'Těžká' -> 'L' | 'S' | 'T'
 */
function parseSoilType(soilTypeStr: string): SoilType {
  const normalized = soilTypeStr.toLowerCase()
  if (normalized.includes('lehk')) return 'L'
  if (normalized.includes('střed') || normalized.includes('stred')) return 'S'
  if (normalized.includes('těž') || normalized.includes('tez')) return 'T'
  // If already in short format
  if (soilTypeStr === 'L' || soilTypeStr === 'S' || soilTypeStr === 'T') {
    return soilTypeStr as SoilType
  }
  return 'S' // Default to střední
}

/**
 * Remove Czech accents as FALLBACK when font loading fails
 * "Střední" -> "Stredni"
 * "doporučení" -> "doporuceni"
 */
function removeAccents(str: string | undefined | null): string {
  // Handle null/undefined
  if (!str) return ''
  
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
  
  return str.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, (char) => accentsMap[char] || char)
}

/**
 * Format date in Czech format WITH diacritics
 */
function formatCzechDate(date: Date): string {
  const day = date.getDate()
  const monthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day}. ${month} ${year}`
}

/**
 * Format number with Czech locale (comma as decimal separator)
 */
function formatNumber(num: number, decimals: number = 1): string {
  if (num === null || num === undefined || isNaN(num)) return '-'
  return num.toFixed(decimals).replace('.', ',')
}

/**
 * Get soil type label in Czech WITH diacritics
 */
function getSoilTypeLabel(soilType: string): string {
  const labels: Record<string, string> = {
    'L': 'Lehká',
    'S': 'Střední',
    'T': 'Těžká',
    'lehká': 'Lehká',
    'střední': 'Střední',
    'těžká': 'Těžká',
  }
  return labels[soilType] || soilType
}

/**
 * Analyze data and generate intelligent recommendations
 * Note: These recommendations will be sanitized by sanitizeText() when rendered
 */
function generateRecommendations(data: LimingPDFData): {
  overallAssessment: string
  limingStrategy: string
  priorityActions: string[]
  warnings: string[]
} {
  const recommendations = {
    overallAssessment: '',
    limingStrategy: '',
    priorityActions: [] as string[],
    warnings: [] as string[],
  }

  // Analyze average pH
  const avgPh = data.averagePh
  if (avgPh < 5.0) {
    recommendations.overallAssessment = 
      `Podnik má silně kyselou půdní reakci (průměrné pH ${formatNumber(avgPh, 1)}). ` +
      `Je nutné provést intenzivní vápnění na většině pozemků.`
  } else if (avgPh < 5.5) {
    recommendations.overallAssessment = 
      `Podnik má mírně kyselou půdní reakci (průměrné pH ${formatNumber(avgPh, 1)}). ` +
      `Doporučujeme postupné vápnění k optimalizaci pH.`
  } else if (avgPh < 6.5) {
    recommendations.overallAssessment = 
      `Podnik má přijatelnou půdní reakci (průměrné pH ${formatNumber(avgPh, 1)}). ` +
      `Většina pozemků je v dobrém stavu, doporučujeme udržovací vápnění.`
  } else {
    recommendations.overallAssessment = 
      `Podnik má optimální půdní reakci (průměrné pH ${formatNumber(avgPh, 1)}). ` +
      `Půdní stav je velmi dobrý.`
  }

  // Analyze Mg status (check K/Mg ratios in rows)
  let lowMgCount = 0
  let highKMgCount = 0
  
  data.rows.forEach(row => {
    if (row.kMgRatio && row.kMgRatio !== '-') {
      const ratioMatch = row.kMgRatio.match(/([0-9.]+)/)
      if (ratioMatch) {
        const ratio = parseFloat(ratioMatch[1])
        if (ratio > 1.6) highKMgCount++
      }
    }
    // Check for "+ Mg" indicator
    if (row.kMgRatio.includes('+ Mg')) {
      lowMgCount++
    }
  })

  // Liming strategy based on Mg status
  if (lowMgCount > data.totalParcels * 0.5) {
    recommendations.limingStrategy = 
      `Vzhledem k nízkému obsahu hořčíku na více než polovině pozemků doporučujeme ` +
      `použití DOLOMITICKÉHO VÁPENCE (Ca+Mg), který doplní jak vápník, tak hořčík. ` +
      `Optimální poměr K:Mg je 1.1-1.6:1.`
  } else if (highKMgCount > data.totalParcels * 0.3) {
    recommendations.limingStrategy = 
      `Na některých pozemcích je nevyvážený poměr K:Mg. Doporučujeme použít ` +
      `dolomitický vápenec nebo přidat hořčíkové hnojivo ke standardnímu vápnění.`
  } else {
    recommendations.limingStrategy = 
      `Poměr K:Mg je na většině pozemků vyrovnaný. Můžete použít standardní ` +
      `vápenatý vápenec (CaCO₃) nebo podle urgentnosti pálené vápno.`
  }

  // Priority actions
  if (data.parcelsToLime > 0) {
    recommendations.priorityActions.push(
      `${data.parcelsToLime} pozemků vyžaduje vápnění (celková potřeba: ${formatNumber(data.totalCaoNeed, 1)} t CaO)`
    )
  }

  // Critical pH warnings
  const criticalPh = data.rows.filter(row => {
    const ph = parseFloat(row.ph)
    return !isNaN(ph) && ph < 5.0
  })

  if (criticalPh.length > 0) {
    recommendations.warnings.push(
      `⚠️ KRITICKÉ: ${criticalPh.length} pozemků má pH < 5.0 (extrémně kyselé). Nutná urgentní náprava!`
    )
    recommendations.priorityActions.push(
      `Urychleně řešit pozemky s pH < 5.0 pomocí páleného vápna pro rychlý účinek`
    )
  }

  // Large-scale liming warning
  if (data.totalCaoNeed > 100) {
    recommendations.priorityActions.push(
      `Celková potřeba CaO překračuje 100 tun. Doporučujeme rozdělit aplikaci do 2-3 let.`
    )
  }

  return recommendations
}

/**
 * Load logo as base64 from public folder
 */
async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logo.png')
    if (!response.ok) return null
    
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to load logo:', error)
    return null
  }
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export Professional Liming Recommendations PDF
 * 
 * @param data - The liming data with Czech characters properly encoded
 * @returns PDF Blob for download
 */
export async function exportLimingRecommendationsPDF(
  data: LimingPDFData
): Promise<Blob> {
  // Initialize PDF (A4, landscape for wide table)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true,
  })

  // =========================================================================
  // LOAD CUSTOM FONT FOR CZECH CHARACTERS
  // =========================================================================
  // 
  // CRITICAL: This is required for Czech diacritics (ěščřžýáíé...)
  // 
  // Method 1: Load from URL (recommended for production)
  let fontLoaded = false
  try {
    // ⚠️ CRITICAL: jsPDF requires TTF format, not WOFF/WOFF2
    // Strategy: Try multiple sources until one succeeds
    
    const fontUrls = [
      // 1. Try local public folder first (fastest if available)
      '/fonts/Roboto-Regular.ttf',
      // 2. Try jsDelivr CDN (very reliable, serves raw files)
      'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Regular.ttf',
      // 3. Fallback to rawgit proxy
      'https://raw.githack.com/google/fonts/main/apache/roboto/static/Roboto-Regular.ttf'
    ]
    
    for (const fontUrl of fontUrls) {
      try {
        console.log(`📥 Trying to load Roboto font from: ${fontUrl}`)
        const fontResponse = await fetch(fontUrl)
        
        if (fontResponse.ok) {
          const fontBlob = await fontResponse.blob()
          const fontBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1]
              resolve(base64)
            }
            reader.readAsDataURL(fontBlob)
          })
          
          // Add Roboto font to PDF
          doc.addFileToVFS('Roboto-Regular.ttf', fontBase64)
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
          doc.setFont(getFontName())
          console.log(`✅ Roboto font loaded successfully from: ${fontUrl}`)
          console.log('✅ Czech characters (ěščřžýáíéúůďťň) will display correctly!')
          fontLoaded = true
          break
        }
      } catch (err) {
        console.warn(`⚠️ Failed to load font from ${fontUrl}:`, err)
        // Continue to next URL
      }
    }
    
    if (!fontLoaded) {
      throw new Error('All font sources failed')
    }
  } catch (error) {
    console.error('❌ CRITICAL: Failed to load Roboto font:', error)
    console.error('❌ Czech characters WILL NOT display correctly!')
    console.error('❌ PDF will use default Helvetica font (no diacritics support)')
    console.warn('⚠️ Using removeAccents() fallback for text sanitization')
    // Don't throw - let PDF generation continue with default font
  }

  // Helper function to conditionally sanitize text
  const sanitizeText = (text: string | undefined | null): string => {
    if (!text) return ''
    return fontLoaded ? text : removeAccents(text)
  }

  // Helper to get the font name (Roboto if loaded, helvetica as fallback)
  const getFontName = () => fontLoaded ? 'Roboto' : 'helvetica'

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 12
  let currentY = margin + 5

  // Generate intelligent recommendations
  const recommendations = generateRecommendations(data)

  // =========================================================================
  // 1. PROFESSIONAL HEADER
  // =========================================================================

  // Logo
  const logoBase64 = await loadLogoAsBase64()
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, currentY - 3, 40, 18)
    } catch (error) {
      // Fallback: Styled text logo
      doc.setFillColor(COLORS.primary)
      doc.roundedRect(margin, currentY - 3, 40, 18, 3, 3, 'F')
      doc.setFontSize(14)
      doc.setTextColor(COLORS.white)
      doc.setFont(getFontName(), 'bold')
      doc.text('DÉMON AGRO', margin + 20, currentY + 7, { align: 'center' })
    }
  } else {
    // Fallback: Styled text logo
    doc.setFillColor(COLORS.primary)
    doc.roundedRect(margin, currentY - 3, 40, 18, 3, 3, 'F')
    doc.setFontSize(14)
    doc.setTextColor(COLORS.white)
    doc.setFont(getFontName(), 'bold')
    doc.text('DÉMON AGRO', margin + 20, currentY + 7, { align: 'center' })
  }

  // Main Title
  doc.setFontSize(FONTS.title)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('PROTOKOL DOPORUČENÍ VÁPNĚNÍ A VÝŽIVY ROSTLIN'), pageWidth / 2, currentY + 4, { 
    align: 'center' 
  })

  // Decorative line under title
  doc.setDrawColor(COLORS.primary)
  doc.setLineWidth(1.2)
  doc.line(margin + 45, currentY + 9, pageWidth - margin - 45, currentY + 9)

  currentY += 24

  // Company info box
  doc.setFillColor(COLORS.background)
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 16, 2, 2, 'F')
  
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.text)
  doc.setFont(getFontName(), 'normal')
  
  const infoY = currentY + 6
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Zemědělský podnik:'), margin + 5, infoY)
  doc.setFont(getFontName(), 'normal')
  doc.text(sanitizeText(data.companyName), margin + 45, infoY)
  
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Celková výměra:'), margin + 5, infoY + 5)
  doc.setFont(getFontName(), 'normal')
  doc.text(`${formatNumber(data.totalArea, 2)} ha`, margin + 45, infoY + 5)

  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Datum vypracování:'), pageWidth - margin - 65, infoY)
  doc.setFont(getFontName(), 'normal')
  doc.text(sanitizeText(formatCzechDate(new Date())), pageWidth - margin - 5, infoY, { align: 'right' })
  
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Průměrné pH:'), pageWidth - margin - 65, infoY + 5)
  doc.setFont(getFontName(), 'normal')
  const phColor = data.averagePh < 5.5 ? COLORS.error : 
                  data.averagePh < 6.0 ? COLORS.warning : COLORS.success
  doc.setTextColor(phColor)
  doc.text(formatNumber(data.averagePh, 1), pageWidth - margin - 5, infoY + 5, { align: 'right' })

  currentY += 20

  // =========================================================================
  // 2. INTELLIGENT RECOMMENDATIONS SECTION
  // =========================================================================

  if (data.parcelsToLime > 0) {
    doc.setFillColor(255, 245, 230) // Light orange background
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 24, 2, 2, 'F')
    
    doc.setFontSize(FONTS.subheading)
    doc.setTextColor(COLORS.primaryDark)
    doc.setFont(getFontName(), 'bold')
    doc.text(sanitizeText('>> CELKOVE HODNOCENI'), margin + 5, currentY + 5)
    
    doc.setFontSize(FONTS.small)
    doc.setTextColor(COLORS.text)
    doc.setFont(getFontName(), 'normal')
    const assessmentLines = doc.splitTextToSize(
      sanitizeText(recommendations.overallAssessment),
      pageWidth - 2 * margin - 10
    )
    doc.text(assessmentLines, margin + 5, currentY + 10)
    
    const strategyY = currentY + 10 + (assessmentLines.length * 4)
    doc.setFont(getFontName(), 'bold')
    doc.text(sanitizeText('Strategie vápnění:'), margin + 5, strategyY)
    doc.setFont(getFontName(), 'normal')
    const strategyLines = doc.splitTextToSize(
      sanitizeText(recommendations.limingStrategy),
      pageWidth - 2 * margin - 10
    )
    doc.text(strategyLines, margin + 5, strategyY + 4)
    
    currentY += 28
  }

  // =========================================================================
  // 3. DATA TABLE WITH ADVANCED FORMATTING
  // =========================================================================

  doc.setFontSize(FONTS.heading)
  doc.setFont(getFontName(), 'bold')
  doc.setTextColor(COLORS.primaryDark)
  doc.text(sanitizeText('PŘEHLED POZEMKŮ'), margin, currentY)

  currentY += 6

  const tableData = data.rows.map(row => [
    sanitizeText(row.kultura || 'Orná'),
    sanitizeText(row.pozemek),
    row.kodPozemku || '-',
    row.vymera,
    sanitizeText(getSoilTypeLabel(row.druh)),
    row.rokRozboru,
    row.ph,
    row.ca || '-',
    row.mg || '-',
    row.k || '-',
    row.p || '-',
    row.s || '-',
    sanitizeText(row.kMgRatio),
    row.potrebaCaoTHa || '-',
    row.potrebaCaoCelkem || '-',
  ])

  autoTable(doc, {
    startY: currentY,
    head: [[
      sanitizeText('Kultura'),
      sanitizeText('Pozemek'),
      sanitizeText('Kód pozemku'),
      sanitizeText('Výměra\n(ha)'),
      sanitizeText('Druh\npůdy'),
      sanitizeText('Rok\nrozboru'),
      'pH',
      'Ca\n(mg/kg)',
      'Mg\n(mg/kg)',
      'K\n(mg/kg)',
      'P\n(mg/kg)',
      'S\n(mg/kg)',
      sanitizeText('Poměr\nK/Mg'),
      'CaO\n(t/ha)',
      'CaO\ncelkem (t)',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: FONTS.tiny,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: COLORS.white,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: FONTS.tiny,
      textColor: COLORS.text,
      cellPadding: 1.8,
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'left', fontSize: FONTS.tiny - 0.5 },
      1: { cellWidth: 18, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 16, halign: 'left' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 11, halign: 'right' },
      8: { cellWidth: 11, halign: 'right' },
      9: { cellWidth: 11, halign: 'right' },
      10: { cellWidth: 11, halign: 'right' },
      11: { cellWidth: 11, halign: 'right' },
      12: { cellWidth: 12, halign: 'center' },
      13: { cellWidth: 11, halign: 'right', fontStyle: 'bold' },
      14: { cellWidth: 13, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didParseCell: function (data) {
      // Color-code pH values (pH logic stays the same - not a nutrient)
      if (data.column.index === 6 && data.section === 'body') {
        const phText = data.cell.text[0]
        if (phText && phText !== '-') {
          const ph = parseFloat(phText.replace(',', '.'))
          if (!isNaN(ph)) {
            if (ph < 5.0) {
              // Critical pH - light red background with dark red text
              data.cell.styles.fillColor = [255, 235, 235] // Very light red
              data.cell.styles.textColor = [220, 38, 38] // Dark red
              data.cell.styles.fontStyle = 'bold'
            } else if (ph < 5.5) {
              data.cell.styles.textColor = [239, 68, 68] // Red
            } else if (ph < 6.0) {
              data.cell.styles.textColor = [245, 158, 11] // Orange
            } else {
              data.cell.styles.textColor = [16, 185, 129] // Green
            }
          }
        }
      }

      // Get soil type from row data for nutrient categorization
      const rowIndex = data.row.index
      const rowData = data.rows?.[rowIndex] || tableData[rowIndex]
      const soilTypeStr = rowData?.[4] || 'S' // Column 4 is 'Druh půdy'
      const soilType = parseSoilType(soilTypeStr)

      // ============================================================
      // Color-code Ca (mg/kg) - Column 7
      // ============================================================
      if (data.column.index === 7 && data.section === 'body') {
        const caText = data.cell.text[0]
        if (caText && caText !== '-') {
          const ca = parseFloat(caText.replace(',', '.').replace(/\s/g, ''))
          if (!isNaN(ca)) {
            const category = categorizeNutrient('Ca', ca, soilType)
            const color = getNutrientColorRGB(category)
            data.cell.styles.textColor = color
            if (category === 'nizky') {
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      }

      // ============================================================
      // Color-code Mg (mg/kg) - Column 8
      // ============================================================
      if (data.column.index === 8 && data.section === 'body') {
        const mgText = data.cell.text[0]
        if (mgText && mgText !== '-') {
          const mg = parseFloat(mgText.replace(',', '.').replace(/\s/g, ''))
          if (!isNaN(mg)) {
            const category = categorizeNutrient('Mg', mg, soilType)
            const color = getNutrientColorRGB(category)
            data.cell.styles.textColor = color
            if (category === 'nizky') {
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      }

      // ============================================================
      // Color-code K (mg/kg) - Column 9
      // ============================================================
      if (data.column.index === 9 && data.section === 'body') {
        const kText = data.cell.text[0]
        if (kText && kText !== '-') {
          const k = parseFloat(kText.replace(',', '.').replace(/\s/g, ''))
          if (!isNaN(k)) {
            const category = categorizeNutrient('K', k, soilType)
            const color = getNutrientColorRGB(category)
            data.cell.styles.textColor = color
            if (category === 'nizky') {
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      }

      // ============================================================
      // Color-code P (mg/kg) - Column 10
      // ============================================================
      if (data.column.index === 10 && data.section === 'body') {
        const pText = data.cell.text[0]
        if (pText && pText !== '-') {
          const p = parseFloat(pText.replace(',', '.').replace(/\s/g, ''))
          if (!isNaN(p)) {
            const category = categorizeNutrient('P', p, soilType)
            const color = getNutrientColorRGB(category)
            data.cell.styles.textColor = color
            if (category === 'nizky') {
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      }

      // ============================================================
      // Color-code S (mg/kg) - Column 11
      // ============================================================
      if (data.column.index === 11 && data.section === 'body') {
        const sText = data.cell.text[0]
        if (sText && sText !== '-') {
          const s = parseFloat(sText.replace(',', '.').replace(/\s/g, ''))
          if (!isNaN(s)) {
            const category = categorizeNutrient('S', s, soilType)
            const color = getNutrientColorRGB(category)
            data.cell.styles.textColor = color
            if (category === 'nizky') {
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      }

      // ============================================================
      // Color-code K/Mg ratio - Column 12
      // Metodika shodná s portálem - optimální rozsah: 1.5 - 2.5
      // ============================================================
      if (data.column.index === 12 && data.section === 'body') {
        const ratioText = data.cell.text[0]
        if (ratioText && ratioText !== '-') {
          const ratioMatch = ratioText.match(/([0-9.,]+)/)
          if (ratioMatch) {
            const ratio = parseFloat(ratioMatch[1].replace(',', '.'))
            if (!isNaN(ratio)) {
              if (ratio >= 1.5 && ratio <= 2.5) {
                // Optimální rozsah: 1.5 - 2.5
                data.cell.styles.textColor = [34, 197, 94] // Green-500 - optimální
              } else if ((ratio >= 1.2 && ratio < 1.5) || (ratio > 2.5 && ratio <= 3.5)) {
                // Suboptimální: 1.2-1.5 (+ K) nebo 2.5-3.5 (+ Mg)
                data.cell.styles.textColor = [234, 179, 8] // Yellow-600 - suboptimální (+ K nebo + Mg)
              } else {
                // Kritický nepoměr: < 1.2 nebo > 3.5
                data.cell.styles.textColor = [220, 38, 38] // Red-600 - kritický
                data.cell.styles.fontStyle = 'bold'
              }
            }
          }
        }
      }
    },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // =========================================================================
  // 4. SUMMARY SECTION
  // =========================================================================

  // Check if we need a new page
  if (currentY > pageHeight - 70) {
    doc.addPage()
    currentY = margin + 10
  }

  // Decorative separator
  doc.setDrawColor(COLORS.primary)
  doc.setLineWidth(0.8)
  doc.line(margin, currentY, pageWidth - margin, currentY)

  currentY += 8

  doc.setFontSize(FONTS.heading)
  doc.setFont(getFontName(), 'bold')
  doc.setTextColor(COLORS.primaryDark)
  doc.text(sanitizeText('SOUHRN'), pageWidth / 2, currentY, { align: 'center' })

  currentY += 8

  // Summary boxes
  const boxWidth = (pageWidth - 2 * margin - 20) / 3
  const boxHeight = 22
  const gap = 10
  let boxX = margin

  // Box 1: Parcels
  doc.setFillColor(239, 246, 255) // Light blue background
  doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, 'F')
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.text)
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Celkem pozemku'), boxX + boxWidth / 2, currentY + 6, { align: 'center' })
  doc.setFontSize(FONTS.title)
  doc.setTextColor(59, 130, 246) // Blue
  doc.text(`${data.totalParcels}`, boxX + boxWidth / 2, currentY + 14, { align: 'center' })
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.text(sanitizeText(`Vymera: ${formatNumber(data.totalArea, 2)} ha`), boxX + boxWidth / 2, currentY + 19, { align: 'center' })

  // Box 2: Liming needed
  boxX += boxWidth + gap
  const needsLiming = data.parcelsToLime > data.totalParcels * 0.5
  if (needsLiming) {
    doc.setFillColor(255, 245, 230) // Light orange
  } else {
    doc.setFillColor(240, 253, 244) // Light green
  }
  doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, 'F')
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.text)
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Pozemku k vapneni'), boxX + boxWidth / 2, currentY + 6, { align: 'center' })
  doc.setFontSize(FONTS.title)
  if (needsLiming) {
    doc.setTextColor(245, 158, 11) // Orange
  } else {
    doc.setTextColor(16, 185, 129) // Green
  }
  doc.text(`${data.parcelsToLime}`, boxX + boxWidth / 2, currentY + 14, { align: 'center' })
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.text(`CaO: ${formatNumber(data.totalCaoNeed, 1)} t`, boxX + boxWidth / 2, currentY + 19, { align: 'center' })

  // Box 3: OK parcels
  boxX += boxWidth + gap
  doc.setFillColor(240, 253, 244) // Light green
  doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, 'F')
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.text)
  doc.setFont(getFontName(), 'bold')
  doc.text(sanitizeText('Pozemku v poradku'), boxX + boxWidth / 2, currentY + 6, { align: 'center' })
  doc.setFontSize(FONTS.title)
  doc.setTextColor(16, 185, 129) // Green
  doc.text(`${data.parcelsOk}`, boxX + boxWidth / 2, currentY + 14, { align: 'center' })
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  const percentOk = Math.round((data.parcelsOk / data.totalParcels) * 100)
  doc.text(sanitizeText(`${percentOk}% pozemku`), boxX + boxWidth / 2, currentY + 19, { align: 'center' })

  currentY += boxHeight + 10

  // Priority actions
  if (recommendations.priorityActions.length > 0) {
    doc.setFillColor(232, 245, 233) // Light green background
    const actionsHeight = 6 + recommendations.priorityActions.length * 5
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, actionsHeight, 2, 2, 'F')
    
    doc.setFontSize(FONTS.body)
    doc.setTextColor(COLORS.primaryDark)
    doc.setFont(getFontName(), 'bold')
    doc.text(sanitizeText('>> Prioritni akce:'), margin + 5, currentY + 5)
    
    doc.setFontSize(FONTS.small)
    doc.setTextColor(COLORS.text)
    doc.setFont(getFontName(), 'normal')
    recommendations.priorityActions.forEach((action, index) => {
      doc.text(sanitizeText(`${index + 1}. ${action}`), margin + 8, currentY + 10 + index * 5)
    })
    
    currentY += actionsHeight + 8
  }

  // =========================================================================
  // 5. METHODOLOGY & NOTES
  // =========================================================================

  if (currentY > pageHeight - 50) {
    doc.addPage()
    currentY = margin + 10
  }

  doc.setDrawColor(COLORS.border)
  doc.setLineWidth(0.5)
  doc.line(margin, currentY, pageWidth - margin, currentY)

  currentY += 6

  doc.setFontSize(FONTS.subheading)
  doc.setFont(getFontName(), 'bold')
  doc.setTextColor(COLORS.primaryDark)
  doc.text(sanitizeText('METODIKA A POZNÁMKY'), margin, currentY)

  currentY += 6

  doc.setFontSize(FONTS.small)
  doc.setFont(getFontName(), 'normal')
  doc.setTextColor(COLORS.text)

  const notes = [
    '1) Poměr K/Mg (draslík ku hořčíku) ukazuje vyváženost těchto prvků. Optimální rozmezí je 1,1:1 až 1,6:1.',
    '   Označení "+ Mg" nebo "+ K" indikuje potřebu doplnění daného prvku.',
    '',
    '2) Doporučený produkt je zvolen na základě stavu hořčíku:',
    '   • Dolomit mletý: při nízkém Mg (pod 120 mg/kg)',
    '   • Vápenec mletý: při vyhovujícím Mg',
    '   • Pálené vápno: při urgentní potřebě rychlého zvýšení pH',
    '',
    '3) Navržené dávky jsou orientační pro půdní profil do 20 cm.',
    '   Maximální roční dávka by neměla překročit 3 t CaO/ha.',
    '',
    '4) Doporučujeme provádět kontrolní rozbor půdy 1 rok po každé aplikaci',
    '   a pravidelně každé 4 roky.',
    '',
    '5) Vypočtené dávky vychází z metodiky ÚKZÚZ pro úpravu pH a optimalizaci živin.',
    '   Hodnoty jsou přepočteny na čistý CaO (oxid vápenatý).',
  ]

  notes.forEach(note => {
    if (currentY > pageHeight - 20) {
      doc.addPage()
      currentY = margin + 10
    }
    doc.text(sanitizeText(note), margin + 3, currentY)
    currentY += note === '' ? 2 : 4.5
  })

  // =========================================================================
  // 6. PROFESSIONAL FOOTER ON ALL PAGES
  // =========================================================================

  const pageCount = doc.getNumberOfPages()
  const footerY = pageHeight - 10

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Footer separator
    doc.setDrawColor(COLORS.border)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6)

    // Left side: Company branding
    doc.setFontSize(FONTS.tiny)
    doc.setFont(getFontName(), 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text(sanitizeText('DÉMON AGRO'), margin + 2, footerY)
    doc.setFont(getFontName(), 'normal')
    doc.setTextColor(COLORS.darkGray)
    doc.text('• www.demonagro.cz', margin + 22, footerY)

    // Center: Date
    doc.setFontSize(FONTS.tiny)
    doc.setTextColor(COLORS.darkGray)
    doc.text(
      sanitizeText(`Vygenerováno: ${formatCzechDate(new Date())}`),
      pageWidth / 2,
      footerY,
      { align: 'center' }
    )

    // Right side: Page number
    doc.setFontSize(FONTS.tiny)
    doc.setFont(getFontName(), 'normal')
    doc.text(
      sanitizeText(`Strana ${i} z ${pageCount}`),
      pageWidth - margin - 2,
      footerY,
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
export function downloadLimingPDF(blob: Blob, filename: string): void {
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
 * Generate filename for liming recommendation PDF
 */
export function generateLimingFilename(companyName: string): string {
  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  return `Protokol_vapneni_${safeName}_${date}.pdf`
}

// ============================================================================
// VERSION HISTORY & CHANGELOG
// ============================================================================
/**
 * V2.1 - 2026-01-17
 * -----------------
 * ✅ FIXED: Nutrient colors now match portal exactly
 * - Integrated categorizeNutrient() from soil-categories.ts
 * - Added support for 5-color system (red/orange/green/blue/purple)
 * - Ca, Mg, K, P, S values now use scientific methodology
 * - Values categorized by soil type (Lehká/Střední/Těžká)
 * 
 * Color mapping:
 * - Nízký → Červená (Red-500)
 * - Vyhovující → Oranžová (Orange-500)
 * - Dobrý → Zelená (Green-500)
 * - Vysoký → Modrá (Blue-500)
 * - Velmi vysoký → Fialová (Purple-500)
 * 
 * V2.0 - 2026-01-04
 * -----------------
 * ✅ Czech character support with Roboto font
 * ✅ Professional layout and design
 * ✅ Intelligent recommendations
 * ✅ Color-coded warnings
 */

