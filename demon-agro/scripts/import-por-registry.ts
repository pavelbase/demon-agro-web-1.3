#!/usr/bin/env node
/**
 * Import registru přípravků na ochranu rostlin (POR) z exportu ÚKZÚZ
 *
 * Zdrojový XLSX má 9 listů; importují se tyto (ostatní dva jsou jen jinak
 * seřazené pohledy na stejná data):
 *   Rozhodnutí                     → por_products + por_decisions
 *   Účinné látky                   → por_active_substances
 *   Použití                        → por_usages
 *   Dávkování                      → por_dosages
 *   Údaje                          → por_product_attributes
 *   Plodiny                        → por_crops
 *   Škodlivý organismus vs. Příprav → por_pests
 *
 * Export je vždy úplný snapshot registru, takže se před importem stávající
 * data smažou (mazání por_products kaskáduje do navazujících tabulek).
 *
 * POUŽITÍ:
 *   npx tsx scripts/import-por-registry.ts "C:\\cesta\\POR_2026-07-29.xlsx"
 *
 * Pokud spojení skončí na "unable to verify the first certificate" (v síti je
 * proxy s vlastním certifikátem), spusťte s důvěrou k systémovým certifikátům:
 *   $env:NODE_OPTIONS='--use-system-ca'   (PowerShell)
 */

import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local')
  process.exit(1)
}

const filePath = process.argv[2]
if (!filePath) {
  console.error('❌ Chybí cesta k XLSX souboru.')
  console.error('   npx tsx scripts/import-por-registry.ts "C:\\cesta\\POR_2026-07-29.xlsx"')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

const BATCH_SIZE = 2000

// ---------------------------------------------------------------------------
// Parsovací pomocníky
// ---------------------------------------------------------------------------

type Row = Record<string, any>

function text(value: any): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s === '' ? null : s
}

/** Registr používá formát dd.mm.yyyy */
function date(value: any): string | null {
  const s = text(value)
  if (!s) return null
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!m) return null
  return `${m[3]}-${m[2]}-${m[1]}`
}

function bool(value: any): boolean | null {
  const s = text(value)
  if (!s) return null
  const lower = s.toLowerCase()
  if (lower === 'ano' || lower === 'a') return true
  if (lower === 'ne' || lower === 'n') return false
  return null
}

function int(value: any): number | null {
  const s = text(value)
  if (!s) return null
  const n = Number(s)
  return Number.isInteger(n) ? n : null
}

