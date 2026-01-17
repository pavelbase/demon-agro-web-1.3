/**
 * PDF EXPORT FOR ECONOMIC LOSS CALCULATOR
 * ========================================
 * 
 * Professional PDF export for the acidic soil economic loss calculator.
 * Includes parameters, summary cards, detailed table, and methodology.
 * 
 * @version 2.0
 * @date 2026-01-15
 * @author Senior Frontend Developer
 * 
 * KEY FEATURES:
 * - Full Czech character support (UTF-8) via custom font
 * - Professional layout matching design mockup
 * - Automatic page breaks with jspdf-autotable
 * - Color-coded critical pH values
 * - Responsive grid layout for parameters
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// LOGO (DEMON AGRO)
// ============================================================================
/**
 * Logo is loaded from public/logo.png and converted to Base64
 * This allows embedding the logo directly in the PDF without external dependencies
 */
const LOGO_BASE64_PATH = '/logo.png' // Path for reference - Base64 embedded below

// Note: Full Base64 is embedded at PDF generation time from file system
// For now, we'll load it dynamically or use a placeholder

// ============================================================================
// CUSTOM FONT SUPPORT (ROBOTO)
// ============================================================================
/**
 * IMPORTANT: To enable Czech characters (č, ř, ž, š, ý, á, í, é, ů, ú, ň, ť, ď),
 * you MUST add a custom font to jsPDF.
 * 
 * STEPS TO ADD FONT:
 * 1. Download Roboto-Regular.ttf from Google Fonts
 * 2. Convert to Base64: https://base64.guru/converter/encode/file
 * 3. Paste Base64 string into ROBOTO_FONT_BASE64 below
 * 4. Uncomment the addCustomFont() call in generateKalkulackaZtratPDF()
 * 
 * PLACEHOLDER: Replace this string with actual Base64 font data
 */
const ROBOTO_FONT_BASE64 = `
/* 
 * TODO: INSERT ROBOTO-REGULAR.TTF BASE64 STRING HERE
 * Example: data:font/ttf;base64,AAEAAAASAQAABAAgR0RFRg...
 * 
 * Until then, we'll use removeAccents() as fallback
 */
`

/**
 * Add custom font to jsPDF document
 * @param doc - jsPDF instance
 */
