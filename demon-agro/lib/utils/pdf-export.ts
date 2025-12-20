import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Generování PDF s plánem hnojení
 */
export function generateFertilizationPlanPDF(data: any) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Plán hnojení', 14, 20)

  doc.setFontSize(11)
  doc.text(`Pozemek: ${data.fieldName}`, 14, 30)
  doc.text(`Datum: ${new Date().toLocaleDateString('cs-CZ')}`, 14, 37)

  autoTable(doc, {
    startY: 45,
    head: [['Živina', 'Aktuální stav', 'Potřeba', 'Produkt', 'Dávka']],
    body: data.rows || [],
  })

  return doc
}

/**
 * Generování PDF s plánem vápnění
 */
export function generateLimingPlanPDF(data: any) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Plán vápnění', 14, 20)

  doc.setFontSize(11)
  doc.text(`Pozemek: ${data.fieldName}`, 14, 30)
  doc.text(`Datum: ${new Date().toLocaleDateString('cs-CZ')}`, 14, 37)

  autoTable(doc, {
    startY: 45,
    head: [['Parametr', 'Hodnota']],
    body: data.rows || [],
  })

  return doc
}

/**
 * Stažení PDF souboru
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}
