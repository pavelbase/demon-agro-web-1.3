/**
 * TEST SKRIPT: Jednorázový rozpis Dolomit/Vápenec (calculateOneTimeProductSplit)
 * ================================================================================
 * Ověřuje agronomickou logiku:
 * 1. Nízké/vyhovující Mg -> použije se Dolomit na doplnění Mg + Vápenec na zbytek CaO
 * 2. Dobré/vysoké Mg -> použije se pouze Vápenec
 * 3. Informativní doplnění K2O s ohledem na poměr K/Mg
 */

import { calculateOneTimeProductSplit, type OneTimeProductSplitInput, type LimeProduct } from '../lib/utils/liming-calculator'

const vapenec: LimeProduct = { id: 'vapenec-mlety', name: 'Vápenec mletý', type: 'calcitic', caoContent: 52.0, mgoContent: 0.0 }
const dolomit: LimeProduct = { id: 'dolomit-mlety', name: 'Dolomit mletý', type: 'dolomite', caoContent: 30.0, mgoContent: 18.0 }

function run(label: string, input: OneTimeProductSplitInput) {
  console.log(`\n📋 ${label}`)
  console.log('-'.repeat(80))
  const result = calculateOneTimeProductSplit(input, dolomit, vapenec)
  console.log(`  pH: ${input.currentPh}, Mg: ${input.currentMg} mg/kg (${result.mgCategory}), K: ${input.currentK} mg/kg, půda: ${input.soilType}`)
  console.log(`  Celková potřeba CaO: ${result.totalCaoNeedTHa.toFixed(2)} t/ha (${result.totalCaoNeedCelkem.toFixed(1)} t celkem)`)
  console.log(`  Dolomit: ${result.dolomitTHa.toFixed(2)} t/ha (${result.dolomitCelkem.toFixed(1)} t celkem)`)
  console.log(`  Vápenec: ${result.vapenecTHa.toFixed(2)} t/ha (${result.vapenecCelkem.toFixed(1)} t celkem)`)
  console.log(`  Produkt celkem: ${result.produktCelkemTHa.toFixed(2)} t/ha (${result.produktCelkemTun.toFixed(1)} t celkem)`)
  console.log(`  K/Mg poměr: ${result.kMgRatio?.toFixed(2) ?? '-'} -> ${result.kMgPoznamka}`)
  console.log(`  Doplnit K2O: ${result.doplnitK2OKgHa ?? '-'} kg/ha`)
  if (result.warnings.length > 0) {
    console.log('  Varování:')
    result.warnings.forEach(w => console.log(`    - ${w}`))
  }
}

console.log('🧪 TEST: calculateOneTimeProductSplit')
console.log('='.repeat(80))

run('TEST 1: Nízké Mg, kyselé pH, střední půda (10 ha)', {
  currentPh: 5.0,
  currentMg: 90,
  currentK: 150,
  soilType: 'S',
  landUse: 'orna',
  area: 10,
})

run('TEST 2: Vysoké Mg, kyselé pH, střední půda (10 ha)', {
  currentPh: 5.0,
  currentMg: 300,
  currentK: 150,
  soilType: 'S',
  landUse: 'orna',
  area: 10,
})

run('TEST 3: pH v optimu -> žádná potřeba', {
  currentPh: 6.8,
  currentMg: 150,
  currentK: 150,
  soilType: 'S',
  landUse: 'orna',
  area: 10,
})

run('TEST 4: Velmi kyselé, těžká půda, nízké Mg i K (kontrola limitu jednorázové dávky)', {
  currentPh: 4.3,
  currentMg: 60,
  currentK: 80,
  soilType: 'T',
  landUse: 'orna',
  area: 25,
})

// ============================================================
// CHMELNICE (zadani-chmelnice-engine.md)
// ============================================================
// Mg=180 mg/kg na střední půdě: orná = "dobrý" (>160) -> žádný dolomit
//                                chmelnice = "vyhovující" (161-250) -> DOLOMIT
run('TEST 5 (ORNÁ): Mg=180 na střední půdě -> dle orné kritérií "dobrý", jen vápenec', {
  currentPh: 5.5,
  currentMg: 180,
  currentK: 200,
  soilType: 'S',
  landUse: 'orna',
  area: 10,
})

run('TEST 6 (CHMELNICE): stejné Mg=180 na střední půdě -> dle tab.13 "vyhovující", nasadí se dolomit', {
  currentPh: 5.5,
  currentMg: 180,
  currentK: 200,
  soilType: 'S',
  landUse: 'chmelnice',
  area: 10,
})

console.log('\n' + '='.repeat(80))
console.log('✅ Test dokončen')
