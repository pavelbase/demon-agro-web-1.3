/**
 * ============================================================================
 * PDF EXPORT - KALKULAČKA EKONOMICKÝCH ZTRÁT V3
 * ============================================================================
 * 
 * @author Senior Frontend Developer
 * @date 2026-01-15
 * @version 3.0
 * 
 * FEATURES:
 * - Native jsPDF rendering (no html2canvas)
 * - Logo ONLY on first page with correct aspect ratio
 * - Dashboard cards with visual styling
 * - Auto-pagination with jspdf-autotable
 * - Professional layout matching dashboard design
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// LOGO BASE64
// ============================================================================
/**
 * LOGO PLACEHOLDER
 * Insert your base64 logo string here.
 * If empty, will render gray rectangle as placeholder.
 * 
 * Format: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 */
const LOGO_BASE64 = "" // TODO: Insert base64 logo here

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  // Primary colors
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  
  // Card backgrounds (light)
  cardRed: { r: 255, g: 239, b: 239 },      // Light red
  cardBlue: { r: 239, g: 246, b: 255 },     // Light blue
  cardGreen: { r: 236, g: 253, b: 245 },    // Light green
  cardOrange: { r: 255, g: 251, b: 235 },   // Light orange
  
  // Card text colors
  textRed: '#EF4444',
  textBlue: '#3B82F6',
  textGreen: '#10B981',
  textOrange: '#F59E0B',
  
  // UI colors
  gray: '#666666',
  darkGray: '#333333',
  border: '#E0E0E0',
  white: '#FFFFFF',
}

const FONTS = {
  title: 18,
  heading: 14,
  subheading: 11,
  body: 9,
  small: 7.5,
  tiny: 6.5,
}

// Page dimensions (A4 landscape)
const PAGE = {
  width: 297,
  height: 210,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 15,
  marginBottom: 15,
  contentWidth: 257, // 297 - 20 - 20
}

// ============================================================================
// TYPES
// ============================================================================

export interface PDFParcelData {
  kod: string | null
  nazev: string
  vymeraHa: number
  typPudy: string
  aktualnePh: number
  cilovePh: number
  efektivita: number
  ztrataKcHaRok: number
  ztrataCelkem: number
  nakladyVapneni: number
  navratnostMesice: number
}

export interface PDFDashboardData {
  // Input parameters
  fertilizerCost: number
  revenuePerHa: number
  limingCostPerTon: number
  
  // Dashboard cards
  totalLossYear: number
  totalLimingCost: number
  averageROIMonths: number
  averagePh: number
  
  // Additional info
  criticalParcelsCount: number
  totalAreaHa: number
  totalParcelsCount: number
  
  // Table data
  parcels: PDFParcelData[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format number with thousands separator
 */
function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Format currency (Czech format)
 */
function formatCurrency(amount: number): string {
  return `${formatNumber(amount, 0)} Kč`
}

/**
 * Format date (Czech format)
 */
function formatDate(date: Date): string {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}. ${month}. ${year}`
}

/**
 * Add logo to page with correct aspect ratio
 * Logo maintains its natural proportions by calculating height based on image dimensions
 */
async function addLogoWithAspectRatio(doc: jsPDF, x: number, y: number, targetWidth: number): Promise<number> {
  if (LOGO_BASE64 && LOGO_BASE64.length > 0) {
    try {
      // Create temporary image to get natural dimensions
      const img = new Image()
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const aspectRatio = img.naturalHeight / img.naturalWidth
          const calculatedHeight = targetWidth * aspectRatio
          
          try {
            doc.addImage(LOGO_BASE64, 'PNG', x, y, targetWidth, calculatedHeight)
            resolve(calculatedHeight)
          } catch (error) {
            console.warn('Failed to add logo image, using placeholder')
            addLogoPlaceholder(doc, x, y, targetWidth, 10)
            resolve(10)
          }
        }
        
        img.onerror = () => {
          console.warn('Failed to load logo image, using placeholder')
          addLogoPlaceholder(doc, x, y, targetWidth, 10)
          resolve(10)
        }
        
        img.src = LOGO_BASE64
      })
    } catch (error) {
      console.warn('Error processing logo, using placeholder')
      addLogoPlaceholder(doc, x, y, targetWidth, 10)
      return 10
    }
  } else {
    addLogoPlaceholder(doc, x, y, targetWidth, 10)
    return 10
  }
}

/**
 * Add gray rectangle as logo placeholder
 */
function addLogoPlaceholder(doc: jsPDF, x: number, y: number, width: number, height: number): void {
  doc.setFillColor(200, 200, 200)
  doc.rect(x, y, width, height, 'F')
  
  // Add text
  doc.setFontSize(FONTS.small)
  doc.setTextColor(100, 100, 100)
  doc.text('Logo', x + width / 2, y + height / 2, { align: 'center' })
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function exportToPDF(data: PDFDashboardData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  let currentY = PAGE.marginTop

  // ==========================================================================
  // 1. HEADER - LOGO & TITLE (ONLY ON FIRST PAGE)
  // ==========================================================================
  
  // Logo (left) - Fixed width 15mm, height calculated to maintain aspect ratio
  const logoWidth = 15
  const logoHeight = await addLogoWithAspectRatio(doc, PAGE.marginLeft, currentY, logoWidth)
  
  // Title (center)
  doc.setFontSize(FONTS.title)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text(
    'KALKULACKA EKONOMICKYCH ZTRAT Z KYSELOSTI PUDY',
    PAGE.width / 2,
    currentY + 6,
    { align: 'center' }
  )
  
  // Date (right)
  doc.setFontSize(FONTS.body)
  doc.setTextColor(COLORS.gray)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Vytvoreno: ${formatDate(new Date())}`,
    PAGE.width - PAGE.marginRight,
    currentY + 8,
    { align: 'right' }
  )
  
