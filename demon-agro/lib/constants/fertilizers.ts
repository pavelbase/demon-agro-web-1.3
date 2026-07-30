/**
 * Konstanty pro registr hnojiv ÚKZÚZ
 *
 * Hodnoty musí přesně odpovídat textům v tabulce fert_products – filtry se
 * v databázi porovnávají na rovnost (ne podílovou shodou), protože některé
 * názvy druhů obsahují znak "_", který je v LIKE zástupným znakem.
 */

/** Nabídka filtru druhu hnojiva – seřazeno podle počtu platných výrobků */
export const FERT_PRODUCT_KINDS = [
  'Rostlinný biostimulant',
  'Substrát',
  'Minerální hnojivo bez P_2_O_5_',
  'Minerální hnojivo s P₂O₅ 5 % a více',
  'Minerální hnojivo s P₂O₅ méně než 5 %',
  'Minerální hnojivo s inhibitorem',
  'Organické hnojivo se sušinou 13 a více %',
  'Organické hnojivo se sušinou menší než 13 %',
  'Organominerální hnojivo (organické)',
  'Organominerální hnojivo (minerální - <5 % P₂O₅)',
  'Organominerální hnojivo (minerální - ≥5 % P₂O₅)',
  'Vápenaté a hořečnatovápenaté hnojivo',
  'Pomocná půdní látka',
  'Inhibitor dusíku',
  'Popel ze samostatného spalování biomasy',
  'Produkt získaný procesem pyrolýzy',
  'Kompost vhodný do ekologického zemědělství',
  'Blend CE výrobků',
] as const

/** "Kategorie N" – rozhoduje o zařazení hnojiva v evidenci a limitech pro dusík */
export const FERT_NITROGEN_CATEGORIES = [
  'Minerálně dusíkaté',
  'Rychle uvolnitelný N',
  'Pomalu uvolnitelný N',
  'Nedusíkaté',
  'Pomocné látky',
] as const

/** "Režim" – právní základ uvedení výrobku na trh */
export const FERT_REGIMES = [
  'Registrace',
  'Ohlášení',
  'Vzájemné uznávání',
  'CE hnojiva',
  'ES hnojiva',
] as const

export const FERT_REGIME_NOTES: Record<string, string> = {
  Registrace: 'Výrobek registrovaný ÚKZÚZ (evidenční číslo R)',
  Ohlášení: 'Ohlášené hnojivo podle typu ve vyhlášce (evidenční číslo O)',
  'Vzájemné uznávání': 'Výrobek uznaný z jiného členského státu EU (evidenční číslo V)',
  'CE hnojiva': 'Hnojivý produkt s označením CE podle nařízení (EU) 2019/1009 (evidenční číslo C)',
  'ES hnojiva': 'Hnojivo podle staršího nařízení o hnojivech ES (evidenční číslo E)',
}

/** Počet hnojiv na jednu stránku výsledků vyhledávání */
export const FERT_PAGE_SIZE = 25

/**
 * Registr zapisuje dolní indexy zástupně ("P_2_O_5_"). Pro zobrazení je
 * převádíme na skutečné indexy, ve filtru se ale musí posílat původní hodnota.
 */
export function fertKindLabel(value: string | null): string {
  if (!value) return '–'
  return value.replace(/P_2_O_5_/g, 'P₂O₅')
}
