/**
 * Sdílená logika extrakce rozborů půdy z PDF pomocí AI.
 *
 * Prompt i normalizace jsou schválně TADY (ne v route.ts), aby existovaly jen
 * jednou a daly se testovat skriptem bez běžícího serveru:
 *   npx tsx scripts/test-azzp-extraction.ts "cesta/k/rozboru.pdf"
 *
 * Používá: app/api/portal/extract-soil-data/route.ts
 */

// Model, který funguje (ověřeno)
export const GEMINI_MODEL = 'gemini-flash-latest'

// ============================================================================
// TYPY
// ============================================================================
 
// Kultura pozemku dle LPIS/AZZP - musí odpovídat lib/types/database.ts::Culture.
// 'jina' = AI rozpoznala kulturu, ale engine pro ni zatím nemá tabulky (vinice, sad...) -
// NIKDY se nesmí tiše převést na 'orna', musí to řešit uživatel v UI.
export type ExtractedCulture = 'orna' | 'ttp' | 'chmelnice' | 'jina' | null

export interface SoilAnalysis {
  parcel_code?: string // LPIS kód nebo lab označení (např. "0701/27")
  parcel_name: string | null // Slovní název parcely (např. "U lesa")
  area_ha?: number | null // Výměra v hektarech
  soil_type?: string | null // Druh půdy: L (lehká), S (střední), T (těžká)
  culture: ExtractedCulture // Kultura pozemku - KRITICKÉ pro správný výpočet CaO/živin
  culture_raw?: string | null // Původní text z dokumentu (pro audit/debug)
  analysis_date: string // YYYY-MM-DD
  ph: number | null
  phosphorus: number | null // P (elementární, mg/kg, Mehlich III)
  potassium: number | null // K (elementární, mg/kg, Mehlich III)
  magnesium: number | null // Mg (elementární, mg/kg, Mehlich III)
  calcium: number | null // Ca (elementární, mg/kg, Mehlich III)
  sulfur: number | null // S (SÍRA)
  notes: string
}
 
export interface ExtractionResponse {
  analyses: SoilAnalysis[]
  pdfUrl: string
  laboratory: string | null
  document_type: string | null
  document_date: string | null
  confidence: 'high' | 'medium' | 'low'
  validationErrors: string[]
}
 
// ============================================================================
// HELPER FUNKCE
// ============================================================================
 
/**
 * Odstraní Markdown značky (```json, ```) a ořízne text
 */
export function cleanJsonString(text: string): string {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()
}
 
/**
 * Parsuje datum z různých formátů a převede na ISO (YYYY-MM-DD)
 */
export function parseDate(dateValue: any): string {
  if (!dateValue) return new Date().toISOString().split('T')[0]
  
  const dateStr = String(dateValue).trim()
  
  // Pokud už je ISO formát (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // Pokud je DD.MM.YYYY nebo DD/MM/YYYY
  const europeanMatch = dateStr.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/)
  if (europeanMatch) {
    const [, day, month, year] = europeanMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Pokud je DD-MM-YYYY
  const dashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dashMatch) {
    const [, day, month, year] = dashMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Zkusit standardní Date parsing
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch {
    // Fallback na dnešní datum
  }
  
  // Fallback: dnešní datum
  return new Date().toISOString().split('T')[0]
}
 
/**
 * Parsuje číselnou hodnotu a odstraní jednotky (mg/kg, %, atd.)
 */
export function parseNumericValue(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  
  // Pokud už je číslo, vrať ho
  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }
  
  // Převeď na string a očisti
  let strValue = String(value).trim()
  
  // Odstraň jednotky (mg/kg, %, ppm, atd.)
  strValue = strValue.replace(/\s*(mg\/kg|mg|kg|%|ppm|mmol\/kg|meq\/l)\s*/gi, '')
  
  // Nahraď desetinnou čárku za tečku
  strValue = strValue.replace(',', '.')
  
  // Odstraň mezery
  strValue = strValue.replace(/\s/g, '')
  
  // Zkus parsovat
  const parsed = parseFloat(strValue)
  
  return isNaN(parsed) ? null : parsed
}
 
/**
 * Odstraní diakritiku a převede na malá písmena (pro robustní porovnání textu)
 */
