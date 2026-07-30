#!/usr/bin/env node
/**
 * Import evidence aplikací z exportu EPH
 *
 * Zdrojový XLSX je řádkový výpis evidence (jeden řádek = jedna položka
 * aplikace). Skript z něj složí strukturu evidence:
 *
 *   parcela ("Parcela / objekt") → osev (plodina + sezóna)
 *     → aplikace (parcela + datum + plodina) → položky (hnojiva / POR)
 *
 * Parcely se párují na díly půdních bloků podle "Kód bloku", produkty na
 * registr POR a registr hnojiv podle názvu. Sezóna se určuje z data aplikace
 * (aplikace od srpna patří do hospodářského roku následujícího).
 *
 * EPH zapisuje jeden zásah často po částech pozemku – tentýž produkt ve stejné
 * dávce na několika řádcích s různou výměrou. Do evidence patří jako jedna
 * položka: limity přívodu živin i dávky přípravků jsou stanovené na hektar,
 * takže dávka se přes části nesčítá.
 *
 * POUŽITÍ:
 *   npx tsx scripts/import-applications.ts "C:\\cesta\\Dašek aplikace.xlsx" base@demonagro.cz
 *
 * Při chybě "unable to verify the first certificate" spusťte s
 *   $env:NODE_OPTIONS='--use-system-ca'
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
const userEmail = process.argv[3]

if (!filePath || !userEmail) {
  console.error('❌ Použití: npx tsx scripts/import-applications.ts <xlsx> <email uživatele>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

// ---------------------------------------------------------------------------
// Parsování zdrojového souboru
// ---------------------------------------------------------------------------

interface SourceRow {
  parcelName: string
  productName: string
  cropName: string
  date: string
  area: number
  dose: number
  totalAmount: number | null
  unit: string
  blockCode: string
}

function isoDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readSourceRows(): SourceRow[] {
  const workbook = XLSX.readFile(filePath, { cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: null, blankrows: false })

  const rows: SourceRow[] = []

  // Hlavička zabírá dva řádky, data začínají třetím
  for (const row of raw.slice(2)) {
    const parcelName = row[1] ? String(row[1]).trim() : ''
    const productName = row[2] ? String(row[2]).trim() : ''
    const cropName = row[3] ? String(row[3]).trim() : ''
    const date = row[4] instanceof Date ? isoDate(row[4]) : null
    const area = typeof row[5] === 'number' ? row[5] : null
    const dose = typeof row[6] === 'number' ? row[6] : null
    const total = typeof row[7] === 'number' ? row[7] : null
    const unit = row[8] ? String(row[8]).trim() : ''
    const blockCode = row[9] !== null && row[9] !== undefined ? String(row[9]).trim() : ''

    if (!parcelName || !productName || !date || area === null || dose === null || !unit) continue

    rows.push({
      parcelName,
      productName,
      cropName: cropName || 'Bez plodiny',
      date,
      area,
      dose,
      totalAmount: total,
      unit,
      blockCode,
    })
  }

  return rows
}

/** Hospodářský rok: aplikace od srpna patří do sklizně následujícího roku. */
function seasonForDate(date: string): number {
  const [year, month] = date.split('-').map(Number)
  return month >= 8 ? year + 1 : year
}

interface MergedRows {
  items: SourceRow[]
  /** Ošetřená výměra aplikace (ha) */
  area: number
  /** Popis sloučených dílčích zápisů pro poznámku u aplikace */
  notes: string[]
}

const formatArea = (value: number) => value.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })

/**
 * Sloučí dílčí zápisy téhož zásahu do jedné položky.
 *
 * Stejný produkt ve stejné dávce zapsaný v jeden den několikrát znamená jeden
 * zásah rozdělený po částech pozemku, ne opakovanou aplikaci – dávka na hektar
 * proto zůstává, sčítá se jen ošetřená výměra. Ta nemůže přesáhnout výměru
 * parcely: části se v EPH často překrývají a poslední řádek bývá celý pozemek.
 *
 * Různé dávky téhož produktu v jeden den se neslučují – to už není dělení
 * zásahu, ale rozhodnutí obsluhy, které musí zůstat v evidenci vidět.
 */
