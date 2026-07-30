/**
 * Konstanty pro díly půdních bloků (DPB) z LPIS
 *
 * Hodnoty odpovídají sestavě "Informativní údaje o DPB" z Portálu farmáře.
 */

/** Kódy kultur podle LPIS */
export const LPIS_CULTURE_LABELS: Record<string, string> = {
  R: 'Standardní orná půda',
  U: 'Úhor',
  T: 'Trvalý travní porost',
  V: 'Vinice',
  C: 'Chmelnice',
  S: 'Ovocný sad',
  K: 'Školka',
  J: 'Jiná trvalá kultura',
  D: 'Rychle rostoucí dřeviny',
  G: 'Zalesněná půda',
  L: 'Lesní půda',
  B: 'Rybník',
  Z: 'Zatravněná půda',
  O: 'Ostatní plocha',
}

/** Režim hospodaření ("EKO") */
export const FARMING_MODE_LABELS: Record<string, string> = {
  KONV: 'Konvenční',
  EKO: 'Ekologické zemědělství',
  PO: 'Přechodné období',
}

/** Erozní ohroženost DPB ("Eroze DPB") */
export const EROSION_CLASS_LABELS: Record<string, string> = {
  NEO: 'Neohrožená',
  'MEO-NR': 'Mírně ohrožená – nepřerušovaná',
  MEO: 'Mírně ohrožená',
  'SEO-NR': 'Silně ohrožená – nepřerušovaná',
  SEO: 'Silně ohrožená',
}

/**
 * Aplikační pásma určují termíny zákazu hnojení ve zranitelných oblastech
 * (příloha nařízení vlády o použití hnojiv ve zranitelných oblastech).
 */
export const APPLICATION_ZONE_NOTE =
  'Aplikační pásmo určuje období zákazu hnojení ve zranitelné oblasti dusíkem'

/** Překlad sloupce "Druh půdy" na půdní druh L/S/T používaný v portálu */
export const SOIL_KIND_TO_TYPE: Record<string, 'L' | 'S' | 'T'> = {
  lehká: 'L',
  střední: 'S',
  těžká: 'T',
}

export function lpisCultureLabel(code: string | null): string {
  if (!code) return '–'
  return LPIS_CULTURE_LABELS[code] ?? code
}

export function farmingModeLabel(code: string | null): string {
  if (!code) return '–'
  return FARMING_MODE_LABELS[code] ?? code
}

export function erosionClassLabel(code: string | null): string {
  if (!code) return '–'
  return EROSION_CLASS_LABELS[code] ?? code
}
