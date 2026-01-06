/**
 * Orientační ceny vápenatých produktů v CZK/t
 * POZNÁMKA: Tyto ceny slouží pouze jako fallback
 * Primárním zdrojem cen je databázová tabulka liming_products (sloupec price_per_ton)
 * Skutečná cena závisí na dodavateli, množství, dopravě a aktuální situaci na trhu
 */

export const LIMING_PRODUCT_PRICES: Record<string, number> = {
  // Hlavní kategorie - fallback ceny pokud není cena v DB
  'dolomit': 800,
  'vápenec': 600,
  'vápno': 2500,
  
  // Varianty názvů
  'dolomit mletý': 800,
  'dolomitický vápenec': 800,
  'vápenec mletý': 600,
  'kalcitický vápenec': 600,
  'pálené vápno': 2500,
  'pálené vápno CaO': 2500,
  'uhličitan vápenatý': 600,
  'uhličitan hořečnato-vápenatý': 800,
}

/**
 * Získá cenu produktu - primárně z DB (price_per_ton), sekundárně z fallback hodnot
 * @param priceFromDb - Cena z databáze (price_per_ton)
 * @param productName - Název produktu (pro fallback)
 * @returns Cena v CZK/t nebo null pokud není dostupná
 */
export function getProductPrice(priceFromDb: number | null | undefined, productName?: string): number | null {
  // Primární zdroj: cena z databáze
  if (priceFromDb != null && priceFromDb > 0) {
    return priceFromDb
  }
  
  // Fallback: heuristika podle názvu produktu
  if (productName) {
    return getProductEstimatedPrice(productName)
  }
  
  return null
}

/**
 * Získá orientační cenu produktu na základě názvu (fallback funkce)
 * @param productName - Název produktu
 * @returns Cena v CZK/t nebo null pokud není definována
 */
export function getProductEstimatedPrice(productName: string): number | null {
  const normalizedName = productName.toLowerCase().trim()
  
  // Přesná shoda
  if (LIMING_PRODUCT_PRICES[normalizedName]) {
    return LIMING_PRODUCT_PRICES[normalizedName]
  }
  
  // Částečná shoda - hledáme klíčová slova
  if (normalizedName.includes('dolomit')) {
    return LIMING_PRODUCT_PRICES['dolomit']
  }
  
  if (normalizedName.includes('pálené') || normalizedName.includes('cao') && normalizedName.includes('vápno')) {
    return LIMING_PRODUCT_PRICES['vápno']
  }
  
  if (normalizedName.includes('vápenec') || normalizedName.includes('kalcit')) {
    return LIMING_PRODUCT_PRICES['vápenec']
  }
  
  // Default fallback - průměrná cena
  return 800
}

/**
 * Vypočítá odhadovanou cenu aplikace
 * @param pricePerTon - Cena produktu v CZK/t (z DB nebo fallback)
 * @param totalTons - Celkové množství v tunách
 * @returns Cena v CZK
 */
export function calculateEstimatedCost(pricePerTon: number | null, totalTons: number): number {
  if (!pricePerTon || pricePerTon <= 0) return 0
  return pricePerTon * totalTons
}

/**
 * DEPRECATED: Stará funkce pro zpětnou kompatibilitu
 * Použij raději calculateEstimatedCost s cenou z DB
 * @deprecated
 */
export function calculateEstimatedCostByName(productName: string, totalTons: number): number {
  const pricePerTon = getProductEstimatedPrice(productName)
  if (!pricePerTon) return 0
  return pricePerTon * totalTons
}

/**
 * Formátuje cenu do českého formátu s mezerami jako oddělovačem tisíců
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

