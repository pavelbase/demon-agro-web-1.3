/**
 * TEST SKRIPT PRO OVĚŘENÍ OPRAVENÉ LOGIKY VÁPNĚNÍ
 * =================================================
 * 
 * Testuje:
 * 1. Maximální dávka CaO pro střední půdu je 2.0 t/ha (ne 3.0)
 * 2. Při Mg < 130 mg/kg se používá 100% DOLOMIT (žádný mix)
 * 3. Při Mg >= 130 mg/kg se používá čistý VÁPENEC
 */

import { generateLimingPlan, type LimingInput, type LimeProduct } from '../lib/utils/liming-calculator'

// Mock produkty (odpovídají DB produktům)
const mockProducts: LimeProduct[] = [
  {
    id: 'vapenec-mlety',
    name: 'Vápenec mletý',
    type: 'calcitic',
    caoContent: 52.0,
    mgoContent: 0.0
  },
  {
    id: 'dolomit-mlety',
    name: 'Dolomit mletý',
    type: 'dolomite',
    caoContent: 30.0,
    mgoContent: 18.0
  },
  {
    id: 'vapenec-granul',
    name: 'Vápenec granulovaný',
    type: 'calcitic',
    caoContent: 50.0,
    mgoContent: 0.0
  },
  {
    id: 'dolomit-granul',
    name: 'Dolomit granulovaný',
    type: 'dolomite',
    caoContent: 32.0,
    mgoContent: 16.0
  }
]

console.log('🧪 TEST OPRAVENÉ LOGIKY VÁPNĚNÍ')
console.log('=' .repeat(80))
console.log()

// ============================================================================
// TEST 1: Střední půda, pH 5.0, Mg 99 mg/kg (Případ z user reportu)
// ============================================================================

console.log('📋 TEST 1: Střední půda, pH 5.0, Mg 99 mg/kg')
console.log('-'.repeat(80))

const test1Input: LimingInput = {
  currentPh: 5.0,
  targetPh: 6.5,
  soilType: 'S',
  area: 10,
  currentMg: 99,
  landUse: 'orna'
}

const test1Result = generateLimingPlan(test1Input, mockProducts)

console.log('Vstup:')
console.log(`  - pH: ${test1Input.currentPh} → ${test1Input.targetPh}`)
console.log(`  - Mg: ${test1Input.currentMg} mg/kg`)
console.log(`  - Půda: ${test1Input.soilType} (střední)`)
console.log(`  - Plocha: ${test1Input.area} ha`)
console.log()

console.log('Výsledek:')
console.log(`  ✅ Celková potřeba CaO: ${test1Result.totalCaoNeed.toFixed(2)} t (${test1Result.totalCaoNeedPerHa.toFixed(2)} t/ha)`)
console.log(`  ✅ Počet aplikací: ${test1Result.applications.length}`)
console.log()

// Kontrola aplikací
test1Result.applications.forEach((app, idx) => {
  console.log(`Aplikace ${idx + 1} (${app.year}):`)
  console.log(`  - Produkt: ${app.product.name}`)
  console.log(`  - Dávka produktu: ${app.dosePerHa.toFixed(2)} t/ha (celkem ${app.totalDose.toFixed(1)} t)`)
  console.log(`  - CaO: ${app.caoPerHa.toFixed(2)} t/ha`)
  console.log(`  - MgO: ${app.mgoPerHa.toFixed(3)} t/ha`)
  console.log(`  - pH: ${app.phBefore.toFixed(1)} → ${app.phAfter.toFixed(1)}`)
  console.log(`  - Mg po: ${app.mgAfter?.toFixed(0)} mg/kg`)
  
  // KONTROLY
  if (app.caoPerHa > 2.0) {
    console.log(`  ❌ CHYBA: Dávka CaO ${app.caoPerHa.toFixed(2)} t/ha PŘEKRAČUJE limit 2.0 t/ha!`)
  } else {
    console.log(`  ✅ Dávka CaO je v limitu (≤ 2.0 t/ha)`)
  }
  
  if (test1Input.currentMg < 130 && !app.product.name.toLowerCase().includes('dolomit')) {
    console.log(`  ❌ CHYBA: Mg je nízké (${test1Input.currentMg} mg/kg), ale není použit dolomit!`)
  } else if (test1Input.currentMg < 130) {
    console.log(`  ✅ Správně použit dolomit pro nízké Mg`)
  }
  
  console.log()
})

// Varování
if (test1Result.warnings.length > 0) {
  console.log('⚠️  Varování:')
  test1Result.warnings.forEach(w => console.log(`  - ${w}`))
  console.log()
}

console.log()

