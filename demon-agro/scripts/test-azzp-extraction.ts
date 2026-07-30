/**
 * Regresní test přesnosti AI extrakce rozborů půdy z PDF.
 *
 * Volá stejný model a stejný prompt jako produkční API (sdílený modul
 * lib/utils/soil-extraction.ts), takže test nemůže "utéct" od reality.
 * Neprochází přes Supabase ani auth - testuje jen extrakci a normalizaci.
 *
 * Spuštění:
 *   npx tsx scripts/test-azzp-extraction.ts "cesta/k/rozboru.pdf" [--json soubor.json]
 *
 * Volitelný --json uloží výstup ve tvaru odpovědi API (pro test UI validace).
 */
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import {
  EXTRACTION_PROMPT,
  GEMINI_MODEL,
  buildValidationWarnings,
  cleanJsonString,
  normalizeData,
  validateExtractedData,
} from '../lib/utils/soil-extraction'

dotenv.config({ path: '.env.local' })

async function main() {
  const pdfPath = process.argv[2]
  const jsonFlagIndex = process.argv.indexOf('--json')
  const jsonOutPath = jsonFlagIndex > -1 ? process.argv[jsonFlagIndex + 1] : null

  if (!pdfPath) {
    console.error('Použití: npx tsx scripts/test-azzp-extraction.ts "cesta/k/rozboru.pdf" [--json soubor.json]')
    process.exit(1)
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY není nastaven v .env.local')
    process.exit(1)
  }

  console.log(`📄 PDF: ${pdfPath}`)
  const base64Pdf = fs.readFileSync(pdfPath).toString('base64')

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
  })

  console.log(`🤖 Volám ${GEMINI_MODEL}...`)
  const result = await model.generateContent([
    { inlineData: { data: base64Pdf, mimeType: 'application/pdf' } },
    { text: EXTRACTION_PROMPT },
  ])

  const rawData = JSON.parse(cleanJsonString(result.response.text()))
  const analyses = normalizeData(rawData)
  validateExtractedData(analyses)
  const warnings = [...(rawData.validation_notes ?? []), ...buildValidationWarnings(analyses)]

  console.log(`\n📊 Laboratoř: ${rawData.laboratory ?? '-'}`)
  console.log(`📊 Typ dokumentu: ${rawData.document_type ?? '-'}`)
  console.log(`📊 Spolehlivost dle AI: ${rawData.confidence ?? '-'}`)
  console.log(`📊 Počet vzorků: ${analyses.length}\n`)

  console.log('=== VZORKY ===')
  const cultureCounts: Record<string, number> = {}
  for (const s of analyses) {
    const culture = String(s.culture)
    cultureCounts[culture] = (cultureCounts[culture] || 0) + 1
    console.log(
      `${(s.parcel_code || '?').padEnd(10)} | ${culture.padEnd(10)} (raw: "${s.culture_raw}") | ` +
        `${s.soil_type ?? '?'} | pH=${s.ph} P=${s.phosphorus} K=${s.potassium} Mg=${s.magnesium} Ca=${s.calcium} S=${s.sulfur}`
    )
  }

  console.log('\n=== SOUHRN KULTUR ===')
  for (const [culture, count] of Object.entries(cultureCounts)) {
    console.log(`${culture.padEnd(12)}: ${count}×`)
  }

  console.log(`\n=== VAROVÁNÍ (${warnings.length}) ===`)
  warnings.forEach((w) => console.log(w))
  if (warnings.length === 0) console.log('Žádná - všechny kontroly prošly.')

  const unrecognized = analyses.filter((s) => s.culture === null).length
  console.log(`\n${unrecognized === 0 ? '✅' : '❌'} Nerozpoznaných kultur: ${unrecognized}/${analyses.length}`)

  if (jsonOutPath) {
    const apiShape = {
      analyses,
      pdfUrl: 'https://example.invalid/test.pdf',
      laboratory: rawData.laboratory ?? null,
      document_type: rawData.document_type ?? null,
      document_date: rawData.document_date ?? null,
      confidence: warnings.length > 0 && rawData.confidence === 'high' ? 'medium' : (rawData.confidence ?? 'medium'),
      validationErrors: warnings,
    }
    fs.writeFileSync(jsonOutPath, JSON.stringify(apiShape), 'utf-8')
    console.log(`\n💾 Uloženo do ${jsonOutPath}`)
  }
}

main().catch((err) => {
  console.error('💥 Chyba:', err)
  process.exit(1)
})
