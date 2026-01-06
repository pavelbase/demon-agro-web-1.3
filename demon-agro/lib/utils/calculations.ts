import type { 
  SoilType, 
  Culture, 
  NutrientCategory, 
  LimeType,
  Parcel,
  SoilAnalysis,
} from '@/lib/types/database'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Lime need table based on pH and soil type (kg CaCO3/ha)
 * Source: Czech agricultural standards for soil liming
 */
export const LIME_NEED_TABLE: Record<SoilType, Record<string, number>> = {
  L: { // Lehká půda (light soil)
    '4.0': 8000,
    '4.5': 6000,
    '5.0': 4000,
    '5.5': 2000,
    '6.0': 0,
    '6.5': 0,
  },
  S: { // Střední půda (medium soil)
    '4.0': 12000,
    '4.5': 9000,
    '5.0': 6000,
    '5.5': 3000,
    '6.0': 1000,
    '6.5': 0,
  },
  T: { // Těžká půda (heavy soil)
    '4.0': 16000,
    '4.5': 12000,
    '5.0': 8000,
    '5.5': 4000,
    '6.0': 2000,
    '6.5': 0,
  },
}

/**
 * Acidification factors for common fertilizers (kg CaCO3/kg nutrient)
 */
export const ACIDIFICATION_FACTORS: Record<string, number> = {
  'N': -1.8,      // Ammonium-based nitrogen
  'P2O5': -0.3,   // Phosphate
  'K2O': 0.0,     // Potash (neutral)
  'S': -3.1,      // Elemental sulfur
  'SO4': -1.1,    // Sulfate
}

/**
 * Natural soil acidification (kg CaCO3/ha/year)
 */
export const NATURAL_ACIDIFICATION: Record<SoilType, number> = {
  L: 300,  // Light soil
  S: 400,  // Medium soil
  T: 500,  // Heavy soil
}

/**
 * Crop nutrient uptake rates (kg/t of main product)
 * Based on Czech agricultural research
 */
export const CROP_NUTRIENT_UPTAKE: Record<string, { n: number; p: number; k: number; mg: number; s: number }> = {
  'wheat': { n: 25, p: 4, k: 6, mg: 2, s: 3 },
  'barley': { n: 22, p: 4, k: 5, mg: 2, s: 2.5 },
  'rapeseed': { n: 50, p: 10, k: 12, mg: 4, s: 8 },
  'corn': { n: 18, p: 3, k: 5, mg: 2, s: 2 },
  'potato': { n: 3.5, p: 0.6, k: 5, mg: 0.4, s: 0.5 },
  'sugarbeet': { n: 1.8, p: 0.3, k: 2.5, mg: 0.3, s: 0.4 },
  'grass': { n: 20, p: 3, k: 22, mg: 3, s: 2 },
  'alfalfa': { n: 28, p: 3, k: 20, mg: 4, s: 3 },
  'default': { n: 20, p: 4, k: 8, mg: 2, s: 2.5 },
}

/**
 * Base fertilization rates by nutrient category (kg/ha)
 */
export const BASE_FERTILIZATION: Record<string, Record<NutrientCategory, number>> = {
  P: {
    N: 80,   // Low
    VH: 60,  // Very deep
    D: 40,   // Good
    V: 20,   // High
    VV: 0,   // Very high
  },
  K: {
    N: 120,
    VH: 90,
    D: 60,
    V: 30,
    VV: 0,
  },
  Mg: {
    N: 60,
    VH: 45,
    D: 30,
    V: 15,
    VV: 0,
  },
  S: {
    N: 30,
    VH: 20,
    D: 15,
    V: 10,
    VV: 5,
  },
}

/**
 * Validation ranges for soil analysis values
 */
export const VALIDATION_RANGES = {
  ph: { min: 4.0, max: 9.0 },
  phosphorus: { min: 0, max: 1000 },
  potassium: { min: 0, max: 1000 },
  magnesium: { min: 0, max: 1000 },
  calcium: { min: 0, max: 10000 },
  sulfur: { min: 0, max: 500 },
  nitrogen: { min: 0, max: 500 },
  kMgRatio: { optimal: { min: 1.5, max: 2.5 } },
}