export function foldText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Normalizuje kulturu pozemku z volného textu AI na striktní enum.
 * KRITICKÉ: pokud kultura není jednoznačně rozpoznána, vrací null místo
 * tichého fallbacku na 'orna' - viz zadani-chmelnice-engine.md, "tiché
 * degradování na ornou je právě to, co způsobilo tuhle chybu".
 */
export function normalizeCultureValue(rawValue: any): ExtractedCulture {
  if (rawValue === null || rawValue === undefined) return null
  const text = foldText(String(rawValue))
  if (!text) return null

  if (/^orna( puda)?$|orn\.? *pud|arable/.test(text)) return 'orna'
  if (/^ttp$|trval[yý]?\s*travni|travni porost|louka|pastvina|pastvin/.test(text)) return 'ttp'
  if (/chmelnic/.test(text)) return 'chmelnice'
  if (/vinice|vinohrad|^sad$|ovocn[yý] sad|skolka/.test(text)) return 'jina'

  return null
}

/**
 * Normalizuje jeden vzorek analýzy
 */
export function normalizeSample(sample: any): SoilAnalysis {
  const cultureRaw = sample.culture ?? sample.kultura ?? sample.land_use ?? null

  return {
    parcel_code: sample.parcel_code || sample.code || null,
    parcel_name: sample.parcel_name || sample.name || null,
    area_ha: parseNumericValue(sample.area_ha || sample.area),
    soil_type: sample.soil_type || null,
    culture: normalizeCultureValue(cultureRaw),
    culture_raw: cultureRaw !== null && cultureRaw !== undefined ? String(cultureRaw) : null,
    analysis_date: parseDate(sample.analysis_date || sample.date || sample.datum || null),
    ph: parseNumericValue(sample.ph || sample.pH || sample.PH),
    phosphorus: parseNumericValue(sample.phosphorus || sample.p || sample.P),
    potassium: parseNumericValue(sample.potassium || sample.k || sample.K),
    magnesium: parseNumericValue(sample.magnesium || sample.mg || sample.Mg),
    calcium: parseNumericValue(sample.calcium || sample.ca || sample.Ca),
    sulfur: parseNumericValue(sample.sulfur || sample.s || sample.S),
    notes: String(sample.notes || sample.poznamka || sample.poznámka || '').trim()
  }
}
 
/**
 * Zajistí, že výstup je vždy objekt s polem `analyses`
 */
export function normalizeData(data: any): SoilAnalysis[] {
  // Pokud je data null nebo undefined
  if (!data) {
    throw new Error('AI nevrátila žádná data')
  }
  
  // Pokud už má správnou strukturu
  if (data.analyses && Array.isArray(data.analyses)) {
    return data.analyses.map(normalizeSample)
  }
  
  // Pokud je to pole přímo
  if (Array.isArray(data)) {
    return data.map(normalizeSample)
  }
  
  // Pokud je to objekt s indexy {"0": {...}, "1": {...}}
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    
    // Zkontroluj, jestli jsou klíče numerické
    const isIndexed = keys.every(key => /^\d+$/.test(key))
    
    if (isIndexed && keys.length > 0) {
      // Převeď na pole
      const samples = keys.sort((a, b) => parseInt(a) - parseInt(b)).map(key => data[key])
      return samples.map(normalizeSample)
    }
    
    // Pokud je to jeden objekt (jeden vzorek)
    if (keys.length > 0) {
      return [normalizeSample(data)]
    }
  }
  
  throw new Error('Neznámý formát dat z AI')
}
 
/**
 * Validuje, že máme alespoň nějaká data
 */
export function validateExtractedData(analyses: SoilAnalysis[]): void {
  if (analyses.length === 0) {
    throw new Error('AI neextrahovala žádná data z PDF')
  }
  
  // Zkontroluj, že alespoň jeden vzorek má nějaká data
  const hasAnyData = analyses.some(sample => 
    sample.ph !== null || 
    sample.phosphorus !== null || 
    sample.potassium !== null || 
    sample.magnesium !== null || 
    sample.calcium !== null ||
    sample.sulfur !== null
  )
  
  if (!hasAnyData) {
    throw new Error('AI extrahovala vzorky, ale žádný neobsahuje hodnoty')
  }
}