function mergeSplitRows(
  group: { parcelName: string; date: string; rows: SourceRow[]; area: number },
  parcelArea: number,
  variableDoses: string[]
): MergedRows {
  const buckets = new Map<string, SourceRow[]>()
  for (const row of group.rows) {
    const key = `${row.productName}|${row.unit}|${row.dose}`
    buckets.set(key, [...(buckets.get(key) ?? []), row])
  }

  const byProduct = new Map<string, number>()
  for (const [key] of buckets) {
    const product = key.split('|')[0]
    byProduct.set(product, (byProduct.get(product) ?? 0) + 1)
  }
  for (const [product, count] of byProduct) {
    if (count > 1) {
      variableDoses.push(`${group.parcelName} ${group.date} – ${product} (${count} různých dávek)`)
    }
  }

  const items: SourceRow[] = []
  const notes: string[] = []

  for (const rows of buckets.values()) {
    const first = rows[0]
    if (rows.length === 1) {
      items.push(first)
      continue
    }

    const summed = rows.reduce((total, row) => total + row.area, 0)
    const area = Math.min(summed, parcelArea)

    notes.push(
      `${first.productName} ${formatArea(first.dose)} ${first.unit} na ` +
        `${rows.map((row) => formatArea(row.area)).join(' + ')} ha → ${formatArea(area)} ha`
    )

    items.push({
      ...first,
      area,
      totalAmount: Number((first.dose * area).toFixed(4)),
    })
  }

  return {
    items,
    area: Math.min(Math.max(...items.map((item) => item.area)), parcelArea),
    notes,
  }
}

// ---------------------------------------------------------------------------
// Napojení na registry
// ---------------------------------------------------------------------------

type ProductKind = 'hnojivo' | 'por' | 'pomocna'

interface ResolvedProduct {
  kind: ProductKind
  porItemId: number | null
  fertEvidenceNumber: string | null
  /** Kolik shod v registru název měl – u víceznačných se vazba nezakládá */
  ambiguousMatches: number
}

