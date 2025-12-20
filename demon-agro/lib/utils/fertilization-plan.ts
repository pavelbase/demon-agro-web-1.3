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
