/**
 * IMPORT ČÍSELNÍKU HNOJIV (OBSAHY ŽIVIN)
 *
 * Registr hnojiv ÚKZÚZ obsah živin neuvádí, evidence hnojení ho ale potřebuje.
 * Skript naplní tabulku fert_nutrients z číselníku hnojiv (export z eAGRI) –
 * včetně normativů statkových hnojiv a rostlinných zbytků, které registrační
 * číslo nemají, ale do evidence se zapisují.
 *
 * POUŽITÍ:
 *   npx tsx scripts/import-fertilizer-nutrients.ts "c:\\cesta\\CiselnikHnojiv.xlsx"
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as XLSX from 'xlsx'
import { normalizeFertilizerName } from '../lib/utils/fertilizer-nutrients'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const file = process.argv[2]

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local')
  process.exit(1)
}
if (!file) {
  console.error('❌ Použití: npx tsx scripts/import-fertilizer-nutrients.ts <cesta k xlsx>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed === '' ? null : trimmed
}

function date(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

function bool(value: unknown): boolean {
  return String(value ?? '').trim().toLowerCase() === 'ano'
}

async function main() {
  console.log(`📄 Načítám ${path.basename(file)}`)

  const workbook = XLSX.readFile(file, { cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })

  const records = []
  let withoutCatalogId = 0

  for (const row of rows) {
    const catalogId = num(row['Identifikátor hnojiva'])
    const name = text(row['Název hnojiva'])

    if (catalogId === null || !name) {
      withoutCatalogId += 1
      continue
    }

    const evidenceNumber = text(row['Evidenční číslo hnojiva'])

    records.push({
      catalog_id: catalogId,
      evidence_number: evidenceNumber,
      registration_number: text(row['Reg. číslo dle ÚKZÚZ']),
      name,
      name_key: normalizeFertilizerName(name),
      catalog_type: text(row['Typ číselníku']),
      nitrogen_category: text(row['Kategorie N']),
      product_kind: text(row['Druh hnojiva']),
      unit_type: text(row['Typ obvyklé MJ']) === 'O' ? 'O' : text(row['Typ obvyklé MJ']) === 'H' ? 'H' : null,
      // Normativy statkových hnojiv a rostlinných zbytků evidenční číslo nemají
      is_normative: evidenceNumber === null,
      is_excrement: bool(row['Výkaly']),
      is_organic: bool(row['Organické hnojivo']),
      valid_from: date(row['Platnost od']),
      valid_until: date(row['Platnost do']),
      n_percent: num(row['N']),
      p2o5_percent: num(row['P2O5']),
      k2o_percent: num(row['K2O']),
      cao_percent: num(row['CaO']),
      mgo_percent: num(row['MgO']),
      na2o_percent: num(row['Na2O']),
      s_percent: num(row['S']),
      cl_percent: num(row['Cl']),
      zn_percent: num(row['Zn']),
      cu_percent: num(row['Cu']),
      fe_percent: num(row['Fe']),
      b_percent: num(row['B']),
      mn_percent: num(row['Mn']),
      mo_percent: num(row['Mo']),
      se_percent: num(row['Se']),
      combustible_matter_percent: num(row['Spalit. látky']),
      trace_elements: text(row['Stop. prvky']),
      density_kg_l: num(row['Měrná hmot.']),
    })
  }

  console.log(`   řádků: ${rows.length}, k importu: ${records.length}`)
  if (withoutCatalogId > 0) {
    console.log(`   bez identifikátoru nebo názvu (přeskočeno): ${withoutCatalogId}`)
  }

  const batchSize = 500
  let imported = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { error } = await supabase
      .from('fert_nutrients')
      .upsert(batch, { onConflict: 'catalog_id' })

    if (error) {
      console.error(`❌ Chyba při importu dávky ${i / batchSize + 1}:`, error.message)
      process.exit(1)
    }

    imported += batch.length
    console.log(`   ✓ ${imported}/${records.length}`)
  }

  const normative = records.filter((record) => record.is_normative).length
  const withN = records.filter((record) => record.n_percent !== null).length

  console.log('\n=== SOUHRN ===')
  console.log(`  naimportováno: ${imported}`)
  console.log(`  normativy statkových hnojiv a zbytků: ${normative}`)
  console.log(`  s obsahem N: ${withN}`)
  console.log(`  s měrnou hmotností: ${records.filter((r) => r.density_kg_l !== null).length}`)
  console.log('\n✅ Číselník hnojiv naimportován')
}

main().catch((error) => {
  console.error('❌ Import selhal:', error)
  process.exit(1)
})
