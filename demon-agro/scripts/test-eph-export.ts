/**
 * Ověření exportu evidence do EPH na reálných datech
 *
 * Sestaví soubor za zadané období, vypíše souhrn i všechna zjištění, zkontroluje,
 * že je výstup dobře utvořené XML, a ukáže jeho začátek. Slouží k tomu, aby se
 * na obsah dalo podívat bez proklikávání portálu.
 *
 * Spuštění:
 *   npx tsx scripts/test-eph-export.ts <email> [od] [do]
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { buildEphExportForUser } from '@/lib/database/eph-export'

dotenv.config({ path: '.env.local' })

const email = process.argv[2]
const from = process.argv[3] ?? '2020-01-01'
const to = process.argv[4] ?? '2030-12-31'

if (!email) {
  console.error('Zadejte email uživatele: npx tsx scripts/test-eph-export.ts <email> [od] [do]')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/**
 * Hrubá kontrola dobře utvořeného XML.
 *
 * Nejde o validaci proti schématu – jen o jistotu, že se párují značky a že
 * v textu nezůstal neošetřený znak, který by soubor rozbil.
 */
function checkWellFormed(xml: string): string[] {
  const problems: string[] = []
  const stack: string[] = []

  for (const match of xml.matchAll(/<(\/?)([A-Za-z0-9_]+)[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = match
    if (match[0].startsWith('<?')) continue
    if (selfClosing) continue

    if (closing) {
      const open = stack.pop()
      if (open !== name) problems.push(`Značka </${name}> neodpovídá <${open ?? 'nic'}>`)
    } else {
      stack.push(name)
    }
  }

  if (stack.length > 0) problems.push(`Neuzavřené značky: ${stack.join(', ')}`)

  const body = xml.replace(/<[^>]*>/g, '')
  if (/&(?!(amp|lt|gt|quot|apos);)/.test(body)) {
    problems.push('V textu je neošetřený znak &')
  }

  return problems
}

async function main() {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, szr_id')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  if (!profile) throw new Error(`Uživatel ${email} nenalezen`)

  console.log(`Uživatel: ${profile.email}`)
  console.log(`Identifikátor SZR: ${profile.szr_id ?? 'nevyplněn'}`)
  console.log(`Období: ${from} – ${to}\n`)

  const result = await buildEphExportForUser(supabase, profile.id, from, to)

  console.log('SOUHRN')
  console.log(`  Exportováno aplikací: ${result.exportedApplications}`)
  console.log(`  Vynecháno aplikací:   ${result.skippedApplications}`)
  console.log(`  Parcel v souboru:     ${result.parcels}`)
  console.log(`  Položek hnojiv:       ${result.fertilizerItems}`)
  console.log(`  Položek přípravků:    ${result.productItems}`)

  if (result.problems.length > 0) {
    console.log('\nZJIŠTĚNÍ')
    for (const problem of result.problems) {
      const mark = problem.severity === 'blocking' ? 'BLOKUJE' : 'pozor  '
      console.log(`  ${mark} (${problem.count}×) ${problem.message}`)
      if (problem.examples.length > 0) {
        console.log(`          např. ${problem.examples.join('; ')}`)
      }
    }
  }

  if (!result.xml) {
    console.log('\nSoubor se nesestavil.')
    return
  }

  const wellFormed = checkWellFormed(result.xml)
  console.log(`\nSoubor: ${result.filename} (${result.xml.length} znaků)`)
  console.log(
    wellFormed.length === 0
      ? 'Struktura XML: v pořádku'
      : `Struktura XML: ${wellFormed.join('; ')}`
  )

  console.log('\nZAČÁTEK SOUBORU')
  console.log(result.xml.split('\n').slice(0, 45).join('\n'))
}

main().catch((error) => {
  console.error('Test selhal:', error)
  process.exit(1)
})
