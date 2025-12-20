import type { SoilType, NutrientCategory, PhCategory } from '@/lib/types/database'

/**
 * Categorize pH value
 * Based on Czech soil classification standards
 */
export function categorizePh(ph: number): PhCategory {
  if (ph < 5.0) return 'EK' // Extrémně Kyselý
  if (ph < 5.5) return 'SK' // Silně Kyselý
  if (ph < 7.5) return 'N'  // Neutrální
  if (ph < 8.0) return 'SZ' // Slabě Zásaditý
  return 'EZ' // Extrémně Zásaditý
}

/**
 * Categorize nutrient value based on soil type
 * Based on Mehlich 3 method - Czech agricultural standards
 */
export function categorizeNutrient(
  nutrient: 'P' | 'K' | 'Mg' | 'Ca',
  value: number,
  soilType: SoilType
): NutrientCategory {
  
  // Phosphorus (P) thresholds in mg/kg by soil type
  if (nutrient === 'P') {
    if (soilType === 'L') { // Lehká (light)
      if (value < 40) return 'N'   // Nízký
      if (value < 80) return 'VH'  // Velmi Hluboký
      if (value < 120) return 'D'  // Dobrý
      if (value < 180) return 'V'  // Vysoký
      return 'VV' // Velmi Vysoký
    } else if (soilType === 'S') { // Střední (medium)
      if (value < 50) return 'N'
      if (value < 100) return 'VH'
      if (value < 150) return 'D'
      if (value < 220) return 'V'
      return 'VV'
    } else { // Těžká (heavy)
      if (value < 60) return 'N'
      if (value < 120) return 'VH'
      if (value < 180) return 'D'
      if (value < 260) return 'V'
      return 'VV'
    }
  }

  // Potassium (K) thresholds in mg/kg by soil type
  if (nutrient === 'K') {
    if (soilType === 'L') {
      if (value < 80) return 'N'
      if (value < 140) return 'VH'
      if (value < 200) return 'D'
      if (value < 280) return 'V'
      return 'VV'
    } else if (soilType === 'S') {
      if (value < 100) return 'N'
      if (value < 180) return 'VH'
      if (value < 260) return 'D'
      if (value < 360) return 'V'
      return 'VV'
    } else {
      if (value < 120) return 'N'
      if (value < 220) return 'VH'
      if (value < 320) return 'D'
      if (value < 440) return 'V'
      return 'VV'
    }
  }

  // Magnesium (Mg) thresholds in mg/kg by soil type
  if (nutrient === 'Mg') {
    if (soilType === 'L') {
      if (value < 60) return 'N'
      if (value < 100) return 'VH'
      if (value < 150) return 'D'
      if (value < 220) return 'V'
      return 'VV'
    } else if (soilType === 'S') {
      if (value < 80) return 'N'
      if (value < 140) return 'VH'
      if (value < 200) return 'D'
      if (value < 280) return 'V'
      return 'VV'
    } else {
      if (value < 100) return 'N'
      if (value < 180) return 'VH'
      if (value < 260) return 'D'
      if (value < 360) return 'V'
      return 'VV'
    }
  }

  // Calcium (Ca) thresholds - general (less critical)
  if (nutrient === 'Ca') {
    if (value < 800) return 'N'
    if (value < 1500) return 'VH'
    if (value < 2500) return 'D'
    if (value < 4000) return 'V'
    return 'VV'
  }

  return 'D' // Default to "Dobrý"
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: NutrientCategory | PhCategory): string {
  switch (category) {
    case 'N':
    case 'EK':
      return 'red'
    case 'VH':
    case 'SK':
      return 'orange'
    case 'D':
    case 'N': // pH Neutrální
      return 'green'
    case 'V':
    case 'SZ':
      return 'blue'
    case 'VV':
    case 'EZ':
      return 'purple'
    default:
      return 'gray'
  }
}

/**
 * Get category label
 */
export function getCategoryLabel(category: NutrientCategory | PhCategory): string {
  const labels: Record<string, string> = {
    // Nutrients
    'N': 'Nízký',
    'VH': 'Velmi Hluboký',
    'D': 'Dobrý',
    'V': 'Vysoký',
    'VV': 'Velmi Vysoký',
    // pH
    'EK': 'Extrémně Kyselý',
    'SK': 'Silně Kyselý',
    'SZ': 'Slabě Zásaditý',
    'EZ': 'Extrémně Zásaditý',
  }
  return labels[category] || category
}
