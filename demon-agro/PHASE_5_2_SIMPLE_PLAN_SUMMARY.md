# Phase 5.2 - Simple Fertilization Plan - Implementation Summary ✅

## 📦 What Was Implemented

Simple fertilization plan generator (Type A) for users without detailed crop rotation or yield data. Provides baseline recommendations based solely on soil analysis.

## 🗂️ File Created

**File:** `lib/utils/fertilization-plan.ts` (550+ lines)

## 🎯 Main Function: generateSimplePlan()

```typescript
function generateSimplePlan(
  parcel: Parcel,
  analysis: SoilAnalysis,
  organicFertilizers?: OrganicFertilizer[],
  baseYieldFactor?: number
): FertilizationPlan
```

## 🔄 Algorithm Flow

### 1. **Liming Calculation**
```
- Calculate lime need from pH and soil type
- Select lime type based on Mg status and K:Mg ratio
- Add reasoning text
```

**Logic:**
- Uses `calculateLimeNeed()` with target pH
- Uses `selectLimeType()` for type recommendation
- Generates explanation text

### 2. **Base Nutrient Needs**
```
- Get category from analysis (P, K, Mg, S)
- Calculate base dose using BASE_FERTILIZATION table
- Apply yield factor (0.8-1.3)
- Adjust for arable vs grassland
```

**For each nutrient:**
- P: Based on phosphorus_category
- K: Based on potassium_category  
- Mg: Based on magnesium_category
- S: Estimated from measured value or P category

### 3. **K:Mg Ratio Correction**
```
- Calculate ratio from analysis
- Check if optimal (1.5-2.5)
- If not optimal: apply correction
  - High ratio → reduce K, increase Mg
  - Low ratio → increase K, reduce Mg
```

**Tracking:**
- Stores original ratio
- Flags if correction was applied
- Adds explanatory note

### 4. **Organic Fertilizer Correction**
```
- For each organic fertilizer:
  - Subtract nutrient content × amount
  - Ensure values don't go negative
  - Add note about adjustment
```

**Supported nutrients:**
- P₂O₅, K₂O, MgO from manure/compost

### 5. **Warnings Generation**
```
- Legislative warnings (high P)
- Agronomic warnings (low pH, nutrients)
- Analysis age warnings
- K:Mg imbalance warnings
- General uncertainty notice
```

## 📋 Output Structure

```typescript
interface FertilizationPlan {
  plan_type: 'simple'
  user_type: 'A'
  parcel_id: string
  analysis_id: string
  target_year: string  // "HY2024/25"
  created_at: string
  
  // Liming
  recommended_lime_kg_ha: number
  recommended_lime_type: 'calcitic' | 'dolomite' | 'either'
  lime_reasoning?: string
  
  // Nutrients (kg/ha)
  recommended_nutrients: {
    p2o5: number
    k2o: number
    mgo: number
    s: number
  }
  
  // Warnings
  warnings: Warning[]
  notes?: string[]
  
  // Metadata
  base_yield_factor?: number
  km_ratio?: number
  km_ratio_corrected?: boolean
}

interface Warning {
  type: string
  severity: 'info' | 'warning' | 'error'
  message: string
  recommendation?: string
}
```

## ⚠️ Warning Types

### Legislative Warnings (Error)
```typescript
{
  type: 'high_p_legislative',
  severity: 'error',
  message: 'Velmi vysoká zásobenost P - legislativní omezení hnojení',
  recommendation: 'Aplikace P hnojiv je zakázána dle vyhlášky 377/2013 Sb. § 12'
}
```

**Triggers:**
- P category = VV
- P > 300 mg/kg

**Effect:** Sets P recommendation to 0

### Agronomic Warnings (Warning)
```typescript
{
  type: 'low_ph',
  severity: 'warning',
  message: 'Nízké pH (5.2) - vápnění je prioritní',
  recommendation: 'Doporučujeme provést vápnění před aplikací hnojiv'
}
```

**Triggers:**
- pH < 5.5
- pH < 6.0 for arable land
- K:Mg ratio outside 1.5-2.5
- Very low nutrients (N category)
- Analysis > 4 years old

### Information Warnings (Info)
```typescript
{
  type: 'simple_plan_uncertainty',
  severity: 'info',
  message: 'Bez znalosti osevního postupu je doporučení orientační (±25%)',
  recommendation: 'Pro přesnější plán zadejte plánované plodiny a výnosy'
}
```

**Always added:**
- General uncertainty notice for simple plans

## 🔧 Helper Functions

### 1. **formatPlanSummary()**
```typescript
function formatPlanSummary(plan: FertilizationPlan): string
```

