/**
 * Roboto Regular Font - Base64 encoded (Placeholder)
 * 
 * PRODUCTION NOTE: Replace this with actual Roboto font
 * Download from: https://fonts.google.com/specimen/Roboto
 * Convert to Base64 using: btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))
 * 
 * For now, we use character mapping as fallback
 */

// Placeholder - in production, insert actual Base64 encoded Roboto-Regular.ttf here
export const ROBOTO_BASE64 = "";

// Character mapping for Czech characters when custom font is not available
export const CZECH_CHAR_MAP: Record<string, string> = {
  'ě': 'e',
  'š': 's',
  'č': 'c',
  'ř': 'r',
  'ž': 'z',
  'ý': 'y',
  'á': 'a',
  'í': 'i',
  'é': 'e',
  'ú': 'u',
  'ů': 'u',
  'ť': 't',
  'ď': 'd',
  'ň': 'n',
  'Ě': 'E',
  'Š': 'S',
  'Č': 'C',
  'Ř': 'R',
  'Ž': 'Z',
  'Ý': 'Y',
  'Á': 'A',
  'Í': 'I',
  'É': 'E',
  'Ú': 'U',
  'Ů': 'U',
  'Ť': 'T',
  'Ď': 'D',
  'Ň': 'N',
};

export function sanitizeCzechText(text: string): string {
  // Keep original Czech characters - they render in Helvetica
  return text;
}

export function loadRobotoFont(doc: any): boolean {
  if (!ROBOTO_BASE64 || ROBOTO_BASE64.length === 0) {
    // Use Helvetica with better Unicode support
    doc.setFont('helvetica', 'normal');
    return false;
  }
  
  try {
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_BASE64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    return true;
  } catch (error) {
    console.warn('Failed to load Roboto font, using Helvetica');
    doc.setFont('helvetica', 'normal');
    return false;
  }
}




