/**
 * Parser sestavy "Informativní údaje o DPB" z Portálu farmáře (LPIS)
 *
 * Export je jeden list s hlavičkou, ve které jsou názvy sloupců zalomené na
 * více řádků (např. "Kód\nDPB"). Čísla jsou částečně uložená jako text s
 * desetinnou čárkou, logické hodnoty jako "ano"/"ne".
 *
 * Modul je záměrně bez závislostí na Supabase ani na prostředí – používá ho
 * klient pro náhled importu i server pro validaci před zápisem.
 */

export interface ParsedLandBlock {
  square_code: string
  dpb_code: string
  cadastral_area: string | null
  area: number
  area_without_features: number | null
  perimeter_m: number | null
  culture: string | null
  farming_mode: string | null
  organic_conversion_from: string | null
  organic_from: string | null
  nitrate_vulnerable_zone: boolean | null
  application_zone: string | null
  erosion_class: string | null
  soil_kind: string | null
  soil_type: 'L' | 'S' | 'T' | null
  slope_degrees: number | null
  water_distance_m: number | null
  drainage: boolean | null
  lfa_type: string | null
  lfa_area_text: string | null
  protected_area_type: string | null
  protected_area_ha: number | null
  buffer_zone_ha: number | null
  ect_ha: number | null
  aeko_als: string | null
}

export interface LandBlockParseError {
  /** Číslo řádku v Excelu (1-based, včetně hlavičky) */
  row: number
  message: string
}

export interface LandBlockParseResult {
  rows: ParsedLandBlock[]
  errors: LandBlockParseError[]
  /** Povinné sloupce, které se v hlavičce nenašly */
  missingColumns: string[]
  /** Sloupce hlavičky, které parser nezná – jen informativně */
  unknownColumns: string[]
}

export type SheetCell = string | number | boolean | Date | null | undefined
export type SheetRow = SheetCell[]

/** Sloupce, bez kterých nemá import smysl */
const REQUIRED_COLUMNS = ['Čtverec', 'Kód DPB', 'Výměra [ha]'] as const

/**
 * Mapa normalizovaných názvů sloupců na pole záznamu. Normalizace odstraňuje
 * diakritiku, zalomení řádků a interpunkci, takže drobné změny v exportu
 * ("Vým." vs "Výměra", jiné zalomení) nerozbijí párování.
 */
const COLUMN_MAP: Record<string, keyof ParsedLandBlock> = {
  ctverec: 'square_code',
  koddpb: 'dpb_code',
  katastralniuzemi: 'cadastral_area',
  vymha: 'area',
  vymeraha: 'area',
  vymbezkp: 'area_without_features',
  vymerabezkp: 'area_without_features',
  kul: 'culture',
  kultura: 'culture',
  eko: 'farming_mode',
  pood: 'organic_conversion_from',
  ezod: 'organic_from',
  typlfaanc: 'lfa_type',
  vymeralfaanc: 'lfa_area_text',
  vymlfaanc: 'lfa_area_text',
  typzchu: 'protected_area_type',
  vymzchu: 'protected_area_ha',
  vymschu: 'buffer_zone_ha',
  vymect: 'ect_ha',
  erozedpb: 'erosion_class',
  zod: 'nitrate_vulnerable_zone',
  druhpudy: 'soil_kind',
  aekoals: 'aeko_als',
  sklonitost: 'slope_degrees',
  vzdalodvodym: 'water_distance_m',
  vzdalenostodvodym: 'water_distance_m',
  meliorace: 'drainage',
  aplpasmo: 'application_zone',
  aplikacnipasmo: 'application_zone',
  obvodm: 'perimeter_m',
}

const SOIL_KIND_TO_TYPE: Record<string, 'L' | 'S' | 'T'> = {
  lehka: 'L',
  stredni: 'S',
  tezka: 'T',
}

function normalizeHeader(value: SheetCell): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function toText(value: SheetCell): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text === '' ? null : text
}

/** Čísla mohou přijít jako number i jako text s desetinnou čárkou ("0,00"). */
function toNumber(value: SheetCell): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const text = toText(value)
  if (!text) return null
  // Jen jedna desetinná čárka – víc hodnot v buňce (LFA) se čísly neparsuje
  const normalized = text.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function toBool(value: SheetCell): boolean | null {
  const text = toText(value)?.toLowerCase()
  if (!text) return null
  if (['ano', 'a', 'true', '1'].includes(text)) return true
  if (['ne', 'n', 'false', '0'].includes(text)) return false
  return null
}

/** Datum jako ISO (YYYY-MM-DD); Excel může vrátit Date i text "1.1.2020". */
function toDate(value: SheetCell): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const text = toText(value)
  if (!text) return null

  const czech = text.match(/^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})$/)
  if (czech) {
    const [, day, month, year] = czech
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return iso ? iso[0] : null
}

