/**
 * PROZKOUMÁNÍ ČÍSELNÍKU HNOJIV
 *
 * Zjistí, co číselník o obsahu živin nese, a jak se dá spárovat s registrem
 * hnojiv v databázi (fert_products) a s hnojivy použitými v evidenci.
 *
 * POUŽITÍ:
 *   npx tsx scripts/inspect-fertilizer-catalog.ts "c:\\cesta\\CiselnikHnojiv.xlsx"
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as XLSX from 'xlsx'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const file = process.argv[2]

if (!file) {
  console.error('❌ Použití: npx tsx scripts/inspect-fertilizer-catalog.ts <cesta k xlsx>')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

interface CatalogRow {
  evidenceNumber: string
  registrationNumber: string | null
  name: string
  catalogType: string | null
  nitrogenCategory: string | null
  productKind: string | null
  unitType: string | null
  validFrom: string | null
  validUntil: string | null
  n: number | null
  p2o5: number | null
  k2o: number | null
  density: number | null
}

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

function main() {
  const workbook = XLSX.readFile(file, { cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })

  console.log(`Řádků: ${raw.length}`)
  console.log(`Sloupce: ${Object.keys(raw[0] ?? {}).join(' | ')}\n`)

  const rows: CatalogRow[] = raw.map((row) => ({
    evidenceNumber: String(row['Evidenční číslo hnojiva'] ?? '').trim(),
    registrationNumber: text(row['Reg. číslo dle ÚKZÚZ']),
    name: String(row['Název hnojiva'] ?? '').trim(),
    catalogType: text(row['Typ číselníku']),
    nitrogenCategory: text(row['Kategorie N']),
    productKind: text(row['Druh hnojiva']),
    unitType: text(row['Typ obvyklé MJ']),
    validFrom: text(row['Platnost od']),
    validUntil: text(row['Platnost do']),
    n: num(row['N']),
    p2o5: num(row['P2O5']),
    k2o: num(row['K2O']),
    density: num(row['Měrná hmot.']),
  }))

  const withN = rows.filter((row) => row.n !== null)
  const withNpk = rows.filter((row) => row.n !== null || row.p2o5 !== null || row.k2o !== null)

  console.log('=== POKRYTÍ ===')
  console.log(`  má N: ${withN.length}`)
  console.log(`  má N, P2O5 nebo K2O: ${withNpk.length}`)
  console.log(`  má měrnou hmotnost: ${rows.filter((row) => row.density !== null).length}`)
  console.log(`  bez evidenčního čísla: ${rows.filter((row) => !row.evidenceNumber).length}`)

  const byEvidence = new Map<string, CatalogRow[]>()
  for (const row of rows) {
    const list = byEvidence.get(row.evidenceNumber) ?? []
    list.push(row)
    byEvidence.set(row.evidenceNumber, list)
  }
  const duplicates = Array.from(byEvidence.entries()).filter(([, list]) => list.length > 1)
  console.log(`  unikátních evidenčních čísel: ${byEvidence.size}, duplicit: ${duplicates.length}`)
  if (duplicates.length > 0) {
    console.log(
      `    např. ${duplicates
        .slice(0, 3)
        .map(([key, list]) => `${key} (${list.length}×: ${list.map((r) => r.name).join(' / ')})`)
        .join(', ')}`
    )
  }

  console.log('\n=== TYP OBVYKLÉ MJ ===')
  const unitTypes = new Map<string, number>()
  for (const row of rows) {
    const key = row.unitType ?? '(prázdné)'
    unitTypes.set(key, (unitTypes.get(key) ?? 0) + 1)
  }
  for (const [key, count] of unitTypes) console.log(`  ${key}: ${count}`)

  console.log('\n=== KATEGORIE N ===')
  const categories = new Map<string, number>()
  for (const row of rows) {
    const key = row.nitrogenCategory ?? '(prázdné)'
    categories.set(key, (categories.get(key) ?? 0) + 1)
  }
  for (const [key, count] of categories) console.log(`  ${key}: ${count}`)

  console.log('\n=== UKÁZKY ZNÁMÝCH HNOJIV ===')
  for (const needle of ['DAM 390', 'Močovina', 'StabilureN', 'LOVOFERT', 'Amofos', 'kejda']) {
    const found = rows.filter((row) => row.name.toLowerCase().includes(needle.toLowerCase()))
    console.log(`  „${needle}": ${found.length} shod`)
    for (const row of found.slice(0, 3)) {
      console.log(
        `    ${row.evidenceNumber.padEnd(8)} ${row.name.slice(0, 40).padEnd(42)} N=${row.n ?? '-'} P2O5=${row.p2o5 ?? '-'} K2O=${row.k2o ?? '-'} MJ=${row.unitType ?? '-'} hmot=${row.density ?? '-'}`
      )
    }
  }

  return rows
}

async function compareWithDatabase(rows: CatalogRow[]) {
  // Evidenční čísla z registru hnojiv (stránkovaně, tabulka má tisíce řádků)
  const dbEvidence = new Set<string>()
  const dbNames = new Map<string, string>()
  let from = 0

  for (;;) {
    const { data, error } = await supabase
      .from('fert_products')
      .select('evidence_number, name')
      .range(from, from + 999)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const row of data) {
      dbEvidence.add(row.evidence_number)
      dbNames.set(row.name.toLowerCase(), row.evidence_number)
    }

    if (data.length < 1000) break
    from += 1000
  }

  const catalogEvidence = new Set(rows.map((row) => row.evidenceNumber).filter(Boolean))
  const matched = Array.from(catalogEvidence).filter((code) => dbEvidence.has(code))

  console.log('\n=== POROVNÁNÍ S REGISTREM V DATABÁZI ===')
  console.log(`  hnojiv v databázi: ${dbEvidence.size}`)
  console.log(`  evidenčních čísel v číselníku: ${catalogEvidence.size}`)
  console.log(`  shoda podle evidenčního čísla: ${matched.length}`)

  const catalogByName = new Map<string, CatalogRow>()
  for (const row of rows) {
    if (!catalogByName.has(row.name.toLowerCase())) catalogByName.set(row.name.toLowerCase(), row)
  }

  // Hnojiva použitá v evidenci uživatele
  const { data: items, error } = await supabase
    .from('application_items')
    .select('product_name, fert_evidence_number, unit, dose')
    .eq('kind', 'hnojivo')

  if (error) throw error

  const usage = new Map<string, { count: number; evidenceNumber: string | null; unit: string }>()
  for (const item of items ?? []) {
    const entry = usage.get(item.product_name) ?? {
      count: 0,
      evidenceNumber: item.fert_evidence_number,
      unit: item.unit,
    }
    entry.count += 1
    usage.set(item.product_name, entry)
  }

  console.log('\n=== HNOJIVA V EVIDENCI vs. ČÍSELNÍK ===')
  for (const [name, entry] of Array.from(usage.entries()).sort((a, b) => b[1].count - a[1].count)) {
    const viaEvidence = entry.evidenceNumber
      ? rows.find((row) => row.evidenceNumber === entry.evidenceNumber)
      : undefined
    const viaName = catalogByName.get(name.toLowerCase())
    const source = viaEvidence ?? viaName
    console.log(
      `  ${String(entry.count).padStart(3)}× ${name.slice(0, 32).padEnd(34)} ev.č.=${
        entry.evidenceNumber ?? '—'
      } ${
        source
          ? `→ N=${source.n ?? '-'} P2O5=${source.p2o5 ?? '-'} K2O=${source.k2o ?? '-'} hmot=${source.density ?? '-'} ${
              viaEvidence ? '(podle ev. čísla)' : '(podle názvu)'
            }`
          : '→ v číselníku nenalezeno'
      }`
    )
  }
}

const rows = main()
compareWithDatabase(rows).catch((error) => {
  console.error(error)
  process.exit(1)
})
