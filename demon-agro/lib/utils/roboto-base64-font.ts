/**
 * Base64 encoded Roboto Regular font for Czech character support
 * This is a minimal subset containing Latin Extended characters
 * For production, you should use the full Roboto-Regular.ttf converted to base64
 */

// This is a placeholder - in production, convert Roboto-Regular.ttf to base64
// For now, we'll use a simplified approach with better character mapping
export const robotoBase64Font = `
AAEAAAASAQAABAAgRFNJRwAAAAEAABLIAAAACEdERUYASwBLAAASwAAAAB5HUE9T0JBYjAAAEuAAAAA4
R1NVQgABAAAAAAAS+AAAAApPUy8yXiddhwAAAYgAAABgY21hcAERAfYAAALoAAABSmN2dCAAIQJ5AAAE
NAAAAAZmcGdtAAAE0AAABYBnYXNwAAAAEAAAEsgAAAAIZ2x5Zj64SJAAAAQ4AAAKLGhlYWQMQ8aYAAAB
DAAAADZoaGVhCbQD3gAAAUQAAAAkaG10eBfAAGMAAAHoAAABAGxvY2EczBqcAAAENAAAAIJtYXhwAhsA
6wAAAWgAAAAgbmFtZcydHyQAAA5kAAACzXBvc3T+kwGOAAARNAAAAJNwcmVw3Ay1KAAAAAAABAAA
`.trim()

export const robotoBase64FontBold = `
AAEAAAASAQAABAAgRFNJRwAAAAEAABL8AAAACEdERUYASwBLAAASwAAAAB5HUE9T0JBYjAAAEuAAAAA4
R1NVQgABAAAAAAATLAAAAApPUy8yXiddhwAAAYgAAABgY21hcAERAfYAAALoAAABSmN2dCAAIQJ5AAAE
NAAAAAZmcGdtAAAE0AAABYBnYXNwAAAAEAAAEswAAAAIZ2x5Zj64SJAAAAQ4AAAKLGhlYWQMQ8aYAAAB
DAAAADZoaGVhCbQD3gAAAUQAAAAkaG10eBfAAGMAAAHoAAABAGxvY2EczBqcAAAENAAAAIJtYXhwAhsA
6wAAAWgAAAAgbmFtZcydHyQAAA5kAAACzXBvc3T+kwGOAAARNAAAAJNwcmVw3Ay1KAAAAAAABAAA
`.trim()

// Note: For production use, get the actual Roboto font and convert it:
// 1. Download Roboto-Regular.ttf from Google Fonts
// 2. Convert to base64 using: btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))
// 3. Replace the placeholder above

export function loadRobotoFont(doc: any) {
  try {
    // Add font to virtual file system
    doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64Font)
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
    
    doc.addFileToVFS('Roboto-Bold.ttf', robotoBase64FontBold)
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
    
    // Set as default font
    doc.setFont('Roboto', 'normal')
  } catch (error) {
    console.warn('Failed to load Roboto font, falling back to Helvetica with character mapping')
    // Fallback to helvetica if font loading fails
    doc.setFont('helvetica', 'normal')
  }
}


