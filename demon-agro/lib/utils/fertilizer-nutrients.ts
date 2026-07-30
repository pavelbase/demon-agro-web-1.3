/**
 * PŘÍVOD ŽIVIN Z DÁVKY HNOJIVA
 *
 * Číselník hnojiv uvádí obsahy živin v procentech hmotnosti, evidence ale
 * zapisuje dávku v tom, čím se hnojivo dávkuje – v litrech, kilogramech nebo
 * tunách. Přepočet proto vede přes hmotnost hnojiva na hektar; u objemových
 * dávek se použije měrná hmotnost.
 *
 * Výstup evidence jde do oficiálních hlášení, proto se nic nedopočítává
 * náhradními hodnotami: bez věrohodné měrné hmotnosti se objemová dávka
 * nepřevádí a přívod živin zůstane nevyplněný, dokud ho uživatel nedoloží.
 *
 * Modul je bez závislosti na databázi, aby stejný výpočet běžel při ukládání
 * na serveru i jako živá nápověda ve formuláři.
 */

export interface FertilizerNutrientContent {
  name: string
  evidenceNumber: string | null
  isNormative: boolean
  /** H = obvyklá MJ hmotnostní, O = objemová */
  unitType: 'H' | 'O' | null
  densityKgL: number | null
  nPercent: number | null
  p2o5Percent: number | null
  k2oPercent: number | null
  /** Kategorie dusíku z číselníku – zařazuje hnojivo do pravidel akčního programu */
  nitrogenCategory: string | null
  productKind: string | null
  /** Hnojivo z exkrementů hospodářských zvířat – vstup pro limit 170 kg N/ha */
  isExcrement: boolean
}

export interface NutrientSupply {
  /** Hmotnost hnojiva na hektar (kg/ha) */
  massKgHa: number
  nKgHa: number | null
  p2o5KgHa: number | null
  k2oKgHa: number | null
}

/** Násobek pro převod dávky na kilogramy; null u objemových jednotek. */
const MASS_UNITS: Record<string, number> = {
  'kg/ha': 1,
  'kg': 1,
  'g/ha': 0.001,
  'g': 0.001,
  't/ha': 1000,
  't': 1000,
  'q/ha': 100,
}

/** Násobek pro převod dávky na litry – hmotnost se dopočítá měrnou hmotností. */
const VOLUME_UNITS: Record<string, number> = {
  'l/ha': 1,
  'l': 1,
  'ml/ha': 0.001,
  'ml': 0.001,
  'm3/ha': 1000,
  'm3': 1000,
  'hl/ha': 100,
}

/** Dávkuje se hnojivo objemově? Pak je pro přepočet potřeba měrná hmotnost. */
export function isVolumetricUnit(unit: string): boolean {
  return VOLUME_UNITS[normalizeUnit(unit)] !== undefined
}

/**
 * Měrná hmotnost přesně 1 kg/l je v číselníku zástupná hodnota.
 *
 * Roztoky dusíkatých hnojiv mají hustotu kolem 1,2–1,3 kg/l, takže dávka
 * v litrech přepočtená jedničkou vychází o pětinu až třetinu nižší, než jaká
 * ve skutečnosti na pozemek šla. Taková hodnota se proto k přepočtu nepoužívá
 * vůbec – přívod živin musí doložit uživatel.
 */
export function isPlaceholderDensity(densityKgL: number | null): boolean {
  return densityKgL === null || Number(densityKgL) === 1
}

function normalizeUnit(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/³/g, '3')
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Název bez diakritiky a v malých písmenech.
 *
 * Slouží k párování hnojiv, která v evidenci nemají evidenční číslo –
 * typicky normativy statkových hnojiv a záznamy z importů.
 */
export function normalizeFertilizerName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Hmotnost hnojiva na hektar v kilogramech; null, když dávku nelze přepočítat. */
export function doseToKgPerHa(
  dose: number,
  unit: string,
  densityKgL: number | null
): number | null {
  if (!Number.isFinite(dose) || dose <= 0) return null

  const key = normalizeUnit(unit)

  const massFactor = MASS_UNITS[key]
  if (massFactor !== undefined) return dose * massFactor

  const volumeFactor = VOLUME_UNITS[key]
  if (volumeFactor !== undefined) {
    // Bez věrohodné měrné hmotnosti nelze objem převést na hmotnost;
    // zástupná hodnota 1 kg/l by přívod podhodnotila
    if (isPlaceholderDensity(densityKgL) || densityKgL! <= 0) return null
    return dose * volumeFactor * densityKgL!
  }

  return null
}

/** Přívod N, P₂O₅ a K₂O na hektar z dávky a obsahu živin. */
export function computeNutrientSupply(
  dose: number,
  unit: string,
  content: FertilizerNutrientContent
): NutrientSupply | null {
  const massKgHa = doseToKgPerHa(dose, unit, content.densityKgL)
  if (massKgHa === null) return null

  const fromPercent = (percent: number | null): number | null =>
    percent === null ? null : Number(((massKgHa * percent) / 100).toFixed(3))

  return {
    massKgHa: Number(massKgHa.toFixed(3)),
    nKgHa: fromPercent(content.nPercent),
    p2o5KgHa: fromPercent(content.p2o5Percent),
    k2oKgHa: fromPercent(content.k2oPercent),
  }
}

/** Popis obsahu živin do nápovědy, např. „30 % N · 10 % P₂O₅". */
export function formatNutrientContent(content: FertilizerNutrientContent): string | null {
  const parts = [
    content.nPercent !== null ? `${content.nPercent} % N` : null,
    content.p2o5Percent !== null ? `${content.p2o5Percent} % P₂O₅` : null,
    content.k2oPercent !== null ? `${content.k2oPercent} % K₂O` : null,
  ].filter((part): part is string => part !== null)

  return parts.length > 0 ? parts.join(' · ') : null
}
