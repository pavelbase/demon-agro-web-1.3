/**
 * TESTOVACÍ SCRIPT PRO SYSTÉM PLÁNOVÁNÍ VÁPNĚNÍ
 * ==============================================
 * 
 * Tento script testuje výpočetní funkce pro plán vápnění
 * bez nutnosti připojení k databázi.
 */

import { generateLimingPlan, type LimeProduct, type LimingInput } from './lib/utils/liming-calculator'

// Testovací produkty
const testProducts: LimeProduct[] = [
  {
    id: 'test-1',
    name: 'Vápenec mletý',
    type: 'vapenec_mlety',
    caoContent: 52,
    mgoContent: 0,
    pricePerTon: 300
  },
  {
    id: 'test-2',
    name: 'Dolomit mletý',
    type: 'dolomit_mlety',
    caoContent: 30,
    mgoContent: 18,
    pricePerTon: 300
  },
  {
    id: 'test-3',
    name: 'Vápenec granulovaný',
    type: 'vapenec_granul',
    caoContent: 50,
    mgoContent: 0,
    pricePerTon: 350
  }
]

// =====================================================
// TEST 1: Lehká půda, nízké pH, nízké Mg
// =====================================================
console.log('\n' + '='.repeat(60))
console.log('TEST 1: Lehká půda, pH 5.0 → 6.0, Mg 76 (nízké)')
console.log('='.repeat(60))

const test1Input: LimingInput = {
  currentPh: 5.0,
  targetPh: 6.0,
  soilType: 'L',
  area: 10.0,
  currentMg: 76, // Nízké → měl by vybrat dolomit
  landUse: 'orna'
}

const test1Result = generateLimingPlan(test1Input, testProducts)

console.log('\n📊 VÝSLEDKY:')
console.log(`✓ Celková potřeba Ca: ${test1Result.totalCaNeed.toFixed(2)} t (${test1Result.totalCaNeedPerHa.toFixed(2)} t/ha)`)
console.log(`✓ Celková potřeba CaO: ${test1Result.totalCaoNeed.toFixed(2)} t (${test1Result.totalCaoNeedPerHa.toFixed(2)} t/ha)`)
console.log(`✓ Počet aplikací: ${test1Result.applications.length}`)

console.log('\n📅 APLIKACE:')
test1Result.applications.forEach((app, idx) => {
  console.log(`\n${idx + 1}. Aplikace:`)
  console.log(`   Rok: ${app.year}`)
  console.log(`   Období: ${app.season}`)
  console.log(`   Produkt: ${app.product.name} (${app.product.caoContent}% CaO, ${app.product.mgoContent}% MgO)`)
  console.log(`   Dávka: ${app.dosePerHa.toFixed(2)} t/ha (celkem ${app.totalDose.toFixed(1)} t)`)
  console.log(`   CaO: ${app.caoPerHa.toFixed(2)} t/ha`)
  console.log(`   MgO: ${app.mgoPerHa.toFixed(2)} t/ha`)
  console.log(`   pH změna: ${app.phBefore.toFixed(1)} → ${app.phAfter.toFixed(1)}`)
  console.log(`   Mg změna: → ${app.mgAfter?.toFixed(0)} mg/kg`)
  console.log(`   Doporučení: ${app.recommendation}`)
})

if (test1Result.warnings.length > 0) {
  console.log('\n⚠️  UPOZORNĚNÍ:')
  test1Result.warnings.forEach(w => console.log(`   - ${w}`))
}

// =====================================================
// TEST 2: Střední půda, urgentní vápnění, vyhovující Mg
// =====================================================
console.log('\n' + '='.repeat(60))
console.log('TEST 2: Střední půda, pH 4.8 → 6.5, Mg 120 (vyhovující)')
console.log('='.repeat(60))

const test2Input: LimingInput = {
  currentPh: 4.8,
  targetPh: 6.5,
  soilType: 'S',
  area: 15.0,
  currentMg: 120, // Vyhovující → měl by vybrat čistý vápenec
  landUse: 'orna'
}

