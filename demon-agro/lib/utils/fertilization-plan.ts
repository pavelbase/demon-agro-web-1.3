import type { 
  Parcel, 
  SoilAnalysis,
  LimeType,
} from '@/lib/types/database'

import {
  calculateLimeNeed,
  selectLimeType,
  calculateNutrientNeed,
  applyKMgCorrection,
  calculateKMgRatio,
  isKMgRatioOptimal,
  getHospodarskyRok,
  getCropNutrientUptake,
  mgKgToKgHa,
  calculateAcidification,
  NATURAL_ACIDIFICATION,
  ACIDIFICATION_FACTORS,
  VALIDATION_RANGES,
} from './calculations'

// ============================================================================
// TYPES
// ============================================================================

export interface FertilizationPlan {
  plan_type: 'simple' | 'detailed' | 'advanced'
  user_type: 'A' | 'B' | 'C'
  parcel_id: string
  analysis_id: string
  target_year: string
  created_at: string
  
  // Liming recommendation
  recommended_lime_kg_ha: number
  recommended_lime_type: LimeType
  lime_reasoning?: string
  
  // Nutrient recommendations (kg/ha)
  recommended_nutrients: {
    p2o5: number
    k2o: number
    mgo: number
    s: number
  }
  
  // Warnings and notes
  warnings: Warning[]
  notes?: string[]
  
  // Optional metadata
  base_yield_factor?: number
  km_ratio?: number
  km_ratio_corrected?: boolean
  
  // Advanced plan features
  recommended_products?: RecommendedProduct[]
  predictions?: PlanPredictions
}

export interface RecommendedProduct {
  product_id: string
  name: string
  amount_kg_ha: number
  reason: string
}

export interface PlanPredictions {
  years: string[] // ['HY2025/26', 'HY2026/27', ...]
  ph: number[]
  p: number[]
  k: number[]
  mg: number[]
  s: number[]
}

export interface Warning {
  type: string
  severity: 'info' | 'warning' | 'error'
  message: string
  recommendation?: string
}

export interface OrganicFertilizer {
  type: string
  amount_t_ha: number
  nutrients?: {
    n?: number
    p2o5?: number
    k2o?: number
    mgo?: number
  }
}

export interface CropRotation {
  id: string
  year: number
  crop_name: string
  expected_yield: number | null
  actual_yield: number | null
}

export interface FertilizationHistory {
  id: string
  date: string
  product_name: string
  quantity: number
  nitrogen: number | null
  phosphorus: number | null
  potassium: number | null
  magnesium: number | null
  calcium: number | null
}

interface SoilState {
  ph: number
  p_mgkg: number
  k_mgkg: number
  mg_mgkg: number
  s_mgkg: number
  p_kgha: number
  k_kgha: number
  mg_kgha: number
  s_kgha: number
}

// ============================================================================
// SIMPLE PLAN GENERATION (TYPE A)
// ============================================================================

/**
 * Generate simple fertilization plan for Type A users
 * Based on soil analysis and basic agronomic principles
 * 
 * @param parcel - Parcel information
 * @param analysis - Latest soil analysis
 * @param organicFertilizers - Optional organic fertilizer applications
 * @param baseYieldFactor - Yield level adjustment (0.8-1.3, default 1.0)
 * @returns Complete fertilization plan with recommendations
 */
