# Phase 5.3 - Advanced Plan - Quick Test Guide

## ⚡ Quick Test (5 minutes)

Test the advanced fertilization plan generator with 4-year predictions.

## 📋 Prerequisites

- Soil analysis with pH, P, K, Mg
- Crop rotation data (4 years future)
- Fertilization history (optional)

## 🧪 Test 1: Basic Advanced Plan (2 min)

```typescript
import { generateAdvancedPlan } from '@/lib/utils/fertilization-plan'

// Sample data
const parcel = {
  id: 'test-parcel-1',
  soil_type: 'S',
  culture: 'orna',
  area: 10.5,
}

const analysis = {
  id: 'test-analysis-1',
  ph: 5.8,
  phosphorus: 80,
  phosphorus_category: 'D',
  potassium: 180,
  potassium_category: 'D',
  magnesium: 90,
  magnesium_category: 'D',
  sulfur: 15,
  date: '2024-08-15',
}

const rotations = [
  // Future years
  { id: '1', year: 2025, crop_name: 'wheat', expected_yield: 8.0 },
  { id: '2', year: 2026, crop_name: 'rapeseed', expected_yield: 4.5 },
  { id: '3', year: 2027, crop_name: 'barley', expected_yield: 7.0 },
  { id: '4', year: 2028, crop_name: 'corn', expected_yield: 10.0 },
]

const history = [] // Empty history for basic test

// Generate plan
const plan = generateAdvancedPlan(parcel, analysis, rotations, history)

// Verify output
console.log('Plan type:', plan.plan_type) // 'advanced'
console.log('User type:', plan.user_type) // 'C'
console.log('Target year:', plan.target_year) // 'HY2025/26'

console.log('\nRecommendations:')
console.log('Lime:', plan.recommended_lime_kg_ha, 'kg/ha')
console.log('P₂O₅:', plan.recommended_nutrients.p2o5, 'kg/ha')
console.log('K₂O:', plan.recommended_nutrients.k2o, 'kg/ha')
console.log('MgO:', plan.recommended_nutrients.mgo, 'kg/ha')
console.log('S:', plan.recommended_nutrients.s, 'kg/ha')

console.log('\nPredictions:')
console.log('Years:', plan.predictions!.years)
console.log('pH:', plan.predictions!.ph)
console.log('P (mg/kg):', plan.predictions!.p)
console.log('K (mg/kg):', plan.predictions!.k)

console.log('\nWarnings:', plan.warnings.length)
plan.warnings.forEach(w => {
  console.log(`  [${w.severity}] ${w.type}: ${w.message}`)
})
```

### ✅ Expected Results:
- Plan type: 'advanced'
- User type: 'C'
- Lime: 1000-3000 kg/ha (pH 5.8 → 6.5)
- P₂O₅: 70-90 kg/ha (wheat 8t needs ~73 kg)
- K₂O: 80-100 kg/ha (wheat 8t needs ~58 kg)
- 4 years of predictions
- 3-5 warnings (info + any issues)

---

## 🧪 Test 2: With Historical Data (2 min)

```typescript
const history = [
  {
    id: '1',
    date: '2023-04-10',
    product_name: 'LAD 27',
    quantity: 300,
    nitrogen: 81,
    phosphorus: 0,
    potassium: 0,
    magnesium: 0,
    calcium: 0,
  },
  {
    id: '2',
    date: '2024-03-25',
    product_name: 'NPK 15-15-15',
    quantity: 400,
    nitrogen: 60,
    phosphorus: 26,
    potassium: 50,
    magnesium: 0,
    calcium: 0,
  },
]

const rotations = [
  // Historical
  { id: '1', year: 2023, crop_name: 'wheat', actual_yield: 7.5 },
  { id: '2', year: 2024, crop_name: 'rapeseed', actual_yield: 4.0 },
  
  // Future
  { id: '3', year: 2025, crop_name: 'barley', expected_yield: 7.0 },
  { id: '4', year: 2026, crop_name: 'wheat', expected_yield: 8.0 },
  { id: '5', year: 2027, crop_name: 'corn', expected_yield: 10.0 },
  { id: '6', year: 2028, crop_name: 'rapeseed', expected_yield: 4.5 },
]

const plan = generateAdvancedPlan(parcel, analysis, rotations, history)

// Check historical processing
console.log('\nNotes:', plan.notes)
// Should include: "Zpracováno 2 historických let"

// Check if simulation is accurate
const hasSimulationWarning = plan.warnings.some(
  w => w.type === 'simulation_mismatch'
)
console.log('Simulation mismatch?', hasSimulationWarning)
// Should be false if data is consistent
```

### ✅ Expected Results:
- Notes: "Zpracováno 2 historických let"
- No simulation mismatch (if data consistent)
- Adjusted recommendations based on history

---

## 🧪 Test 3: Trend Detection (1 min)