const test2Result = generateLimingPlan(test2Input, testProducts)

console.log('\n📊 VÝSLEDKY:')
console.log(`✓ Celková potřeba Ca: ${test2Result.totalCaNeed.toFixed(2)} t (${test2Result.totalCaNeedPerHa.toFixed(2)} t/ha)`)
console.log(`✓ Celková potřeba CaO: ${test2Result.totalCaoNeed.toFixed(2)} t (${test2Result.totalCaoNeedPerHa.toFixed(2)} t/ha)`)
console.log(`✓ Počet aplikací: ${test2Result.applications.length}`)

console.log('\n📅 APLIKACE:')
test2Result.applications.forEach((app, idx) => {
  console.log(`\n${idx + 1}. Aplikace:`)
  console.log(`   Rok: ${app.year}`)
  console.log(`   Produkt: ${app.product.name}`)
  console.log(`   Dávka: ${app.dosePerHa.toFixed(2)} t/ha`)
  console.log(`   pH: ${app.phBefore.toFixed(1)} → ${app.phAfter.toFixed(1)}`)
  console.log(`   Doporučení: ${app.recommendation}`)
})

// =====================================================
// TEST 3: Těžká půda, optimální pH
// =====================================================
console.log('\n' + '='.repeat(60))
console.log('TEST 3: Těžká půda, pH 6.8 → 6.8 (už optimální)')
console.log('='.repeat(60))

const test3Input: LimingInput = {
  currentPh: 6.8,
  targetPh: 6.8,
  soilType: 'T',
  area: 20.0,
  currentMg: 200,
  landUse: 'orna'
}

const test3Result = generateLimingPlan(test3Input, testProducts)

console.log('\n📊 VÝSLEDKY:')
console.log(`✓ Celková potřeba CaO: ${test3Result.totalCaoNeed.toFixed(2)} t`)
console.log(`✓ Počet aplikací: ${test3Result.applications.length}`)

if (test3Result.warnings.length > 0) {
  console.log('\n⚠️  UPOZORNĚNÍ:')
  test3Result.warnings.forEach(w => console.log(`   - ${w}`))
}

// =====================================================
// SOUHRN TESTŮ
// =====================================================
console.log('\n' + '='.repeat(60))
console.log('SOUHRN TESTŮ')
console.log('='.repeat(60))

console.log('\n✅ Test 1 (Lehká, nízké Mg):')
console.log(`   - Vybral dolomit? ${test1Result.applications[0]?.product.name.includes('Dolomit') ? 'ANO ✓' : 'NE ✗'}`)
console.log(`   - Počet aplikací: ${test1Result.applications.length}`)
console.log(`   - Dosaženo cílového pH? ${test1Result.applications[test1Result.applications.length - 1]?.phAfter >= test1Input.targetPh - 0.1 ? 'ANO ✓' : 'NE ✗'}`)

console.log('\n✅ Test 2 (Střední, urgentní):')
console.log(`   - Vybral vápenec? ${test2Result.applications[0]?.product.name.includes('Vápenec') ? 'ANO ✓' : 'NE ✗'}`)
console.log(`   - Počet aplikací: ${test2Result.applications.length}`)
console.log(`   - První aplikace urgentní? ${test2Result.applications[0]?.recommendation.includes('Urgentní') ? 'ANO ✓' : 'NE ✗'}`)

console.log('\n✅ Test 3 (Optimální pH):')
console.log(`   - Žádné vápnění? ${test3Result.applications.length === 0 ? 'ANO ✓' : 'NE ✗'}`)
console.log(`   - Upozornění zobrazeno? ${test3Result.warnings.length > 0 ? 'ANO ✓' : 'NE ✗'}`)

console.log('\n' + '='.repeat(60))
console.log('VŠECHNY TESTY DOKONČENY')
console.log('='.repeat(60) + '\n')




