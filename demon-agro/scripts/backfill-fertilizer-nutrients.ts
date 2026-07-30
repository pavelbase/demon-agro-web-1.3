/**
 * DOPLNĚNÍ PŘÍVODU ŽIVIN A ZAŘAZENÍ HNOJIV K POLOŽKÁM EVIDENCE
 *
 * Položky hnojiv, které vznikly importem, nemají přívod N, P₂O₅ a K₂O – zdrojový
 * export ho neobsahoval. Skript ho dopočítá z dávky a obsahu živin v číselníku
 * hnojiv (tabulka fert_nutrients). Ručně zadané hodnoty nepřepisuje.
 *
 * Zároveň doplní zařazení hnojiva podle uvolnitelnosti dusíku a příznak
 * statkového hnojiva – bez nich nelze hlídat termíny a limity akčního programu
 * nitrátové směrnice.
 *
 * Hodnoty dříve dopočtené zástupnou měrnou hmotností 1 kg/l (n_estimated) se
 * odstraňují: výstup evidence jde do oficiálních hlášení a odhady do něj
 * nepatří – přívod musí doložit uživatel.
 *
 * POUŽITÍ:
 *   npx tsx scripts/backfill-fertilizer-nutrients.ts [--dry]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import {
  loadFertilizerNutrients,
  resolveNutrientContent,
} from '../lib/database/fertilizer-nutrient-data'
import { computeNutrientSupply } from '../lib/utils/fertilizer-nutrients'
import {
  classifyNitrogenGroup,
  isLivestockManure,
  NITROGEN_GROUP_LABELS,
  type NitrogenGroup,
} from '../lib/utils/nitrate-directive'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dryRun = process.argv.includes('--dry')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

async function main() {
  const { data: items, error } = await supabase
    .from('application_items')
    .select(
      'id, product_name, fert_evidence_number, dose, unit, n_kg_ha, p2o5_kg_ha, k2o_kg_ha, n_estimated'
    )
    .eq('kind', 'hnojivo')

  if (error) throw error

  const rows = items ?? []
  console.log(`🌱 Položek hnojiv: ${rows.length}`)

  const lookup = await loadFertilizerNutrients(supabase as never, {
    evidenceNumbers: rows.map((row) => row.fert_evidence_number),
    names: rows.map((row) => row.product_name),
  })

  interface Update {
    id: string
    values: Record<string, unknown>
  }

  const updates: Update[] = []
  const unresolved = new Map<string, number>()
  const resolved = new Map<string, { n: number | null; group: NitrogenGroup | null; source: string }>()

  for (const row of rows) {
    const content = resolveNutrientContent(lookup, {
      fertEvidenceNumber: row.fert_evidence_number,
      productName: row.product_name,
      unit: row.unit,
    })

    if (!content) {
      unresolved.set(row.product_name, (unresolved.get(row.product_name) ?? 0) + 1)
      continue
    }

    const group = classifyNitrogenGroup(content)
    const supply = computeNutrientSupply(Number(row.dose), row.unit, content)
    const values: Record<string, unknown> = {
      nitrogen_group: group,
      is_livestock_manure: isLivestockManure(content),
    }

    // Dřívější dopočet zástupnou hustotou 1 kg/l se ruší – bez věrohodné měrné
    // hmotnosti computeNutrientSupply nic nevrací a hodnota se vyprázdní,
    // dokud ji uživatel nedoloží
    const fillable = row.n_kg_ha === null || row.n_estimated === true

    if (fillable) {
      // Živina, kterou číselník u hnojiva neuvádí, v něm není obsažená
      values.n_kg_ha = supply ? supply.nKgHa ?? 0 : null
      values.p2o5_kg_ha = supply ? supply.p2o5KgHa ?? 0 : null
      values.k2o_kg_ha = supply ? supply.k2oKgHa ?? 0 : null
      values.n_estimated = false

      if (!supply) {
        unresolved.set(row.product_name, (unresolved.get(row.product_name) ?? 0) + 1)
      }
    }

    resolved.set(row.product_name, {
      n: (values.n_kg_ha as number | undefined) ?? (row.n_kg_ha !== null ? Number(row.n_kg_ha) : null),
      group,
      source: `${content.name} (${content.nPercent ?? 0} % N${
        content.unitType === 'O' ? `, ${content.densityKgL ?? '-'} kg/l` : ''
      }, dávka ${row.dose} ${row.unit})`,
    })

    updates.push({ id: row.id, values })
  }

  console.log(`\n=== DOPOČÍTÁNO ===`)
  for (const [name, info] of resolved) {
    const group = info.group ? NITROGEN_GROUP_LABELS[info.group] : 'zařazení neznámé'
    console.log(`  ${name.padEnd(34)} N ${info.n ?? '-'} kg/ha · ${group.padEnd(38)} ← ${info.source}`)
  }

  if (unresolved.size > 0) {
    console.log(`\n=== NEDOHLEDÁNO ===`)
    for (const [name, count] of unresolved) {
      console.log(`  ${name.padEnd(34)} ${count}× – doplňte přívod N ručně`)
    }
  }

  console.log(`\nK úpravě: ${updates.length} položek`)

  if (dryRun) {
    console.log('(--dry: nic se neukládá)')
    return
  }

  const batchSize = 25
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    await Promise.all(
      batch.map((update) =>
        supabase.from('application_items').update(update.values).eq('id', update.id)
      )
    )
    console.log(`   ✓ ${Math.min(i + batchSize, updates.length)}/${updates.length}`)
  }

  console.log('\n✅ Přívod živin doplněn. Spusťte znovu kontroly: npx tsx scripts/check-applications.ts <email>')
}

main().catch((error) => {
  console.error('❌ Doplnění selhalo:', error)
  process.exit(1)
})
