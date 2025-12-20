import * as XLSX from 'xlsx'

/**
 * Export dat do Excel souboru
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

/**
 * Export více listů do jednoho Excel souboru
 */
export function exportMultiSheetExcel(
  sheets: Array<{ name: string; data: any[] }>,
  filename: string
) {
  const workbook = XLSX.utils.book_new()

  sheets.forEach(({ name, data }) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, name)
  })

  XLSX.writeFile(workbook, filename)
}

/**
 * Vytvoření Excel souboru s formátováním
 */
export function createFormattedExcel(
  data: any[],
  headers: string[],
  filename: string
) {
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, filename)
}