function num(value: any): number | null {
  const s = text(value)
  if (!s) return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Ochranná lhůta bývá číslo ("30"), číslo s jednotkou ("35 dnů"), ale také
 * nečíselné hodnoty ("AT", "14/21", "100-110", "-"), které necháváme jen textem.
 */
function protectionPeriodDays(value: any): number | null {
  const s = text(value)
  if (!s) return null
  const m = s.match(/^(\d+)(\s*(dn[ůyí]|dní|dny))?$/i)
  return m ? Number(m[1]) : null
}

function uniqueSorted(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort()
}

// ---------------------------------------------------------------------------
// Načtení XLSX
// ---------------------------------------------------------------------------

console.log(`📖 Načítám ${filePath}`)
const workbook = XLSX.readFile(filePath)

function sheet(name: string): Row[] {
  if (!workbook.Sheets[name]) {
    throw new Error(`V souboru chybí list "${name}"`)
  }
  return XLSX.utils.sheet_to_json<Row>(workbook.Sheets[name], { defval: null })
}

const decisionRows = sheet('Rozhodnutí')
console.log(`   list Rozhodnutí: ${decisionRows.length} řádků`)

// ---------------------------------------------------------------------------
// 1. Přípravky (agregace listu Rozhodnutí na "Id položky")
// ---------------------------------------------------------------------------

interface ProductAcc {
  item_id: number
  name: string
  rows: Row[]
}

const productsAcc = new Map<number, ProductAcc>()

for (const r of decisionRows) {
  const itemId = int(r['Id položky'])
  const name = text(r['Obchodní název přípravku'])
  if (itemId === null || !name) continue

  if (!productsAcc.has(itemId)) {
    productsAcc.set(itemId, { item_id: itemId, name, rows: [] })
  }
  productsAcc.get(itemId)!.rows.push(r)
}

/** Nejaktuálnější rozhodnutí = nejnovější právní účinky, při shodě nejvyšší Id */
function pickCurrentDecision(rows: Row[]): Row | null {
  const withDecision = rows.filter((r) => int(r['Id rozhodnutí']) !== null)
  if (withDecision.length === 0) return null

  return withDecision.reduce((best, r) => {
    const bestDate = date(best['Právní účinky rozhodnutí ode dne']) ?? ''
    const rDate = date(r['Právní účinky rozhodnutí ode dne']) ?? ''
    if (rDate > bestDate) return r
    if (rDate < bestDate) return best
    return (int(r['Id rozhodnutí']) ?? 0) > (int(best['Id rozhodnutí']) ?? 0) ? r : best
  })
}

const products = [...productsAcc.values()].map(({ item_id, name, rows }) => {
  const current = pickCurrentDecision(rows)
  const distinctDecisions = new Set(
    rows.map((r) => int(r['Id rozhodnutí'])).filter((v): v is number => v !== null)
  )
  const mainRow = rows.find((r) => int(r['Id hlavního přípravku']) !== null)

  return {
    item_id,
    name,
    main_product_item_id: mainRow ? int(mainRow['Id hlavního přípravku']) : null,
    main_product_name: mainRow ? text(mainRow['Obchodní název hlavního přípravku']) : null,

    registration_number: current ? text(current['Registrační číslo']) : null,
    all_registration_numbers: uniqueSorted(rows.map((r) => text(r['Registrační číslo']))),
    authorization_holder: current ? text(current['Držitel rozhodnutí']) : null,
    biological_function: current ? text(current['Biologická funkce']) : null,
    all_biological_functions: uniqueSorted(rows.map((r) => text(r['Biologická funkce']))),
    registration_status: current ? text(current['Status registrace']) : null,
    decision_status: current ? text(current['Aktuální stav rozhodnutí']) : null,
    product_regime: current ? text(current['Režim výrobku']) : null,
    package_type: current ? text(current['Druh balení']) : text(rows[0]['Druh balení']),
    organic_farming: current ? bool(current['Pro ekologické zemědělství']) : null,
    seed_treatment: current ? bool(current['Moření']) : null,
    renewal_in_progress: current
      ? bool(current['Probíhá řízení o prodloužení platnosti rozhodnutí'])
      : null,

    valid_from: current ? date(current['Právní účinky rozhodnutí ode dne']) : null,
    valid_until: current ? date(current['Platnost rozhodnutí končí dne']) : null,
    market_until: current ? date(current['Ukončení uvádění na trh']) : null,
    use_until: current ? date(current['Používání povoleno max. do']) : null,
    trade_name_until: current ? date(current['Max.platnost obchodního jména do']) : null,

    parallel_import: rows.some(
      (r) => text(r['Účel dovozu']) !== null || text(r['Evidenční číslo SP']) !== null
    ),
    is_authorized: rows.some((r) => text(r['Aktuální stav rozhodnutí']) === 'Platné rozhodnutí'),
    is_discontinued:
      distinctDecisions.size === 0 ||
      rows.every((r) => text(r['Druh balení']) === 'Platnost přípravku ukončena'),
    decisions_count: distinctDecisions.size,
  }
})

console.log(`   → ${products.length} přípravků`)

// ---------------------------------------------------------------------------
// 2. Rozhodnutí (deduplikace na Id položky + Id rozhodnutí)
// ---------------------------------------------------------------------------

const decisionsMap = new Map<string, Row>()

for (const r of decisionRows) {
  const itemId = int(r['Id položky'])
  const decisionId = int(r['Id rozhodnutí'])
  if (itemId === null || decisionId === null) continue

  const key = `${itemId}|${decisionId}`
  const existing = decisionsMap.get(key)
  // Duplicitní řádky se v exportu liší jen odkazem na hlavní přípravek –
  // preferujeme variantu, která ten odkaz obsahuje.
  if (!existing || (int(r['Id hlavního přípravku']) !== null && int(existing['Id hlavního přípravku']) === null)) {
    decisionsMap.set(key, r)
  }
}

const decisions = [...decisionsMap.values()].map((r) => ({
  product_item_id: int(r['Id položky'])!,
  decision_id: int(r['Id rozhodnutí'])!,
  registration_number: text(r['Registrační číslo']),
  authorization_holder: text(r['Držitel rozhodnutí']),
  valid_from: date(r['Právní účinky rozhodnutí ode dne']),
  valid_until: date(r['Platnost rozhodnutí končí dne']),
  market_until: date(r['Ukončení uvádění na trh']),
  use_until: date(r['Používání povoleno max. do']),
  trade_name_until: date(r['Max.platnost obchodního jména do']),
  biological_function: text(r['Biologická funkce']),
  registration_status: text(r['Status registrace']),
  decision_status: text(r['Aktuální stav rozhodnutí']),
  product_regime: text(r['Režim výrobku']),
  package_type: text(r['Druh balení']),
  organic_farming: bool(r['Pro ekologické zemědělství']),
  seed_treatment: bool(r['Moření']),
  renewal_in_progress: bool(r['Probíhá řízení o prodloužení platnosti rozhodnutí']),
  main_product_item_id: int(r['Id hlavního přípravku']),
  main_product_name: text(r['Obchodní název hlavního přípravku']),
  sp_record_number: text(r['Evidenční číslo SP']),
  reference_product_name: text(r['Obchodní název referenčního přípravku']),
  eea_product_name: text(r['Obchodní název přípravku ve státě EHP']),
  eea_country: text(r['Stát EHP']),
  import_permit_holder: text(r['Držitel povolení dovozu SP']),
  import_purpose: text(r['Účel dovozu']),
}))

console.log(`   → ${decisions.length} rozhodnutí`)

// ---------------------------------------------------------------------------
// Mapování detailních listů na přípravek
// ---------------------------------------------------------------------------
// Detailní listy neobsahují "Id položky", pouze název + registrační číslo +
// Id rozhodnutí. Názvy jsou v registru prakticky unikátní, kombinace
// registrační číslo + rozhodnutí nikoliv (souběžné dovozy sdílí rozhodnutí),
// takže primárně mapujeme podle názvu a kolize řešíme přes rozhodnutí.

const nameToItems = new Map<string, number[]>()
const keyToItems = new Map<string, number[]>()

for (const r of decisionRows) {
  const itemId = int(r['Id položky'])
  const name = text(r['Obchodní název přípravku'])
  if (itemId === null || !name) continue

  const byName = nameToItems.get(name) ?? []
  if (!byName.includes(itemId)) byName.push(itemId)
  nameToItems.set(name, byName)

  const decisionId = int(r['Id rozhodnutí'])
  if (decisionId !== null) {
    const key = `${text(r['Registrační číslo'])}|${decisionId}`
    const byKey = keyToItems.get(key) ?? []
    if (!byKey.includes(itemId)) byKey.push(itemId)
    keyToItems.set(key, byKey)
  }
}

let unresolvedRows = 0

function resolveItemId(r: Row): number | null {
  const name = text(r['Obchodní název přípravku'])
  const candidates = name ? nameToItems.get(name) : undefined

  if (candidates && candidates.length === 1) return candidates[0]

  const key = `${text(r['Registrační číslo'])}|${int(r['Id rozhodnutí'])}`
  const byKey = keyToItems.get(key)

  if (candidates && candidates.length > 1 && byKey) {
    const intersection = candidates.filter((id) => byKey.includes(id))
    if (intersection.length > 0) return intersection[0]
  }
  if (candidates && candidates.length > 1) return candidates[0]
  if (byKey && byKey.length > 0) return byKey[0]

  unresolvedRows++
  return null
}

function mapSheet<T>(sheetName: string, mapper: (r: Row, itemId: number) => T): T[] {
  const rows = sheet(sheetName)
  const result: T[] = []
  for (const r of rows) {
    const itemId = resolveItemId(r)
    if (itemId === null) continue
    result.push(mapper(r, itemId))
  }
  console.log(`   list ${sheetName}: ${rows.length} řádků → ${result.length} záznamů`)
  return result
}

const activeSubstances = mapSheet('Účinné látky', (r, itemId) => ({
  product_item_id: itemId,
  decision_id: int(r['Id rozhodnutí']),
  registration_number: text(r['Registrační číslo']),
  substance_record_id: int(r['Identifikátor záznamu']),
  name_cs: text(r['Název účinné látky']) ?? '',
  name_en: text(r['Název účinné látky (En)']),
  amount: num(r['Množství']),
  amount_text: text(r['Množství']),
  unit: text(r['Měrná jednotka']),
  substance_groups: text(r['Skupiny']),
}))

const usages = mapSheet('Použití', (r, itemId) => ({
  product_item_id: itemId,
  decision_id: int(r['Id rozhodnutí']),
  registration_number: text(r['Registrační číslo']),
  crop: text(r['Plodina, oblast použití']),
  pest: text(r['Škodlivý organismus, jiný účel použití']),
  dose_text: text(r['Dávkování']),
  protection_period_text: text(r['Ochranná lhůta']),
  protection_period_days: protectionPeriodDays(r['Ochranná lhůta']),
  aerial_application: bool(r['Letecká aplikace']),
  application_notes: text(r['Aplikační poznámky']),
  seed_treatment: bool(r['Moření']),
}))

const dosages = mapSheet('Dávkování', (r, itemId) => ({
  product_item_id: itemId,
  decision_id: int(r['Id rozhodnutí']),
  registration_number: text(r['Registrační číslo']),
  crop: text(r['Plodina, oblast použití']),
  pest: text(r['Škodlivý organismus, jiný účel použití']),
  dose_text: text(r['Dávkování']),
  dose_min: num(r['Min. dávka']),
  dose_max: num(r['Max. dávka']),
  unit: text(r['Měrná jednotka']),
  water_min: num(r['Min. dávka vody']),
  water_max: num(r['Max. dávka vody']),
  water_unit: text(r['Měrná jednotka vody']),
  dose_note: text(r['Textový doplněk u dávkování']),
  dose_full_text: text(r['Celá dávka textem']),
}))

const attributes = mapSheet('Údaje', (r, itemId) => ({
  product_item_id: itemId,
  decision_id: int(r['Id rozhodnutí']),
  registration_number: text(r['Registrační číslo']),
  attribute: text(r['Hodnocený údaj']) ?? '',
  abbreviation: text(r['Zkratka']),
  meaning: text(r['Význam údaje']),
  note: text(r['Poznámka']),
}))

const crops = mapSheet('Plodiny', (r, itemId) => ({
  product_item_id: itemId,
  decision_id: int(r['Id rozhodnutí']),
  registration_number: text(r['Registrační číslo']),
  crop_code: text(r['Kód']),
  crop_name: text(r['Název']),
  crop_type: text(r['Typ']),
  is_match: bool(r['Shoda']),
  web_listing: text(r['Výpis plodin podle webové prezentace (bez vazby na číselník)']),
}))

const pests = mapSheet('Škodlivý organismus vs. Příprav', (r, itemId) => ({
  product_item_id: itemId,
  decision_id: int(r['Id rozhodnutí']),
  registration_number: text(r['Registrační číslo']),
  pest_name: text(r['Škodlivý organismus']),
  ppp_code: text(r['Kód ŠO z PPP']),
}))

if (unresolvedRows > 0) {
  console.warn(`⚠️  ${unresolvedRows} řádků nešlo přiřadit k přípravku – vynecháno`)
}

// ---------------------------------------------------------------------------
// Zápis do databáze
// ---------------------------------------------------------------------------

async function insertBatched(table: string, rows: any[]) {
  if (rows.length === 0) {
    console.log(`   ${table}: nic k vložení`)
    return
  }

  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from(table).insert(batch)

    if (error) {
      console.error(`❌ ${table}: chyba u dávky ${i}–${i + batch.length}:`, error.message)
      console.error('   ukázka záznamu:', JSON.stringify(batch[0]).slice(0, 500))
      process.exit(1)
    }

    inserted += batch.length
    process.stdout.write(`\r   ${table}: ${inserted}/${rows.length}`)
  }
  process.stdout.write('\n')
}

