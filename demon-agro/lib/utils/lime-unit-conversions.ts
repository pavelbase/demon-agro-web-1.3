/**
 * UTILITY FUNKCE PRO PŘEPOČTY JEDNOTEK VÁPNĚNÍ
 * ==============================================
 * 
 * Tento soubor obsahuje utility funkce pro převod mezi různými jednotkami
 * používanými při vápnění zemědělských půd.
 * 
 * DŮLEŽITÉ KONSTANTY:
 * - 1 kg CaO = 1.79 kg CaCO3
 * - 1 kg CaCO3 = 0.559 kg CaO
 * - CaO = oxid vápenatý (čisté vápno, pálené vápno)
 * - CaCO3 = uhličitan vápenatý (vápenec, mletý vápenec)
 * 
 * HISTORIE:
 * - 2026-01-04: Vytvořeno po nalezení kritické chyby v jednotkách (TabulkovyPrehledVapneni.tsx)
 */

// ============================================================================
// KONSTANTY
// ============================================================================

/**
 * Konverzní faktor: CaO → CaCO3
 * 1 kg CaO odpovídá 1.79 kg CaCO3
 */
export const CAO_TO_CACO3_FACTOR = 1.79

/**
 * Konverzní faktor: CaCO3 → CaO
 * 1 kg CaCO3 odpovídá 0.559 kg CaO
 */
export const CACO3_TO_CAO_FACTOR = 0.559

// ============================================================================
// ZÁKLADNÍ KONVERZE
// ============================================================================

/**
 * Převod CaO na CaCO3
 * 
 * @param cao - Množství CaO (v jakýchkoliv jednotkách: kg, t, dt...)
 * @returns Ekvivalent v CaCO3 (ve stejných jednotkách)
 * 
 * @example
 * ```typescript
 * // 1 tuna CaO = 1.79 tuny CaCO3
 * caoToCaco3(1) // 1.79
 * 
 * // 1000 kg CaO = 1790 kg CaCO3
 * caoToCaco3(1000) // 1790
 * ```
 */
export function caoToCaco3(cao: number): number {
  return cao * CAO_TO_CACO3_FACTOR
}

/**
 * Převod CaCO3 na CaO
 * 
 * @param caco3 - Množství CaCO3 (v jakýchkoliv jednotkách: kg, t, dt...)
 * @returns Ekvivalent v CaO (ve stejných jednotkách)
 * 
 * @example
 * ```typescript
 * // 1 tuna CaCO3 = 0.559 tuny CaO
 * caco3ToCao(1) // 0.559
 * 
 * // 1790 kg CaCO3 = 1000 kg CaO
 * caco3ToCao(1790) // 1000
 * ```
 */
export function caco3ToCao(caco3: number): number {
  return caco3 * CACO3_TO_CAO_FACTOR
}

// ============================================================================
// SPECIFICKÉ KONVERZE PRO RŮZNÉ JEDNOTKY
// ============================================================================

/**
 * Převod kg CaCO3/ha na t CaO/ha
 * Kombinuje převod jednotek (kg → t) a chemickou konverzi (CaCO3 → CaO)
 * 
 * @param kgCaco3PerHa - Množství CaCO3 v kg/ha
 * @returns Ekvivalent CaO v t/ha
 * 
 * @example
 * ```typescript
 * // 9600 kg CaCO3/ha = 5.36 t CaO/ha
 * kgCaco3PerHa_to_tCaoPerHa(9600) // 5.3664
 * ```
 */
export function kgCaco3PerHa_to_tCaoPerHa(kgCaco3PerHa: number): number {
  // 1. Převod kg → t: /1000
  // 2. Převod CaCO3 → CaO: ×0.559
  return (kgCaco3PerHa / 1000) * CACO3_TO_CAO_FACTOR
}

