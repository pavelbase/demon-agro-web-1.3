/**
 * Kontrola našeho číselníku hnojiv proti vyhlášenému číselníku RHN_GHN01D
 *
 * Export evidence do EPH posílá u hnojiva jeho ID z resortního číselníku,
 * kategorii dusíku jako číslo (KATEGORIEN 1–8) a příznak organického hnojiva.
 * My máme kategorii uloženou slovem, jak ji uvádí stažený číselník hnojiv.
 * Převod slova na číslo je proto potřeba doložit, ne odhadnout – tenhle skript
 * porovná obojí proti vyhlášenému znění a vypíše každý rozpor.
 *
 * Zdroj: https://mze.gov.cz/ssl/nosso-app/DataKeStazeni/Hnojiva/GetXml
 *   (číselník hnojiv ÚKZÚZ, tentýž, ze kterého čte EPH)
 *
 * Spuštění:
 *   npx tsx scripts/verify-fertilizer-eph-mapping.ts
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { EPH_NITROGEN_CATEGORY_CODES } from '@/lib/utils/eph-xml'

dotenv.config({ path: '.env.local' })

const CATALOG_URL = 'https://mze.gov.cz/ssl/nosso-app/DataKeStazeni/Hnojiva/GetXml'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

interface CatalogRow {
  id: number
  name: string
  nitrogenCategory: number | null
  isOrganic: boolean
  /** KOEFPREP – přepočet objemové dávky na hmotnost, tedy měrná hmotnost */
  densityKgL: number | null
}

/** Číselník posílá jeden element ROW na hnojivo, údaje jsou v atributech. */
function parseCatalog(xml: string): Map<number, CatalogRow> {
  const rows = new Map<number, CatalogRow>()

  for (const match of xml.matchAll(/<ROW\s([^>]*?)\/?>/g)) {
    const attributes = new Map<string, string>()
    for (const attribute of match[1].matchAll(/([A-Z_0-9]+)="([^"]*)"/g)) {
      attributes.set(attribute[1], attribute[2])
    }

    const id = Number(attributes.get('ID'))
    if (!Number.isFinite(id)) continue

    const category = attributes.get('KAT_N')?.trim()
    const density = attributes.get('KOEFPREP')?.trim()

    rows.set(id, {
      id,
      name: attributes.get('NAZ') ?? '',
      nitrogenCategory: category ? Number(category) : null,
      isOrganic: attributes.get('ORG') === '1',
      densityKgL: density ? Number(density) : null,
    })
  }

  return rows
}

async function main() {
  console.log('Stahuji číselník hnojiv…')
  const response = await fetch(CATALOG_URL)
  if (!response.ok) {
    throw new Error(`Číselník se nepodařilo stáhnout: HTTP ${response.status}`)
  }

  const xml = await response.text()
  const changedAt = xml.match(/<DATZMENY>([^<]*)<\/DATZMENY>/)?.[1] ?? 'neuvedeno'
  const catalog = parseCatalog(xml)
  console.log(`Číselník ze dne ${changedAt}, hnojiv: ${catalog.size}\n`)

  const missing: string[] = []
  const categoryMismatch: string[] = []
  const organicMismatch: string[] = []
  const densityMismatch: string[] = []
  const unknownCategory = new Set<string>()
  let checked = 0

  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('fert_nutrients')
      .select('catalog_id, name, nitrogen_category, is_organic, density_kg_l')
      .order('catalog_id')
      .range(from, from + pageSize - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const row of data) {
      checked++
      const official = catalog.get(Number(row.catalog_id))

      if (!official) {
        missing.push(`${row.catalog_id} – ${row.name}`)
        continue
      }

      const code = row.nitrogen_category
        ? EPH_NITROGEN_CATEGORY_CODES[row.nitrogen_category] ?? null
        : null

      if (row.nitrogen_category && code === null) {
        unknownCategory.add(row.nitrogen_category)
      } else if (code !== official.nitrogenCategory) {
        categoryMismatch.push(
          `${row.catalog_id} – ${row.name}: u nás „${row.nitrogen_category}" (${code}), číselník ${official.nitrogenCategory}`
        )
      }

      if (Boolean(row.is_organic) !== official.isOrganic) {
        organicMismatch.push(
          `${row.catalog_id} – ${row.name}: u nás ${row.is_organic ? 'organické' : 'anorganické'}, číselník opačně`
        )
      }

      // Měrná hmotnost rozhoduje o přepočtu objemové dávky na přívod dusíku,
      // takže rozdíl proti číselníku by znamenal jiná čísla, než jaká spočítá
      // portál z týchž dat
      const ourDensity = row.density_kg_l !== null ? Number(row.density_kg_l) : null
      if (ourDensity !== official.densityKgL) {
        densityMismatch.push(
          `${row.catalog_id} – ${row.name}: u nás ${ourDensity ?? 'nevyplněno'}, číselník ${official.densityKgL ?? 'nevyplněno'}`
        )
      }
    }

    if (data.length < pageSize) break
  }

  console.log(`Porovnáno hnojiv: ${checked}`)

  const report = (label: string, items: string[]) => {
    if (items.length === 0) {
      console.log(`  ${label}: v pořádku`)
      return
    }
    console.log(`  ${label}: ${items.length}`)
    items.slice(0, 15).forEach((item) => console.log(`    ${item}`))
    if (items.length > 15) console.log(`    … a dalších ${items.length - 15}`)
  }

  report('Není ve vyhlášeném číselníku', missing)
  report('Neshoda kategorie dusíku', categoryMismatch)
  report('Neshoda organického hnojiva', organicMismatch)
  report('Neshoda měrné hmotnosti', densityMismatch)
  report('Neznámý název kategorie', Array.from(unknownCategory))

  const problems =
    missing.length +
    categoryMismatch.length +
    organicMismatch.length +
    densityMismatch.length +
    unknownCategory.size
  if (problems > 0) {
    console.log(`\nNalezeno ${problems} rozporů – export do EPH by u nich poslal nesprávný údaj.`)
    process.exit(1)
  }

  console.log('\nČíselník souhlasí s vyhlášeným zněním.')
}

main().catch((error) => {
  console.error('Kontrola selhala:', error)
  process.exit(1)
})