Creates human-readable text summary:
```
=== Plán hnojení HY2024/25 ===
Typ plánu: Jednoduchý

VÁPNĚNÍ:
  Množství: 4.8 t/ha
  Typ: Dolomitický CaCO₃·MgCO₃
  pH 5.3 je pod cílovým 6.5

HNOJENÍ:
  P₂O₅: 60 kg/ha
  K₂O: 80 kg/ha
  MgO: 50 kg/ha
  S: 25 kg/ha

UPOZORNĚNÍ:
  ⚠️ Poměr K:Mg (2.8) je mimo optimum (1.5-2.5)
     → Dávky upraveny: snížen draslík, zvýšen hořčík
  ℹ️ Bez znalosti osevního postupu je doporučení orientační (±25%)
```

### 2. **estimateFertilizerCost()**
```typescript
function estimateFertilizerCost(
  plan: FertilizationPlan,
  prices?: { p2o5, k2o, mgo, s, lime }
): number
```

**Default prices (CZK):**
- P₂O₅: 45 Kč/kg
- K₂O: 25 Kč/kg
- MgO: 30 Kč/kg
- S: 15 Kč/kg
- Lime: 2.5 Kč/kg

**Returns:** Total cost in CZK/ha

### 3. **validatePlan()**
```typescript
function validatePlan(plan: FertilizationPlan): {
  valid: boolean
  errors: string[]
}
```

**Checks:**
- Required fields present
- Lime: 0-20 t/ha
- P₂O₅: 0-200 kg/ha
- K₂O: 0-300 kg/ha
- MgO: 0-150 kg/ha
- S: 0-100 kg/ha

## 📊 Usage Examples

### Example 1: Basic Usage
```typescript
import { generateSimplePlan } from '@/lib/utils/fertilization-plan'

const plan = generateSimplePlan(parcel, analysis)

console.log(plan.recommended_nutrients)
// {
//   p2o5: 60,
//   k2o: 72,
//   mgo: 45,
//   s: 20
// }

console.log(plan.recommended_lime_kg_ha) // 4800
console.log(plan.recommended_lime_type)  // 'dolomite'
```

### Example 2: With Yield Factor
```typescript
// High-yielding farm (30% above baseline)
const plan = generateSimplePlan(parcel, analysis, undefined, 1.3)

// Nutrient doses will be increased by 30%
```

### Example 3: With Organic Fertilizers
```typescript
const organics: OrganicFertilizer[] = [
  {
    type: 'Hovězí hnůj',
    amount_t_ha: 30,
    nutrients: {
      n: 5,      // kg N per ton
      p2o5: 3,   // kg P₂O₅ per ton
      k2o: 6,    // kg K₂O per ton
      mgo: 1.5,  // kg MgO per ton
    }
  }
]

const plan = generateSimplePlan(parcel, analysis, organics)

// Mineral fertilizer needs reduced by:
// P₂O₅: 30t × 3 = 90 kg/ha
// K₂O: 30t × 6 = 180 kg/ha
// MgO: 30t × 1.5 = 45 kg/ha
```

### Example 4: High P Content (Legislative)
```typescript
const analysis = {
  // ... other fields
  phosphorus: 350,
  phosphorus_category: 'VV'
}

const plan = generateSimplePlan(parcel, analysis)

console.log(plan.recommended_nutrients.p2o5) // 0 (forbidden)

console.log(plan.warnings)
// [{
//   type: 'high_p_legislative',
//   severity: 'error',
//   message: 'Velmi vysoká zásobenost P - legislativní omezení',
//   recommendation: 'Aplikace P hnojiv je zakázána...'
// }]
```

### Example 5: Format and Cost
```typescript
const plan = generateSimplePlan(parcel, analysis)

// Format for display
const summary = formatPlanSummary(plan)
console.log(summary)

// Estimate cost
const cost = estimateFertilizerCost(plan)
console.log(`Orientační náklady: ${cost.toLocaleString('cs-CZ')} Kč/ha`)

// Custom prices
const customCost = estimateFertilizerCost(plan, {
  p2o5: 50,  // Higher P price
  lime: 3.0,  // Higher lime price
})
```

### Example 6: Validation
```typescript
const plan = generateSimplePlan(parcel, analysis)

const validation = validatePlan(plan)

if (!validation.valid) {
  console.error('Chyby v plánu:', validation.errors)
} else {
  // Save to database
  await savePlan(plan)
}
```

## 🧪 Test Scenarios

### Scenario 1: Low pH, Low Mg
```typescript
const analysis = {
  ph: 5.2,
  phosphorus: 80,
  phosphorus_category: 'D',
  potassium: 200,
  potassium_category: 'D',
  magnesium: 60,
  magnesium_category: 'VH',
  // K:Mg ratio = 3.33 (too high)
}

const plan = generateSimplePlan(parcel, analysis)

// Expected:
// - Lime: ~5000 kg/ha
// - Lime type: dolomite (low Mg)
// - K reduced, Mg increased (ratio correction)
// - Warning: low pH
// - Warning: K:Mg imbalance
```