```typescript
// Intensive rotation - should show declining nutrients
const intensiveRotations = [
  { id: '1', year: 2025, crop_name: 'rapeseed', expected_yield: 5.0 }, // High demand
  { id: '2', year: 2026, crop_name: 'corn', expected_yield: 12.0 },    // Very high K
  { id: '3', year: 2027, crop_name: 'rapeseed', expected_yield: 5.0 },
  { id: '4', year: 2028, crop_name: 'corn', expected_yield: 12.0 },
]

const plan = generateAdvancedPlan(parcel, analysis, intensiveRotations, [])

// Check trends
const pTrend = plan.predictions!.p[3] - plan.predictions!.p[0]
const kTrend = plan.predictions!.k[3] - plan.predictions!.k[0]
const phTrend = plan.predictions!.ph[3] - plan.predictions!.ph[0]

console.log('\nTrends (4 years):')
console.log('P change:', pTrend, 'mg/kg')
console.log('K change:', kTrend, 'mg/kg')
console.log('pH change:', phTrend)

// Check for trend warnings
const hasDecliningK = plan.warnings.some(w => w.type === 'declining_k')
const hasDecliningPh = plan.warnings.some(w => w.type === 'declining_ph')

console.log('\nTrend warnings:')
console.log('Declining K?', hasDecliningK) // Should be true
console.log('Declining pH?', hasDecliningPh) // Likely true
```

### ✅ Expected Results:
- P trend: -20 to -40 mg/kg
- K trend: -40 to -80 mg/kg (intensive crops)
- pH trend: -0.2 to -0.4 (acidification)
- Warning: 'declining_k'
- Warning: 'declining_ph' or 'declining_p'

---

## 🧪 Test 4: K:Mg Ratio Correction (1 min)

```typescript
// Imbalanced soil
const imbalancedAnalysis = {
  ...analysis,
  potassium: 240,      // High
  magnesium: 60,       // Low
  // K:Mg ratio = 4.0 (too high, optimum 1.5-2.5)
}

const plan = generateAdvancedPlan(
  parcel,
  imbalancedAnalysis,
  rotations,
  []
)

console.log('\nK:Mg Ratio:', plan.km_ratio?.toFixed(2))
console.log('Corrected?', plan.km_ratio_corrected)

// Check correction applied
const hasKMgWarning = plan.warnings.some(
  w => w.type === 'km_ratio_unbalanced'
)
console.log('K:Mg warning?', hasKMgWarning)

console.log('\nAdjusted nutrients:')
console.log('K₂O:', plan.recommended_nutrients.k2o) // Should be reduced
console.log('MgO:', plan.recommended_nutrients.mgo) // Should be increased
```

### ✅ Expected Results:
- K:Mg ratio: ~4.0
- Corrected: true
- Warning: 'km_ratio_unbalanced'
- K₂O: Reduced by ~10-20%
- MgO: Increased by ~20-30%

---

## 🎯 Success Criteria

✅ **All tests pass if:**
1. Plan type is 'advanced'
2. User type is 'C'
3. 4 predictions generated (years, pH, P, K, Mg, S)
4. Recommendations are reasonable:
   - Lime: 0-8000 kg/ha
   - P₂O₅: 0-150 kg/ha
   - K₂O: 0-200 kg/ha
   - MgO: 0-100 kg/ha
5. Historical data is processed correctly
6. Trends are detected (declining nutrients)
7. K:Mg correction is applied when needed
8. Warnings are generated appropriately

---

## 🐛 Common Issues

### Issue: "Chybí data osevního postupu"
**Solution:** Provide at least 1 future year in rotations array

### Issue: Simulation mismatch warning
**Solution:** 
- Check fertilization history is complete
- Verify actual yields match reality
- Ensure dates are correct (agricultural year)

### Issue: Unrealistic predictions
**Solution:**
- Check crop names (use lowercase, Czech names)
- Verify expected yields are reasonable
- Ensure soil type is correct (L/S/T)

### Issue: Too many declining trend warnings
**Solution:** 
- This is correct for intensive rotations
- Increase fertilizer doses
- Add organic amendments

---

## 📊 Integration Test

```typescript
// Test all plan types together
import { 
  generateSimplePlan,
  generateAdvancedPlan 
} from '@/lib/utils/fertilization-plan'

// Simple plan (no data)
const simplePlan = generateSimplePlan(parcel, analysis)
console.log('Simple plan:', simplePlan.plan_type)

// Advanced plan (full data)
const advancedPlan = generateAdvancedPlan(
  parcel,
  analysis,
  rotations,
  history
)
console.log('Advanced plan:', advancedPlan.plan_type)

// Compare recommendations
console.log('\nComparison:')
console.log('P₂O₅:', simplePlan.recommended_nutrients.p2o5, 'vs', advancedPlan.recommended_nutrients.p2o5)
console.log('K₂O:', simplePlan.recommended_nutrients.k2o, 'vs', advancedPlan.recommended_nutrients.k2o)

// Advanced should be more precise
console.log('\nSimple warnings:', simplePlan.warnings.length)
console.log('Advanced warnings:', advancedPlan.warnings.length)
```

---

## ✅ Completion Checklist

- [ ] Test 1: Basic plan generation works
- [ ] Test 2: Historical data is processed
- [ ] Test 3: Trends are detected
- [ ] Test 4: K:Mg correction works
- [ ] Predictions are reasonable
- [ ] Warnings are appropriate
- [ ] No TypeScript errors
- [ ] No runtime errors

**Total test time: ~5 minutes**

🎉 **If all tests pass, Phase 5.3 is complete!**