  currentY += Math.max(logoHeight, 10) + 10

  // ==========================================================================
  // 2. PARAMETERS SECTION (3 BOXES)
  // ==========================================================================
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('Parametry vypoctu', PAGE.marginLeft, currentY)
  
  currentY += 8

  const paramBoxWidth = (PAGE.contentWidth - 8) / 3 // 3 boxes with 4mm gaps
  const paramBoxHeight = 18
  const paramBoxGap = 4
  
  // Draw 3 parameter boxes
  const parameters = [
    {
      label: 'Naklady na hnojiva:',
      value: formatCurrency(data.fertilizerCost),
      unit: '/ha/rok'
    },
    {
      label: 'Trzby z plodin:',
      value: formatCurrency(data.revenuePerHa),
      unit: '/ha/rok'
    },
    {
      label: 'Cena vapence:',
      value: formatCurrency(data.limingCostPerTon),
      unit: '/t'
    }
  ]
  
  parameters.forEach((param, index) => {
    const boxX = PAGE.marginLeft + (paramBoxWidth + paramBoxGap) * index
    
    // Box background
    doc.setDrawColor(COLORS.border)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(boxX, currentY, paramBoxWidth, paramBoxHeight, 2, 2, 'FD')
    
    // Label
    doc.setFontSize(FONTS.body)
    doc.setTextColor(COLORS.gray)
    doc.setFont('helvetica', 'normal')
    doc.text(param.label, boxX + 3, currentY + 6)
    
    // Value
    doc.setFontSize(FONTS.heading)
    doc.setTextColor(COLORS.darkGray)
    doc.setFont('helvetica', 'bold')
    const valueText = param.value + param.unit
    doc.text(valueText, boxX + 3, currentY + 13)
  })
  
  currentY += paramBoxHeight + 10

  // ==========================================================================
  // 3. DASHBOARD CARDS (4 CARDS) - KEY VISUAL SECTION
  // ==========================================================================
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('Prehled ztrat', PAGE.marginLeft, currentY)
  
  currentY += 8

  const cardWidth = (PAGE.contentWidth - 12) / 4 // 4 cards with 4mm gaps
  const cardHeight = 22
  const cardGap = 4
  
  // Card 1: Total Loss (Red)
  drawDashboardCard(doc, {
    x: PAGE.marginLeft,
    y: currentY,
    width: cardWidth,
    height: cardHeight,
    bgColor: COLORS.cardRed,
    iconColor: COLORS.textRed,
    mainValue: formatCurrency(data.totalLossYear),
    label: 'Celkova ztrata rocne',
    subtext: `${data.criticalParcelsCount} kriticke pozemky`
  })
  
  // Card 2: Liming Cost (Blue)
  drawDashboardCard(doc, {
    x: PAGE.marginLeft + (cardWidth + cardGap) * 1,
    y: currentY,
    width: cardWidth,
    height: cardHeight,
    bgColor: COLORS.cardBlue,
    iconColor: COLORS.textBlue,
    mainValue: formatCurrency(data.totalLimingCost),
    label: 'Naklady na vapneni',
    subtext: `Celkem na ${formatNumber(data.totalAreaHa, 1)} ha`
  })
  
