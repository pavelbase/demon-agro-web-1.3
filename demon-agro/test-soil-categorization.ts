#!/usr/bin/env ts-node
/**
 * Test script pro ověření kategorizace živin podle typu půdy
 * 
 * Testuje, že stejná hodnota živiny dává různé kategorie podle typu půdy
 * Podle Mehlich 3 metodiky ÚKZÚZ
 * 
 * Použití: npx tsx test-soil-categorization.ts
 */

import { categorizeNutrient } from './lib/utils/soil-categories'

console.log('╔══════════════════════════════════════════════════════════════╗')
console.log('║  TEST: Kategorizace živin podle typu půdy (Mehlich 3)     ║')
console.log('╚══════════════════════════════════════════════════════════════╝')
console.log()

// Test podle požadavků v zadání
console.log('📋 TEST 1: Fosfor P = 85 mg/kg')
console.log('─'.repeat(60))
const p_lehka = categorizeNutrient('P', 85, 'L')
const p_stredni = categorizeNutrient('P', 85, 'S')
const p_tezka = categorizeNutrient('P', 85, 'T')

console.log(`Lehká půda (L):    P = 85 mg/kg → ${p_lehka}`)
console.log(`Střední půda (S):  P = 85 mg/kg → ${p_stredni}`)
console.log(`Těžká půda (T):    P = 85 mg/kg → ${p_tezka}`)
console.log()

// Ověření podle zadání
console.log('✓ Očekávané výsledky:')
console.log(`  L: ${p_lehka === 'dobry' ? '✅' : '❌'} dobry (očekáváno: dobry, rozmezí 81-125)`)
console.log(`  S: ${p_stredni === 'nizky' ? '✅' : '❌'} nizky (očekáváno: nizky, pod 100)`)
console.log(`  T: ${p_tezka === 'nizky' ? '✅' : '❌'} nizky (očekáváno: nizky, pod 105)`)
console.log()

// Test 2: Draslík
console.log('📋 TEST 2: Draslík K = 150 mg/kg')
console.log('─'.repeat(60))
const k_lehka = categorizeNutrient('K', 150, 'L')
const k_stredni = categorizeNutrient('K', 150, 'S')
const k_tezka = categorizeNutrient('K', 150, 'T')

console.log(`Lehká půda (L):    K = 150 mg/kg → ${k_lehka}`)
console.log(`Střední půda (S):  K = 150 mg/kg → ${k_stredni}`)
console.log(`Těžká půda (T):    K = 150 mg/kg → ${k_tezka}`)
console.log()

console.log('✓ Očekávané výsledky:')
console.log(`  L: ${k_lehka === 'dobry' ? '✅' : '❌'} dobry (rozmezí 136-200)`)
console.log(`  S: ${k_stredni === 'vyhovujici' ? '✅' : '❌'} vyhovujici (rozmezí 106-160)`)
console.log(`  T: ${k_tezka === 'nizky' ? '✅' : '❌'} nizky (pod 170)`)
console.log()

// Test 3: Hořčík
console.log('📋 TEST 3: Hořčík Mg = 110 mg/kg')
console.log('─'.repeat(60))
const mg_lehka = categorizeNutrient('Mg', 110, 'L')
const mg_stredni = categorizeNutrient('Mg', 110, 'S')
const mg_tezka = categorizeNutrient('Mg', 110, 'T')

console.log(`Lehká půda (L):    Mg = 110 mg/kg → ${mg_lehka}`)
console.log(`Střední půda (S):  Mg = 110 mg/kg → ${mg_stredni}`)
console.log(`Těžká půda (T):    Mg = 110 mg/kg → ${mg_tezka}`)
console.log()

console.log('✓ Očekávané výsledky:')
console.log(`  L: ${mg_lehka === 'vyhovujici' ? '✅' : '❌'} vyhovujici (rozmezí 81-135)`)
console.log(`  S: ${mg_stredni === 'vyhovujici' ? '✅' : '❌'} vyhovujici (rozmezí 106-160)`)
console.log(`  T: ${mg_tezka === 'nizky' ? '✅' : '❌'} nizky (pod 120)`)
console.log()

// Test 4: Vápník (stejný pro všechny)
console.log('📋 TEST 4: Vápník Ca = 2000 mg/kg (stejný pro všechny typy půd)')
console.log('─'.repeat(60))
const ca_lehka = categorizeNutrient('Ca', 2000, 'L')
const ca_stredni = categorizeNutrient('Ca', 2000, 'S')
const ca_tezka = categorizeNutrient('Ca', 2000, 'T')

console.log(`Lehká půda (L):    Ca = 2000 mg/kg → ${ca_lehka}`)
console.log(`Střední půda (S):  Ca = 2000 mg/kg → ${ca_stredni}`)
console.log(`Těžká půda (T):    Ca = 2000 mg/kg → ${ca_tezka}`)
console.log()

console.log('✓ Očekávané výsledky (stejné pro všechny):')
console.log(`  Všechny: ${ca_lehka === 'dobry' && ca_stredni === 'dobry' && ca_tezka === 'dobry' ? '✅' : '❌'} dobry (rozmezí 1500-4000)`)
console.log()

// Test 5: Síra (stejná pro všechny)
console.log('📋 TEST 5: Síra S = 20 mg/kg (stejná pro všechny typy půd)')
console.log('─'.repeat(60))
const s_lehka = categorizeNutrient('S', 20, 'L')
const s_stredni = categorizeNutrient('S', 20, 'S')
const s_tezka = categorizeNutrient('S', 20, 'T')

console.log(`Lehká půda (L):    S = 20 mg/kg → ${s_lehka}`)
console.log(`Střední půda (S):  S = 20 mg/kg → ${s_stredni}`)
console.log(`Těžká půda (T):    S = 20 mg/kg → ${s_tezka}`)
console.log()

console.log('✓ Očekávané výsledky (stejné pro všechny):')
console.log(`  Všechny: ${s_lehka === 'dobry' && s_stredni === 'dobry' && s_tezka === 'dobry' ? '✅' : '❌'} dobry (rozmezí 16-25)`)
console.log()

// Celkové výsledky
console.log('═'.repeat(60))
const allPassed = 
  p_lehka === 'dobry' && p_stredni === 'nizky' && p_tezka === 'nizky' &&
  k_lehka === 'dobry' && k_stredni === 'vyhovujici' && k_tezka === 'nizky' &&
  mg_lehka === 'vyhovujici' && mg_stredni === 'vyhovujici' && mg_tezka === 'nizky' &&
  ca_lehka === 'dobry' && ca_stredni === 'dobry' && ca_tezka === 'dobry' &&
  s_lehka === 'dobry' && s_stredni === 'dobry' && s_tezka === 'dobry'

if (allPassed) {
  console.log('✅ VŠECHNY TESTY PROŠLY!')
  console.log()
  console.log('Kategorizace živin funguje správně podle typu půdy.')
  process.exit(0)
} else {
  console.log('❌ NĚKTERÉ TESTY SELHALY!')
  console.log()
  console.log('Zkontrolujte implementaci funkce categorizeNutrient.')
  process.exit(1)
}