/**
 * Programové (ne AI) kontroly nad normalizovanými daty - nezávisle na tom, co AI
 * sama nahlásí jako "confidence". Cílem je, aby žádná chyba v kultuře/hodnotách
 * neprošla tiše dál do enginu (viz zadani-chmelnice-engine.md).
 */
export function buildValidationWarnings(analyses: SoilAnalysis[]): string[] {
  const warnings: string[] = []
  // Klíč = kód pozemku + datum + všechny hodnoty. Jeden pozemek může mít v AZZP
  // zprávě legitimně více vzorků (různé hodnoty), to NENÍ duplicita - hlásíme
  // jen skutečně identické řádky.
  const seenRows = new Set<string>()

  analyses.forEach((sample, index) => {
    const label = sample.parcel_name || sample.parcel_code || `vzorek #${index + 1}`

    if (sample.culture === null) {
      warnings.push(`⚠️ Kultura pozemku "${label}" nebyla rozpoznána (chybí v dokumentu nebo nejednoznačná) - zkontrolujte a vyberte ručně.`)
    } else if (sample.culture === 'jina') {
      warnings.push(`⚠️ Pozemek "${label}" má kulturu "${sample.culture_raw}", kterou engine zatím nepodporuje (jen orná/TTP/chmelnice) - zkontrolujte ručně.`)
    }

    if (sample.ph !== null && (sample.ph < 3 || sample.ph > 10)) {
      warnings.push(`⚠️ pH u "${label}" (${sample.ph}) je mimo realistický rozsah 3-10 - ověřte extrakci.`)
    }
    if (sample.phosphorus !== null && sample.phosphorus < 0) {
      warnings.push(`⚠️ Fosfor u "${label}" je záporný - ověřte extrakci.`)
    }
    if (sample.potassium !== null && sample.potassium < 0) {
      warnings.push(`⚠️ Draslík u "${label}" je záporný - ověřte extrakci.`)
    }
    if (sample.magnesium !== null && sample.magnesium < 0) {
      warnings.push(`⚠️ Hořčík u "${label}" je záporný - ověřte extrakci.`)
    }

    if (sample.parcel_code) {
      const rowKey = [
        sample.parcel_code,
        sample.analysis_date,
        sample.ph,
        sample.phosphorus,
        sample.potassium,
        sample.magnesium,
        sample.calcium,
      ].join('|')
      if (seenRows.has(rowKey)) {
        warnings.push(`⚠️ Vzorek u pozemku "${sample.parcel_code}" se v dokumentu opakuje se zcela shodnými hodnotami - zkontrolujte, zda nejde o duplicitu.`)
      }
      seenRows.add(rowKey)
    }
  })

  return warnings
}
 
// ============================================================================
// PROMPT PRO GEMINI
// ============================================================================
 