  // Card 3: ROI (Green)
  drawDashboardCard(doc, {
    x: PAGE.marginLeft + (cardWidth + cardGap) * 2,
    y: currentY,
    width: cardWidth,
    height: cardHeight,
    bgColor: COLORS.cardGreen,
    iconColor: COLORS.textGreen,
    mainValue: `${Math.round(data.averageROIMonths)} mesicu`,
    label: 'Prumerna navratnost',
    subtext: 'Doba navratnosti investice'
  })
  
  // Card 4: Average pH (Orange)
  drawDashboardCard(doc, {
    x: PAGE.marginLeft + (cardWidth + cardGap) * 3,
    y: currentY,
    width: cardWidth,
    height: cardHeight,
    bgColor: COLORS.cardOrange,
    iconColor: COLORS.textOrange,
    mainValue: `pH ${formatNumber(data.averagePh, 1)}`,
    label: 'Prumerne pH pudy',
    subtext: `Celkem ${data.totalParcelsCount} pozemku`
  })
  
  currentY += cardHeight + 10

  // ==========================================================================
  // 4. MAIN TABLE
  // ==========================================================================
  
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('Detailni rozpad ztrat podle pozemku', PAGE.marginLeft, currentY)
  
  currentY += 5

  // Prepare table data
  const tableHeaders = [[
    'Kod',
    'Nazev pozemku',
    'Vymera\n(ha)',
    'Typ\npudy',
    'pH',
    'Cilove\npH',
    'Efektiv.\n(%)',
    'Ztrata\n(Kc/ha/rok)',
    'Ztrata\ncelkem (Kc)',
    'Vapneni\n(Kc)',
    'Navrat.\n(mes.)'
  ]]

  const tableRows = data.parcels.map(p => [
    p.kod || '-',
    p.nazev,
    formatNumber(p.vymeraHa, 2),
    getSoilTypeLabel(p.typPudy),
    formatNumber(p.aktualnePh, 1),
    formatNumber(p.cilovePh, 1),
    formatNumber(p.efektivita * 100, 0),
    formatNumber(p.ztrataKcHaRok, 0),
    formatNumber(p.ztrataCelkem, 0),
    formatNumber(p.nakladyVapneni, 0),
    p.navratnostMesice.toString()
  ])

  autoTable(doc, {
    startY: currentY,
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
      0: { halign: 'left', cellWidth: 18 },
      1: { halign: 'left', cellWidth: 45 },
      2: { halign: 'right', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'right', cellWidth: 20 },
      8: { halign: 'right', cellWidth: 25 },
      9: { halign: 'right', cellWidth: 22 },
      10: { halign: 'center', cellWidth: 15 },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    // Color-code critical pH values
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const pH = parseFloat(data.cell.text[0].replace(',', '.'))
        if (pH < 5.0) {
          data.cell.styles.textColor = COLORS.textRed
          data.cell.styles.fontStyle = 'bold'
        } else if (pH < 5.5) {
          data.cell.styles.textColor = COLORS.textOrange
          data.cell.styles.fontStyle = 'bold'
        }
      }
    }
    // Logo is ONLY on first page - removed from didDrawPage callback
  })

  // ==========================================================================
  // 5. METHODOLOGY SECTION
  // ==========================================================================
  
  const finalY = (doc as any).lastAutoTable.finalY

  // Add new page for methodology (WITHOUT logo - only on first page)
  doc.addPage()
  
  currentY = 25

  // Section header
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text('O METODICE VYPOCTU', PAGE.marginLeft, currentY)
  
  doc.setDrawColor(COLORS.primary)
  doc.setLineWidth(0.5)
  doc.line(PAGE.marginLeft, currentY + 2, PAGE.width - PAGE.marginRight, currentY + 2)
  
  currentY += 10

  // Methodology content
  addMethodologyContent(doc, currentY)

  // ==========================================================================
  // 6. FOOTERS (ALL PAGES)
  // ==========================================================================
  
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Separator line
    doc.setDrawColor(COLORS.border)
    doc.setLineWidth(0.1)
    doc.line(PAGE.marginLeft, 195, PAGE.width - PAGE.marginRight, 195)
    
    // Footer text
    doc.setFontSize(FONTS.small)
    doc.setTextColor(COLORS.gray)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'Vygenerovano systemem Demon Agro Portal - Kalkulacka ekonomickych ztrat',
      PAGE.width / 2,
      199,
      { align: 'center' }
    )
    
    // Page number
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Strana ${i} z ${pageCount}`,
      PAGE.width - PAGE.marginRight,
      199,
      { align: 'right' }
    )
  }

  // ==========================================================================
  // 7. SAVE PDF
  // ==========================================================================
  
  const fileName = `kalkulace-ztrat-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
  
  console.log(`✅ PDF export completed: ${fileName}`)
}