### Scenario 2: High P (Legislative)
```typescript
const analysis = {
  ph: 6.5,
  phosphorus: 320,
  phosphorus_category: 'VV',
  potassium: 180,
  potassium_category: 'V',
  magnesium: 90,
  magnesium_category: 'D',
}

const plan = generateSimplePlan(parcel, analysis)

// Expected:
// - Lime: 0 (pH optimal)
// - P: 0 (legislative restriction)
// - K: maintenance only
// - Mg: maintenance only
// - Error warning: high P legislative
```

### Scenario 3: Optimal Conditions
```typescript
const analysis = {
  ph: 6.5,
  phosphorus: 100,
  phosphorus_category: 'D',
  potassium: 180,
  potassium_category: 'D',
  magnesium: 90,
  magnesium_category: 'D',
  // K:Mg ratio = 2.0 (optimal)
}

const plan = generateSimplePlan(parcel, analysis)

// Expected:
// - Lime: minimal or 0
// - Moderate doses (40-60 kg/ha)
// - No K:Mg correction
// - Only info warning about uncertainty
```

### Scenario 4: With Organic Fertilizers
```typescript
const organics = [{
  type: 'Kejda',
  amount_t_ha: 25,
  nutrients: {
    n: 4,
    p2o5: 2,
    k2o: 5,
  }
}]

const plan = generateSimplePlan(parcel, analysis, organics)

// Expected:
// - P reduced by 50 kg/ha (25t × 2)
// - K reduced by 125 kg/ha (25t × 5)
// - Note: "Započteno organické hnojivo: Kejda"
```

## 🎓 Algorithm Logic Diagram

```
INPUT: Parcel + Analysis + [Organics] + [Yield Factor]
  │
  ├─> 1. VALIDATE INPUT
  │     ├─> Check required fields
  │     └─> Get target year (HY)
  │
  ├─> 2. CALCULATE LIMING
  │     ├─> calculateLimeNeed(pH, soilType, culture)
  │     ├─> selectLimeType(analysis)
  │     └─> Generate reasoning
  │
  ├─> 3. BASE NUTRIENT NEEDS
  │     ├─> For P, K, Mg, S:
  │     │     ├─> Get category
  │     │     ├─> BASE_DOSE × yieldFactor
  │     │     └─> Grassland adjustment (K +30%)
  │     └─> Add warnings if category missing
  │
  ├─> 4. K:MG CORRECTION
  │     ├─> Calculate ratio
  │     ├─> If outside 1.5-2.5:
  │     │     ├─> applyKMgCorrection()
  │     │     └─> Add warning + note
  │     └─> Set correction flag
  │
  ├─> 5. ORGANIC ADJUSTMENT
  │     ├─> For each organic:
  │     │     ├─> Subtract nutrients
  │     │     └─> Add note
  │     └─> Ensure non-negative
  │
  ├─> 6. WARNINGS
  │     ├─> Legislative (high P → P=0)
  │     ├─> Agronomic (low pH, nutrients)
  │     ├─> Analysis age
  │     └─> Uncertainty notice
  │
  └─> OUTPUT: FertilizationPlan
        ├─> Lime recommendation
        ├─> Nutrient recommendations
        ├─> Warnings array
        └─> Notes array
```

## 📐 Calculation Examples

### Example: Complete Calculation
```
INPUT:
  pH: 5.4
  Soil type: S (medium)
  Culture: orna (arable)
  P: 70 mg/kg (category VH)
  K: 160 mg/kg (category D)
  Mg: 55 mg/kg (category VH)
  Yield factor: 1.1

STEP 1: LIMING
  Target pH: 6.5 (arable)
  Current pH: 5.4
  From table (S, 5.4): interpolate
    5.0 → 6000 kg
    5.5 → 3000 kg
  Linear interpolation: 5.4 → 4800 kg/ha
  Lime type: K:Mg = 2.9 → dolomite (high ratio)
  
STEP 2: BASE NUTRIENTS
  P (VH): 60 kg × 1.1 = 66 kg P₂O₅/ha
  K (D):  60 kg × 1.1 = 66 kg K₂O/ha
  Mg (VH): 45 kg × 1.1 = 50 kg MgO/ha
  S (est): 20 kg × 1.1 = 22 kg S/ha
  
STEP 3: K:MG CORRECTION
  Ratio: 160/55 = 2.9 (high)
  Correction: K × 0.9, Mg × 1.15
  K: 66 → 59 kg/ha
  Mg: 50 → 58 kg/ha
  
STEP 4: ORGANIC (none)
  No adjustment
  
OUTPUT:
  Lime: 4800 kg/ha (dolomite)
  P₂O₅: 66 kg/ha
  K₂O: 59 kg/ha
  MgO: 58 kg/ha
  S: 22 kg/ha
  Warnings: low pH, K:Mg imbalance, uncertainty
```

## ✅ Phase 5.2 Complete!

**Summary:**
- Complete simple plan generator
- Algorithm with 5 main steps
- 10+ warning types
- 3 helper functions
- 550+ lines of production code
- Full TypeScript type safety
- Compliant with Czech legislation

**Ready for Phase 5.3!** 🚀