/**
 * Převod t CaO/ha na kg CaCO3/ha
 * Opačná konverze k předchozí funkci
 * 
 * @param tCaoPerHa - Množství CaO v t/ha
 * @returns Ekvivalent CaCO3 v kg/ha
 * 
 * @example
 * ```typescript
 * // 5.36 t CaO/ha = 9591 kg CaCO3/ha
 * tCaoPerHa_to_kgCaco3PerHa(5.36) // 9591.4
 * ```
 */
export function tCaoPerHa_to_kgCaco3PerHa(tCaoPerHa: number): number {
  // 1. Převod CaO → CaCO3: ×1.79
  // 2. Převod t → kg: ×1000
  return tCaoPerHa * CAO_TO_CACO3_FACTOR * 1000
}

/**
 * Převod t CaCO3/ha na t CaO/ha
 * Pouze chemická konverze, jednotky zůstávají stejné (tuny)
 * 
 * @param tCaco3PerHa - Množství CaCO3 v t/ha
 * @returns Ekvivalent CaO v t/ha
 * 
 * @example
 * ```typescript
 * // 9.6 t CaCO3/ha = 5.36 t CaO/ha
 * tCaco3PerHa_to_tCaoPerHa(9.6) // 5.3664
 * ```
 */
export function tCaco3PerHa_to_tCaoPerHa(tCaco3PerHa: number): number {
  return tCaco3PerHa * CACO3_TO_CAO_FACTOR
}

/**
 * Převod t CaO/ha na t CaCO3/ha
 * Opačná konverze k předchozí funkci
 * 
 * @param tCaoPerHa - Množství CaO v t/ha
 * @returns Ekvivalent CaCO3 v t/ha
 * 
 * @example
 * ```typescript
 * // 5.36 t CaO/ha = 9.59 t CaCO3/ha
 * tCaoPerHa_to_tCaco3PerHa(5.36) // 9.5944
 * ```
 */
export function tCaoPerHa_to_tCaco3PerHa(tCaoPerHa: number): number {
  return tCaoPerHa * CAO_TO_CACO3_FACTOR
}

// ============================================================================
// PŘEPOČET NA PRODUKT PODLE OBSAHU CaO
// ============================================================================

/**
 * Výpočet potřebného množství vápencového produktu podle jeho obsahu CaO
 * 
 * @param targetCao_t - Cílové množství CaO v tunách
 * @param productCaoContent - Obsah CaO v produktu (0-100 %)
 * @returns Potřebné množství produktu v tunách
 * 
 * @example
 * ```typescript
 * // Potřebujeme 5 t CaO, máme vápenec s 48% CaO
 * calculateProductAmount(5, 48) // 10.42 t vápence
 * 
 * // Potřebujeme 2.5 t CaO, máme pálené vápno s 85% CaO
 * calculateProductAmount(2.5, 85) // 2.94 t páleného vápna
 * ```
 */
export function calculateProductAmount(
  targetCao_t: number,
  productCaoContent: number
): number {
  if (productCaoContent <= 0 || productCaoContent > 100) {
    throw new Error(
      `Neplatný obsah CaO: ${productCaoContent}%. Musí být v rozsahu 0-100%`
    )
  }
  
  return targetCao_t / (productCaoContent / 100)
}

/**
 * Výpočet množství CaO v produktu
 * Opačný výpočet k předchozí funkci
 * 
 * @param productAmount_t - Množství produktu v tunách
 * @param productCaoContent - Obsah CaO v produktu (0-100 %)
 * @returns Množství CaO v tunách
 * 
 * @example
 * ```typescript
 * // 10 t vápence s 48% CaO
 * calculateCaoInProduct(10, 48) // 4.8 t CaO
 * 
 * // 3 t páleného vápna s 85% CaO
 * calculateCaoInProduct(3, 85) // 2.55 t CaO
 * ```
 */
export function calculateCaoInProduct(
  productAmount_t: number,
  productCaoContent: number
): number {
  if (productCaoContent < 0 || productCaoContent > 100) {
    throw new Error(
      `Neplatný obsah CaO: ${productCaoContent}%. Musí být v rozsahu 0-100%`
    )
  }
  
  return productAmount_t * (productCaoContent / 100)
}

