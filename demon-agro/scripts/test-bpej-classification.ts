#!/usr/bin/env node
/**
 * Kontrola zařazení BPEJ proti aplikačnímu pásmu z LPIS
 *
 * Aplikační pásmo je v předpisu i v sestavě z LPIS, takže odvození z kódu BPEJ
 * jde ověřit: co skript spočítá z přílohy 2, musí sedět s tím, co uvádí LPIS.
 * Když to sedí, dá se stejné logice věřit i u výnosové hladiny, kterou LPIS
 * neuvádí a ověřit ji proti ničemu nelze.
 *
 * POUŽITÍ:
 *   npx tsx scripts/test-bpej-classification.ts [kód BPEJ ...]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { loadBpejRules } from '../lib/database/nitrate-directive-data'
import {
  classifyBpej,
  parseApplicationZone,
  parseBpejCode,
} from '../lib/utils/nitrate-directive'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/** Ručně sestavené případy pokrývající obě vyjmenovaná pásma i zbytkové */
const SAMPLES: { code: string; slope: number | null; expect: string }[] = [
  { code: '20100', slope: 2, expect: 'I. – region 2, HPJ 01' },
  { code: '10800', slope: 3, expect: 'I. – HPJ 08 při sklonu do 7°' },
  { code: '10800', slope: 10, expect: 'II. – nad 7° podmínka pásma I. neplatí' },
  { code: '00400', slope: 1, expect: 'III. – lehké písčité půdy' },
  { code: '21701', slope: 1, expect: 'III. s vysokým rizikem infiltrace (HPJ 17, kód 01)' },
  { code: '21710', slope: 1, expect: 'III. s vysokým rizikem infiltrace (HPJ 17, kód 10)' },
  { code: '21799', slope: 1, expect: 'III. se středním rizikem – kód 99 v tab. 5 není' },
  { code: '54400', slope: 5, expect: 'III. – HPJ 44 ve všech regionech' },
  { code: '85600', slope: 5, expect: 'III. + hladina 1 (region 8, HPJ 56)' },
  { code: '20101', slope: 2, expect: 'hladina 3 – region 2, HPJ 01' },
  { code: '93900', slope: 5, expect: 'hladina 1 – HPJ 39 ve všech regionech' },
]

async function main() {
  const rules = await loadBpejRules(supabase as any)
  console.log(`Pravidel zařazení BPEJ: ${rules.length}\n`)

  const codes = process.argv.slice(2)
  const samples = codes.length > 0
    ? codes.map((code) => ({ code, slope: null, expect: '—' }))
    : SAMPLES

  console.log('=== VZOROVÉ KÓDY ===')
  for (const sample of samples) {
    const bpej = parseBpejCode(sample.code)
    if (!bpej) {
      console.log(`  ${sample.code}: nečitelný kód`)
      continue
    }

    const result = classifyBpej(rules, bpej, sample.slope)
    console.log(
      `  ${sample.code} (sklon ${sample.slope ?? '?'}°) → region ${result.climaticRegion}, ` +
        `hladina ${result.yieldLevel}, pásmo ${result.applicationZone}` +
        `${result.infiltrationRisk ? ` (${result.infiltrationRisk} riziko infiltrace)` : ''}` +
        `   [očekáváno: ${sample.expect}]`
    )
  }

  // Porovnání s LPIS u DPB, které už kód BPEJ mají
  const { data: blocks } = await supabase
    .from('land_blocks')
    .select('dpb_code, bpej_code, application_zone, slope_degrees, climatic_region, yield_level')
    .not('bpej_code', 'is', null)

  if ((blocks ?? []).length === 0) {
    console.log('\nŽádný DPB zatím kód BPEJ nemá – porovnání s LPIS nelze udělat.')
    return
  }

  console.log('\n=== POROVNÁNÍ S LPIS ===')
  let mismatches = 0

  for (const block of blocks as any[]) {
    const bpej = parseBpejCode(block.bpej_code)
    if (!bpej) continue

    const result = classifyBpej(
      rules,
      bpej,
      block.slope_degrees !== null ? Number(block.slope_degrees) : null
    )
    const lpis = parseApplicationZone(block.application_zone)
    const agrees = lpis.zone === null || lpis.zone === result.applicationZone

    if (!agrees) mismatches++

    console.log(
      `  ${agrees ? '✓' : '✗'} DPB ${block.dpb_code} (${block.bpej_code}): ` +
        `LPIS ${block.application_zone ?? '–'} × odvozeno ${result.applicationZone}, ` +
        `region ${result.climaticRegion}, hladina ${result.yieldLevel}`
    )
  }

  console.log(
    mismatches === 0
      ? `\nVšech ${(blocks ?? []).length} DPB souhlasí s LPIS.`
      : `\nNesouhlasí ${mismatches} z ${(blocks ?? []).length} DPB – ověřte kód BPEJ.`
  )
}

main().catch((error) => {
  console.error('Chyba:', error)
  process.exit(1)
})
