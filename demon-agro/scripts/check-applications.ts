#!/usr/bin/env node
/**
 * Dávková kontrola evidence aplikací
 *
 * Spustí nad celou evidencí uživatele stejné kontroly jako portál
 * (lib/database/application-check-runner.ts), uloží zjištění k záznamům
 * a vypíše přehled. Slouží k prvnímu proběhnutí kontrol po importu
 * a k ověření pravidel na reálných datech.
 *
 * POUŽITÍ:
 *   npx tsx scripts/check-applications.ts base@demonagro.cz [--dry]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { runChecksForApplications } from '../lib/database/application-check-runner'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userEmail = process.argv[2]
const dryRun = process.argv.includes('--dry')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local')
  process.exit(1)
}
if (!userEmail) {
  console.error('❌ Použití: npx tsx scripts/check-applications.ts <email uživatele> [--dry]')
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

  console.log(`🔍 Kontroluji evidenci uživatele ${profile.email}`)

  const { applications } = await runChecksForApplications(supabase as any, profile.id, null, {
    persist: !dryRun,
  })

  const statusCounts = new Map<string, number>()
  const byCode = new Map<string, { severity: string; count: number; example: string }>()

  for (const application of applications) {
    statusCounts.set(application.status, (statusCounts.get(application.status) ?? 0) + 1)

    for (const finding of application.findings) {
      const entry = byCode.get(finding.code) ?? {
        severity: finding.severity,
        count: 0,
        example: `${application.parcelName} ${application.applicationDate}: ${finding.title}${
          finding.detail ? ' – ' + finding.detail : ''
        }`,
      }
      entry.count++
      byCode.set(finding.code, entry)
    }
  }

  console.log(`   zkontrolováno ${applications.length} aplikací`)

  console.log('\n=== STAV APLIKACÍ ===')
  for (const [status, count] of [...statusCounts.entries()].sort()) {
    console.log(`  ${status}: ${count}`)
  }

  console.log('\n=== ZJIŠTĚNÍ PODLE TYPU ===')
  for (const [code, entry] of [...byCode.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  [${entry.severity}] ${code}: ${entry.count}×`)
    console.log(`      např. ${entry.example}`)
  }

  console.log(dryRun ? '\n(--dry: výsledky se neukládají)' : `\n✅ Uloženo u ${applications.length} aplikací`)
}

main().catch((error) => {
  console.error('❌ Neočekávaná chyba:', error)
  process.exit(1)
})
