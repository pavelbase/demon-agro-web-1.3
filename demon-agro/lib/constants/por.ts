/**
 * Konstanty pro registr přípravků na ochranu rostlin (POR)
 *
 * Hodnoty odpovídají textům z exportu ÚKZÚZ. Biologická funkce může být
 * v registru kombinovaná ("Fungicid, Akaricid"), proto se ve filtru
 * vyhledává podílovou shodou, ne přesnou rovností.
 */

/** Nabídka filtru biologické funkce – seřazeno podle počtu platných přípravků */
export const POR_BIOLOGICAL_FUNCTIONS = [
  'Herbicid',
  'Fungicid',
  'Insekticid',
  'Akaricid',
  'Moluskocid',
  'Rodenticid',
  'Nematicid',
  'Baktericid',
  'Viricid',
  'Regulátor růstu',
  'Desikant',
  'Repelent',
  'Feromon',
  'Biopreparát',
  'Bioagens',
  'Adjuvant',
  'Pomocný prostředek',
  'Podpora zdravotního stavu',
  'Základní látka',
] as const

/** Počet přípravků na jednu stránku výsledků vyhledávání */
export const POR_PAGE_SIZE = 25

/**
 * Pořadí hodnocených údajů na detailu přípravku.
 * Údaje, které v seznamu nejsou, se vypíší až za těmito.
 */
export const POR_ATTRIBUTE_ORDER = [
  'Úprava = Typ formulace',
  'Biologická funkce',
  'Klasifikace (CLP)',
  'Signální slova',
  'Výstražné symboly nebezpečí dle CLP',
  'H věty - úplný seznam',
  'EUH věty',
  'Zvláštní rizika pro lidské zdraví',
  'Bezpečnostní opatření',
  'Riziko pro včely',
  'Riziko pro vodní organismy',
  'Riziko pro ptáky',
  'Riziko pro savce',
  'Riziko pro ostatní necílové členovce',
  'Riziko pro necílové rostliny',
  'Riziko pro půdní mikroorganismy',
  'Riziko pro půdní makroorganismy',
  'Riziko pro životní prostředí',
  'Ochranná pásma vod',
  'Další označení - fyz. chem. vlastnosti',
  'Další označení',
] as const

/** Údaje, které se na detailu zobrazují jako rizika (vizuálně oddělená sekce) */
export const POR_RISK_ATTRIBUTES = POR_ATTRIBUTE_ORDER.filter((a) =>
  a.startsWith('Riziko pro')
)

/**
 * Vysvětlení nečíselných hodnot ochranné lhůty používaných v registru.
 * "AT" = ochranná lhůta je dána odstupem, technologickou lhůtou nebo termínem aplikace.
 */
export const POR_PROTECTION_PERIOD_NOTES: Record<string, string> = {
  AT: 'Ochranná lhůta je dána odstupem mezi termínem aplikace a sklizní',
  '-': 'Ochranná lhůta není stanovena',
}