async function resolveProducts(names: string[]): Promise<Map<string, ResolvedProduct>> {
  const resolved = new Map<string, ResolvedProduct>()

  const { data: porProducts } = await supabase
    .from('por_products')
    .select('item_id, name, biological_function, is_authorized, valid_until')
    .in('name', names)

  const { data: fertProducts } = await supabase
    .from('fert_products')
    .select('evidence_number, name, product_kind, valid_until, is_valid')
    .in('name', names)
    .eq('is_latest', true)

  const porByName = new Map<string, typeof porProducts>()
  for (const product of porProducts ?? []) {
    const list = porByName.get(product.name) ?? []
    list.push(product)
    porByName.set(product.name, list as any)
  }

  const fertByName = new Map<string, typeof fertProducts>()
  for (const product of fertProducts ?? []) {
    const list = fertByName.get(product.name) ?? []
    list.push(product)
    fertByName.set(product.name, list as any)
  }

  for (const name of names) {
    const porMatches = (porByName.get(name) ?? []) as any[]
    const fertMatches = (fertByName.get(name) ?? []) as any[]

    if (porMatches.length > 0) {
      // Adjuvanty a pomocné prostředky jsou v registru POR, ale v evidenci
      // se vedou zvlášť – kontroly plodin a dávek na ně nesedí
      const isAdjuvant = porMatches.every((match) =>
        /adjuvant|pomocn/i.test(match.biological_function ?? '')
      )

      // Přednost má platná registrace s nejpozdějším koncem použití
      const preferred = porMatches
        .slice()
        .sort((a, b) => {
          if (a.is_authorized !== b.is_authorized) return a.is_authorized ? -1 : 1
          return String(b.valid_until ?? '').localeCompare(String(a.valid_until ?? ''))
        })[0]

      resolved.set(name, {
        kind: isAdjuvant ? 'pomocna' : 'por',
        porItemId: preferred.item_id,
        fertEvidenceNumber: null,
        ambiguousMatches: porMatches.length,
      })
      continue
    }

    if (fertMatches.length > 0) {
      const isAid = /pomocn/i.test(name) || fertMatches.every((match) => /pomocn/i.test(match.product_kind ?? ''))

      resolved.set(name, {
        kind: isAid ? 'pomocna' : 'hnojivo',
        porItemId: null,
        // Stejný název může mít v registru desítky záznamů (např. Močovina);
        // konkrétní evidenční číslo si uživatel zvolí na skladové kartě
        fertEvidenceNumber: fertMatches.length === 1 ? fertMatches[0].evidence_number : null,
        ambiguousMatches: fertMatches.length,
      })
      continue
    }

    resolved.set(name, {
      kind: /hnojiv|mo[čc]ovina|dam |sam |amofos|urea|b[óo]r|ho[řr]k[áa] s[ůu]l/i.test(name)
        ? 'hnojivo'
        : 'por',
      porItemId: null,
      fertEvidenceNumber: null,
      ambiguousMatches: 0,
    })
  }

  return resolved
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

async function main() {
  console.log('📄 Čtu soubor:', filePath)
  const rows = readSourceRows()
  console.log(`   načteno ${rows.length} položek evidence`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', userEmail)
    .maybeSingle()

  if (!profile) {
    console.error(`❌ Uživatel ${userEmail} nebyl nalezen`)
    process.exit(1)
  }

  const userId = profile.id
  console.log('👤 Uživatel:', profile.email, userId)

  // --- Číselník plodin a DPB ---
  const { data: crops } = await supabase.from('crops').select('id, name')
  const cropIdByName = new Map((crops ?? []).map((crop) => [crop.name.toLowerCase(), crop.id]))

  const { data: blocks } = await supabase
    .from('land_blocks')
    .select('id, dpb_code')
    .eq('user_id', userId)
  const blockIdByCode = new Map((blocks ?? []).map((block) => [block.dpb_code, block.id]))
  console.log(`🗺️  DPB v evidenci: ${blockIdByCode.size}`)

  // --- Parcely ---
  interface ParcelAggregate {
    name: string
    blockCode: string
    area: number
  }

  const parcelAggregates = new Map<string, ParcelAggregate>()
  for (const row of rows) {
    const current = parcelAggregates.get(row.parcelName)
    if (!current) {
      parcelAggregates.set(row.parcelName, {
        name: row.parcelName,
        blockCode: row.blockCode,
        area: row.area,
      })
      continue
    }
    // Výměra se mezi roky mírně mění – bere se největší, aby kontrola
    // ošetřené výměry nehlásila falešné chyby
    current.area = Math.max(current.area, row.area)
    if (!current.blockCode && row.blockCode) current.blockCode = row.blockCode
  }

  const parcelRecords = Array.from(parcelAggregates.values()).map((parcel) => ({
    user_id: userId,
    name: parcel.name,
    area: parcel.area,
    block_code: parcel.blockCode || null,
    land_block_id: blockIdByCode.get(parcel.blockCode) ?? null,
  }))

  const { error: parcelError } = await supabase
    .from('crop_parcels')
    .upsert(parcelRecords, { onConflict: 'user_id,name' })

  if (parcelError) {
    console.error('❌ Chyba při ukládání parcel:', parcelError.message)
    process.exit(1)
  }

  const { data: savedParcels } = await supabase
    .from('crop_parcels')
    .select('id, name, land_block_id')
    .eq('user_id', userId)

  const parcelIdByName = new Map((savedParcels ?? []).map((parcel) => [parcel.name, parcel.id]))
  const matchedBlocks = (savedParcels ?? []).filter((parcel) => parcel.land_block_id).length
  console.log(`🌾 Parcely: ${parcelRecords.length} (napojeno na DPB: ${matchedBlocks})`)

  // --- Osevy ---
  const cropKey = (parcelName: string, season: number, cropName: string) =>
    `${parcelName}|${season}|${cropName}`

  const cropRecords = new Map<string, any>()
  for (const row of rows) {
    const season = seasonForDate(row.date)
    const key = cropKey(row.parcelName, season, row.cropName)
    if (cropRecords.has(key)) continue

    cropRecords.set(key, {
      user_id: userId,
      crop_parcel_id: parcelIdByName.get(row.parcelName),
      crop_id: cropIdByName.get(row.cropName.toLowerCase()) ?? null,
      crop_name: row.cropName,
      season,
    })
  }

  const { error: cropError } = await supabase
    .from('parcel_crops')
    .upsert(Array.from(cropRecords.values()), {
      onConflict: 'user_id,crop_parcel_id,season,crop_name',
    })

  if (cropError) {
    console.error('❌ Chyba při ukládání osevů:', cropError.message)
    process.exit(1)
  }

  const { data: savedCrops } = await supabase
    .from('parcel_crops')
    .select('id, crop_parcel_id, crop_name, season, crop_id')
    .eq('user_id', userId)

  const parcelNameById = new Map((savedParcels ?? []).map((parcel) => [parcel.id, parcel.name]))
  const cropIdByKey = new Map(
    (savedCrops ?? []).map((crop) => [
      cropKey(parcelNameById.get(crop.crop_parcel_id) ?? '', crop.season, crop.crop_name),
      crop.id,
    ])
  )

  const unmatchedCrops = (savedCrops ?? []).filter((crop) => !crop.crop_id)
  console.log(
    `🌱 Osevy: ${cropRecords.size}` +
      (unmatchedCrops.length > 0
        ? ` (mimo číselník: ${Array.from(new Set(unmatchedCrops.map((c) => c.crop_name))).join(', ')})`
        : '')
  )

  // --- Produkty ---
  const productNames = Array.from(new Set(rows.map((row) => row.productName)))
  const products = await resolveProducts(productNames)

  const linkedPor = Array.from(products.values()).filter((p) => p.porItemId).length
  const linkedFert = Array.from(products.values()).filter((p) => p.fertEvidenceNumber).length
  const ambiguous = Array.from(products.entries()).filter(
    ([, p]) => !p.porItemId && !p.fertEvidenceNumber && p.ambiguousMatches > 1
  )
  const unresolved = Array.from(products.entries()).filter(([, p]) => p.ambiguousMatches === 0)

  console.log(
    `🧪 Produkty: ${productNames.length}, napojeno na POR ${linkedPor}, na registr hnojiv ${linkedFert}`
  )
  if (ambiguous.length > 0) {
    console.log(
      `   víceznačný název (vazbu určí skladová karta): ${ambiguous.map(([name, p]) => `${name} (${p.ambiguousMatches})`).join(', ')}`
    )
  }
  if (unresolved.length > 0) {
    console.log(`   nenalezeno v registrech: ${unresolved.map(([name]) => name).join(', ')}`)
  }

  // --- Aplikace ---
  interface ApplicationGroup {
    parcelName: string
    date: string
    cropName: string
    season: number
    area: number
    rows: SourceRow[]
    /** Poznámka o dílčích zápisech, ze kterých aplikace vznikla */
    note?: string | null
  }

  const groups = new Map<string, ApplicationGroup>()
  for (const row of rows) {
    const season = seasonForDate(row.date)
    const key = `${row.parcelName}|${row.date}|${row.cropName}`
    const group = groups.get(key)

    if (!group) {
      groups.set(key, {
        parcelName: row.parcelName,
        date: row.date,
        cropName: row.cropName,
        season,
        area: row.area,
        rows: [row],
      })
      continue
    }

    group.rows.push(row)
    group.area = Math.max(group.area, row.area)
  }

  const merges: string[] = []
  const variableDoses: string[] = []
  for (const group of groups.values()) {
    const merged = mergeSplitRows(
      group,
      parcelAggregates.get(group.parcelName)?.area ?? group.area,
      variableDoses
    )
    if (merged.notes.length > 0) {
      merges.push(`${group.parcelName} ${group.date}: ${merged.notes.join(', ')}`)
    }
    group.rows = merged.items
    group.area = merged.area
    group.note = merged.notes.length > 0 ? `V EPH evidováno po částech: ${merged.notes.join('; ')}` : null
  }

  console.log(`📋 Aplikace k importu: ${groups.size}`)
  if (merges.length > 0) {
    console.log(`   sloučeno dílčích zápisů téhož zásahu: ${merges.length}`)
    merges.forEach((line) => console.log(`     ${line}`))
  }
  if (variableDoses.length > 0) {
    console.log(`   ⚠️  tentýž produkt v jeden den v různých dávkách (ponecháno odděleně):`)
    variableDoses.forEach((line) => console.log(`     ${line}`))
  }

  // Opakovaný import nesmí duplikovat – smažou se dřívější importované záznamy
  const { error: deleteError, count: deletedCount } = await supabase
    .from('applications')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('source', 'import')

  if (deleteError) {
    console.error('❌ Chyba při mazání předchozího importu:', deleteError.message)
    process.exit(1)
  }
  if (deletedCount) console.log(`   odstraněno ${deletedCount} dříve importovaných aplikací`)

  // Identifikátory se generují dopředu, aby položky šly vložit bez dohledávání
  const applicationIdByKey = new Map<string, string>()
  const applicationRecords = Array.from(groups.entries()).map(([key, group]) => {
    const id = crypto.randomUUID()
    applicationIdByKey.set(key, id)

    return {
      id,
      user_id: userId,
      crop_parcel_id: parcelIdByName.get(group.parcelName),
      parcel_crop_id:
        cropIdByKey.get(cropKey(group.parcelName, group.season, group.cropName)) ?? null,
      application_date: group.date,
      applied_area: group.area,
      mode: 'skutecnost' as const,
      is_tankmix: group.rows.length > 1,
      notes: group.note ?? null,
      source: 'import' as const,
    }
  })

  const { data: insertedApplications, error: applicationError } = await supabase
    .from('applications')
    .insert(applicationRecords)
    .select('id')

  if (applicationError || !insertedApplications) {
    console.error('❌ Chyba při ukládání aplikací:', applicationError?.message)
    process.exit(1)
  }

  const itemRecords: any[] = []
  for (const [key, group] of groups) {
    const applicationId = applicationIdByKey.get(key)
    if (!applicationId) continue

    group.rows.forEach((row, index) => {
      const product = products.get(row.productName)!
      itemRecords.push({
        user_id: userId,
        application_id: applicationId,
        kind: product.kind,
        product_name: row.productName,
        por_item_id: product.porItemId,
        fert_evidence_number: product.fertEvidenceNumber,
        dose: row.dose,
        unit: row.unit,
        total_amount: row.totalAmount ?? Number((row.dose * group.area).toFixed(4)),
        position: index,
      })
    })
  }

  const BATCH = 500
  for (let i = 0; i < itemRecords.length; i += BATCH) {
    const batch = itemRecords.slice(i, i + BATCH)
    const { error } = await supabase.from('application_items').insert(batch)
    if (error) {
      console.error('❌ Chyba při ukládání položek:', error.message)
      process.exit(1)
    }
    console.log(`   položky ${Math.min(i + BATCH, itemRecords.length)}/${itemRecords.length}`)
  }

  await supabase.from('application_imports').insert({
    user_id: userId,
    source_file: path.basename(filePath),
    counts: {
      parcels: parcelRecords.length,
      parcel_crops: cropRecords.size,
      applications: insertedApplications.length,
      items: itemRecords.length,
      products: productNames.length,
      linked_por: linkedPor,
      linked_fert: linkedFert,
    },
  })

  console.log('\n✅ Import hotov')
  console.log(`   parcely: ${parcelRecords.length}`)
  console.log(`   osevy: ${cropRecords.size}`)
  console.log(`   aplikace: ${insertedApplications.length}`)
  console.log(`   položky: ${itemRecords.length}`)
  console.log('\nDalší krok: v portálu spusťte kontrolu evidence (Evidence aplikací → Spustit kontrolu)')
}

main().catch((error) => {
  console.error('❌ Neočekávaná chyba:', error)
  process.exit(1)
})