export const EXTRACTION_PROMPT = `Jsi expert na české agrochemické rozbory půdy. Analyzuj PDF a extrahuj VŠECHNY vzorky.
Tvůj výstup se automaticky napojuje na výpočetní engine vápnění a hnojení - přesnost je
KRITICKÁ, zejména u kultury pozemku a jednotek živin. Nikdy si nevymýšlej ani neodhaduj
hodnotu, kterou v dokumentu jasně nevidíš - v takovém případě vrať null.

DŮLEŽITÉ:
1. Rozpoznej formát dokumentu:
   - Laboratorní rozbor (např. Laboratoř Postoloprty)
   - AZZP zpráva (Agrochemické zkoušení zemědělských půd)

2. Pro KAŽDÝ vzorek extrahuj:

IDENTIFIKACE:
- parcel_code: Kód pozemku (např. "0701/27", "1 9002/1") - LPIS nebo lab označení
- parcel_name: Slovní název (např. "U lesa", "orná neurčena")
- area_ha: Výměra v hektarech (pokud je v dokumentu)

KULTURA POZEMKU (KRITICKÉ - ovlivňuje, podle jaké tabulky se počítá dávka!):
- culture: Urči kulturu pozemku podle textu v dokumentu (bývá to první slovo/sloupec
  u každého řádku, nebo záhlaví tabulky/sekce). Namapuj na PŘESNĚ jednu z hodnot:
  * "orna" - text obsahuje "orná", "orná půda", "orná p."
  * "ttp" - text obsahuje "TTP", "trvalý travní porost", "louka", "pastvina"
  * "chmelnice" - text obsahuje "chmelnice", "chmelnicová půda"
  * "jina" - jakákoliv jiná kultura (vinice, sad, ovocný sad, školka...)
  * null - kultura NENÍ v dokumentu jasně uvedena pro tento vzorek (NEHÁDEJ, nikdy
    automaticky nedosazuj "orna" jen proto, že je to nejčastější kultura!)
- culture_raw: Přesný text z dokumentu, ze kterého jsi kulturu odvodil/a (pro kontrolu člověkem)

ZÁKLADNÍ ÚDAJE:
- analysis_date: Datum rozboru (YYYY-MM-DD)
- soil_type: Druh půdy - hledej "L", "S", nebo "T"
  * L = lehká (písčitá)
  * S = střední (střední)
  * T = těžká (jílovitá)

ŽIVINY - VŽDY ELEMENTÁRNÍ FORMA v mg/kg (metodika Mehlich III, ÚKZÚZ):
- ph: Hodnota pH (typicky 4-9)
- phosphorus: Elementární P (fosfor), NIKOLIV P₂O₅
- potassium: Elementární K (draslík), NIKOLIV K₂O
- magnesium: Elementární Mg (hořčík), NIKOLIV MgO
- calcium: Elementární Ca (vápník), NIKOLIV CaO
- sulfur: S (SÍRA - velmi důležité!)

POZOR na jednotky: české AZZP/laboratorní rozbory téměř vždy uvádějí P, K, Mg, Ca už
jako elementární prvek v mg/kg (typické hodnoty: P 20-200, K 80-600, Mg 80-400,
Ca 800-4000). Pokud by dokument výjimečně uváděl hodnotu jako oxid (P₂O₅, K₂O, MgO, CaO -
pozná se podle explicitního označení v hlavičce sloupce), PŘEPOČTI na elementární formu
těmito koeficienty PŘED vrácením výsledku: P = P₂O₅ × 0,436; K = K₂O × 0,830;
Mg = MgO × 0,603; Ca = CaO × 0,715. Do poznámky (notes) v takovém případě napiš
"přepočteno z oxidu".

POZNÁMKY:
- notes: Jakékoliv poznámky, číslo vzorku, označení, přepočty jednotek

CELKOVÉ HODNOCENÍ DOKUMENTU:
- laboratory: Název laboratoře/zpracovatele, pokud je uveden
- document_type: "azzp" nebo "lab_report" nebo "unknown"
- document_date: Datum vypracování dokumentu (YYYY-MM-DD), pokud je uveden
- confidence: Tvoje upřímné sebehodnocení kvality extrakce:
  * "high" - všechny vzorky mají jasně čitelné všechny hodnoty i kulturu
  * "medium" - většina dat jasná, ale některé hodnoty/kultura chybí nebo jsou nejisté
  * "low" - dokument je nekvalitní/nejasný, hodně hodnot jsi musel/a odhadovat nebo chybí
- validation_notes: Pole textových poznámek pro člověka - cokoliv nejisté, nejednoznačné,
  nestandardní formátování, podezřelé hodnoty, apod. Prázdné pole, pokud nic takového není.

FORMÁT ODPOVĚDI - POUZE ČISTÝ JSON:
{
  "analyses": [
    {
      "parcel_code": "0701/27",
      "parcel_name": "U lesa",
      "area_ha": 4.3,
      "soil_type": "S",
      "culture": "orna",
      "culture_raw": "Orná",
      "analysis_date": "2023-12-31",
      "ph": 7.2,
      "phosphorus": 118,
      "potassium": 355,
      "magnesium": 265.5,
      "calcium": 2752,
      "sulfur": 17.8,
      "notes": "vz. 274"
    }
  ],
  "laboratory": "Laboratoř Postoloprty",
  "document_type": "lab_report",
  "document_date": "2024-09-19",
  "confidence": "high",
  "validation_notes": []
}

PRAVIDLA:
- Pokud hodnota chybí nebo si nejsi jistý/á → použij null (platí i pro "culture")
- Odstraň jednotky (mg/kg, %, atd)
- Pokud je hodnota "< 10" → použij 10
- Pokud je rozsah "10-15" → použij střed (12.5)
- Datum vždy YYYY-MM-DD
- VRAŤ POUZE JSON, BEZ MARKDOWN!`;