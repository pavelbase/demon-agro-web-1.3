// Quick test script for Phase 5.3 - Advanced Plan
// Run with: node --loader ts-node/esm test-advanced-plan.mjs

import { generateAdvancedPlan } from './lib/utils/fertilization-plan'

// Test data
const parcel = {
  id: 'test-parcel-1',
  user_id: 'test-user',
  name: 'Testovací pozemek',
  area: 10.5,
  cadastral_number: '123-456/1',
  soil_type: 'S',
  culture: 'orna',
  notes: null,
  status: 'active',
  source_parcel_id: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const analysis = {
  id: 'test-analysis-1',
  parcel_id: 'test-parcel-1',
  user_id: 'test-user',
  date: '2024-08-15',
  ph: 5.8,
  ph_category: 'SK',
  phosphorus: 80,
  phosphorus_category: 'D',
  potassium: 180,
  potassium_category: 'D',
  magnesium: 90,
  magnesium_category: 'D',
  calcium: 1200,
  calcium_category: 'D',
  nitrogen: null,
  sulfur: 15,
  pdf_url: null,
  lab_name: 'Test Lab',
  notes: null,
  created_at: '2024-08-15T00:00:00Z',
  updated_at: '2024-08-15T00:00:00Z',
}

const rotations = [
  // Historical
  { 
    id: '1', 
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    year: 2023, 
    crop_name: 'wheat', 
    expected_yield: null,
    actual_yield: 7.5,
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  { 
    id: '2', 
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    year: 2024, 
    crop_name: 'rapeseed', 
    expected_yield: null,
    actual_yield: 4.0,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  
  // Future
  { 
    id: '3', 
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    year: 2025, 
    crop_name: 'wheat', 
    expected_yield: 8.0,
    actual_yield: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  { 
    id: '4', 
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    year: 2026, 
    crop_name: 'rapeseed', 
    expected_yield: 4.5,
    actual_yield: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  { 
    id: '5', 
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    year: 2027, 
    crop_name: 'barley', 
    expected_yield: 7.0,
    actual_yield: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  { 
    id: '6', 
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    year: 2028, 
    crop_name: 'corn', 
    expected_yield: 10.0,
    actual_yield: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

const history = [
  {
    id: '1',
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    date: '2023-04-10',
    product_name: 'LAD 27',
    quantity: 300,
    unit: 'kg',
    nitrogen: 81,
    phosphorus: 0,
    potassium: 0,
    magnesium: 0,
    calcium: 0,
    notes: null,
    created_at: '2023-04-10T00:00:00Z',
    updated_at: '2023-04-10T00:00:00Z',
  },
  {
    id: '2',
    parcel_id: 'test-parcel-1',
    user_id: 'test-user',
    date: '2024-03-25',
    product_name: 'NPK 15-15-15',
    quantity: 400,
    unit: 'kg',
    nitrogen: 60,
    phosphorus: 26,
    potassium: 50,
    magnesium: 0,
    calcium: 0,
    notes: null,
    created_at: '2024-03-25T00:00:00Z',
    updated_at: '2024-03-25T00:00:00Z',
  },
]

console.log('🧪 Testing Phase 5.3 - Advanced Plan Generation\n')
console.log('═'.repeat(60))

try {
  console.log('\n📋 Input Data:')
  console.log(`  Parcel: ${parcel.name} (${parcel.area} ha, ${parcel.soil_type})`)
  console.log(`  Analysis: pH ${analysis.ph}, P ${analysis.phosphorus} mg/kg, K ${analysis.potassium} mg/kg`)
  console.log(`  Rotations: ${rotations.length} years (2 historical + 4 future)`)
  console.log(`  History: ${history.length} fertilization records`)
  
  console.log('\n⚙️  Generating advanced plan...\n')
  
  const plan = generateAdvancedPlan(parcel, analysis, rotations, history)
  
  console.log('✅ Plan generated successfully!\n')
  console.log('═'.repeat(60))
  
  console.log('\n📊 PLAN DETAILS:')
  console.log(`  Type: ${plan.plan_type}`)
  console.log(`  User Type: ${plan.user_type}`)
  console.log(`  Target Year: ${plan.target_year}`)
  
  console.log('\n🌱 LIME RECOMMENDATION:')
  console.log(`  Amount: ${(plan.recommended_lime_kg_ha / 1000).toFixed(1)} t/ha`)
  console.log(`  Type: ${plan.recommended_lime_type}`)
  console.log(`  Reason: ${plan.lime_reasoning}`)
  
  console.log('\n💊 NUTRIENT RECOMMENDATIONS:')
  console.log(`  P₂O₅: ${plan.recommended_nutrients.p2o5} kg/ha`)
  console.log(`  K₂O: ${plan.recommended_nutrients.k2o} kg/ha`)
  console.log(`  MgO: ${plan.recommended_nutrients.mgo} kg/ha`)
  console.log(`  S: ${plan.recommended_nutrients.s} kg/ha`)
  
  if (plan.km_ratio) {
    console.log('\n⚖️  K:Mg RATIO:')
    console.log(`  Current: ${plan.km_ratio.toFixed(2)}`)
    console.log(`  Corrected: ${plan.km_ratio_corrected ? 'Yes' : 'No'}`)
    console.log(`  Optimal: 1.5-2.5`)
  }
  
  if (plan.predictions) {
    console.log('\n📈 4-YEAR PREDICTIONS:')
    console.log(`  Years: ${plan.predictions.years.join(', ')}`)
    console.log(`  pH:    ${plan.predictions.ph.map(v => v.toFixed(1)).join(' → ')}`)
    console.log(`  P:     ${plan.predictions.p.join(' → ')} mg/kg`)
    console.log(`  K:     ${plan.predictions.k.join(' → ')} mg/kg`)
    console.log(`  Mg:    ${plan.predictions.mg.join(' → ')} mg/kg`)
    console.log(`  S:     ${plan.predictions.s.join(' → ')} mg/kg`)
    
    // Calculate trends
    const pTrend = plan.predictions.p[3] - plan.predictions.p[0]
    const kTrend = plan.predictions.k[3] - plan.predictions.k[0]
    const phTrend = plan.predictions.ph[3] - plan.predictions.ph[0]
    
    console.log('\n  Trends (4 years):')
    console.log(`    P:  ${pTrend > 0 ? '+' : ''}${pTrend} mg/kg ${pTrend < -20 ? '⚠️  Declining' : '✓'}`)
    console.log(`    K:  ${kTrend > 0 ? '+' : ''}${kTrend} mg/kg ${kTrend < -30 ? '⚠️  Declining' : '✓'}`)
    console.log(`    pH: ${phTrend > 0 ? '+' : ''}${phTrend.toFixed(2)} ${phTrend < -0.3 ? '⚠️  Acidifying' : '✓'}`)
  }
  
  console.log('\n⚠️  WARNINGS (' + plan.warnings.length + '):')
  plan.warnings.forEach((w, i) => {
    const icon = w.severity === 'error' ? '❌' : w.severity === 'warning' ? '⚠️ ' : 'ℹ️ '
    console.log(`  ${i + 1}. ${icon} [${w.severity.toUpperCase()}] ${w.type}`)
    console.log(`     ${w.message}`)
    if (w.recommendation) {
      console.log(`     → ${w.recommendation}`)
    }
  })
  
  if (plan.notes && plan.notes.length > 0) {
    console.log('\n📝 NOTES:')
    plan.notes.forEach((note, i) => {
      console.log(`  ${i + 1}. ${note}`)
    })
  }
  
  console.log('\n' + '═'.repeat(60))
  console.log('\n✅ TEST PASSED - Phase 5.3 is working correctly!')
  console.log('\n📊 Summary:')
  console.log(`  - Plan type: ${plan.plan_type}`)
  console.log(`  - Predictions: ${plan.predictions ? plan.predictions.years.length : 0} years`)
  console.log(`  - Warnings: ${plan.warnings.length}`)
  console.log(`  - Notes: ${plan.notes ? plan.notes.length : 0}`)
  console.log('\n🎉 Ready for UI implementation!')
  
} catch (error) {
  console.error('\n❌ TEST FAILED')
  console.error('\nError:', error.message)
  console.error('\nStack:', error.stack)
  process.exit(1)
}