async function main() {
  console.log('\n🗑️  Mažu předchozí data registru (kaskáduje do navazujících tabulek)…')
  const { error: deleteError } = await supabase.from('por_products').delete().gte('item_id', 0)
  if (deleteError) {
    console.error('❌ Mazání selhalo:', deleteError.message)
    process.exit(1)
  }

  console.log('\n⬆️  Vkládám data…')
  await insertBatched('por_products', products)
  await insertBatched('por_decisions', decisions)
  await insertBatched('por_active_substances', activeSubstances)
  await insertBatched('por_usages', usages)
  await insertBatched('por_dosages', dosages)
  await insertBatched('por_product_attributes', attributes)
  await insertBatched('por_crops', crops)
  await insertBatched('por_pests', pests)

  // Datum exportu z názvu souboru (POR_YYYY-MM-DD.xlsx)
  const exportedOn = path.basename(filePath).match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null

  await supabase.from('por_imports').insert({
    source_file: path.basename(filePath),
    exported_on: exportedOn,
    row_counts: {
      por_products: products.length,
      por_decisions: decisions.length,
      por_active_substances: activeSubstances.length,
      por_usages: usages.length,
      por_dosages: dosages.length,
      por_product_attributes: attributes.length,
      por_crops: crops.length,
      por_pests: pests.length,
    },
  })

  console.log('\n✅ Import registru POR dokončen')
}

main().catch((err) => {
  console.error('❌ Import selhal:', err)
  process.exit(1)
})
