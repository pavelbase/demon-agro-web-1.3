/**
 * SESTAVENÍ XML PRO IMPORT EVIDENCE DO EPH
 *
 * Portál farmáře přijímá evidenci hnojení, POR a pastvy souborem podle rozhraní
 * „Popis rozhraní pro import dat evidence hnojení, POR a pastvy" (eAGRI).
 * Kořenem je SUBJEKT s obdobím, uvnitř jsou parcely a v nich jednotlivé
 * aplikace. Parcela v tomto rozhraní neznamená pozemek, ale jednu pěstovanou
 * plodinu na jednom dílu půdního bloku v čase od–do.
 *
 * Modul jen skládá text – co se do něj smí dostat, rozhoduje příprava dat
 * v lib/database/eph-export.ts. Záznam, kterému chybí povinný údaj, se do
 * exportu nedostane vůbec; dopisovat za uživatele hodnoty do hlášení nelze.
 *
 * Modul je bez závislosti na databázi, aby se dal ověřit samostatně.
 */

/**
 * Kategorie dusíku (KATEGORIEN) jako číslo, které rozhraní vyžaduje.
 *
 * Klíčem je název kategorie tak, jak ho uvádí číselník hnojiv ÚKZÚZ, ze kterého
 * je náš číselník pořízen. Shodu obou zápisů ověřuje proti vyhlášenému znění
 * skript scripts/verify-fertilizer-eph-mapping.ts – kategorie, která tu není,
 * se nepřevádí a hnojivo se z exportu vyřadí.
 */
export const EPH_NITROGEN_CATEGORY_CODES: Record<string, number> = {
  'Nedusíkaté hnojivo': 1,
  'Minerální hnojivo': 2,
  'Hnojivo s rychle uvol. dusíkem': 3,
  'Hnojivo s pomalu uvolnitelným dusíkem': 4,
  'Rostlinný zbytek': 6,
  'Pomocné látky': 8,
}

/** Množstevní jednotky povolené u hnojiva. */
export const EPH_FERTILIZER_UNITS = ['l/ha', 't/ha', 'kg/ha'] as const

/** Množstevní jednotky povolené u přípravku. */
export const EPH_PRODUCT_UNITS = ['l/ha', 't/ha', 'kg/ha', 'g/ha', 'ml/ha', 'ks/ha', 'kus/ha'] as const

/** L = letecky, S = službou, V = vlastní zařízení. */
export type EphApplicationMethod = 'L' | 'S' | 'V'

export interface EphFertilizer {
  /** ID z číselníku hnojiv; bez něj EPH hnojivo zakládá mezi vlastní */
  id: number | null
  name: string
  /** Množství celkem na celou ošetřenou výměru */
  totalAmount: number | null
  dosePerHa: number
  unit: string
  nKgHa: number
  p2o5KgHa: number
  k2oKgHa: number
  mgoKgHa: number
  caoKgHa: number
  sKgHa: number
  nitrogenCategory: number
  isOrganic: boolean
  note: string | null
}

export interface EphProduct {
  /** ID z registru přípravků; bez něj EPH přípravek zakládá mezi vlastní */
  id: number | null
  name: string
  totalAmount: number | null
  dosePerHa: number
  unit: string
  batch: string | null
  /** Účel použití – škodlivý organismus, plevel, choroba */
  targetOrganism: string
  note: string | null
}

export interface EphApplication {
  /** Datum aplikace; čas se posílá nulový, evidence ho nevede */
  date: string
  treatedArea: number
  method: EphApplicationMethod
  fertilizers: EphFertilizer[]
  products: EphProduct[]
}

export interface EphParcel {
  /** Čtverec dílu půdního bloku */
  squareCode: string | null
  /** Kód dílu půdního bloku */
  blockCode: string
  name: string | null
  area: number
  /** ID plodiny z číselníku plodin LPIS */
  cropId: number
  cropName: string
  cropFrom: string | null
  cropTo: string | null
  applications: EphApplication[]
}

export interface EphSubject {
  /** Jednotný identifikátor subjektu ze SZR */
  szrId: string
  /** Období, za které se evidence předává */
  from: string
  to: string
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Číslo v zápisu s desetinnou tečkou a bez exponentu.
 *
 * Zaokrouhlení drží tolik míst, kolik má smysl u dávky a přívodu živin;
 * koncové nuly se ořezávají, ať je soubor čitelný.
 */
function formatNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '0'
  const rounded = Number(value.toFixed(decimals))
  return String(rounded)
}

function element(name: string, value: string | number | null, indent: string): string {
  if (value === null || value === '') return ''
  const text = typeof value === 'number' ? String(value) : escapeXml(value)
  return `${indent}<${name}>${text}</${name}>\n`
}