/**
 * Category colors for UI display
 */
export const CATEGORY_COLORS: Record<NutrientCategory, string> = {
  N: 'red',
  VH: 'orange',
  D: 'green',
  V: 'blue',
  VV: 'purple',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect user type based on agricultural sophistication
 * Type A: Advanced users with detailed records
 * Type B: Intermediate users with some data
 * Type C: Basic users with minimal data
 */
export function detectUserType(
  parcel: Parcel,
  analyses: SoilAnalysis[],
  rotations: any[],
  fertilizationHistory: any[]
): 'A' | 'B' | 'C' {
  let score = 0

  // Check soil analysis availability and age
  if (analyses.length > 0) {
    const latestAnalysis = analyses[0]
    const analysisAge = (Date.now() - new Date(latestAnalysis.date).getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    if (analysisAge < 2) score += 3
    else if (analysisAge < 4) score += 2
    else score += 1

    // Check for complete analysis (including Ca, S)
    if (latestAnalysis.calcium && latestAnalysis.sulfur) score += 1
  }

  // Check crop rotation records (last 3 years)
  const recentRotations = rotations.filter(r => r.year >= new Date().getFullYear() - 2)
  if (recentRotations.length >= 3) score += 2
  else if (recentRotations.length > 0) score += 1

  // Check fertilization history (last 2 years)
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  const recentFertilization = fertilizationHistory.filter(
    f => new Date(f.date) >= twoYearsAgo
  )
  if (recentFertilization.length >= 3) score += 2
  else if (recentFertilization.length > 0) score += 1

  // Classify based on score
  if (score >= 6) return 'A'  // Advanced user
  if (score >= 3) return 'B'  // Intermediate user
  return 'C'  // Basic user
}

/**
 * Calculate lime need based on pH and soil properties
 * Returns amount in kg CaCO3/ha and recommended lime type
 */
export function calculateLimeNeed(
  currentPh: number,
  soilType: SoilType,
  culture: Culture,
  targetPh?: number
): { amount: number; type: LimeType; targetPh: number } {
  // Default target pH based on culture
  const defaultTargetPh = culture === 'orna' ? 6.5 : 6.0

  const finalTargetPh = targetPh || defaultTargetPh

  // If pH is already at or above target, no liming needed
  if (currentPh >= finalTargetPh) {
    return {
      amount: 0,
      type: 'either',
      targetPh: finalTargetPh,
    }
  }

  // Get lime need from table (interpolate if needed)
  const table = LIME_NEED_TABLE[soilType]
  const phSteps = Object.keys(table).map(Number).sort((a, b) => a - b)

  let limeNeed = 0

  // Find the two closest pH values in table
  for (let i = 0; i < phSteps.length - 1; i++) {
    if (currentPh >= phSteps[i] && currentPh < phSteps[i + 1]) {
      // Linear interpolation
      const ph1 = phSteps[i]
      const ph2 = phSteps[i + 1]
      const need1 = table[ph1.toFixed(1)]
      const need2 = table[ph2.toFixed(1)]
      
      const ratio = (currentPh - ph1) / (ph2 - ph1)
      limeNeed = need1 - (need1 - need2) * ratio
      break
    }
  }

  // If pH is below lowest in table, use highest dose
  if (currentPh < phSteps[0]) {
    limeNeed = table[phSteps[0].toFixed(1)]
  }

  // Adjust for target pH if different from 6.5/6.0
  const phDifference = finalTargetPh - (culture === 'orna' ? 6.5 : 6.0)
  if (Math.abs(phDifference) > 0.1) {
    // Roughly 2000 kg CaCO3 per 0.5 pH unit
    limeNeed += phDifference * 4000
  }

  return {
    amount: Math.max(0, Math.round(limeNeed / 100) * 100), // Round to nearest 100
    type: 'either', // Type will be refined by selectLimeType()
    targetPh: finalTargetPh,
  }
}

/**
 * Select appropriate lime type based on Mg status and K:Mg ratio
 */
export function selectLimeType(analysis: SoilAnalysis): LimeType {
  // Check Mg category
  if (!analysis.magnesium_category) {
    return 'either'
  }

  // Calculate K:Mg ratio
  const kMgRatio = analysis.potassium / (analysis.magnesium || 1)

  // Low Mg or high K:Mg ratio → use dolomite
  if (
    analysis.magnesium_category === 'nizky' || 
    analysis.magnesium_category === 'vyhovujici' ||
    kMgRatio > 2.5
  ) {
    return 'dolomite'
  }

  // High Mg or low K:Mg ratio → use calcitic
  if (
    analysis.magnesium_category === 'vysoky' || 
    analysis.magnesium_category === 'velmi_vysoky' ||
    kMgRatio < 1.5
  ) {
    return 'calcitic'
  }

  // Optimal Mg → either type is fine
  return 'either'
}

/**
 * Calculate nutrient need based on category and crop yield
 */
export function calculateNutrientNeed(
  nutrient: 'P' | 'K' | 'Mg' | 'S',
  category: NutrientCategory,
  baseYield: number = 1.0,
  isArable: boolean = true
): number {
  const baseDose = BASE_FERTILIZATION[nutrient][category]
  
  // Apply yield factor
  let needPerHa = baseDose * baseYield

  // Grassland adjustment (higher K need)
  if (!isArable && nutrient === 'K') {
    needPerHa *= 1.3
  }

  return Math.round(needPerHa)
}

/**
 * Apply K:Mg ratio correction to nutrient recommendations
 */
export function applyKMgCorrection(
  nutrients: { K: number; Mg: number },
  kMgRatio: number
): { K: number; Mg: number } {
  const corrected = { ...nutrients }

  // If ratio too high (excess K), reduce K or increase Mg
  if (kMgRatio > 2.5) {
    const excessRatio = kMgRatio - 2.5
    corrected.K = Math.max(0, corrected.K - excessRatio * 10)
    corrected.Mg += excessRatio * 15
  }

  // If ratio too low (excess Mg), reduce Mg or increase K
  if (kMgRatio < 1.5) {
    const deficitRatio = 1.5 - kMgRatio
    corrected.Mg = Math.max(0, corrected.Mg - deficitRatio * 10)
    corrected.K += deficitRatio * 15
  }

  return {
    K: Math.round(corrected.K),
    Mg: Math.round(corrected.Mg),
  }
}

/**
 * Convert soil nutrient content from mg/kg to kg/ha
 * @param mgKg - Nutrient content in mg/kg
 * @param depth - Soil depth in cm (default 30 cm)
 * @returns Nutrient content in kg/ha
 */
export function mgKgToKgHa(mgKg: number, depth: number = 30): number {
  // Conversion factor: 1 mg/kg = ~4.2 kg/ha for 30 cm depth
  // For 15 cm depth: factor is ~2.1
  const factor = depth === 30 ? 4.2 : depth === 15 ? 2.1 : (depth / 30) * 4.2
  return Math.round(mgKg * factor * 10) / 10
}

/**
 * Estimate KVK (Cation Exchange Capacity) if not measured
 * Based on soil type
 */
export function estimateKVK(soilType: SoilType): number {
  const kvkEstimates: Record<SoilType, number> = {
    L: 120,  // Light soil: 80-160 mmol/kg
    S: 200,  // Medium soil: 160-240 mmol/kg
    T: 280,  // Heavy soil: 240-320 mmol/kg
  }
  return kvkEstimates[soilType]
}

/**
 * Calculate acidification from fertilizer applications
 * @param fertilizers - Array of fertilizer applications
 * @returns Total acidification in kg CaCO3
 */
export function calculateAcidification(
  fertilizers: Array<{
    nutrient: string
    amount: number // kg/ha
  }>
): number {
  let totalAcidification = 0

  for (const fert of fertilizers) {
    const factor = ACIDIFICATION_FACTORS[fert.nutrient] || 0
    totalAcidification += fert.amount * factor
  }

  return Math.round(totalAcidification)
}

/**
 * Get current agricultural year (hospodářský rok)
 * Runs from July 1st to June 30th
 * @param date - Optional date to check (defaults to now)
 * @returns Agricultural year string (e.g., "HY2024/25")
 */
export function getHospodarskyRok(date?: Date): string {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = d.getMonth() + 1 // 1-12

  // If before July, we're in the previous agricultural year
  if (month < 7) {
    return `HY${year - 1}/${String(year).slice(-2)}`
  } else {
    return `HY${year}/${String(year + 1).slice(-2)}`
  }
}

/**
 * Get nutrient uptake rates for a specific crop
 * @param cropName - Name of the crop (normalized)
 * @returns Nutrient uptake rates per ton of main product
 */
export function getCropNutrientUptake(cropName: string): {
  n: number
  p: number
  k: number
  mg: number
  s: number
} {
  const normalizedName = cropName.toLowerCase().trim()
  
  // Try exact match
  if (CROP_NUTRIENT_UPTAKE[normalizedName]) {
    return CROP_NUTRIENT_UPTAKE[normalizedName]
  }

  // Try partial match
  for (const [key, value] of Object.entries(CROP_NUTRIENT_UPTAKE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value
    }
  }

  // Return default if no match
  return CROP_NUTRIENT_UPTAKE.default
}

/**
 * Calculate K:Mg ratio from analysis
 */
export function calculateKMgRatio(
  potassium: number,
  magnesium: number
): number {
  if (magnesium === 0) return 0
  return Math.round((potassium / magnesium) * 100) / 100
}

/**
 * Check if K:Mg ratio is optimal
 */
export function isKMgRatioOptimal(ratio: number): boolean {
  return ratio >= VALIDATION_RANGES.kMgRatio.optimal.min && 
         ratio <= VALIDATION_RANGES.kMgRatio.optimal.max
}

/**
 * Get recommendation message for K:Mg ratio
 */
export function getKMgRatioRecommendation(ratio: number): string {
  if (ratio < 1.5) {
    return 'Poměr K:Mg je příliš nízký. Doporučujeme snížit dávky hořčíku a zvýšit draslík.'
  }
  if (ratio > 2.5) {
    return 'Poměr K:Mg je příliš vysoký. Doporučujeme snížit dávky draslíku a zvýšit hořčík.'
  }
  return 'Poměr K:Mg je v optimálním rozmezí (1.5-2.5).'
}

/**
 * Calculate total lime need including acidification compensation
 * @param baseLimeNeed - Base lime need from pH (kg CaCO3/ha)
 * @param soilType - Soil type
 * @param fertilizers - Fertilizer applications
 * @param years - Planning period in years
 * @returns Total lime need in kg CaCO3/ha
 */
export function calculateTotalLimeNeed(
  baseLimeNeed: number,
  soilType: SoilType,
  fertilizers: Array<{ nutrient: string; amount: number }>,
  years: number = 4
): number {
  // Natural acidification over planning period
  const naturalAcid = NATURAL_ACIDIFICATION[soilType] * years

  // Fertilizer-induced acidification
  const fertilizerAcid = Math.abs(calculateAcidification(fertilizers)) * years

  // Total lime need
  const total = baseLimeNeed + naturalAcid + fertilizerAcid

  return Math.round(total / 100) * 100 // Round to nearest 100
}

/**
 * Validate soil analysis values
 */
export function validateAnalysisValue(
  nutrient: keyof typeof VALIDATION_RANGES,
  value: number
): { valid: boolean; message?: string } {
  const range = VALIDATION_RANGES[nutrient]
  
  if (!range) {
    return { valid: true }
  }

  if (value < range.min || value > range.max) {
    return {
      valid: false,
      message: `Hodnota ${value} je mimo platný rozsah ${range.min}-${range.max}`,
    }
  }

  return { valid: true }
}