// ============================================================================
// TEST 2: Střední půda, pH 5.0, Mg 150 mg/kg (Mg vysoké - měl by použít vápenec)
// ============================================================================

console.log('📋 TEST 2: Střední půda, pH 5.0, Mg 150 mg/kg (vyšší Mg)')
console.log('-'.repeat(80))

const test2Input: LimingInput = {
  currentPh: 5.0,
  targetPh: 6.5,
  soilType: 'S',
  area: 10,
  currentMg: 150, // Vysoké Mg - měl by použít vápenec
  landUse: 'orna'
}

const test2Result = generateLimingPlan(test2Input, mockProducts)

console.log('Vstup:')
console.log(`  - pH: ${test2Input.currentPh} → ${test2Input.targetPh}`)
console.log(`  - Mg: ${test2Input.currentMg} mg/kg`)
console.log(`  - Půda: ${test2Input.soilType} (střední)`)
console.log()

console.log('Výsledek:')
console.log(`  ✅ Celková potřeba CaO: ${test2Result.totalCaoNeed.toFixed(2)} t (${test2Result.totalCaoNeedPerHa.toFixed(2)} t/ha)`)
console.log(`  ✅ Počet aplikací: ${test2Result.applications.length}`)
console.log()

test2Result.applications.forEach((app, idx) => {
  console.log(`Aplikace ${idx + 1} (${app.year}):`)
  console.log(`  - Produkt: ${app.product.name}`)
  console.log(`  - CaO: ${app.caoPerHa.toFixed(2)} t/ha`)
  
  // KONTROLY
  if (app.caoPerHa > 2.0) {
    console.log(`  ❌ CHYBA: Dávka CaO ${app.caoPerHa.toFixed(2)} t/ha PŘEKRAČUJE limit 2.0 t/ha!`)
  } else {
    console.log(`  ✅ Dávka CaO je v limitu (≤ 2.0 t/ha)`)
  }
  
  if (test2Input.currentMg >= 130 && app.product.name.toLowerCase().includes('dolomit')) {
    console.log(`  ❌ CHYBA: Mg je vysoké (${test2Input.currentMg} mg/kg), měl by být použit vápenec, ne dolomit!`)
  } else if (test2Input.currentMg >= 130) {
    console.log(`  ✅ Správně použit vápenec pro vysoké Mg`)
  }
  
  console.log()
})

console.log()

// ============================================================================
// SOUHRN
// ============================================================================

console.log('=' .repeat(80))
console.log('📊 SOUHRN TESTŮ')
console.log('=' .repeat(80))

let passed = 0
let failed = 0

// Test 1 kontroly
const test1MaxCao = Math.max(...test1Result.applications.map(a => a.caoPerHa))
const test1UsesDolomite = test1Result.applications.every(a => a.product.name.toLowerCase().includes('dolomit'))

if (test1MaxCao <= 2.0) {
  console.log('✅ TEST 1a: Maximální dávka CaO ≤ 2.0 t/ha pro střední půdu')
  passed++
} else {
  console.log('❌ TEST 1a: Maximální dávka CaO překračuje 2.0 t/ha!')
  failed++
}

if (test1UsesDolomite) {
  console.log('✅ TEST 1b: Při Mg < 130 se používá 100% dolomit (žádný mix)')
  passed++
} else {
  console.log('❌ TEST 1b: Při Mg < 130 by měl být použit pouze dolomit!')
  failed++
}

// Test 2 kontroly
const test2MaxCao = Math.max(...test2Result.applications.map(a => a.caoPerHa))
const test2UsesCalcite = test2Result.applications.every(a => !a.product.name.toLowerCase().includes('dolomit'))

if (test2MaxCao <= 2.0) {
  console.log('✅ TEST 2a: Maximální dávka CaO ≤ 2.0 t/ha pro střední půdu')
  passed++
} else {
  console.log('❌ TEST 2a: Maximální dávka CaO překračuje 2.0 t/ha!')
  failed++
}

if (test2UsesCalcite) {
  console.log('✅ TEST 2b: Při Mg >= 130 se používá vápenec (ne dolomit)')
  passed++
} else {
  console.log('❌ TEST 2b: Při Mg >= 130 by měl být použit vápenec!')
  failed++
}

console.log()
console.log(`Výsledek: ${passed}/${passed + failed} testů prošlo`)

if (failed === 0) {
  console.log()
  console.log('🎉 VŠECHNY TESTY PROŠLY! Opravená logika funguje správně.')
} else {
  console.log()
  console.log('⚠️  NĚKTERÉ TESTY SELHALY! Je potřeba zkontrolovat kód.')
  process.exit(1)
}



