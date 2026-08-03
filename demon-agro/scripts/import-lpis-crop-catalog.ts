/**
 * Napojení našeho číselníku plodin na číselník plodin LPIS
 *
 * Export evidence do EPH uvádí u každé parcely IDPLODINY z resortního číselníku
 * (služba LPI_GPL01D). Číslo se sem nepřepisuje ručně – stahuje se z vyhlášeného
 * číselníku a páruje se na shodu názvu.
 *
 * Přiřadí se jen jednoznačná shoda. Tam, kde je náš název obecnější než
 * číselník („Brambory" proti pěti položkám), zůstane ID prázdné a plodina se
 * vypíše k ručnímu rozhodnutí – vybrat za uživatele jednu z variant by znamenalo
 * poslat do hlášení něco, co nikdo nepotvrdil.
 *
 * Zdroj: https://mze.gov.cz/ssl/nosso-app/DataKeStazeni/Plodiny/GetXml
 *   (číselník plodin LPIS, veřejný, bez autorizace)
 *
 * Spuštění:
 *   npx tsx scripts/import-lpis-crop-catalog.ts
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const CATALOG_URL = 'https://mze.gov.cz/ssl/nosso-app/DataKeStazeni/Plodiny/GetXml'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

interface CatalogCrop {
  id: number
  name: string
}

/** Porovnávat se dá jen znění bez diakritiky, velikosti písmen a dvojitých mezer. */
function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/**
 * Číselník má plochou strukturu opakovaných elementů PLODINA, proto stačí
 * vytáhnout jednotlivé bloky a z nich dvě položky.
 */
function parseCatalog(xml: string): CatalogCrop[] {
  const crops: CatalogCrop[] = []

  for (const block of xml.matchAll(/<PLODINA>([\s\S]*?)<\/PLODINA>/g)) {
    const body = block[1]

    // Ukončenou platnost číselník zapisuje naplněným PLATNOSTDO; takovou
    // položku už evidence použít nemůže.
    const validUntil = body.match(/<PLATNOSTDO>([^<]*)<\/PLATNOSTDO>/)
    if (validUntil && validUntil[1].trim().length > 0) continue

    const id = body.match(/<ID>(\d+)<\/ID>/)
    const name = body.match(/<NAZEV>([^<]*)<\/NAZEV>/)
    if (!id || !name) continue

    crops.push({ id: Number(id[1]), name: decodeEntities(name[1]).trim() })
  }

  return crops
}

async function main() {
  console.log('Stahuji číselník plodin LPIS…')
  const response = await fetch(CATALOG_URL)
  if (!response.ok) {
    throw new Error(`Číselník se nepodařilo stáhnout: HTTP ${response.status}`)
  }

  const xml = await response.text()
  const changedAt = xml.match(/<DATZMENYCIS>([^<]*)<\/DATZMENYCIS>/)?.[1] ?? 'neuvedeno'
  const catalog = parseCatalog(xml)

  if (catalog.length === 0) {
    throw new Error('Číselník se stáhl, ale neobsahuje žádnou platnou plodinu')
  }

  console.log(`Číselník ze dne ${changedAt}, platných plodin: ${catalog.length}\n`)

  const byName = new Map<string, CatalogCrop[]>()
  for (const crop of catalog) {
    const key = normalizeName(crop.name)
    const list = byName.get(key)
    if (list) list.push(crop)
    else byName.set(key, [crop])
  }

  const { data: crops, error } = await supabase
    .from('crops')
    .select('id, name, lpis_crop_id')
    .order('id')

  if (error) throw error
  if (!crops) throw new Error('Číselník plodin se nepodařilo načíst')

  const matched: string[] = []
  const unmatched: string[] = []

  for (const crop of crops) {
    const candidates = byName.get(normalizeName(crop.name)) ?? []

    if (candidates.length !== 1) {
      // Nabídnout kandidáty podle podřetězce, ať je vidět, mezi čím vybírat.
      const hint = catalog
        .filter((entry) => normalizeName(entry.name).startsWith(normalizeName(crop.name)))
        .slice(0, 6)
        .map((entry) => `${entry.id} – ${entry.name}`)

      unmatched.push(
        `${crop.name}${hint.length > 0 ? `\n      varianty v číselníku: ${hint.join(' | ')}` : ''}`
      )
      continue
    }

    const target = candidates[0]
    if (crop.lpis_crop_id === target.id) {
      matched.push(`${crop.name} → ${target.id} (beze změny)`)
      continue
    }

    const { error: updateError } = await supabase
      .from('crops')
      .update({ lpis_crop_id: target.id })
      .eq('id', crop.id)

    if (updateError) throw updateError
    matched.push(`${crop.name} → ${target.id}`)
  }

  console.log(`Napárováno (${matched.length}):`)
  matched.forEach((line) => console.log(`  ${line}`))

  if (unmatched.length > 0) {
    console.log(`\nBez jednoznačné shody (${unmatched.length}) – evidenci s nimi nelze exportovat:`)
    unmatched.forEach((line) => console.log(`  ${line}`))
  }
}

main().catch((error) => {
  console.error('Import selhal:', error)
  process.exit(1)
})