// ============================================================================
// VALIDAČNÍ FUNKCE
// ============================================================================

/**
 * Validace a přepočet hodnoty vápnění s kontrolou jednotek
 * 
 * @param value - Hodnota k přepočtu
 * @param fromUnit - Zdrojová jednotka
 * @param toUnit - Cílová jednotka
 * @returns Přepočtená hodnota
 * 
 * @example
 * ```typescript
 * convertLimeUnits(9600, 'kg_CaCO3_per_ha', 't_CaO_per_ha')
 * // returns 5.3664
 * ```
 */
export function convertLimeUnits(
  value: number,
  fromUnit: 'kg_CaCO3_per_ha' | 't_CaCO3_per_ha' | 't_CaO_per_ha' | 'kg_CaO_per_ha',
  toUnit: 'kg_CaCO3_per_ha' | 't_CaCO3_per_ha' | 't_CaO_per_ha' | 'kg_CaO_per_ha'
): number {
  // Převod na společnou jednotku (kg CaO)
  let kgCao: number
  
  switch (fromUnit) {
    case 'kg_CaCO3_per_ha':
      kgCao = caco3ToCao(value)
      break
    case 't_CaCO3_per_ha':
      kgCao = caco3ToCao(value * 1000)
      break
    case 't_CaO_per_ha':
      kgCao = value * 1000
      break
    case 'kg_CaO_per_ha':
      kgCao = value
      break
  }
  
  // Převod ze společné jednotky (kg CaO) na cílovou
  switch (toUnit) {
    case 'kg_CaCO3_per_ha':
      return caoToCaco3(kgCao)
    case 't_CaCO3_per_ha':
      return caoToCaco3(kgCao) / 1000
    case 't_CaO_per_ha':
      return kgCao / 1000
    case 'kg_CaO_per_ha':
      return kgCao
  }
}

// ============================================================================
// FORMÁTOVACÍ FUNKCE
// ============================================================================

/**
 * Formátování hodnoty vápnění s jednotkou pro zobrazení
 * 
 * @param value - Hodnota k formátování
 * @param unit - Jednotka hodnoty
 * @param decimals - Počet desetinných míst (default 2)
 * @returns Formátovaný řetězec s jednotkou
 * 
 * @example
 * ```typescript
 * formatLimeValue(5.36, 't_CaO_per_ha')
 * // returns "5.36 t CaO/ha"
 * 
 * formatLimeValue(9600, 'kg_CaCO3_per_ha', 0)
 * // returns "9600 kg CaCO3/ha"
 * ```
 */
export function formatLimeValue(
  value: number,
  unit: 'kg_CaCO3_per_ha' | 't_CaCO3_per_ha' | 't_CaO_per_ha' | 'kg_CaO_per_ha',
  decimals: number = 2
): string {
  const formatted = value.toFixed(decimals)
  
  const unitLabels = {
    'kg_CaCO3_per_ha': 'kg CaCO₃/ha',
    't_CaCO3_per_ha': 't CaCO₃/ha',
    't_CaO_per_ha': 't CaO/ha',
    'kg_CaO_per_ha': 'kg CaO/ha',
  }
  
  return `${formatted} ${unitLabels[unit]}`
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Konstanty
  CAO_TO_CACO3_FACTOR,
  CACO3_TO_CAO_FACTOR,
  
  // Základní konverze
  caoToCaco3,
  caco3ToCao,
  
  // Specifické konverze
  kgCaco3PerHa_to_tCaoPerHa,
  tCaoPerHa_to_kgCaco3PerHa,
  tCaco3PerHa_to_tCaoPerHa,
  tCaoPerHa_to_tCaco3PerHa,
  
  // Produkty
  calculateProductAmount,
  calculateCaoInProduct,
  
  // Utilities
  convertLimeUnits,
  formatLimeValue,
}



