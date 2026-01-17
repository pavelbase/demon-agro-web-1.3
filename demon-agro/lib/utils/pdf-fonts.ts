/**
 * PDF FONT LOADER - ROBOTO WITH CZECH CHARACTER SUPPORT
 * ======================================================
 * 
 * This module provides helpers to load custom fonts into jsPDF
 * with full support for Czech diacritics (ěščřžýáíéúůďťň).
 * 
 * @version 1.0
 * @date 2026-01-04
 */

import type { jsPDF } from 'jspdf'

/**
 * Load Roboto font from Google Fonts and add to jsPDF document
 * 
 * This function fetches the Roboto-Regular font from Google Fonts CDN
 * and adds it to the jsPDF document. The font includes full Latin Extended
 * character set with Czech diacritics.
 * 
 * @param doc - jsPDF document instance
 * @returns Promise<boolean> - true if font loaded successfully, false otherwise
 * 
 * @example
 * ```typescript
 * const doc = new jsPDF()
 * const loaded = await loadRobotoFont(doc)
 * 
 * if (loaded) {
 *   doc.setFont('Roboto')
 *   doc.text('Dobrý den! ěščřžýáíé', 10, 10)
 * } else {
 *   console.warn('Using default font')
 * }
 * ```
 */
export async function loadRobotoFont(doc: any): Promise<boolean> {
  try {
    // Method 1: Try to load from Google Fonts (production-ready)
    const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff'
    
    const response = await fetch(fontUrl)
    if (!response.ok) {
      console.warn('⚠️ Failed to fetch Roboto font from Google Fonts')
      return false
    }

    const fontBlob = await response.blob()
    const fontBase64 = await blobToBase64(fontBlob)
    
    // Remove data URL prefix if present
    const base64Data = fontBase64.split(',')[1] || fontBase64

    // Add font to jsPDF
    doc.addFileToVFS('Roboto-Regular.ttf', base64Data)
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
    
    console.log('✅ Roboto font loaded successfully')
    return true

  } catch (error) {
    console.error('❌ Error loading Roboto font:', error)
    return false
  }
}

/**
 * Load Roboto Bold font
 */
export async function loadRobotoBoldFont(doc: any): Promise<boolean> {
  try {
    const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff'
    
    const response = await fetch(fontUrl)
    if (!response.ok) return false

    const fontBlob = await response.blob()
    const fontBase64 = await blobToBase64(fontBlob)
    const base64Data = fontBase64.split(',')[1] || fontBase64

    doc.addFileToVFS('Roboto-Bold.ttf', base64Data)
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
    
    console.log('✅ Roboto Bold font loaded successfully')
    return true

  } catch (error) {
    console.error('❌ Error loading Roboto Bold font:', error)
    return false
  }
}

/**
 * Load both Roboto regular and bold fonts
 */
export async function loadRobotoFonts(doc: any): Promise<{
  regular: boolean
  bold: boolean
}> {
  const [regular, bold] = await Promise.all([
    loadRobotoFont(doc),
    loadRobotoBoldFont(doc)
  ])

  return { regular, bold }
}

/**
 * Helper: Convert Blob to Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Alternative: Load font from local file (if font file is bundled)
 * 
 * @param doc - jsPDF document
 * @param fontPath - Path to .ttf file in public folder (e.g., '/fonts/Roboto-Regular.ttf')
 * @param fontName - Name to register font as (e.g., 'Roboto')
 * @param fontStyle - Font style: 'normal' or 'bold'
 */
export async function loadCustomFont(
  doc: any,
  fontPath: string,
  fontName: string,
  fontStyle: 'normal' | 'bold' = 'normal'
): Promise<boolean> {
  try {
    const response = await fetch(fontPath)
    if (!response.ok) {
      console.warn(`⚠️ Failed to load font from ${fontPath}`)
      return false
    }

    const fontBlob = await response.blob()
    const fontBase64 = await blobToBase64(fontBlob)
    const base64Data = fontBase64.split(',')[1] || fontBase64

    const vfsFileName = `${fontName}-${fontStyle}.ttf`
    doc.addFileToVFS(vfsFileName, base64Data)
    doc.addFont(vfsFileName, fontName, fontStyle)
    
    console.log(`✅ ${fontName} ${fontStyle} font loaded from ${fontPath}`)
    return true

  } catch (error) {
    console.error(`❌ Error loading font from ${fontPath}:`, error)
    return false
  }
}

/**
 * Test if a font supports Czech characters
 * 
 * @param doc - jsPDF document
 * @param fontName - Font name to test
 * @returns boolean - true if font likely supports Czech characters
 */
export function testCzechCharacterSupport(doc: any, fontName: string): boolean {
  try {
    doc.setFont(fontName)
    
    // Try to render Czech test string
    const testString = 'ěščřžýáíéúůďťň ĚŠČŘŽÝÁÍÉÚŮĎŤŇ'
    const width = doc.getTextWidth(testString)
    
    // If width is reasonable, font probably supports these characters
    // (Width of 0 or very large width indicates missing glyphs)
    return width > 0 && width < 1000

  } catch (error) {
    console.error('Error testing Czech character support:', error)
    return false
  }
}

/**
 * Get fallback font if custom font fails to load
 */
export function getFallbackFont(): string {
  // Helvetica is default but doesn't support Czech
  // Return 'helvetica' and warn user
  console.warn('⚠️ Using fallback font. Czech characters may not display correctly.')
  console.warn('⚠️ Consider bundling Roboto font in your application.')
  return 'helvetica'
}

/**
 * RECOMMENDED SETUP FOR PRODUCTION:
 * 
 * 1. Download Roboto fonts from Google Fonts:
 *    https://fonts.google.com/specimen/Roboto
 * 
 * 2. Place .ttf files in public/fonts/:
 *    - public/fonts/Roboto-Regular.ttf
 *    - public/fonts/Roboto-Bold.ttf
 * 
 * 3. Use loadCustomFont() instead of loadRobotoFont():
 *    ```typescript
 *    await loadCustomFont(doc, '/fonts/Roboto-Regular.ttf', 'Roboto', 'normal')
 *    await loadCustomFont(doc, '/fonts/Roboto-Bold.ttf', 'Roboto', 'bold')
 *    ```
 * 
 * 4. This avoids external CDN dependency and improves offline support.
 */




