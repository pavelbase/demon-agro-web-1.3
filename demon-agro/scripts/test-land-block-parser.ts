/**
 * Ověření parseru sestavy DPB na reálném exportu z LPIS.
 * Spuštění: npx tsx scripts/test-land-block-parser.ts <cesta k xls>
 */

import * as XLSX from 'xlsx'
import { parseLandBlocksSheet, type SheetRow } from '../lib/utils/land-block-parser'

const file = process.argv[2]
if (!file) {
  console.error('Použití: npx tsx scripts/test-land-block-parser.ts <cesta k xls>')
  process.exit(1)
}

const workbook = XLSX.readFile(file, { cellDates: true })
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
  header: 1,
  defval: null,
  blankrows: false,
})

const result = parseLandBlocksSheet(rows)

console.log('Načteno DPB:', result.rows.length)
console.log('Chybné řádky:', result.errors.length, result.errors.slice(0, 5))
console.log('Chybějící sloupce:', result.missingColumns)
console.log('Nerozpoznané sloupce:', result.unknownColumns)

const totalArea = result.rows.reduce((sum, row) => sum + row.area, 0)
console.log('Celková výměra:', totalArea.toFixed(2), 'ha')
console.log('Ve zranitelné oblasti:', result.rows.filter((r) => r.nitrate_vulnerable_zone).length)
console.log(
  'Erozně ohrožené:',
  result.rows.filter((r) => r.erosion_class && r.erosion_class !== 'NEO').length
)
console.log('Kultury:', [...new Set(result.rows.map((r) => r.culture))])
console.log('Aplikační pásma:', [...new Set(result.rows.map((r) => r.application_zone))])
console.log('Druhy půdy → typ:', [
  ...new Set(result.rows.map((r) => `${r.soil_kind}=${r.soil_type}`)),
])

console.log('\nUkázka prvních 3 záznamů:')
console.log(JSON.stringify(result.rows.slice(0, 3), null, 2))