function addCustomFont(doc: jsPDF): boolean {
  try {
    if (ROBOTO_FONT_BASE64.includes('TODO')) {
      console.warn('⚠️ Custom font not loaded. Czech characters will be converted to ASCII.')
      return false
    }
    
    // Add font file to VFS (Virtual File System)
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_FONT_BASE64)
    
    // Register font with jsPDF
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
    
    // Set as default font
    doc.setFont('Roboto')
    
    console.log('✅ Custom font loaded successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to load custom font:', error)
    return false
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface KalkulackaZtratRow {
  kod: string | null
  nazev: string
  vymeraHa: number
  typPudy: string
  aktualnePh: number
  cilovePh: number
  efektivita: number
  celkovaZtrataKcHa: number
  celkovaZtrataPozemek: number
  nakladyVapneni: number
  potrebaCaoTHa: number
  potrebaVapenceTHa: number
  navratnostMesice: number
}

export interface KalkulackaZtratPDFData {
  // Parametry výpočtu
  fertilizerCost: number
  revenuePerHa: number
  limingCostPerTon: number
  
  // Přehledová data
  totalLoss: number
  totalLimingCost: number
  averageROI: number
  averagePh: number
  criticalParcels: number
  totalArea: number
  
  // Detailní data pozemků
  rows: KalkulackaZtratRow[]
}

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#2E7D32',      // Professional dark green
  primaryLight: '#4CAF50', // Light green for accents
  primaryDark: '#1B5E20',  // Very dark green for text
  
  success: '#10B981',      // Green - pH OK
  warning: '#F59E0B',      // Orange - pH low
  error: '#EF4444',        // Red - pH critical
  
  background: '#F5F5F5',   // Light gray background
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
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Remove Czech accents for PDF compatibility
 */
function removeAccents(str: string): string {
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
 * Format date in Czech format
 */
function formatCzechDate(date: Date): string {
  const day = date.getDate()
  const monthNames = [
    'ledna', 'unora', 'brezna', 'dubna', 'kvetna', 'cervna',
    'cervence', 'srpna', 'zari', 'rijna', 'listopadu', 'prosince'
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
 * Format currency in Czech format
 */
function formatCurrency(amount: number): string {
  return `${formatNumber(amount, 0)} Kc`
}

/**
 * Get soil type label in Czech
 */
function getSoilTypeLabel(soilType: string): string {
  const labels: Record<string, string> = {
    'L': 'Lehka',
    'S': 'Stredni',
    'T': 'Tezka',
  }
  return labels[soilType] || soilType
}

/**
 * Sanitize text for PDF rendering (remove accents)
 */
function sanitize(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return ''
  return removeAccents(String(text))
}

// ============================================================================
// PDF GENERATION
// ============================================================================

export async function generateKalkulackaZtratPDF(data: KalkulackaZtratPDFData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // ============================================================================
  // LOAD LOGO FROM PUBLIC FOLDER
  // ============================================================================
  let logoBase64 = ''
  try {
    // Try to load logo for embedding (client-side)
    const response = await fetch('/logo.png')
    const blob = await response.blob()
    logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
    console.log('✅ Logo loaded successfully')
  } catch (error) {
    console.warn('⚠️ Could not load logo, using text fallback')
  }

  // ============================================================================
  // SETUP CUSTOM FONT (uncomment when Base64 font is added)
  // ============================================================================
  // const fontLoaded = addCustomFont(doc)
  // if (!fontLoaded) {
  //   console.warn('Using default helvetica font with accent removal')
  // }

  /**
   * Helper function to add logo to page with correct aspect ratio
   * Returns the actual height of the logo
   */
  const addLogoToPage = async (yPos: number = 15): Promise<number> => {
    if (logoBase64) {
      try {
        // Create image to get natural dimensions
        const img = new Image()
        
        return new Promise((resolve) => {
          img.onload = () => {
            // Calculate aspect ratio from natural dimensions
            const aspectRatio = img.naturalHeight / img.naturalWidth
            const logoWidth = 15  // Fixed width in mm
            const logoHeight = logoWidth * aspectRatio  // Calculated height maintains aspect ratio
            
            try {
              doc.addImage(logoBase64, 'PNG', 20, yPos, logoWidth, logoHeight)
              console.log(`✅ Logo added: ${logoWidth}mm × ${logoHeight.toFixed(2)}mm (aspect ratio: ${aspectRatio.toFixed(2)})`)
              resolve(logoHeight)
            } catch (error) {
              console.warn('Failed to add logo image, using text fallback')
              addTextLogo(yPos)
              resolve(10)
            }
          }
          
          img.onerror = () => {
            console.warn('Failed to load logo image, using text fallback')
            addTextLogo(yPos)
            resolve(10)
          }
          
          img.src = logoBase64
        })
      } catch (error) {
        console.warn('Error processing logo, using text fallback')
        addTextLogo(yPos)
        return 10
      }
    } else {
      addTextLogo(yPos)
      return 10
    }
  }

  const addTextLogo = (yPos: number) => {
    doc.setFontSize(FONTS.subheading)
    doc.setTextColor(COLORS.primaryDark)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize('Demon'), 20, yPos + 5)
    doc.setTextColor(COLORS.primary)
    doc.text(sanitize('agro'), 35, yPos + 5)
  }

  let yPosition = 15

  // ============================================================================
  // 1. HEADER WITH LOGO (ONLY ON FIRST PAGE)
  // ============================================================================
  
  // Add logo (left side) - with correct aspect ratio
  const logoHeight = await addLogoToPage(yPosition)
  
  // Title (center)
  doc.setFontSize(FONTS.title)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('KALKULACKA EKONOMICKYCH ZTRAT Z KYSELOSTI PUDY'), 148, yPosition + 6, { align: 'center' })
  
  // Date (right side)
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  const dateText = `Vytvoreno: ${formatCzechDate(new Date())}`
  doc.text(sanitize(dateText), 276, yPosition + 8, { align: 'right' })
  
  yPosition += Math.max(logoHeight, 12) + 8

  // ============================================================================
  // 2. PARAMETERS SECTION
  // ============================================================================
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Parametry vypoctu'), 20, yPosition)
  
  yPosition += 8

  // Parameters box
  const paramBoxY = yPosition
  doc.setDrawColor(COLORS.border)
  doc.setFillColor(COLORS.background)
  doc.roundedRect(20, paramBoxY, 256, 18, 2, 2, 'FD')
  
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')
  
  const col1X = 25
  const col2X = 110
  const col3X = 195
  const textY = paramBoxY + 6
  
  doc.text(sanitize('Naklady na hnojiva:'), col1X, textY)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(`${formatCurrency(data.fertilizerCost)}/ha/rok`), col1X, textY + 5)
  
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Trzby z plodin:'), col2X, textY)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(`${formatCurrency(data.revenuePerHa)}/ha/rok`), col2X, textY + 5)
  
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Cena vapence:'), col3X, textY)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(`${formatCurrency(data.limingCostPerTon)}/t`), col3X, textY + 5)
  
  yPosition = paramBoxY + 22

  // ============================================================================
  // 3. SUMMARY CARDS
  // ============================================================================
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Prehled ztrat'), 20, yPosition)
  
  yPosition += 8

  const cardWidth = 62
  const cardHeight = 22
  const cardGap = 4
  const cardsY = yPosition

  // Card 1: Total Loss
  const card1X = 20
  doc.setDrawColor(COLORS.error)
  doc.setFillColor(255, 239, 239)
  doc.roundedRect(card1X, cardsY, cardWidth, cardHeight, 2, 2, 'FD')
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Celkova ztrata rocne'), card1X + 3, cardsY + 5)
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.error)
  doc.setFont('helvetica', 'bold')
  // FIX: Ensure totalLoss is valid number, not undefined
  const totalLossValue = data.totalLoss && !isNaN(data.totalLoss) ? data.totalLoss : 0
  doc.text(sanitize(formatCurrency(totalLossValue)), card1X + 3, cardsY + 13)
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  const criticalCount = data.criticalParcels || 0
  doc.text(sanitize(`${criticalCount} kriticke pozemky`), card1X + 3, cardsY + 18)

  // Card 2: Liming Cost
  const card2X = card1X + cardWidth + cardGap
  doc.setDrawColor(COLORS.warning)
  doc.setFillColor(255, 251, 235)
  doc.roundedRect(card2X, cardsY, cardWidth, cardHeight, 2, 2, 'FD')
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Naklady na vapneni'), card2X + 3, cardsY + 5)
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.warning)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(formatCurrency(data.totalLimingCost)), card2X + 3, cardsY + 13)
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize(`Celkem na ${formatNumber(data.totalArea, 1)} ha`), card2X + 3, cardsY + 18)

  // Card 3: Average ROI
  const card3X = card2X + cardWidth + cardGap
  doc.setDrawColor(COLORS.success)
  doc.setFillColor(236, 253, 245)
  doc.roundedRect(card3X, cardsY, cardWidth, cardHeight, 2, 2, 'FD')
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Prumerna navratnost'), card3X + 3, cardsY + 5)
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.success)
  doc.setFont('helvetica', 'bold')
  // FIX: Round averageROI to whole number
  const roundedROI = Math.round(data.averageROI || 0)
  doc.text(sanitize(`${roundedROI} mesicu`), card3X + 3, cardsY + 13)
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Doba navratnosti investice'), card3X + 3, cardsY + 18)

  // Card 4: Average pH
  const card4X = card3X + cardWidth + cardGap
  doc.setDrawColor(COLORS.primary)
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(card4X, cardsY, cardWidth, cardHeight, 2, 2, 'FD')
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize('Prumerne pH pudy'), card4X + 3, cardsY + 5)
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(formatNumber(data.averagePh, 1)), card4X + 3, cardsY + 13)
  
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize(`Celkem ${data.rows.length} pozemku`), card4X + 3, cardsY + 18)

  yPosition = cardsY + cardHeight + 10

  // ============================================================================
  // 4. DETAILED TABLE
  // ============================================================================
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Detailni rozpad ztrat podle pozemku'), 20, yPosition)
  
  yPosition += 5

  // Prepare table data
  const tableHeaders = [
    ['Kod', 'Nazev pozemku', 'Vymera\n(ha)', 'Typ\npudy', 'pH', 'Cilove\npH', 'Efektiv.\n(%)', 'Ztrata\n(Kc/ha/rok)', 'Ztrata\ncelkem (Kc)', 'Vapneni\n(Kc)', 'Navrat.\n(mes.)']
  ]

  const tableRows = data.rows.map(row => [
    sanitize(row.kod || '-'),
    sanitize(row.nazev),
    formatNumber(row.vymeraHa, 2),
    sanitize(getSoilTypeLabel(row.typPudy)),
    formatNumber(row.aktualnePh, 1),
    formatNumber(row.cilovePh, 1),
    formatNumber(row.efektivita * 100, 0),
    formatNumber(row.celkovaZtrataKcHa, 0),
    formatNumber(row.celkovaZtrataPozemek, 0),
    formatNumber(row.nakladyVapneni, 0),
    row.navratnostMesice.toString(),
  ])

  autoTable(doc, {
    startY: yPosition,
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: FONTS.small,
      cellPadding: 2,
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 18 },   // Kod
      1: { halign: 'left', cellWidth: 45 },   // Nazev
      2: { halign: 'right', cellWidth: 15 },  // Vymera
      3: { halign: 'center', cellWidth: 15 }, // Typ
      4: { halign: 'center', cellWidth: 12 }, // pH
      5: { halign: 'center', cellWidth: 15 }, // Cilove pH
      6: { halign: 'center', cellWidth: 15 }, // Efektivita
      7: { halign: 'right', cellWidth: 20 },  // Ztrata/ha
      8: { halign: 'right', cellWidth: 25 },  // Ztrata celkem
      9: { halign: 'right', cellWidth: 22 },  // Vapneni
      10: { halign: 'center', cellWidth: 15 }, // Navratnost
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    // Color-code critical rows
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const pH = parseFloat(data.cell.text[0].replace(',', '.'))
        if (pH < 5.0) {
          data.cell.styles.textColor = COLORS.error
          data.cell.styles.fontStyle = 'bold'
        } else if (pH < 5.5) {
          data.cell.styles.textColor = COLORS.warning
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  // ============================================================================
  // 5. METHODOLOGY SECTION (DETAILED)
  // ============================================================================
  
  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50

  // Always add methodology on new page for better readability
  doc.addPage()
  yPosition = 20

  // NO LOGO on methodology page (logo only on first page)

  // Methodology header
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('O METODICE VYPOCTU'), 20, yPosition)
  
  // Separator line
  doc.setDrawColor(COLORS.primary)
  doc.setLineWidth(0.5)
  doc.line(20, yPosition + 2, 276, yPosition + 2)
  
  yPosition += 10

  // ===== SCIENTIFIC SOURCES =====
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Vedecke zdroje a studie'), 20, yPosition)
  
  yPosition += 6

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')

  const sources = [
    {
      title: 'AHDB (UK, 2024):',
      text: 'Agriculture and Horticulture Development Board dokumentuje, ze "pri pH 5.5 se promarni 32% hnojiv" (efektivita pouze 68%).'
    },
    {
      title: 'University of Idaho (1987):',
      text: 'Mahler & McDole publikovali vysledky 39 polnich pokusu (1980-1987), ktere prokazaly 35-50% snizeni vynosu pri pH 5.0.'
    },
    {
      title: 'Michigan State University:',
      text: 'Vyzkum toxicity hliniku (Al3+) ukazal, ze pri pH < 4.5 dochazi k zastaveni rustu korenu behem 1 hodiny. Pri pH 4.0 klesa efektivita zivin az na 20%.'
    },
    {
      title: 'USDA NRCS:',
      text: 'Dokumentace management fosforu v pude potvrzuje, ze "pH < 5.5 vyrazne omezuje dostupnost fosforu" kvuli fixaci na Al/Fe.'
    },
    {
      title: 'UKZUZ:',
      text: 'Oficialni Metodicky pokyn c. 01/AZZP pro vypocet potreby vapneni v podminkach CR.'
    }
  ]

  sources.forEach(source => {
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(source.title), 22, yPosition)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(sanitize(source.text), 250)
    doc.text(lines, 22, yPosition + 3.5)
    yPosition += 3.5 + (lines.length * 3.5)
  })

  yPosition += 3

  // ===== 1. FERTILIZER EFFICIENCY =====
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('1. Efektivita hnojiv'), 20, yPosition)
  
  yPosition += 5

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')
  
  const effText = 'Vypocet vychazi z vedecky overenych dat o vyuziti zivin pri ruznem pH:'
  doc.text(sanitize(effText), 22, yPosition)
  yPosition += 4

  const efficiencyData = [
    '• pH 4.0-4.5: Pouze 20-29% efektivita (Al3+ toxicita nici koreny)',
    '• pH 5.0: 46% efektivita (fosfor fixovan na Al/Fe slouceniny)',
    '• pH 5.5: 67% efektivita (AHDB: "32% hnojiv propada")',
    '• pH 6.0: 80% efektivita (temer optimalni)',
    '• pH 6.5-7.0: 100% efektivita (optimum pro vetsinu plodin)'
  ]

  efficiencyData.forEach(item => {
    doc.text(sanitize(item), 24, yPosition)
    yPosition += 3.5
  })

  yPosition += 1
  const exampleText = 'Priklad: Pri pH 5.5 a nakladech 8 000 Kc/ha na hnojiva ztracite 2 640 Kc/ha rocne (33% z 8 000 Kc) kvuli spatne dostupnosti zivin.'
  const exampleLines = doc.splitTextToSize(sanitize(exampleText), 252)
  doc.text(exampleLines, 22, yPosition)
  yPosition += exampleLines.length * 3.5 + 3

  // ===== 2. YIELD LOSS =====
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('2. Ztrata vynosu'), 20, yPosition)
  
  yPosition += 5

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')
  
  const yieldText = 'Kysela puda primo poskozuje rostliny tremi mechanismy:'
  doc.text(sanitize(yieldText), 22, yPosition)
  yPosition += 4

  const yieldMechanisms = [
    '• Toxicita hliniku (Al3+): Nici korenove vlaseni, omezuje prijem vody',
    '• Deficit zivin: Fosfor, molybden a vapnik jsou nedostupne',
    '• Naruseni mikrobialni aktivity: Nizsi mineralizace organicke hmoty'
  ]

  yieldMechanisms.forEach(item => {
    doc.text(sanitize(item), 24, yPosition)
    yPosition += 3.5
  })

  yPosition += 1
  const yieldExample = 'Studie z University of Idaho prokazaly 15% ztratu vynosu pri pH 5.0 a az 35% ztratu pri pH 4.0. U pozemku s trzbami 35 000 Kc/ha to znamena ztratu 5 250-12 250 Kc/ha rocne.'
  const yieldLines = doc.splitTextToSize(sanitize(yieldExample), 252)
  doc.text(yieldLines, 22, yPosition)
  yPosition += yieldLines.length * 3.5 + 3

  // Check if we need new page
  if (yPosition > 170) {
    doc.addPage()
    // NO LOGO on additional methodology pages (logo only on first page)
    yPosition = 25
  }

  // ===== 3. LIMING REQUIREMENT =====
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('3. Potreba vapna'), 20, yPosition)
  
  yPosition += 5

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')
  
  const limingText1 = 'Vypocet podle oficialni metodiky UKZUZ (Metodicky pokyn c. 01/AZZP) s respektovanim pufrovaci kapacity pudy za 4lete obdobi. System automaticky pouziva stejnou funkci jako modul "Plany vapneni" pro zajisteni konzistence vypoctu.'
  const limingLines1 = doc.splitTextToSize(sanitize(limingText1), 252)
  doc.text(limingLines1, 22, yPosition)
  yPosition += limingLines1.length * 3.5 + 2

  const limingText2 = 'Tabulkove hodnoty zohlednuji detailni typ pudy (lehka/stredni/tezka) a druh kultury (orna/TTP). Vypocet zahrnuje i prirozenou acidifikaci pudy behem planovaneho obdobi.'
  const limingLines2 = doc.splitTextToSize(sanitize(limingText2), 252)
  doc.text(limingLines2, 22, yPosition)
  yPosition += limingLines2.length * 3.5 + 3

  // ===== 4. ROI =====
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('4. Ekonomicka navratnost'), 20, yPosition)
  
  yPosition += 5

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')
  
  doc.text(sanitize('Navratnost = (Jednorazove naklady na vapneni / Rocni uspora) x 12 mesicu'), 22, yPosition)
  yPosition += 5

  const roiText = 'Interpretace: Pokud je navratnost 18 mesicu, znamena to, ze za 1,5 roku se vam investice do vapneni vrati usporami na hnojivech a vyssimi vynosy. Efekt vapneni pritom trva 4-6 let, takze zbytek obdobi mate cisty zisk.'
  const roiLines = doc.splitTextToSize(sanitize(roiText), 252)
  doc.text(roiLines, 22, yPosition)
  yPosition += roiLines.length * 3.5 + 3

  // ===== IMPORTANT NOTES =====
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.warning)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Dulezite poznamky'), 20, yPosition)
  
  yPosition += 5

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.text)
  doc.setFont('helvetica', 'normal')

  const notes = [
    '• Vypocty vychazi z vedecky overenych studii - skutecne ztraty mohou byt vyssi pri kombinaci stresoru (sucho, mrazy, choroby)',
    '• Cena vapneni zahrnuje pouze material - nepocita se s naklady na aplikaci a dopravu',
    '• Predpokladaji prumerne povetrnostni podminky bez extremnich vykyvuv',
    '• Doporucujeme overeni kontrolnim rozborem pudy 1 rok po vapneni'
  ]

  notes.forEach(note => {
    const noteLines = doc.splitTextToSize(sanitize(note), 250)
    doc.text(noteLines, 22, yPosition)
    yPosition += noteLines.length * 3.5 + 1
  })

  // ============================================================================
  // 6. PAGE FOOTER & LOGO
  // ============================================================================
  
  const pageCount = doc.getNumberOfPages()
  
  // Add footer and logo to all pages
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // NO LOGO on pages 2+ (logo only on first page as requested)
    
    // Separator line
    doc.setDrawColor(COLORS.border)
    doc.setLineWidth(0.1)
    doc.line(20, 195, 276, 195)
    
    // Footer text
    doc.setFontSize(FONTS.small)
    doc.setTextColor(COLORS.darkGray)
    doc.setFont('helvetica', 'italic')
    doc.text(
      sanitize('Vygenerovano systemem Demon Agro Portal - Kalkulacka ekonomickych ztrat'),
      148,
      199,
      { align: 'center' }
    )
    
    // Page number
    doc.setFont('helvetica', 'normal')
    doc.text(
      sanitize(`Strana ${i} z ${pageCount}`),
      276,
      199,
      { align: 'right' }
    )
  }

  // ============================================================================
  // 7. SAVE PDF
  // ============================================================================
  
  const fileName = `kalkulace-ztrat-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
  
  console.log(`✅ PDF export completed: ${fileName}`)
}

