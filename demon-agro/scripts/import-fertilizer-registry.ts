#!/usr/bin/env node
/**
 * Import registru hnojiv z exportu ÚKZÚZ
 *
 * Zdrojový XLSX má jeden list, jeden řádek = jeden registrační záznam
 * ("Evidenční číslo"). Stejné hnojivo se v registru objevuje víckrát, pokud
 * mu byla registrace obnovena – takové záznamy mají shodné registrační číslo
 * a liší se platností. Nejnovější záznam v rámci registračního čísla se
 * označí příznakem is_latest.
 *
 * Export je úplný snapshot registru, takže se před importem stávající data
 * smažou.
 *
 * POUŽITÍ:
 *   npx tsx scripts/import-fertilizer-registry.ts "C:\\cesta\\Export_20260730_010840.xlsx"
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
  console.error('   npx tsx scripts/import-fertilizer-registry.ts "C:\\cesta\\Export.xlsx"')
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
  const s = String(value).replace(/\s+/g, ' ').trim()
  return s === '' ? null : s
}

/**
 * Export nese datum jako Excel timestamp, který se po přepočtu na UTC posune
 * o hodinu zpět (např. 2029-12-30T23:00Z = 31.12.2029 v Praze). Datum proto
 * čteme v pražském čase, jinak by se platnost lišila o den.
 */
function date(value: any): string | null {
  if (value instanceof Date) {
    return value.toLocaleDateString('sv-SE', { timeZone: 'Europe/Prague' })
  }
  const s = text(value)
  if (!s) return null
  const dotted = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/)
  if (dotted) {
    return `${dotted[3]}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

function bool(value: any): boolean | null {
  const s = text(value)
  if (!s) return null
  const lower = s.toLowerCase()
  if (lower === 'ano' || lower === 'a') return true
  if (lower === 'ne' || lower === 'n') return false
  return null
}

// ---------------------------------------------------------------------------
// Načtení XLSX
// ---------------------------------------------------------------------------

console.log(`📖 Načítám ${filePath}`)
const workbook = XLSX.readFile(filePath, { cellDates: true })
const sheetName = workbook.SheetNames[0]
const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[sheetName], { defval: null })
console.log(`   list ${sheetName}: ${rows.length} řádků`)

// ---------------------------------------------------------------------------
// Mapování na tabulku fert_products
// ---------------------------------------------------------------------------

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Prague' })

interface FertProduct {
  evidence_number: string
  registration_number: string | null
  name: string
  regime: string | null
  product_type: string | null
  product_kind: string | null
  nitrogen_category: string | null
  organic_farming: boolean | null
  applicant: string | null
  manufacturer: string | null
  valid_from: string | null
  valid_until: string | null
  is_valid: boolean
  is_latest: boolean
}

const byEvidenceNumber = new Map<string, FertProduct>()
let skipped = 0
let duplicates = 0

for (const r of rows) {
  const evidenceNumber = text(r['Evidenční číslo'])
  const name = text(r['Název'])

  if (!evidenceNumber || !name) {
    skipped++
    continue
  }

  const validUntil = date(r['Platnost výrobku do'])

  const product: FertProduct = {
    evidence_number: evidenceNumber,
    registration_number: text(r['Registrační číslo']),
    name,
    regime: text(r['Režim']),
    product_type: text(r['Typ']),
    product_kind: text(r['Druh']),
    nitrogen_category: text(r['Kategorie N']),
    organic_farming: bool(r['Ekol.zem.']),
    applicant: text(r['Žadatel']),
    manufacturer: text(r['Výrobce']),
    valid_from: date(r['Platnost výrobku od']),
    valid_until: validUntil,
    is_valid: validUntil === null || validUntil >= today,
    is_latest: false,
  }

  if (byEvidenceNumber.has(evidenceNumber)) duplicates++
  byEvidenceNumber.set(evidenceNumber, product)
}

const products = [...byEvidenceNumber.values()]

// Nejnovější záznam v rámci registračního čísla; záznamy bez registračního
// čísla (ohlášení, vzájemné uznávání, ES/CE hnojiva) stojí samostatně.
const groups = new Map<string, FertProduct[]>()
for (const product of products) {
  const key = product.registration_number ?? `ev:${product.evidence_number}`
  const group = groups.get(key)
  if (group) group.push(product)
  else groups.set(key, [product])
}

for (const group of groups.values()) {
  const latest = group.reduce((best, p) => {
    const bestFrom = best.valid_from ?? ''
    const pFrom = p.valid_from ?? ''
    if (pFrom > bestFrom) return p
    if (pFrom < bestFrom) return best
    // Při shodném datu platnosti rozhoduje vyšší evidenční číslo (novější záznam)
    return p.evidence_number > best.evidence_number ? p : best
  })
  latest.is_latest = true
}

console.log(`   → ${products.length} hnojiv (${groups.size} registračních skupin)`)
console.log(`   → platných ke dni ${today}: ${products.filter((p) => p.is_valid).length}`)
console.log(`   → aktuálních záznamů (is_latest): ${products.filter((p) => p.is_latest).length}`)
if (skipped > 0) console.warn(`⚠️  ${skipped} řádků bez evidenčního čísla nebo názvu – vynecháno`)
if (duplicates > 0) console.warn(`⚠️  ${duplicates} duplicitních evidenčních čísel – ponechán poslední`)

// ---------------------------------------------------------------------------
// Zápis do databáze
// ---------------------------------------------------------------------------

async function insertBatched(table: string, data: any[]) {
  if (data.length === 0) {
    console.log(`   ${table}: nic k vložení`)
    return
  }

  let inserted = 0
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from(table).insert(batch)

    if (error) {
      console.error(`❌ ${table}: chyba u dávky ${i}–${i + batch.length}:`, error.message)
      console.error('   ukázka záznamu:', JSON.stringify(batch[0]).slice(0, 500))
      process.exit(1)
    }

    inserted += batch.length
    process.stdout.write(`\r   ${table}: ${inserted}/${data.length}`)
  }
  process.stdout.write('\n')
}

async function main() {
  console.log('\n🗑️  Mažu předchozí data registru hnojiv…')
  const { error: deleteError } = await supabase
    .from('fert_products')
    .delete()
    .not('evidence_number', 'is', null)

  if (deleteError) {
    console.error('❌ Mazání selhalo:', deleteError.message)
    process.exit(1)
  }

  console.log('\n⬆️  Vkládám data…')
  await insertBatched('fert_products', products)

  // Datum exportu z názvu souboru (Export_YYYYMMDD_HHMMSS.xlsx)
  const stamp = path.basename(filePath).match(/(\d{4})(\d{2})(\d{2})/)
  const exportedOn = stamp ? `${stamp[1]}-${stamp[2]}-${stamp[3]}` : null

  await supabase.from('fert_imports').insert({
    source_file: path.basename(filePath),
    exported_on: exportedOn,
    row_counts: {
      source_rows: rows.length,
      fert_products: products.length,
      valid: products.filter((p) => p.is_valid).length,
      latest: products.filter((p) => p.is_latest).length,
    },
  })

  console.log('\n✅ Import registru hnojiv dokončen')
}

main().catch((err) => {
  console.error('❌ Import selhal:', err)
  process.exit(1)
})
