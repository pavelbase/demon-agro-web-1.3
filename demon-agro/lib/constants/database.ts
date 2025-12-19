// Database constants and labels for UI display

import type {
  SoilType,
  Culture,
  NutrientCategory,
  PhCategory,
  RequestStatus,
  LimeType,
  UserRole,
} from '../types/database'

// ============================================================================
// SOIL TYPE (Typ půdy)
// ============================================================================

export const SOIL_TYPE_LABELS: Record<SoilType, string> = {
  L: 'Lehká',
  S: 'Střední',
  T: 'Těžká',
}

export const SOIL_TYPE_DESCRIPTIONS: Record<SoilType, string> = {
  L: 'Lehká půda (písčitá)',
  S: 'Střední půda (hlinitá)',
  T: 'Těžká půda (jílovitá)',
}

export const SOIL_TYPES: SoilType[] = ['L', 'S', 'T']

// ============================================================================
// CULTURE (Kultura)
// ============================================================================

export const CULTURE_LABELS: Record<Culture, string> = {
  orna: 'Orná půda',
  ttp: 'Travní trvalý porost',
}

export const CULTURE_DESCRIPTIONS: Record<Culture, string> = {
  orna: 'Půda určená pro pěstování plodin',
  ttp: 'Trvalé travní porosty',
}

export const CULTURES: Culture[] = ['orna', 'ttp']

// ============================================================================
// NUTRIENT CATEGORY (Kategorie živiny)
// ============================================================================

export const NUTRIENT_CATEGORY_LABELS: Record<NutrientCategory, string> = {
  N: 'Nízký',
  VH: 'Velmi hluboký',
  D: 'Dobrý',
  V: 'Vysoký',
  VV: 'Velmi vysoký',
}

export const NUTRIENT_CATEGORY_DESCRIPTIONS: Record<NutrientCategory, string> = {
  N: 'Nízký obsah živiny - nutné hnojení',
  VH: 'Velmi hluboký pod optimem - výrazné hnojení',
  D: 'Dobrý obsah živiny - udržovací hnojení',
  V: 'Vysoký obsah živiny - minimální hnojení',
  VV: 'Velmi vysoký obsah - hnojení není nutné',
}

export const NUTRIENT_CATEGORY_COLORS: Record<NutrientCategory, string> = {
  N: 'text-red-600',
  VH: 'text-orange-600',
  D: 'text-green-600',
  V: 'text-blue-600',
  VV: 'text-purple-600',
}

export const NUTRIENT_CATEGORIES: NutrientCategory[] = ['N', 'VH', 'D', 'V', 'VV']

// ============================================================================
// PH CATEGORY (Kategorie pH)
// ============================================================================

export const PH_CATEGORY_LABELS: Record<PhCategory, string> = {
  EK: 'Extrémně kyselý',
  SK: 'Silně kyselý',
  N: 'Neutrální',
  SZ: 'Slabě zásaditý',
  EZ: 'Extrémně zásaditý',
}

export const PH_CATEGORY_DESCRIPTIONS: Record<PhCategory, string> = {
  EK: 'pH < 5.0 - nutné vápnění',
  SK: 'pH 5.0 - 5.5 - doporučeno vápnění',
  N: 'pH 6.0 - 7.0 - optimální',
  SZ: 'pH 7.0 - 7.5 - mírně alkalická',
  EZ: 'pH > 8.0 - vysoká alkalita',
}

export const PH_CATEGORY_COLORS: Record<PhCategory, string> = {
  EK: 'text-red-700',
  SK: 'text-orange-600',
  N: 'text-green-600',
  SZ: 'text-blue-600',
  EZ: 'text-purple-600',
}

export const PH_CATEGORIES: PhCategory[] = ['EK', 'SK', 'N', 'SZ', 'EZ']

// ============================================================================
// REQUEST STATUS (Stav poptávky)
// ============================================================================

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Nová',
  in_progress: 'Zpracovává se',
  quoted: 'Nabídka odeslána',
  completed: 'Dokončeno',
  cancelled: 'Zrušeno',
}

export const REQUEST_STATUS_DESCRIPTIONS: Record<RequestStatus, string> = {
  new: 'Nová poptávka čeká na zpracování',
  in_progress: 'Poptávka se zpracovává',
  quoted: 'Cenová nabídka byla odeslána',
  completed: 'Poptávka byla dokončena',
  cancelled: 'Poptávka byla zrušena',
}

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export const REQUEST_STATUSES: RequestStatus[] = [
  'new',
  'in_progress',
  'quoted',
  'completed',
  'cancelled',
]

// ============================================================================
// LIME TYPE (Typ vápna)
// ============================================================================

export const LIME_TYPE_LABELS: Record<LimeType, string> = {
  calcitic: 'Vápenatý',
  dolomite: 'Dolomitický',
  either: 'Libovolný',
}

export const LIME_TYPE_DESCRIPTIONS: Record<LimeType, string> = {
  calcitic: 'Vápenatý vápenec (CaCO₃) - obsahuje pouze vápník',
  dolomite: 'Dolomitický vápenec (CaMg(CO₃)₂) - obsahuje vápník i hořčík',
  either: 'Může být použit libovolný typ vápence',
}

export const LIME_TYPES: LimeType[] = ['calcitic', 'dolomite', 'either']

// ============================================================================
// USER ROLE (Role uživatele)
// ============================================================================

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrátor',
  user: 'Uživatel',
}

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Administrátor s plným přístupem',
  user: 'Běžný uživatel portálu',
}

export const USER_ROLES: UserRole[] = ['admin', 'user']

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export const PRODUCT_TYPE_LABELS = {
  fertilizer: 'Hnojivo',
  lime: 'Vápno',
}

export const PRODUCT_TYPE_DESCRIPTIONS = {
  fertilizer: 'Produkty pro hnojení půdy',
  lime: 'Produkty pro vápnění půdy',
}

// ============================================================================
// UNITS (Jednotky)
// ============================================================================

export const UNITS = {
  area: 'ha',
  weight: 't',
  weightPerArea: 't/ha',
  kg: 'kg',
  kgPerHa: 'kg/ha',
  percent: '%',
  mgPer100g: 'mg/100g',
}

export const UNIT_LABELS = {
  ha: 'hektar',
  t: 'tuna',
  't/ha': 'tuna na hektar',
  kg: 'kilogram',
  'kg/ha': 'kilogram na hektar',
  '%': 'procento',
  'mg/100g': 'miligram na 100g',
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get label for any enum value
 */
export function getEnumLabel<T extends string>(
  value: T,
  labels: Record<T, string>
): string {
  return labels[value] || value
}

/**
 * Get color class for nutrient category
 */
export function getNutrientCategoryColor(category: NutrientCategory): string {
  return NUTRIENT_CATEGORY_COLORS[category]
}

/**
 * Get color class for pH category
 */
export function getPhCategoryColor(category: PhCategory): string {
  return PH_CATEGORY_COLORS[category]
}

/**
 * Get status badge color
 */
export function getRequestStatusColor(status: RequestStatus): string {
  return REQUEST_STATUS_COLORS[status]
}

/**
 * Format area with unit
 */
export function formatArea(area: number): string {
  return `${area.toFixed(2)} ${UNITS.area}`
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(2)} ${UNITS.weight}`
}

/**
 * Get all options for a select dropdown
 */
export function getSelectOptions<T extends string>(
  values: T[],
  labels: Record<T, string>
): Array<{ value: T; label: string }> {
  return values.map(value => ({
    value,
    label: labels[value],
  }))
}