export function generateSimplePlan(
  parcel: Parcel,
  analysis: SoilAnalysis,
  organicFertilizers?: OrganicFertilizer[],
  baseYieldFactor: number = 1.0
): FertilizationPlan {
  const warnings: Warning[] = []
  const notes: string[] = []
  
  // Validate inputs
  if (!analysis.ph || !analysis.phosphorus || !analysis.potassium || !analysis.magnesium) {
    throw new Error('Neúplná data rozboru půdy - chybí povinné hodnoty')
  }

  // Get current agricultural year
  const targetYear = getHospodarskyRok()
  
  // =========================================================================
  // 1. LIMING CALCULATION
  // =========================================================================
  
  const limeCalc = calculateLimeNeed(
    analysis.ph,
    parcel.soil_type,
    parcel.culture
  )
  
  const limeType = selectLimeType(analysis)
  
  // Add lime reasoning
  let limeReasoning = ''
  if (limeCalc.amount > 0) {
    limeReasoning = `pH ${analysis.ph.toFixed(1)} je pod cílovým ${limeCalc.targetPh.toFixed(1)}. `
    limeReasoning += `Doporučeno ${limeType === 'dolomite' ? 'dolomitické' : limeType === 'calcitic' ? 'vápenaté' : 'libovolné'} vápno.`
  } else {
    limeReasoning = `pH ${analysis.ph.toFixed(1)} je v optimálním rozmezí.`
  }
  
  // Warning for low pH
  if (analysis.ph < 5.5) {
    warnings.push({
      type: 'low_ph',
      severity: 'warning',
      message: `Nízké pH (${analysis.ph.toFixed(1)}) - vápnění je prioritní`,
      recommendation: 'Doporučujeme provést vápnění před aplikací hnojiv',
    })
  } else if (analysis.ph < 6.0 && parcel.culture === 'orna') {
    warnings.push({
      type: 'suboptimal_ph',
      severity: 'info',
      message: `pH (${analysis.ph.toFixed(1)}) je pod optimem pro ornou půdu (6.5)`,
      recommendation: 'Zvažte vápnění v příštím období',
    })
  }
  
  // =========================================================================
  // 2. BASE NUTRIENT NEEDS BY CATEGORY
  // =========================================================================
  
  const isArable = parcel.culture === 'orna'
  
  // Validate base yield factor
  const validYieldFactor = Math.max(0.8, Math.min(1.3, baseYieldFactor))
  if (validYieldFactor !== baseYieldFactor) {
    warnings.push({
      type: 'yield_factor_adjusted',
      severity: 'info',
      message: `Výnosová úroveň upravena na ${validYieldFactor}`,
    })
  }
  
  // Calculate base needs
  let pNeed = 0
  let kNeed = 0
  let mgNeed = 0
  let sNeed = 0
  
  // Phosphorus
  if (analysis.phosphorus_category) {
    pNeed = calculateNutrientNeed('P', analysis.phosphorus_category, validYieldFactor, isArable)
  } else {
    warnings.push({
      type: 'missing_category',
      severity: 'warning',
      message: 'Chybí kategorie zásobenosti P - použita orientační hodnota',
    })
    pNeed = 40 // Default moderate dose
  }
  
  // Potassium
  if (analysis.potassium_category) {
    kNeed = calculateNutrientNeed('K', analysis.potassium_category, validYieldFactor, isArable)
  } else {
    warnings.push({
      type: 'missing_category',
      severity: 'warning',
      message: 'Chybí kategorie zásobenosti K - použita orientační hodnota',
    })
    kNeed = 60 // Default moderate dose
  }
  
  // Magnesium
  if (analysis.magnesium_category) {
    mgNeed = calculateNutrientNeed('Mg', analysis.magnesium_category, validYieldFactor, isArable)
  } else {
    warnings.push({
      type: 'missing_category',
      severity: 'warning',
      message: 'Chybí kategorie zásobenosti Mg - použita orientační hodnota',
    })
    mgNeed = 30 // Default moderate dose
  }
  
  // Sulfur (use P category as proxy if S not measured)
  if (analysis.sulfur && analysis.sulfur > 0) {
    // Estimate sulfur category based on measured value
    // Low < 10, Medium 10-20, High > 20 mg/kg
    const sCategory = analysis.sulfur < 10 ? 'N' : analysis.sulfur < 20 ? 'D' : 'V'
    sNeed = calculateNutrientNeed('S', sCategory, validYieldFactor, isArable)
  } else {
    // Default S dose based on P category as proxy
    sNeed = analysis.phosphorus_category === 'N' || analysis.phosphorus_category === 'VH' ? 25 : 15
    notes.push('Síra nebyla měřena - doporučení je orientační')
  }
  
  // =========================================================================
  // 3. K:Mg RATIO CORRECTION
  // =========================================================================
  
  const kMgRatio = calculateKMgRatio(analysis.potassium, analysis.magnesium)
  let kmRatioCorrected = false
  
  if (!isKMgRatioOptimal(kMgRatio)) {
    const beforeCorrection = { K: kNeed, Mg: mgNeed }
    const corrected = applyKMgCorrection({ K: kNeed, Mg: mgNeed }, kMgRatio)
    
    kNeed = corrected.K
    mgNeed = corrected.Mg
    kmRatioCorrected = true
    
    warnings.push({
      type: 'km_ratio_unbalanced',
      severity: 'warning',
      message: `Poměr K:Mg (${kMgRatio.toFixed(2)}) je mimo optimum (1.5-2.5)`,
      recommendation: kMgRatio > 2.5 
        ? 'Dávky upraveny: snížen draslík, zvýšen hořčík'
        : 'Dávky upraveny: zvýšen draslík, snížen hořčík',
    })
    
    notes.push(
      `K:Mg korekce: K ${beforeCorrection.K} → ${corrected.K} kg/ha, ` +
      `Mg ${beforeCorrection.Mg} → ${corrected.Mg} kg/ha`
    )
  }
  
  // =========================================================================
  // 4. ORGANIC FERTILIZER CORRECTION
  // =========================================================================
  
  if (organicFertilizers && organicFertilizers.length > 0) {
    for (const organic of organicFertilizers) {
      if (organic.nutrients) {
        // Subtract nutrients from organic fertilizers
        if (organic.nutrients.p2o5) {
          pNeed = Math.max(0, pNeed - organic.nutrients.p2o5 * organic.amount_t_ha)
        }
        if (organic.nutrients.k2o) {
          kNeed = Math.max(0, kNeed - organic.nutrients.k2o * organic.amount_t_ha)
        }
        if (organic.nutrients.mgo) {
          mgNeed = Math.max(0, mgNeed - organic.nutrients.mgo * organic.amount_t_ha)
        }
        
        notes.push(
          `Započteno organické hnojivo: ${organic.type} (${organic.amount_t_ha} t/ha)`
        )
      }
    }
  }
  
  // =========================================================================
  // 5. LEGISLATIVE AND AGRONOMIC WARNINGS
  // =========================================================================
  
  // High P content - legislative restrictions
  if (analysis.phosphorus_category === 'VV' || analysis.phosphorus > 300) {
    warnings.push({
      type: 'high_p_legislative',
      severity: 'error',
      message: 'Velmi vysoká zásobenost P - legislativní omezení hnojení',
      recommendation: 'Aplikace P hnojiv je zakázána dle vyhlášky 377/2013 Sb. § 12',
    })
    pNeed = 0 // No P fertilization allowed
  } else if (analysis.phosphorus_category === 'V') {
    warnings.push({
      type: 'high_p_restriction',
      severity: 'warning',
      message: 'Vysoká zásobenost P - omezené hnojení',
      recommendation: 'Aplikujte pouze udržovací dávky odpovídající odčerpání',
    })
  }
  
  // Very low nutrient content
  if (analysis.phosphorus_category === 'N') {
    warnings.push({
      type: 'very_low_p',
      severity: 'warning',
      message: 'Velmi nízká zásobenost P - zvýšené dávky doporučeny',
      recommendation: 'Rozložte aplikaci do více let (40-50% ročně)',
    })
  }
  
  if (analysis.potassium_category === 'N') {
    warnings.push({
      type: 'very_low_k',
      severity: 'warning',
      message: 'Velmi nízká zásobenost K - zvýšené dávky doporučeny',
      recommendation: 'Rozložte aplikaci do více let (40-50% ročně)',
    })
  }
  
  if (analysis.magnesium_category === 'N') {
    warnings.push({
      type: 'very_low_mg',
      severity: 'warning',
      message: 'Velmi nízká zásobenost Mg - zvýšené dávky doporučeny',
      recommendation: 'Zvažte použití dolomitického vápna pro rychlejší korekci',
    })
  }
  
  // Analysis age warning
  const analysisAge = (Date.now() - new Date(analysis.date).getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (analysisAge > 4) {
    warnings.push({
      type: 'old_analysis',
      severity: 'warning',
      message: `Rozbor je starý ${Math.floor(analysisAge)} let`,
      recommendation: 'Doporučujeme provést nový rozbor pro přesnější plán',
    })
  }
  
  // General uncertainty warning for simple plan
  warnings.push({
    type: 'simple_plan_uncertainty',
    severity: 'info',
    message: 'Bez znalosti osevního postupu je doporučení orientační (±25%)',
    recommendation: 'Pro přesnější plán zadejte plánované plodiny a výnosy',
  })
  
  // =========================================================================
  // 6. RETURN COMPLETE PLAN
  // =========================================================================
  
  return {
    plan_type: 'simple',
    user_type: 'A',
    parcel_id: parcel.id,
    analysis_id: analysis.id,
    target_year: targetYear,
    created_at: new Date().toISOString(),
    
    recommended_lime_kg_ha: limeCalc.amount,
    recommended_lime_type: limeType,
    lime_reasoning: limeReasoning,
    
    recommended_nutrients: {
      p2o5: Math.round(pNeed),
      k2o: Math.round(kNeed),
      mgo: Math.round(mgNeed),
      s: Math.round(sNeed),
    },
    
    warnings,
    notes: notes.length > 0 ? notes : undefined,
    
    base_yield_factor: validYieldFactor,
    km_ratio: kMgRatio,
    km_ratio_corrected: kmRatioCorrected,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format fertilization plan for display
 */
export function formatPlanSummary(plan: FertilizationPlan): string {
  const lines: string[] = []
  
  lines.push(`=== Plán hnojení ${plan.target_year} ===`)
  lines.push(`Typ plánu: ${plan.plan_type === 'simple' ? 'Jednoduchý' : 'Detailní'}`)
  lines.push(``)
  
  // Liming
  if (plan.recommended_lime_kg_ha > 0) {
    lines.push(`VÁPNĚNÍ:`)
    lines.push(`  Množství: ${(plan.recommended_lime_kg_ha / 1000).toFixed(1)} t/ha`)
    lines.push(`  Typ: ${getLimeTypeName(plan.recommended_lime_type)}`)
    if (plan.lime_reasoning) {
      lines.push(`  ${plan.lime_reasoning}`)
    }
    lines.push(``)
  }
  
  // Nutrients
  lines.push(`HNOJENÍ:`)
  lines.push(`  P₂O₅: ${plan.recommended_nutrients.p2o5} kg/ha`)
  lines.push(`  K₂O: ${plan.recommended_nutrients.k2o} kg/ha`)
  lines.push(`  MgO: ${plan.recommended_nutrients.mgo} kg/ha`)
  lines.push(`  S: ${plan.recommended_nutrients.s} kg/ha`)
  lines.push(``)
  
  // Warnings
  if (plan.warnings.length > 0) {
    lines.push(`UPOZORNĚNÍ:`)
    for (const warning of plan.warnings) {
      const icon = warning.severity === 'error' ? '❌' : warning.severity === 'warning' ? '⚠️' : 'ℹ️'
      lines.push(`  ${icon} ${warning.message}`)
      if (warning.recommendation) {
        lines.push(`     → ${warning.recommendation}`)
      }
    }
    lines.push(``)
  }
  
  // Notes
  if (plan.notes && plan.notes.length > 0) {
    lines.push(`POZNÁMKY:`)
    for (const note of plan.notes) {
      lines.push(`  • ${note}`)
    }
  }
  
  return lines.join('\n')
}

/**
 * Get Czech name for lime type
 */
function getLimeTypeName(type: LimeType): string {
  switch (type) {
    case 'calcitic':
      return 'Vápenatý CaCO₃'
    case 'dolomite':
      return 'Dolomitický CaCO₃·MgCO₃'
    case 'either':
      return 'Libovolný (CaCO₃ nebo dolomit)'
    default:
      return 'Neurčeno'
  }
}

/**
 * Calculate total fertilizer cost estimate
 */
export function estimateFertilizerCost(
  plan: FertilizationPlan,
  pricesPer100kg?: {
    p2o5?: number
    k2o?: number
    mgo?: number
    s?: number
    lime?: number
  }
): number {
  const defaultPrices = {
    p2o5: 45,   // CZK/kg pure nutrient
    k2o: 25,
    mgo: 30,
    s: 15,
    lime: 2.5,  // CZK/kg CaCO3
  }
  
  const prices = { ...defaultPrices, ...pricesPer100kg }
  
  let totalCost = 0
  
  // Lime cost
  totalCost += plan.recommended_lime_kg_ha * prices.lime
  
  // Nutrient costs
  totalCost += plan.recommended_nutrients.p2o5 * prices.p2o5
  totalCost += plan.recommended_nutrients.k2o * prices.k2o
  totalCost += plan.recommended_nutrients.mgo * prices.mgo
  totalCost += plan.recommended_nutrients.s * prices.s
  
  return Math.round(totalCost)
}

/**
 * Validate plan before saving
 */
export function validatePlan(plan: FertilizationPlan): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  if (!plan.parcel_id) errors.push('Chybí ID pozemku')
  if (!plan.analysis_id) errors.push('Chybí ID rozboru')
  if (!plan.target_year) errors.push('Chybí cílový rok')
  
  // Check reasonable limits
  if (plan.recommended_lime_kg_ha < 0 || plan.recommended_lime_kg_ha > 20000) {
    errors.push('Dávka vápna je mimo rozumné meze (0-20 t/ha)')
  }
  
  if (plan.recommended_nutrients.p2o5 < 0 || plan.recommended_nutrients.p2o5 > 200) {
    errors.push('Dávka P₂O₅ je mimo rozumné meze (0-200 kg/ha)')
  }
  
  if (plan.recommended_nutrients.k2o < 0 || plan.recommended_nutrients.k2o > 300) {
    errors.push('Dávka K₂O je mimo rozumné meze (0-300 kg/ha)')
  }
  
  if (plan.recommended_nutrients.mgo < 0 || plan.recommended_nutrients.mgo > 150) {
    errors.push('Dávka MgO je mimo rozumné meze (0-150 kg/ha)')
  }
  
  if (plan.recommended_nutrients.s < 0 || plan.recommended_nutrients.s > 100) {
    errors.push('Dávka S je mimo rozumné meze (0-100 kg/ha)')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// ADVANCED PLAN GENERATION (TYPE C)
// ============================================================================

/**
 * Generate advanced fertilization plan with 4-year prediction
 * For Type C users with crop rotation and fertilization history
 * 
 * @param parcel - Parcel information
 * @param analysis - Latest soil analysis
 * @param rotations - Crop rotation data (past and future)
 * @param history - Fertilization history
 * @returns Complete plan with predictions
 */
export function generateAdvancedPlan(
  parcel: Parcel,
  analysis: SoilAnalysis,
  rotations: CropRotation[],
  history: FertilizationHistory[]
): FertilizationPlan {
  const warnings: Warning[] = []
  const notes: string[] = []
  
  // Validate inputs
  if (!analysis.ph || !analysis.phosphorus || !analysis.potassium || !analysis.magnesium) {
    throw new Error('Neúplná data rozboru půdy - chybí povinné hodnoty')
  }
  
  if (!rotations || rotations.length === 0) {
    throw new Error('Chybí data osevního postupu - požadováno pro pokročilý plán')
  }
  
  // Get current agricultural year
  const targetYear = getHospodarskyRok()
  
  // =========================================================================
  // 1. INITIALIZE SOIL STATE
  // =========================================================================
  
  const soilState = initializeSoilState(analysis, parcel)
  notes.push(`Počáteční stav půdy: pH ${soilState.ph.toFixed(1)}, P ${soilState.p_mgkg} mg/kg, K ${soilState.k_mgkg} mg/kg, Mg ${soilState.mg_mgkg} mg/kg`)
  
  // =========================================================================
  // 2. PROCESS HISTORICAL DATA
  // =========================================================================
  
  // Sort history by date (oldest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  // Group history by agricultural year
  const historyByYear = new Map<string, FertilizationHistory[]>()
  for (const record of sortedHistory) {
    const hyYear = getHospodarskyRok(new Date(record.date))
    if (!historyByYear.has(hyYear)) {
      historyByYear.set(hyYear, [])
    }
    historyByYear.get(hyYear)!.push(record)
  }
  
  // Get historical rotations (past years)
  const currentYear = new Date().getFullYear()
  const historicalRotations = rotations.filter(r => r.year < currentYear)
  
  // Simulate historical years to validate current state
  let simulatedState = { ...soilState }
  let historicalYearsProcessed = 0
  
  for (const rotation of historicalRotations) {
    const hyYear = `HY${rotation.year}/${String(rotation.year + 1).slice(-2)}`
    const yearHistory = historyByYear.get(hyYear) || []
    
    if (yearHistory.length > 0 || rotation.actual_yield) {
      simulatedState = processHistoricalYear(
        simulatedState,
        rotation,
        yearHistory,
        parcel
      )
      historicalYearsProcessed++
    }
  }
  
  if (historicalYearsProcessed > 0) {
    notes.push(`Zpracováno ${historicalYearsProcessed} historických let`)
    // Check if simulated state matches current analysis
    const pError = Math.abs(simulatedState.p_mgkg - analysis.phosphorus)
    const kError = Math.abs(simulatedState.k_mgkg - analysis.potassium)
    
    if (pError > 20 || kError > 30) {
      warnings.push({
        type: 'simulation_mismatch',
        severity: 'warning',
        message: 'Simulovaný stav se liší od aktuálního rozboru',
        recommendation: 'Doporučujeme zkontrolovat historii hnojení a sklizňové výnosy',
      })
    }
  }
  
  // Reset to actual current state for forward prediction
  simulatedState = { ...soilState }
  
  // =========================================================================
  // 3. PREDICT NEXT 4 YEARS
  // =========================================================================
  
  // Get future rotations
  const futureRotations = rotations
    .filter(r => r.year >= currentYear)
    .sort((a, b) => a.year - b.year)
    .slice(0, 4)
  
  if (futureRotations.length === 0) {
    throw new Error('Chybí plánovaný osevní postup - požadováno pro pokročilý plán')
  }
  
  const predictions: PlanPredictions = {
    years: [],
    ph: [],
    p: [],
    k: [],
    mg: [],
    s: [],
  }
  
  const yearRecommendations: Array<{
    year: string
    lime: number
    nutrients: { p2o5: number; k2o: number; mgo: number; s: number }
  }> = []
  
  // Simulate each future year
  for (let i = 0; i < futureRotations.length; i++) {
    const rotation = futureRotations[i]
    const hyYear = `HY${rotation.year}/${String(rotation.year + 1).slice(-2)}`
    
    // Get crop nutrient needs
    const cropUptake = getCropNutrientUptake(rotation.crop_name)
    const expectedYield = rotation.expected_yield || 5.0 // Default moderate yield
    
    const cropNeeds = {
      p: cropUptake.p * expectedYield,
      k: cropUptake.k * expectedYield,
      mg: cropUptake.mg * expectedYield,
      s: cropUptake.s * expectedYield,
    }
    
    // Calculate recommendation for this year
    const recommendation = calculateYearRecommendation(
      simulatedState,
      cropNeeds,
      parcel
    )
    
    yearRecommendations.push({
      year: hyYear,
      lime: recommendation.lime,
      nutrients: recommendation.nutrients,
    })
    
    // Record prediction before applying recommendation
    predictions.years.push(hyYear)
    predictions.ph.push(Math.round(simulatedState.ph * 10) / 10)
    predictions.p.push(Math.round(simulatedState.p_mgkg))
    predictions.k.push(Math.round(simulatedState.k_mgkg))
    predictions.mg.push(Math.round(simulatedState.mg_mgkg))
    predictions.s.push(Math.round(simulatedState.s_mgkg))
    
    // Apply recommendation and simulate year
    simulatedState = applySimulatedYear(
      simulatedState,
      recommendation,
      cropNeeds,
      parcel
    )
  }
  
  // =========================================================================
  // 4. GENERATE RECOMMENDATION FOR FIRST YEAR
  // =========================================================================
  
  const firstYearRec = yearRecommendations[0]
  
  // Calculate K:Mg ratio and apply correction
  const kMgRatio = calculateKMgRatio(soilState.k_mgkg, soilState.mg_mgkg)
  let kmRatioCorrected = false
  
  let nutrients = { ...firstYearRec.nutrients }
  
  if (!isKMgRatioOptimal(kMgRatio)) {
    const corrected = applyKMgCorrection(
      { K: nutrients.k2o, Mg: nutrients.mgo },
      kMgRatio
    )
    
    nutrients.k2o = corrected.K
    nutrients.mgo = corrected.Mg
    kmRatioCorrected = true
    
    warnings.push({
      type: 'km_ratio_unbalanced',
      severity: 'warning',
      message: `Poměr K:Mg (${kMgRatio.toFixed(2)}) je mimo optimum (1.5-2.5)`,
      recommendation: kMgRatio > 2.5
        ? 'Doporučeno zvýšit dávku Mg a snížit K'
        : 'Doporučeno zvýšit dávku K a snížit Mg',
    })
  }
  
  // Select lime type
  const limeType = selectLimeType(analysis)
  
  // Add lime reasoning
  let limeReasoning = ''
  if (firstYearRec.lime > 0) {
    limeReasoning = `Na základě predikce 4 let doporučeno ${(firstYearRec.lime / 1000).toFixed(1)} t/ha vápna. `
    limeReasoning += `Typ: ${limeType === 'dolomite' ? 'dolomitické' : limeType === 'calcitic' ? 'vápenaté' : 'libovolné'}.`
  }
  
  // =========================================================================
  // 5. GENERATE WARNINGS
  // =========================================================================
  
  // Low pH warning
  if (soilState.ph < 5.5) {
    warnings.push({
      type: 'low_ph',
      severity: 'warning',
      message: `Nízké pH (${soilState.ph.toFixed(1)}) - vápnění je prioritní`,
      recommendation: 'Doporučujeme provést vápnění před jarním hnojením',
    })
  }
  
  // Legislative warnings
  if (analysis.phosphorus_category === 'VV' || analysis.phosphorus > 300) {
    warnings.push({
      type: 'high_p_legislative',
      severity: 'error',
      message: 'Velmi vysoká zásobenost P - legislativní omezení',
      recommendation: 'Aplikace P hnojiv je zakázána dle vyhlášky 377/2013 Sb.',
    })
    nutrients.p2o5 = 0
  }
  
  // Nutrient trend warnings
  const pTrend = predictions.p[predictions.p.length - 1] - predictions.p[0]
  const kTrend = predictions.k[predictions.k.length - 1] - predictions.k[0]
  
  if (pTrend < -30) {
    warnings.push({
      type: 'declining_p',
      severity: 'warning',
      message: 'Predikce ukazuje pokles P za 4 roky',
      recommendation: 'Zvažte zvýšení dávek P ve druhé polovině období',
    })
  }
  
  if (kTrend < -50) {
    warnings.push({
      type: 'declining_k',
      severity: 'warning',
      message: 'Predikce ukazuje pokles K za 4 roky',
      recommendation: 'Zvažte zvýšení dávek K ve druhé polovině období',
    })
  }
  
  // pH trend warning
  const phTrend = predictions.ph[predictions.ph.length - 1] - predictions.ph[0]
  if (phTrend < -0.3) {
    warnings.push({
      type: 'declining_ph',
      severity: 'info',
      message: 'Predikce ukazuje postupné okyselování',
      recommendation: 'Plánujte další vápnění za 3-4 roky',
    })
  }
  
  // Analysis age
  const analysisAge = (Date.now() - new Date(analysis.date).getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (analysisAge > 4) {
    warnings.push({
      type: 'old_analysis',
      severity: 'warning',
      message: `Rozbor je starý ${Math.floor(analysisAge)} let`,
      recommendation: 'Pro přesnější predikci doporučujeme nový rozbor',
    })
  }
  
  // Add info about prediction
  warnings.push({
    type: 'advanced_plan_info',
    severity: 'info',
    message: 'Plán zahrnuje 4letou predikci založenou na osevním postupu',
    recommendation: 'Aktualizujte plán při změně osevního postupu nebo výnosů',
  })
  
  // =========================================================================
  // 6. RETURN COMPLETE PLAN
  // =========================================================================
  
  return {
    plan_type: 'advanced',
    user_type: 'C',
    parcel_id: parcel.id,
    analysis_id: analysis.id,
    target_year: targetYear,
    created_at: new Date().toISOString(),
    
    recommended_lime_kg_ha: firstYearRec.lime,
    recommended_lime_type: limeType,
    lime_reasoning: limeReasoning,
    
    recommended_nutrients: {
      p2o5: Math.round(nutrients.p2o5),
      k2o: Math.round(nutrients.k2o),
      mgo: Math.round(nutrients.mgo),
      s: Math.round(nutrients.s),
    },
    
    warnings,
    notes: notes.length > 0 ? notes : undefined,
    
    km_ratio: kMgRatio,
    km_ratio_corrected: kmRatioCorrected,
    
    predictions,
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR ADVANCED PLAN
// ============================================================================

/**
 * Initialize soil state from analysis
 */
function initializeSoilState(
  analysis: SoilAnalysis,
  parcel: Parcel
): SoilState {
  // Convert mg/kg to kg/ha for P, K, Mg
  const p_kgha = mgKgToKgHa(analysis.phosphorus, 30)
  const k_kgha = mgKgToKgHa(analysis.potassium, 30)
  const mg_kgha = mgKgToKgHa(analysis.magnesium, 30)
  
  // Estimate sulfur if not measured
  const s_mgkg = analysis.sulfur || 15 // Default 15 mg/kg if not measured
  const s_kgha = mgKgToKgHa(s_mgkg, 30)
  
  return {
    ph: analysis.ph,
    p_mgkg: analysis.phosphorus,
    k_mgkg: analysis.potassium,
    mg_mgkg: analysis.magnesium,
    s_mgkg,
    p_kgha,
    k_kgha,
    mg_kgha,
    s_kgha,
  }
}

/**
 * Process one historical year - updates soil state based on fertilization and harvest
 */
function processHistoricalYear(
  state: SoilState,
  rotation: CropRotation,
  fertilizationRecords: FertilizationHistory[],
  parcel: Parcel
): SoilState {
  const newState = { ...state }
  
  // 1. Add nutrients from fertilization
  for (const record of fertilizationRecords) {
    if (record.phosphorus) {
      newState.p_kgha += record.phosphorus
    }
    if (record.potassium) {
      newState.k_kgha += record.potassium
    }
    if (record.magnesium) {
      newState.mg_kgha += record.magnesium
    }
    
    // Calculate acidification from nitrogen and sulfur
    if (record.nitrogen) {
      const acidification = record.nitrogen * ACIDIFICATION_FACTORS['N']
      // Convert acidification to pH change (very simplified)
      newState.ph += acidification / 10000 // Rough approximation
    }
  }
  
  // 2. Subtract nutrients removed by harvest
  if (rotation.actual_yield) {
    const cropUptake = getCropNutrientUptake(rotation.crop_name)
    
    newState.p_kgha -= cropUptake.p * rotation.actual_yield
    newState.k_kgha -= cropUptake.k * rotation.actual_yield
    newState.mg_kgha -= cropUptake.mg * rotation.actual_yield
    newState.s_kgha -= cropUptake.s * rotation.actual_yield
  }
  
  // 3. Natural acidification
  const naturalAcid = NATURAL_ACIDIFICATION[parcel.soil_type]
  newState.ph -= naturalAcid / 10000 // Rough conversion
  
  // 4. Convert kg/ha back to mg/kg
  newState.p_mgkg = newState.p_kgha / 4.2
  newState.k_mgkg = newState.k_kgha / 4.2
  newState.mg_mgkg = newState.mg_kgha / 4.2
  newState.s_mgkg = newState.s_kgha / 4.2
  
  // Ensure non-negative values
  newState.p_kgha = Math.max(0, newState.p_kgha)
  newState.k_kgha = Math.max(0, newState.k_kgha)
  newState.mg_kgha = Math.max(0, newState.mg_kgha)
  newState.s_kgha = Math.max(0, newState.s_kgha)
  
  newState.p_mgkg = Math.max(0, newState.p_mgkg)
  newState.k_mgkg = Math.max(0, newState.k_mgkg)
  newState.mg_mgkg = Math.max(0, newState.mg_mgkg)
  newState.s_mgkg = Math.max(0, newState.s_mgkg)
  
  // Keep pH in reasonable range
  newState.ph = Math.max(4.0, Math.min(8.0, newState.ph))
  
  return newState
}

/**
 * Calculate fertilization recommendation for one year
 */
function calculateYearRecommendation(
  state: SoilState,
  cropNeeds: { p: number; k: number; mg: number; s: number },
  parcel: Parcel
): {
  lime: number
  nutrients: { p2o5: number; k2o: number; mgo: number; s: number }
} {
  // Calculate lime need
  const limeCalc = calculateLimeNeed(state.ph, parcel.soil_type, parcel.culture)
  
  // Calculate nutrient needs
  // Convert crop needs (pure element) to oxide form
  const p2o5Need = cropNeeds.p * 2.29 // P → P2O5 conversion
  const k2oNeed = cropNeeds.k * 1.20  // K → K2O conversion
  const mgoNeed = cropNeeds.mg * 1.66 // Mg → MgO conversion
  const sNeed = cropNeeds.s
  
  // Add base fertilization to compensate for low soil reserves
  let totalP2O5 = p2o5Need
  let totalK2O = k2oNeed
  let totalMgO = mgoNeed
  let totalS = sNeed
  
  // If soil reserves are low, add extra
  if (state.p_mgkg < 60) {
    totalP2O5 += 20 // Extra 20 kg to build reserves
  }
  if (state.k_mgkg < 120) {
    totalK2O += 30 // Extra 30 kg to build reserves
  }
  if (state.mg_mgkg < 80) {
    totalMgO += 20 // Extra 20 kg to build reserves
  }
  
  return {
    lime: limeCalc.amount,
    nutrients: {
      p2o5: totalP2O5,
      k2o: totalK2O,
      mgo: totalMgO,
      s: totalS,
    },
  }
}

/**
 * Apply recommendation and simulate one year forward
 */
function applySimulatedYear(
  state: SoilState,
  recommendation: {
    lime: number
    nutrients: { p2o5: number; k2o: number; mgo: number; s: number }
  },
  cropNeeds: { p: number; k: number; mg: number; s: number },
  parcel: Parcel
): SoilState {
  const newState = { ...state }
  
  // 1. Apply lime - increases pH
  if (recommendation.lime > 0) {
    // Very rough pH increase estimation
    // 1 t/ha lime ≈ 0.1-0.2 pH units increase (depends on buffering)
    const phIncrease = (recommendation.lime / 1000) * 0.15
    newState.ph += phIncrease
  }
  
  // 2. Add fertilizer nutrients (convert oxide to element and then to kg/ha)
  const pAdded = (recommendation.nutrients.p2o5 / 2.29) // P2O5 → P
  const kAdded = (recommendation.nutrients.k2o / 1.20)  // K2O → K
  const mgAdded = (recommendation.nutrients.mgo / 1.66) // MgO → Mg
  
  newState.p_kgha += pAdded
  newState.k_kgha += kAdded
  newState.mg_kgha += mgAdded
  newState.s_kgha += recommendation.nutrients.s
  
  // 3. Subtract crop uptake
  newState.p_kgha -= cropNeeds.p
  newState.k_kgha -= cropNeeds.k
  newState.mg_kgha -= cropNeeds.mg
  newState.s_kgha -= cropNeeds.s
  
  // 4. Natural acidification
  const naturalAcid = NATURAL_ACIDIFICATION[parcel.soil_type]
  newState.ph -= naturalAcid / 10000
  
  // 5. Fertilizer acidification (from N and S - estimate based on typical NPK)
  // Assume 100 kg N per year as typical
  const nAcidification = 100 * ACIDIFICATION_FACTORS['N']
  newState.ph += nAcidification / 10000
  
  // 6. Convert kg/ha back to mg/kg
  newState.p_mgkg = newState.p_kgha / 4.2
  newState.k_mgkg = newState.k_kgha / 4.2
  newState.mg_mgkg = newState.mg_kgha / 4.2
  newState.s_mgkg = newState.s_kgha / 4.2
  
  // Ensure reasonable ranges
  newState.p_kgha = Math.max(0, newState.p_kgha)
  newState.k_kgha = Math.max(0, newState.k_kgha)
  newState.mg_kgha = Math.max(0, newState.mg_kgha)
  newState.s_kgha = Math.max(0, newState.s_kgha)
  
  newState.p_mgkg = Math.max(0, newState.p_mgkg)
  newState.k_mgkg = Math.max(0, newState.k_mgkg)
  newState.mg_mgkg = Math.max(0, newState.mg_mgkg)
  newState.s_mgkg = Math.max(0, newState.s_mgkg)
  
  newState.ph = Math.max(4.0, Math.min(8.0, newState.ph))
  
  return newState
}