function toSoilType(soilKind: string | null): 'L' | 'S' | 'T' | null {
  if (!soilKind) return null
  const key = soilKind
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  return SOIL_KIND_TO_TYPE[key] ?? null
}

/** Najde řádek hlavičky – v exportu bývá první, ale nemusí. */
function findHeaderRow(rows: SheetRow[]): number {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const normalized = (rows[i] ?? []).map(normalizeHeader)
    if (normalized.includes('ctverec') && normalized.includes('koddpb')) {
      return i
    }
  }
  return -1
}

/**
 * Převede surové řádky listu (XLSX.utils.sheet_to_json s header: 1) na
 * záznamy DPB. Neplatné řádky nezastaví import – vrátí se v `errors`.
 */
export function parseLandBlocksSheet(rows: SheetRow[]): LandBlockParseResult {
  const headerIndex = findHeaderRow(rows)

  if (headerIndex === -1) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message:
            'V souboru nebyla nalezena hlavička se sloupci "Čtverec" a "Kód DPB". Nahrajte sestavu Informativní údaje o DPB z Portálu farmáře.',
        },
      ],
      missingColumns: [...REQUIRED_COLUMNS],
      unknownColumns: [],
    }
  }

  const header = rows[headerIndex] ?? []
  const fieldByIndex = new Map<number, keyof ParsedLandBlock>()
  const unknownColumns: string[] = []

  header.forEach((cell, index) => {
    const normalized = normalizeHeader(cell)
    if (!normalized) return
    const field = COLUMN_MAP[normalized]
    if (field) {
      fieldByIndex.set(index, field)
    } else {
      unknownColumns.push(String(cell).replace(/\s+/g, ' ').trim())
    }
  })

  const mappedFields = new Set(fieldByIndex.values())
  const missingColumns: string[] = []
  if (!mappedFields.has('square_code')) missingColumns.push('Čtverec')
  if (!mappedFields.has('dpb_code')) missingColumns.push('Kód DPB')
  if (!mappedFields.has('area')) missingColumns.push('Výměra [ha]')

  if (missingColumns.length > 0) {
    return { rows: [], errors: [], missingColumns, unknownColumns }
  }

  const parsed: ParsedLandBlock[] = []
  const errors: LandBlockParseError[] = []
  const seen = new Map<string, number>()

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    const excelRow = i + 1
    if (!row || row.every((cell) => toText(cell) === null)) continue

    const raw = {} as Record<keyof ParsedLandBlock, SheetCell>
    fieldByIndex.forEach((field, index) => {
      raw[field] = row[index]
    })

    const squareCode = toText(raw.square_code)
    const dpbCode = toText(raw.dpb_code)
    const area = toNumber(raw.area)

    if (!squareCode || !dpbCode) {
      errors.push({ row: excelRow, message: 'Chybí čtverec nebo kód DPB' })
      continue
    }

    if (area === null || area <= 0) {
      errors.push({ row: excelRow, message: `DPB ${dpbCode}: chybí nebo neplatná výměra` })
      continue
    }

    const key = `${squareCode}|${dpbCode}`
    const previousRow = seen.get(key)
    if (previousRow) {
      errors.push({
        row: excelRow,
        message: `DPB ${dpbCode} je v souboru vícekrát (už na řádku ${previousRow})`,
      })
      continue
    }
    seen.set(key, excelRow)

    const soilKind = toText(raw.soil_kind)

    parsed.push({
      square_code: squareCode,
      dpb_code: dpbCode,
      cadastral_area: toText(raw.cadastral_area),
      area,
      area_without_features: toNumber(raw.area_without_features),
      perimeter_m: toNumber(raw.perimeter_m),
      culture: toText(raw.culture)?.toUpperCase() ?? null,
      farming_mode: toText(raw.farming_mode)?.toUpperCase() ?? null,
      organic_conversion_from: toDate(raw.organic_conversion_from),
      organic_from: toDate(raw.organic_from),
      nitrate_vulnerable_zone: toBool(raw.nitrate_vulnerable_zone),
      application_zone: toText(raw.application_zone),
      erosion_class: toText(raw.erosion_class)?.toUpperCase() ?? null,
      soil_kind: soilKind,
      soil_type: toSoilType(soilKind),
      slope_degrees: toNumber(raw.slope_degrees),
      water_distance_m: toNumber(raw.water_distance_m),
      drainage: toBool(raw.drainage),
      lfa_type: toText(raw.lfa_type),
      lfa_area_text: toText(raw.lfa_area_text),
      protected_area_type: toText(raw.protected_area_type),
      protected_area_ha: toNumber(raw.protected_area_ha),
      buffer_zone_ha: toNumber(raw.buffer_zone_ha),
      ect_ha: toNumber(raw.ect_ha),
      aeko_als: toText(raw.aeko_als),
    })
  }

  return { rows: parsed, errors, missingColumns: [], unknownColumns }
}
