#!/usr/bin/env node
/**
 * Migrační skript pro přepočítání všech soil categories
 * 
 * DŮVOD: Po opravě limitů v soil-categories.ts je potřeba přepočítat
 * všechny existující záznamy v databázi podle nových prahových hodnot.
 * 
 * POUŽITÍ:
 * 1. Ujistěte se, že máte SUPABASE_SERVICE_ROLE_KEY v .env.local
 * 2. Spusťte: npx tsx scripts/recalculate-soil-categories.ts
 */

import { createClient } from '@supabase/supabase-js'
import { categorizePh, categorizeNutrient } from '../lib/utils/soil-categories'
import type { SoilType } from '../lib/utils/soil-categories'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí proměnné prostředí!')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  console.error('\nPřidejte do .env.local:')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function recalculateCategories() {
  console.log('🔄 Načítání všech soil_analyses...\n')
  
  // Načíst všechny rozbory včetně parcel (pro soil_type)
  const { data: analyses, error } = await supabase
    .from('soil_analyses')
    .select(`
      id,
      ph,
      ph_category,
      p,
      p_category,
      k,
      k_category,
      mg,
      mg_category,
      ca,
      ca_category,
      s,
      s_category,
      parcel_id,
      parcels!inner(
        id,
        soil_type,
        culture
      )
    `)
  
  if (error) {
    console.error('❌ Chyba při načítání:', error)
    return
  }
  
  if (!analyses || analyses.length === 0) {
    console.log('⚠️ Žádné rozbory k přepočítání')
    return
  }
  
  console.log(`📊 Načteno ${analyses.length} rozborů\n`)
  console.log('=' .repeat(80))
  
  let updated = 0
  let unchanged = 0
  let errors = 0
  
  for (const analysis of analyses) {
    try {
      // @ts-ignore - parcels structure from join
      const soilType = (analysis.parcels?.soil_type || 'S') as SoilType
      // @ts-ignore - parcels structure from join
      const culture = analysis.parcels?.culture
      
      // Přepočítat kategorie podle NOVÝCH funkcí (dle kultury - chmelnice mají vlastní kritéria)
      const new_ph_category = categorizePh(analysis.ph)
      const new_p_category = categorizeNutrient('P', analysis.p, soilType, culture)
      const new_k_category = categorizeNutrient('K', analysis.k, soilType, culture)
      const new_mg_category = categorizeNutrient('Mg', analysis.mg, soilType, culture)
      // @ts-ignore - ca může být null
      const new_ca_category = analysis.ca ? categorizeNutrient('Ca', analysis.ca, soilType) : null
      // @ts-ignore - s může být null nebo undefined
      const new_s_category = analysis.s ? categorizeNutrient('S', analysis.s, soilType) : null
      
      // Zkontrolovat, zda se něco změnilo
      const hasChanges = 
        new_ph_category !== analysis.ph_category ||
        new_p_category !== analysis.p_category ||
        new_k_category !== analysis.k_category ||
        new_mg_category !== analysis.mg_category ||
        new_ca_category !== analysis.ca_category ||
        new_s_category !== analysis.s_category
      
      if (!hasChanges) {
        unchanged++
        continue
      }
      
      // Zobrazit změny
      console.log(`\n📝 Rozbor ID: ${analysis.id} (půda: ${soilType})`)
      if (new_ph_category !== analysis.ph_category) {
        console.log(`   pH ${analysis.ph.toFixed(2)}: ${analysis.ph_category} → ${new_ph_category}`)
      }
      if (new_p_category !== analysis.p_category) {
        console.log(`   P ${analysis.p.toFixed(0)} mg/kg: ${analysis.p_category} → ${new_p_category}`)
      }
      if (new_k_category !== analysis.k_category) {
        console.log(`   K ${analysis.k.toFixed(0)} mg/kg: ${analysis.k_category} → ${new_k_category}`)
      }
      if (new_mg_category !== analysis.mg_category) {
        console.log(`   Mg ${analysis.mg.toFixed(0)} mg/kg: ${analysis.mg_category} → ${new_mg_category}`)
      }
      // @ts-ignore
      if (analysis.ca && new_ca_category !== analysis.ca_category) {
        // @ts-ignore
        console.log(`   Ca ${analysis.ca.toFixed(0)} mg/kg: ${analysis.ca_category || 'null'} → ${new_ca_category}`)
      }
      // @ts-ignore
      if (analysis.s && new_s_category !== analysis.s_category) {
        // @ts-ignore
        console.log(`   S ${analysis.s.toFixed(1)} mg/kg: ${analysis.s_category || 'null'} → ${new_s_category}`)
      }
      
      // Update v databázi
      const { error: updateError } = await supabase
        .from('soil_analyses')
        .update({
          ph_category: new_ph_category,
          p_category: new_p_category,
          k_category: new_k_category,
          mg_category: new_mg_category,
          ca_category: new_ca_category,
          s_category: new_s_category,
        })
        .eq('id', analysis.id)
      
      if (updateError) {
        console.error(`   ❌ Chyba při updatu:`, updateError.message)
        errors++
      } else {
        console.log(`   ✅ Aktualizováno`)
        updated++
      }
    } catch (err) {
      console.error(`❌ Chyba při zpracování ${analysis.id}:`, err)
      errors++
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n📊 VÝSLEDKY MIGRACE:')
  console.log(`✅ Úspěšně přepočítáno: ${updated}`)
  console.log(`⚪ Beze změny: ${unchanged}`)
  console.log(`❌ Chyby: ${errors}`)
  console.log(`📝 Celkem záznamů: ${analyses.length}`)
}

// Spustit migraci
console.log('╔═══════════════════════════════════════════════════════════════╗')
console.log('║   MIGRACE: Přepočítání soil categories podle Mehlich 3      ║')
console.log('╚═══════════════════════════════════════════════════════════════╝')
console.log()

recalculateCategories()
  .then(() => {
    console.log('\n🎉 Migrace dokončena!')
    console.log('\n📋 DALŠÍ KROKY:')
    console.log('   1. Zkontrolujte výsledky v Supabase')
    console.log('   2. Restartujte aplikaci: rm -rf .next && npm run dev')
    console.log('   3. Proveďte hard refresh v prohlížeči (Ctrl+Shift+R)')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n💥 Fatální chyba:', err)
    process.exit(1)
  })


