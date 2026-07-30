#!/usr/bin/env node
/**
 * Kontrola bilance dusíku nad reálnou evidencí
 *
 * Spustí stejný výpočet, jaký ukazuje stránka Nitrátová směrnice
 * (lib/database/nitrate-balance.ts), a vypíše ho do konzole. Slouží k ověření,
 * že dotazy sedí na schéma a že čísla odpovídají evidenci, aniž by bylo nutné
 * se do portálu přihlašovat.
 *
 * POUŽITÍ:
 *   npx tsx scripts/test-nitrate-balance.ts base@demonagro.cz [sklizňový rok]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { getNitrateBalance } from '../lib/database/nitrate-balance'
import { formatNitrogen } from '../lib/utils/nitrate-directive'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userEmail = process.argv[2]
const season = Number(process.argv[3])

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local')
  process.exit(1)
}
if (!userEmail) {
  console.error('❌ Použití: npx tsx scripts/test-nitrate-balance.ts <email uživatele> [rok]')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

async function main() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', userEmail)
    .maybeSingle()

  if (!profile) {
    console.error(`❌ Uživatel ${userEmail} nebyl nalezen`)
    process.exit(1)
  }

  const balance = await getNitrateBalance(
    supabase as any,
    profile.id,
    Number.isFinite(season) && season > 0 ? season : undefined
  )

  console.log(`Sezóny v evidenci: ${balance.seasons.join(', ') || '—'}`)
  console.log(`Počítáno za sklizňový rok: ${balance.season ?? '—'}\n`)

  console.log('=== FARMA ===')
  console.log(`  zemědělská půda: ${balance.farm.farmArea.toFixed(1)} ha`)
  console.log(`  z toho zranitelné oblasti: ${balance.farm.nvzArea.toFixed(1)} ha`)
  console.log(
    `  statková hnojiva: ${balance.farm.livestockNitrogenKg.toFixed(0)} kg N ` +
      `= ${formatNitrogen(balance.farm.livestockPerHectare)} (limit ${balance.farm.limitKgNHa})`
  )

  console.log(`\n=== OSEVY (${balance.stands.length}) ===`)
  const marks = { over: '✗', unverifiable: '?', ok: '✓', none: '–' } as const

  for (const stand of balance.stands) {
    const limit = stand.limit
      ? `${formatNitrogen(stand.limit.limitKgNHa)} (${stand.limit.cropLabel}` +
        `${stand.limit.level !== null ? `, hladina ${stand.limit.level}` : ''})`
      : stand.limitRange
        ? `${stand.limitRange.minKgNHa}–${stand.limitRange.maxKgNHa} kg N/ha (${stand.limitRange.uncertainty.join('; ')})`
        : 'příloha 3 limit neuvádí'

    console.log(
      `  ${marks[stand.limitStatus]} ${stand.parcelName} / ${stand.cropName}: ` +
        `${formatNitrogen(stand.supply.totalKgHa)} z toho minerální ` +
        `${formatNitrogen(stand.supply.mineralKgHa)} × limit ${limit}` +
        `${stand.usage !== null ? ` → ${Math.round(stand.usage * 100)} %` : ''}` +
        `${stand.hasMissingNitrogen ? ' [neúplné – chybí přívod N]' : ''}`
    )
  }

  console.log(
    `\nNad limitem: ${balance.overLimitCount} · nelze ověřit: ${balance.unverifiableCount} · bez limitu v příloze 3: ${balance.withoutLimitCount}`
  )
}

main().catch((error) => {
  console.error('❌ Neočekávaná chyba:', error)
  process.exit(1)
})