function buildFertilizer(fertilizer: EphFertilizer, indent: string): string {
  const inner = indent + '  '

  // TYP se záměrně neposílá. Rozhraní připouští jen HO/HS/HD/HM, číselník
  // hnojiv ale rozlišuje i hnojiva ES a vzájemně uznaná, která se do výčtu
  // nevejdou. ID hnojivo určuje jednoznačně, kontrolní údaj navíc by mohl
  // říkat něco jiného než číselník.
  return (
    `${indent}<HNOJIVO>\n` +
    element('ID', fertilizer.id, inner) +
    element('NAZEV', fertilizer.name, inner) +
    element(
      'MNOZSTVI',
      fertilizer.totalAmount !== null ? formatNumber(fertilizer.totalAmount, 3) : null,
      inner
    ) +
    element('DAVKA', formatNumber(fertilizer.dosePerHa, 3), inner) +
    element('MNOZSTEVNIJEDNOTKA', fertilizer.unit, inner) +
    element('DAVKAN', formatNumber(fertilizer.nKgHa, 2), inner) +
    element('DAVKAP2O5', formatNumber(fertilizer.p2o5KgHa, 2), inner) +
    element('DAVKAK2O', formatNumber(fertilizer.k2oKgHa, 2), inner) +
    element('DAVKAMGO', formatNumber(fertilizer.mgoKgHa, 2), inner) +
    element('DAVKACaO', formatNumber(fertilizer.caoKgHa, 2), inner) +
    element('DAVKAS', formatNumber(fertilizer.sKgHa, 2), inner) +
    element('KATEGORIEN', fertilizer.nitrogenCategory, inner) +
    element('ORGANICKE', fertilizer.isOrganic ? 'A' : 'N', inner) +
    element('POZNAMKA', fertilizer.note, inner) +
    `${indent}</HNOJIVO>\n`
  )
}

function buildProduct(product: EphProduct, indent: string): string {
  const inner = indent + '  '

  return (
    `${indent}<PRIPRAVEK>\n` +
    element('ID', product.id, inner) +
    element('NAZEV', product.name, inner) +
    element(
      'MNOZSTVI',
      product.totalAmount !== null ? formatNumber(product.totalAmount, 3) : null,
      inner
    ) +
    element('DAVKA', formatNumber(product.dosePerHa, 3), inner) +
    element('MNOZSTEVNIJEDNOTKA', product.unit, inner) +
    element('SARZE', product.batch, inner) +
    element('CILOVYORGANISMUS', product.targetOrganism, inner) +
    element('POZNAMKA', product.note, inner) +
    `${indent}</PRIPRAVEK>\n`
  )
}

function buildApplication(application: EphApplication, indent: string): string {
  const inner = indent + '  '

  return (
    `${indent}<APLIKACE>\n` +
    // Rozhraní čeká DATETIME; evidence vede jen datum, čas se posílá nulový
    // a portál ho uživateli nezobrazuje
    element('DATUMCASAPLIKACE', `${application.date}T00:00:00`, inner) +
    element('VYMERAAPLIKACE', formatNumber(application.treatedArea, 2), inner) +
    element('ZPUSOBAPLIKACE', application.method, inner) +
    application.fertilizers.map((item) => buildFertilizer(item, inner)).join('') +
    application.products.map((item) => buildProduct(item, inner)).join('') +
    `${indent}</APLIKACE>\n`
  )
}

function buildParcel(parcel: EphParcel, indent: string): string {
  const inner = indent + '  '

  return (
    `${indent}<PARCELA>\n` +
    element('CTVEREC', parcel.squareCode, inner) +
    element('BLOK', parcel.blockCode, inner) +
    element('NAZEVPARCELY', parcel.name, inner) +
    element('VYMERAPARCELY', formatNumber(parcel.area, 2), inner) +
    element('IDPLODINY', parcel.cropId, inner) +
    element('PLODINA', parcel.cropName, inner) +
    element('PLODINAOD', parcel.cropFrom, inner) +
    element('PLODINADO', parcel.cropTo, inner) +
    parcel.applications.map((application) => buildApplication(application, inner)).join('') +
    `${indent}</PARCELA>\n`
  )
}

/** Celý soubor evidence k nahrání do EPH. */
export function buildEphXml(subject: EphSubject, parcels: EphParcel[]): string {
  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    '<SUBJEKT>\n' +
    element('SZR', subject.szrId, '  ') +
    element('ODDATA', subject.from, '  ') +
    element('DODATA', subject.to, '  ') +
    parcels.map((parcel) => buildParcel(parcel, '  ')).join('') +
    '</SUBJEKT>\n'
  )
}