// ============================================================================
// HELPER FUNCTIONS - DRAWING
// ============================================================================

interface DashboardCardOptions {
  x: number
  y: number
  width: number
  height: number
  bgColor: { r: number; g: number; b: number }
  iconColor: string
  mainValue: string
  label: string
  subtext: string
}

/**
 * Draw a dashboard card (native jsPDF rendering)
 */
function drawDashboardCard(doc: jsPDF, options: DashboardCardOptions): void {
  const { x, y, width, height, bgColor, iconColor, mainValue, label, subtext } = options
  
  // Card background
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
  doc.roundedRect(x, y, width, height, 2, 2, 'FD')
  
  // Label (top)
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.gray)
  doc.setFont('helvetica', 'normal')
  doc.text(label, x + 3, y + 5)
  
  // Main value (center - BIG & BOLD)
  doc.setFontSize(FONTS.heading)
  doc.setTextColor(iconColor)
  doc.setFont('helvetica', 'bold')
  doc.text(mainValue, x + 3, y + 13)
  
  // Subtext (bottom)
  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.gray)
  doc.setFont('helvetica', 'normal')
  doc.text(subtext, x + 3, y + 18)
}

/**
 * Get soil type label
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
 * Add methodology content to page
 */
function addMethodologyContent(doc: jsPDF, startY: number): void {
  let currentY = startY

  // Scientific sources
  doc.setFontSize(FONTS.subheading)
  doc.setTextColor(COLORS.primaryDark)
  doc.setFont('helvetica', 'bold')
  doc.text('Vedecke zdroje a studie', PAGE.marginLeft, currentY)
  
  currentY += 6

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

  doc.setFontSize(FONTS.small)
  doc.setTextColor(COLORS.darkGray)
  
  sources.forEach(source => {
    doc.setFont('helvetica', 'bold')
    doc.text(source.title, PAGE.marginLeft + 2, currentY)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(source.text, PAGE.contentWidth - 4)
    doc.text(lines, PAGE.marginLeft + 2, currentY + 3.5)
    currentY += 3.5 + (lines.length * 3.5)
  })

  currentY += 3

  // Key calculations
  const sections = [
    {
      number: '1.',
      title: 'Efektivita hnojiv',
      items: [
        'pH 4.0-4.5: Pouze 20-29% efektivita (Al3+ toxicita nici koreny)',
        'pH 5.0: 46% efektivita (fosfor fixovan na Al/Fe slouceniny)',
        'pH 5.5: 67% efektivita (AHDB: "32% hnojiv propada")',
        'pH 6.0: 80% efektivita (temer optimalni)',
        'pH 6.5-7.0: 100% efektivita (optimum pro vetsinu plodin)'
      ]
    },
    {
      number: '2.',
      title: 'Ztrata vynosu',
      items: [
        'Toxicita hliniku (Al3+): Nici korenove vlaseni, omezuje prijem vody',
        'Deficit zivin: Fosfor, molybden a vapnik jsou nedostupne',
        'Naruseni mikrobialni aktivity: Nizsi mineralizace organicke hmoty'
      ]
    }
  ]

  sections.forEach(section => {
    doc.setFontSize(FONTS.subheading)
    doc.setTextColor(COLORS.primaryDark)
    doc.setFont('helvetica', 'bold')
    doc.text(`${section.number} ${section.title}`, PAGE.marginLeft, currentY)
    
    currentY += 5

    doc.setFontSize(FONTS.small)
    doc.setTextColor(COLORS.darkGray)
    doc.setFont('helvetica', 'normal')
    
    section.items.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, PAGE.contentWidth - 4)
      doc.text(lines, PAGE.marginLeft + 2, currentY)
      currentY += lines.length * 3.5
    })

    currentY += 2
  })
}

