/**
 * Kontroly evidence použití hnojiv a přípravků na ochranu rostlin
 *
 * Modul je čistý (bez Supabase a bez prostředí), takže stejné kontroly běží
 * při ukládání aplikace na serveru, při dávkové kontrole existující evidence
 * i v náhledu ve formuláři.
 *
 * Zdroje pravdy:
 *   • registr POR (ÚKZÚZ) – platnost registrace, registrované plodiny,
 *     rozmezí dávek, ochranná lhůta, rizikové věty
 *   • díl půdního bloku z LPIS – zranitelná oblast, aplikační pásmo, erozní
 *     ohroženost, vzdálenost od vody
 *   • osev parcely – termín setí a sklizně
 *   • akční program nitrátové směrnice – termíny a limity přívodu dusíku
 *     (výklad je v lib/utils/nitrate-directive.ts)
 *
 * Kontroly nikdy nebrání uložení: evidence musí odpovídat skutečnosti. Vracejí
 * se jako zjištění se závažností, aby se problém dal dohledat a vysvětlit.
 */

import {
  addNitrogen,
  assessCropLimit,
  assessPostHarvestLimits,
  evaluateBanPeriod,
  findConditionalBan,
  formatBanWindow,
  formatNitrogen,
  NITROGEN_GROUP_LABELS,
  parseApplicationZone,
  resolvePostHarvestMethod,
  sumNitrogen,
  type BanPeriod,
  type CropNitrogenLimit,
  type NitrogenGroup,
  type NitrogenSupply,
  type PostHarvestLimit,
  type PostHarvestMethod,
  type ResolvedCropLimit,
  type YieldLevel,
} from '@/lib/utils/nitrate-directive'

export type CheckSeverity = 'info' | 'warning' | 'error'
export type CheckStatus = 'unchecked' | 'ok' | CheckSeverity

export interface CheckFinding {
  code: string
  severity: CheckSeverity
  title: string
  detail?: string
  /** Index položky aplikace, ke které se zjištění vztahuje */
  itemIndex?: number
}

/** Rozmezí dávek a ochranná lhůta pro jednu kombinaci plodina + cílový organismus */
export interface RegistryUsage {
  crop: string
  pest: string | null
  doseMin: number | null
  doseMax: number | null
  unit: string | null
  protectionPeriodDays: number | null
  note: string | null
}

export interface RegistryPorProduct {
  itemId: number
  name: string
  isAuthorized: boolean
  validUntil: string | null
  useUntil: string | null
  usages: RegistryUsage[]
  /** Příznaky odvozené z rizikových vět (por_product_attributes) */
  waterBufferRestriction: boolean
  beeRisk: boolean
  waterProtectionZoneExcluded: boolean
  waterProtectionZoneNote: string | null
}

export interface CropDefinition {
  id: number
  name: string
  season: 'ozima' | 'jarni' | null
  category: string | null
  registryAliases: string[]
  /** Klíč limitu přívodu N v příloze 3 NV 262/2012 */
  nitrateLimitKey: string | null
}

export interface CheckLandBlock {
  dpbCode: string
  area: number
  nitrateVulnerableZone: boolean | null
  applicationZone: string | null
  erosionClass: string | null
  waterDistanceM: number | null
  slopeDegrees: number | null
  /** Klimatický region z BPEJ – rozhoduje o období zákazu hnojení */
  climaticRegion: number | null
  /** Výnosová hladina z BPEJ – rozhoduje o limitu přívodu N k plodině */
  yieldLevel: YieldLevel | null
}

export interface CheckItemInput {
  kind: 'hnojivo' | 'por' | 'pomocna'
  productName: string
  porItemId: number | null
  dose: number
  unit: string
  targetPest: string | null
  nKgHa: number | null
  /** Skupina hnojiva podle uvolnitelnosti dusíku z číselníku hnojiv */
  nitrogenGroup?: NitrogenGroup | null
  isLivestockManure?: boolean
}

/** Podklady akčního programu pro jednu kontrolovanou aplikaci */
export interface NitrateContext {
  banPeriods: BanPeriod[]
  postHarvestLimits: PostHarvestLimit[]
  postHarvestMethods: Map<number, PostHarvestMethod>
  /** Limity přívodu N, které pro plodinu osevu připadají v úvahu (varianty přílohy 3) */
  cropLimits: CropNitrogenLimit[]
  /** Přívod N k témuž osevu z ostatních aplikací (kg/ha) */
  otherNitrogen: NitrogenSupply
  /** Přívod N z ostatních aplikací na podzim před sezónou (kg/ha) */
  otherAutumnNitrogen: NitrogenSupply
  /** Kategorie plodiny sklizené v předchozí sezóně – rozlišuje způsob hnojení po sklizni */
  previousCropCategory: string | null
}

export interface OtherApplication {
  date: string
  items: { porItemId: number | null; productName: string }[]
}

export interface CheckInput {
  applicationDate: string
  appliedArea: number
  /**
   * Původ záznamu. U importované evidence se chybějící údaje, které zdrojový
   * export neobsahuje (typicky cílový organismus), hlásí jen jako informace.
   */
  source?: 'manual' | 'import'
  parcel: { name: string; area: number }
  landBlock: CheckLandBlock | null
  parcelCrop: {
    cropName: string
    crop: CropDefinition | null
    /** Hospodářský rok osevu (rok sklizně) */
    season: number | null
    sowingDate: string | null
    harvestDate: string | null
  } | null
  items: CheckItemInput[]
  /** Ostatní aplikace téhož osevu – pro počet opakování a intervaly */
  otherApplications?: OtherApplication[]
  /** Registr POR podle item_id */
  porRegistry: Record<number, RegistryPorProduct>
  /** Akční program nitrátové směrnice; bez něj se termíny a limity N neposuzují */
  nitrate?: NitrateContext
}

// ============================================================================
// POMOCNÉ FUNKCE
// ============================================================================

const SEVERITY_ORDER: Record<CheckSeverity, number> = { info: 1, warning: 2, error: 3 }

/** Nejvyšší závažnost zjištění; bez zjištění je stav v pořádku. */
export function resolveCheckStatus(findings: CheckFinding[]): CheckStatus {
  if (findings.length === 0) return 'ok'
  return findings.reduce<CheckSeverity>(
    (worst, finding) =>
      SEVERITY_ORDER[finding.severity] > SEVERITY_ORDER[worst] ? finding.severity : worst,
    'info'
  )
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function daysBetween(from: string, to: string): number {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  return Math.round((end - start) / 86_400_000)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('cs-CZ')
}

function addDays(value: string, days: number): string {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Přepočet jednotek na společný základ, aby se dávky daly porovnat s registrem. */
const UNIT_BASE: Record<string, { base: string; factor: number }> = {
  'g/ha': { base: 'kg/ha', factor: 0.001 },
  'kg/ha': { base: 'kg/ha', factor: 1 },
  't/ha': { base: 'kg/ha', factor: 1000 },
  'ml/ha': { base: 'l/ha', factor: 0.001 },
  'l/ha': { base: 'l/ha', factor: 1 },
  'hl/ha': { base: 'l/ha', factor: 100 },
}

function toBaseDose(dose: number, unit: string): { base: string; value: number } | null {
  const conversion = UNIT_BASE[normalize(unit).replace(/\s/g, '')]
  if (!conversion) return null
  return { base: conversion.base, value: dose * conversion.factor }
}

/**
 * Pozná, zda text plodiny z registru pokrývá danou plodinu evidence.
 *
 * Registr uvádí plodiny jako seznam v jednom textu ("pšenice ozimá, ječmen
 * ozimý, žito ozimé") a mísí obecné i konkrétní názvy ("pšenice" vs. "pšenice
 * ozimá"). Porovnávají se proto jednotlivé tokeny a shoda se zamítne, pokud si
 * token a plodina odporují v ozimé/jarní formě.
 */
export function registryCropMatches(registryCrop: string, crop: CropDefinition): boolean {
  if (crop.registryAliases.length === 0) return false

  const tokens = registryCrop
    .split(',')
    .map((token) => normalize(token))
    .filter(Boolean)

  return tokens.some((token) => {
    if (crop.season === 'ozima' && /\bjarni\b/.test(token)) return false
    if (crop.season === 'jarni' && /\bozim/.test(token)) return false

    return crop.registryAliases.some((alias) => {
      const normalizedAlias = normalize(alias)
      if (token === normalizedAlias) return true
      // "cukrovka - odrůdy CONVISO SMART", "kukuřice mimo kukuřice cukrová"
      return token.startsWith(normalizedAlias + ' ') || token.startsWith(normalizedAlias + '-')
    })
  })
}

export interface DoseEvaluation {
  status: 'ok' | 'over' | 'under' | 'unknown'
  min: number | null
  max: number | null
  base: string | null
}

/**
 * Porovná dávku s rozmezím přes všechna registrovaná použití.
 *
 * Používá se stejně při ukládání (kontroly) i ve formuláři, aby uživatel viděl
 * překročení dávky hned při zápisu.
 */
export function evaluateDoseAgainstUsages(
  dose: number,
  unit: string,
  usages: Pick<RegistryUsage, 'doseMin' | 'doseMax' | 'unit'>[]
): DoseEvaluation {
  const applied = toBaseDose(dose, unit)
  if (!applied || usages.length === 0) return { status: 'unknown', min: null, max: null, base: null }

  let min: number | null = null
  let max: number | null = null

  for (const usage of usages) {
    if (!usage.unit) continue

    const usageMin = usage.doseMin !== null ? toBaseDose(usage.doseMin, usage.unit) : null
    const usageMax = usage.doseMax !== null ? toBaseDose(usage.doseMax, usage.unit) : null

    if (usageMin && usageMin.base === applied.base && usageMin.value > 0) {
      min = min === null ? usageMin.value : Math.min(min, usageMin.value)
    }
    if (usageMax && usageMax.base === applied.base && usageMax.value > 0) {
      max = max === null ? usageMax.value : Math.max(max, usageMax.value)
    }
  }

  if (min === null && max === null) return { status: 'unknown', min, max, base: applied.base }

  // Porovnává se přesně podle registru; zaokrouhlení na 6 míst jen odstraňuje
  // šum plovoucí čárky z převodu jednotek, žádnou povolenou odchylku nezavádí
  const exact = (value: number) => Number(value.toFixed(6))

  if (max !== null && exact(applied.value) > exact(max)) {
    return { status: 'over', min, max, base: applied.base }
  }
  if (min !== null && exact(applied.value) < exact(min)) {
    return { status: 'under', min, max, base: applied.base }
  }

  return { status: 'ok', min, max, base: applied.base }
}

/** Dávka v čitelném tvaru (přepočtená na základní jednotku). */
export function formatDose(value: number, base: string): string {
  return formatBaseDose(value, base)
}

/** Registrovaná použití přípravku pro danou plodinu. */
export function findUsagesForCrop(
  product: RegistryPorProduct,
  crop: CropDefinition
): RegistryUsage[] {
  return product.usages.filter((usage) => registryCropMatches(usage.crop, crop))
}

// ============================================================================
// KONTROLY
// ============================================================================

export function runApplicationChecks(input: CheckInput): CheckFinding[] {
  const findings: CheckFinding[] = []

  checkArea(input, findings)
  checkCropRecord(input, findings)

  input.items.forEach((item, index) => {
    if (item.kind === 'hnojivo') {
      checkFertilizerItem(input, item, index, findings)
      return
    }

    checkPorItem(input, item, index, findings)
  })

  checkNitrateDirective(input, findings)

  return findings
}

// --- Výměra a zařazení parcely -------------------------------------------------

function checkArea(input: CheckInput, findings: CheckFinding[]): void {
  // Výměry z LPIS mají rozlišení 0,01 ha – porovnává se přesně na setiny,
  // žádná povolená odchylka se nepřipouští
  const round = (value: number) => Number(Number(value).toFixed(2))

  if (round(input.appliedArea) > round(input.parcel.area)) {
    findings.push({
      code: 'AREA_OVER_PARCEL',
      severity: 'error',
      title: 'Ošetřená výměra převyšuje výměru parcely',
      detail: `Aplikováno na ${input.appliedArea} ha, parcela ${input.parcel.name} má ${input.parcel.area} ha.`,
    })
  }

  if (input.landBlock && round(input.appliedArea) > round(Number(input.landBlock.area))) {
    findings.push({
      code: 'AREA_OVER_BLOCK',
      severity: 'warning',
      title: 'Ošetřená výměra převyšuje výměru dílu půdního bloku',
      detail: `Aplikováno na ${input.appliedArea} ha, DPB ${input.landBlock.dpbCode} má ${input.landBlock.area} ha.`,
    })
  }

  if (!input.landBlock) {
    findings.push({
      code: 'NO_LAND_BLOCK',
      severity: 'info',
      title: 'Parcela není napojená na díl půdního bloku',
      detail:
        'Bez vazby na DPB nelze kontrolovat zranitelnou oblast, erozní ohroženost ani vzdálenost od vody. Doplňte blok na parcele nebo naimportujte DPB z LPIS.',
    })
  }
}

function checkCropRecord(input: CheckInput, findings: CheckFinding[]): void {
  if (!input.parcelCrop) {
    findings.push({
      code: 'NO_CROP',
      severity: 'warning',
      title: 'K aplikaci není přiřazený osev',
      detail:
        'Bez plodiny nelze ověřit registrované použití přípravku ani ochrannou lhůtu do sklizně.',
    })
    return
  }

  const { sowingDate, harvestDate } = input.parcelCrop

  if (sowingDate && input.applicationDate < sowingDate) {
    findings.push({
      code: 'BEFORE_SOWING',
      severity: 'warning',
      title: 'Aplikace je před termínem setí',
      detail: `Datum aplikace ${formatDate(input.applicationDate)}, setí ${formatDate(sowingDate)}. U předseťových a preemergentních aplikací je to v pořádku, jinak zkontrolujte datum.`,
    })
  }

  if (harvestDate && input.applicationDate > harvestDate) {
    findings.push({
      code: 'AFTER_HARVEST',
      severity: 'warning',
      title: 'Aplikace je po termínu sklizně',
      detail: `Datum aplikace ${formatDate(input.applicationDate)}, sklizeň ${formatDate(harvestDate)}. Aplikace po sklizni patří k následující plodině nebo na strniště.`,
    })
  }

  if (!input.parcelCrop.crop && input.parcelCrop.cropName) {
    findings.push({
      code: 'CROP_NOT_IN_CATALOG',
      severity: 'info',
      title: `Plodina „${input.parcelCrop.cropName}" není v číselníku`,
      detail:
        'Bez zařazení do číselníku nelze porovnat plodinu s registrovaným použitím přípravku.',
    })
  }
}

// --- Přípravky na ochranu rostlin ---------------------------------------------

function checkPorItem(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  findings: CheckFinding[]
): void {
  if (item.kind === 'por' && !item.targetPest) {
    const fromImport = input.source === 'import'
    findings.push({
      code: 'POR_NO_TARGET',
      severity: fromImport ? 'info' : 'warning',
      title: `${item.productName}: chybí cílový organismus`,
      detail: fromImport
        ? 'Zdrojový export cílový organismus neobsahuje – doplňte ho, evidence použití přípravku ho musí uvádět.'
        : 'Evidence použití přípravku musí uvádět škodlivý organismus nebo jiný účel aplikace.',
      itemIndex: index,
    })
  }

  if (!item.porItemId) {
    findings.push({
      code: 'POR_UNLINKED',
      severity: 'info',
      title: `${item.productName}: není napojen na registr`,
      detail:
        'Bez vazby na registr ÚKZÚZ nelze zkontrolovat platnost registrace, registrovanou plodinu, dávku ani ochrannou lhůtu.',
      itemIndex: index,
    })
    return
  }

  const product = input.porRegistry[item.porItemId]
  if (!product) return

  checkPorAuthorization(input, item, index, product, findings)
  checkPorRestrictions(input, item, index, product, findings)

  // Adjuvanty a pomocné prostředky mají v registru použití vázané na
  // partnerský přípravek ("podle použitého herbicidu"), takže kontrola plodiny,
  // dávky ani ochranné lhůty na ně nesedí
  if (item.kind === 'pomocna') return

  const usages = checkPorCrop(input, item, index, product, findings)
  checkPorDose(item, index, product, usages, findings)
  checkProtectionPeriod(input, item, index, product, usages, findings)
  checkRepeatedUse(input, item, index, findings)
}

function checkPorAuthorization(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  product: RegistryPorProduct,
  findings: CheckFinding[]
): void {
  const lastAllowed = product.useUntil ?? product.validUntil

  if (lastAllowed && input.applicationDate > lastAllowed) {
    findings.push({
      code: 'POR_USE_EXPIRED',
      severity: 'error',
      title: `${item.productName}: aplikace po konci povoleného použití`,
      detail: `Přípravek bylo možné použít do ${formatDate(lastAllowed)}, aplikace je z ${formatDate(input.applicationDate)}.`,
      itemIndex: index,
    })
    return
  }

  // Registrace mohla skončit dřív než povolené použití zásob. Rozhoduje datum
  // aplikace, ne dnešní stav registrace.
  if (product.validUntil && input.applicationDate > product.validUntil) {
    findings.push({
      code: 'POR_WIND_DOWN_PERIOD',
      severity: 'info',
      title: `${item.productName}: aplikace v období doběhu zásob`,
      detail: `Registrace skončila ${formatDate(product.validUntil)}, použití zásob je povolené do ${formatDate(lastAllowed!)}. Aplikace je z ${formatDate(input.applicationDate)}.`,
      itemIndex: index,
    })
    return
  }

  if (!product.isAuthorized && !lastAllowed) {
    findings.push({
      code: 'POR_NOT_IN_REGISTER',
      severity: 'warning',
      title: `${item.productName}: přípravek nemá v registru platnou registraci`,
      detail:
        'Registr neuvádí konec registrace ani povolené použití zásob – ověřte, zda šlo o povolené použití k datu aplikace.',
      itemIndex: index,
    })
  }
}

function checkPorCrop(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  product: RegistryPorProduct,
  findings: CheckFinding[]
): RegistryUsage[] {
  const crop = input.parcelCrop?.crop
  if (!crop || product.usages.length === 0) return []

  // Záznam bez plodiny (desikace strniště, příprava před setím) nemá s čím
  // registrované použití porovnat
  if (crop.registryAliases.length === 0) {
    findings.push({
      code: 'CROP_NOT_COMPARABLE',
      severity: 'info',
      title: `${item.productName}: plodinu nelze porovnat s registrem`,
      detail: `Osev je vedený jako „${crop.name}", proto nelze ověřit registrované použití. Doplňte plodinu, ke které aplikace patří.`,
      itemIndex: index,
    })
    return []
  }

  const usages = findUsagesForCrop(product, crop)

  if (usages.length === 0) {
    findings.push({
      code: 'POR_CROP_NOT_REGISTERED',
      severity: 'error',
      title: `${item.productName}: plodina není v registrovaném použití`,
      detail: `Registr neuvádí použití pro plodinu ${crop.name}. Registrované plodiny: ${summarizeCrops(product)}.`,
      itemIndex: index,
    })
  }

  return usages
}

function summarizeCrops(product: RegistryPorProduct): string {
  const unique = Array.from(new Set(product.usages.map((usage) => usage.crop)))
  const shown = unique.slice(0, 6).join('; ')
  return unique.length > 6 ? `${shown} a další` : shown
}

function checkPorDose(
  item: CheckItemInput,
  index: number,
  product: RegistryPorProduct,
  usages: RegistryUsage[],
  findings: CheckFinding[]
): void {
  if (usages.length === 0) return

  const evaluation = evaluateDoseAgainstUsages(item.dose, item.unit, usages)

  if (evaluation.status === 'over' && evaluation.max !== null) {
    findings.push({
      code: 'POR_DOSE_OVER_MAX',
      severity: 'error',
      title: `${item.productName}: dávka nad registrovaným maximem`,
      detail: `Aplikováno ${item.dose} ${item.unit}, registr povoluje nejvýše ${formatBaseDose(evaluation.max, evaluation.base!)}.`,
      itemIndex: index,
    })
    return
  }

  if (evaluation.status === 'under' && evaluation.min !== null) {
    findings.push({
      code: 'POR_DOSE_UNDER_MIN',
      // Snížená dávka není porušením registrace (na rozdíl od překročení),
      // v tank-mixu je běžná – hlásí se jen jako upozornění na účinnost
      severity: 'info',
      title: `${item.productName}: dávka pod registrovaným minimem`,
      detail: `Aplikováno ${item.dose} ${item.unit}, registrovaná dávka začíná na ${formatBaseDose(evaluation.min, evaluation.base!)}. Nižší dávka může být neúčinná a je rizikem vzniku rezistence.`,
      itemIndex: index,
    })
  }
}

function formatBaseDose(value: number, base: string): string {
  if (base === 'kg/ha' && value < 0.1) {
    return `${(value * 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} g/ha`
  }
  return `${value.toLocaleString('cs-CZ', { maximumFractionDigits: 3 })} ${base}`
}

function checkProtectionPeriod(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  product: RegistryPorProduct,
  usages: RegistryUsage[],
  findings: CheckFinding[]
): void {
  const days = usages
    .map((usage) => usage.protectionPeriodDays)
    .filter((value): value is number => value !== null && value > 0)

  if (days.length === 0) return

  const required = Math.max(...days)
  const earliestHarvest = addDays(input.applicationDate, required)
  const harvestDate = input.parcelCrop?.harvestDate ?? null

  if (!harvestDate) {
    findings.push({
      code: 'POR_PHI_UNKNOWN_HARVEST',
      severity: 'info',
      title: `${item.productName}: ochranná lhůta ${required} dní`,
      detail: `Sklizeň je možná nejdříve ${formatDate(earliestHarvest)}. Termín sklizně není v osevu zadaný, proto ho nelze ověřit.`,
      itemIndex: index,
    })
    return
  }

  const available = daysBetween(input.applicationDate, harvestDate)

  if (available < required) {
    findings.push({
      code: 'POR_PHI_VIOLATION',
      severity: 'error',
      title: `${item.productName}: nedodržená ochranná lhůta`,
      detail: `Ochranná lhůta je ${required} dní, do sklizně ${formatDate(harvestDate)} zbývá ${available} dní. Sklizeň je možná nejdříve ${formatDate(earliestHarvest)}.`,
      itemIndex: index,
    })
  }
}

function checkPorRestrictions(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  product: RegistryPorProduct,
  findings: CheckFinding[]
): void {
  const waterDistance = input.landBlock?.waterDistanceM ?? null

  if (product.waterBufferRestriction && waterDistance !== null && waterDistance <= 50) {
    findings.push({
      code: 'POR_WATER_BUFFER',
      severity: 'warning',
      title: `${item.productName}: omezení kvůli ochraně vodních organismů`,
      detail: `Přípravek má stanovenou ochrannou vzdálenost od povrchové vody (SPe3) a DPB ${input.landBlock?.dpbCode} je ${waterDistance} m od vody. Ověřte v etiketě požadovanou vzdálenost a vynechání pásu.`,
      itemIndex: index,
    })
  }

  if (product.beeRisk) {
    findings.push({
      code: 'POR_BEE_RISK',
      severity: 'info',
      title: `${item.productName}: přípravek je nebezpečný pro včely`,
      detail:
        'Nesmí se aplikovat na kvetoucí porost ani v době letu opylovačů; ohlašovací povinnost vůči chovatelům podle etikety.',
      itemIndex: index,
    })
  }

  if (product.waterProtectionZoneExcluded) {
    findings.push({
      code: 'POR_WATER_PROTECTION_ZONE',
      severity: 'info',
      title: `${item.productName}: vyloučen z ochranného pásma vod`,
      detail:
        product.waterProtectionZoneNote ??
        'Přípravek je vyloučen z použití v ochranném pásmu II. stupně zdrojů vody – ověřte, zda pozemek v pásmu neleží.',
      itemIndex: index,
    })
  }
}

function checkRepeatedUse(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  findings: CheckFinding[]
): void {
  const others = input.otherApplications ?? []
  if (others.length === 0) return

  const sameProduct = others.filter((application) =>
    application.items.some((other) =>
      item.porItemId ? other.porItemId === item.porItemId : other.productName === item.productName
    )
  )

  if (sameProduct.length === 0) return

  const sameDay = sameProduct.filter((application) => application.date === input.applicationDate)
  if (sameDay.length > 0) {
    findings.push({
      code: 'POR_DUPLICATE_SAME_DAY',
      severity: 'warning',
      title: `${item.productName}: stejný přípravek už je k tomuto dni evidovaný`,
      detail: 'Zkontrolujte, zda nejde o dvojí zápis téže aplikace.',
      itemIndex: index,
    })
    return
  }

  const dates = sameProduct.map((application) => application.date).sort()
  const closest = dates.reduce((best, date) => {
    const diff = Math.abs(daysBetween(date, input.applicationDate))
    return diff < Math.abs(daysBetween(best, input.applicationDate)) ? date : best
  }, dates[0])

  findings.push({
    code: 'POR_REPEATED_USE',
    severity: 'info',
    title: `${item.productName}: ${sameProduct.length + 1}. aplikace na tento osev`,
    detail: `Předchozí aplikace: ${dates.map(formatDate).join(', ')} (naposledy ${Math.abs(daysBetween(closest, input.applicationDate))} dní před touto). Ověřte maximální počet aplikací a interval podle etikety.`,
    itemIndex: index,
  })
}

// --- Hnojiva -------------------------------------------------------------------

function checkFertilizerItem(
  input: CheckInput,
  item: CheckItemInput,
  index: number,
  findings: CheckFinding[]
): void {
  const block = input.landBlock

  if (item.nKgHa === null) {
    // Dusíkaté hnojivo bez doloženého přívodu N ve zranitelné oblasti znamená,
    // že limity akčního programu nelze vůbec ověřit – hlášení by bylo neúplné
    const nitrogenRelevant =
      item.nitrogenGroup !== 'bez_dusiku' && Boolean(block?.nitrateVulnerableZone)

    findings.push({
      code: 'FERT_NO_NUTRIENTS',
      severity: nitrogenRelevant ? 'warning' : 'info',
      title: `${item.productName}: není doložen přívod živin`,
      detail:
        'Hnojivo buď není v číselníku hnojiv, nebo u objemové dávky chybí věrohodná měrná hmotnost – zástupné hodnoty se nepoužívají, protože výstup jde do oficiálního hlášení. Doplňte přívod N u položky podle etikety nebo dodacího listu; bez něj nelze ověřit limity akčního programu.',
      itemIndex: index,
    })
  }

  if (!block) return

  const hasNitrogen = item.nKgHa === null || item.nKgHa > 0

  if (hasNitrogen && block.nitrateVulnerableZone && block.waterDistanceM !== null) {
    if (block.waterDistanceM <= 25) {
      findings.push({
        code: 'FERT_WATER_BUFFER_NVZ',
        severity: 'warning',
        title: `${item.productName}: hnojení blízko vodního toku ve zranitelné oblasti`,
        detail: `DPB ${block.dpbCode} je ${block.waterDistanceM} m od vody. Ve zranitelné oblasti dusíkem se nesmí hnojit v ochranném pásu u vodního toku – vynechejte pás podle druhu hnojiva a sklonu.`,
        itemIndex: index,
      })
    }
  }

  if (
    hasNitrogen &&
    block.erosionClass &&
    block.erosionClass !== 'NEO' &&
    block.slopeDegrees !== null &&
    block.slopeDegrees > 7
  ) {
    findings.push({
      code: 'FERT_EROSION_SLOPE',
      severity: 'info',
      title: `${item.productName}: erozně ohrožený pozemek se sklonem ${block.slopeDegrees}°`,
      detail: `DPB ${block.dpbCode} je v kategorii ${block.erosionClass}. Na svazích nad 7° platí omezení pro aplikaci dusíkatých hnojiv a povinnost zapravení.`,
      itemIndex: index,
    })
  }
}

// --- Akční program nitrátové směrnice ------------------------------------------

/**
 * Kontroly pro pozemky ve zranitelné oblasti dusíkem.
 *
 * Akční program (příloha 2 a 3 NV 262/2012) omezuje, kdy a kolik dusíku lze na
 * pozemek dostat. Zařazení pozemku (klimatický region, aplikační pásmo,
 * výnosová hladina) pochází z BPEJ; chybějící údaj se nenahrazuje odhadem –
 * posoudí se všechny varianty, které mohou platit, a když se neshodnou,
 * kontrola ohlásí, co v evidenci chybí k jednoznačnému posouzení.
 */
function checkNitrateDirective(input: CheckInput, findings: CheckFinding[]): void {
  const nitrate = input.nitrate
  const block = input.landBlock

  if (!nitrate || !block?.nitrateVulnerableZone) return

  const fertilizers = input.items
    .map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.kind === 'hnojivo')

  if (fertilizers.length === 0) return

  const { zone, infiltrationRisk } = parseApplicationZone(block.applicationZone)

  checkBanPeriod(input, block, nitrate, zone, fertilizers, findings)
  checkCropNitrogenLimit(input, block, nitrate, findings)
  checkPostHarvestNitrogen(input, nitrate, zone, infiltrationRisk, findings)
}

/** Přívod dusíku ukládané aplikace podle skupin hnojiv. */
function currentNitrogen(input: CheckInput): NitrogenSupply {
  return sumNitrogen(
    input.items
      .filter((item) => item.kind === 'hnojivo')
      .map((item) => ({
        nitrogenGroup: item.nitrogenGroup ?? null,
        isLivestockManure: item.isLivestockManure ?? false,
        nKgHa: item.nKgHa,
      }))
  )
}

/**
 * Byl na pozemku v době aplikace porost plodin?
 *
 * Na pozemcích do 5° s porostem končí zákaz hnojení dřív. Bez termínu setí to
 * z evidence nevyplývá – kontrola pak posoudí obě varianty.
 */
function standAtApplication(input: CheckInput): boolean | null {
  const crop = input.parcelCrop
  if (!crop?.sowingDate) return null

  if (input.applicationDate < crop.sowingDate) return false
  if (crop.harvestDate && input.applicationDate > crop.harvestDate) return false

  return true
}

function checkBanPeriod(
  input: CheckInput,
  block: CheckLandBlock,
  nitrate: NitrateContext,
  zone: ReturnType<typeof parseApplicationZone>['zone'],
  fertilizers: { item: CheckItemInput; index: number }[],
  findings: CheckFinding[]
): void {
  const hasCropStand = standAtApplication(input)

  for (const { item, index } of fertilizers) {
    if (item.nKgHa === 0) continue

    const group = item.nitrogenGroup ?? null

    if (group === 'bez_dusiku') continue

    if (!group) {
      findings.push({
        code: 'NVZ_GROUP_UNKNOWN',
        severity: 'warning',
        title: `${item.productName}: není známé zařazení hnojiva`,
        detail:
          'Číselník hnojiv u výrobku neuvádí kategorii dusíku, proto nelze ověřit období zákazu hnojení ani limit dávky po sklizni. Ve zranitelné oblasti je zařazení hnojiva pro hlášení nezbytné – dohledejte výrobek v registru hnojiv, nebo ho zapište pod evidovaným názvem.',
        itemIndex: index,
      })
      continue
    }

    const result = evaluateBanPeriod(nitrate.banPeriods, {
      applicationDate: input.applicationDate,
      fertilizerGroup: group,
      climaticRegion: block.climaticRegion,
      applicationZone: zone,
      slopeDegrees: block.slopeDegrees,
      hasCropStand,
    })

    if (result.status !== 'allowed') {
      const windows = Array.from(new Set(result.matched.map(formatBanWindow))).join(' nebo ')
      const certain = result.status === 'in_ban'

      findings.push({
        code: certain ? 'NVZ_BAN_PERIOD' : 'NVZ_BAN_PERIOD_POSSIBLE',
        severity: certain ? 'error' : 'warning',
        title: certain
          ? `${item.productName}: hnojení v období zákazu`
          : `${item.productName}: aplikace může spadat do zákazu hnojení`,
        detail: certain
          ? `Ve zranitelné oblasti platí pro ${NITROGEN_GROUP_LABELS[group]} zákaz hnojení ${windows}; aplikace je z ${formatDate(input.applicationDate)}.`
          : `Pro ${NITROGEN_GROUP_LABELS[group]} může na tento pozemek platit zákaz hnojení ${windows}. Posoudit to přesně brání: ${result.uncertainty.join('; ')}.`,
        itemIndex: index,
      })
    }

    const conditional = findConditionalBan(nitrate.banPeriods, {
      applicationDate: input.applicationDate,
      fertilizerGroup: group,
    })

    if (conditional) {
      findings.push({
        code: 'NVZ_SUMMER_BAN',
        severity: 'info',
        title: `${item.productName}: letní omezení hnojení`,
        detail: `V období ${formatBanWindow(conditional)} lze ${NITROGEN_GROUP_LABELS[group]} použít jen tehdy, když v témže roce následuje hlavní plodina nebo meziplodina.`,
        itemIndex: index,
      })
    }
  }
}

/** Popis jednoho možného limitu do nálezu, např. „200 kg N/ha (Pšenice ozimá potravinářská, hladina 2)" */
function describeLimit(limit: ResolvedCropLimit): string {
  const parts = [
    limit.cropLabel,
    limit.level !== null ? `hladina ${limit.level}` : null,
    limit.referenceYield !== null && limit.yieldUnit
      ? `k výnosu ${limit.referenceYield.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ${limit.yieldUnit}`
      : null,
  ].filter(Boolean)

  return `${formatNitrogen(limit.limitKgNHa)} (${parts.join(', ')})`
}

function checkCropNitrogenLimit(
  input: CheckInput,
  block: CheckLandBlock,
  nitrate: NitrateContext,
  findings: CheckFinding[]
): void {
  const assessment = assessCropLimit(nitrate.cropLimits, block.yieldLevel)
  if (!assessment) return

  const current = currentNitrogen(input)
  if (current.totalKgHa <= 0) return

  const season = addNitrogen(nitrate.otherNitrogen, current)
  const perCalendarYear = assessment.candidates.every((entry) => entry.perCalendarYear)
  const period = perCalendarYear ? 'za kalendářní rok' : 'k plodině'
  const organic = season.totalKgHa - season.mineralKgHa

  // Dusík v minerálních hnojivech se do limitu počítá celý, u statkových
  // a organických jen jeho využitelný podíl – jisté porušení proto prokazuje
  // už samotný minerální dusík
  const organicNote =
    organic > 0
      ? ` Z celku připadá ${formatNitrogen(season.mineralKgHa)} na minerální hnojiva; u statkových a organických se do limitu počítá jen využitelný podíl dusíku.`
      : ''
  const supplyNote = `Evidence eviduje na osevu ${formatNitrogen(season.totalKgHa)}, z toho ${formatNitrogen(current.totalKgHa)} touto aplikací.`

  // Překročení nejvyššího z limitů, které mohou platit, je porušení jistě
  if (season.mineralKgHa > assessment.maxLimitKgNHa) {
    const reference = assessment.certain
      ? describeLimit(assessment.certain)
      : `nejvyšší z limitů, které mohou platit: ${describeLimit(
          assessment.candidates.find((entry) => entry.limitKgNHa === assessment.maxLimitKgNHa)!
        )}`

    findings.push({
      code: 'NVZ_CROP_N_LIMIT',
      severity: 'error',
      title: `Překročen limit přívodu dusíku ${period}`,
      detail:
        `${supplyNote} Minerální dusík ${formatNitrogen(season.mineralKgHa)} překračuje ${reference}.` +
        (assessment.uncertainty.length > 0
          ? ` Limit je překročen při každém možném zařazení (${assessment.uncertainty.join('; ')}).`
          : ''),
    })
    return
  }

  if (season.totalKgHa > assessment.maxLimitKgNHa) {
    const maxLimit = describeLimit(
      assessment.candidates.find((entry) => entry.limitKgNHa === assessment.maxLimitKgNHa)!
    )

    findings.push({
      code: 'NVZ_CROP_N_LIMIT',
      severity: 'warning',
      title: `Přívod dusíku ${period} přesahuje limit`,
      detail:
        `${supplyNote} ${assessment.certain ? `Limit je ${maxLimit}` : `Nejvyšší z limitů, které mohou platit, je ${maxLimit}`}.${organicNote}`,
    })
    return
  }

  if (season.totalKgHa > assessment.minLimitKgNHa) {
    const exceeded = assessment.candidates
      .filter((entry) => season.totalKgHa > entry.limitKgNHa)
      .map(describeLimit)

    findings.push({
      code: 'NVZ_CROP_N_LIMIT_UNVERIFIABLE',
      severity: 'warning',
      title: `Limit přívodu dusíku ${period} nelze ověřit`,
      detail:
        `${supplyNote} Přívod přesahuje část limitů, které mohou platit: ${exceeded.join('; ')}. ` +
        `K jednoznačnému posouzení chybí: ${assessment.uncertainty.join('; ')}.${organicNote}`,
    })
    return
  }

  if (season.totalKgHa >= assessment.minLimitKgNHa * 0.9) {
    const minLimit = describeLimit(
      assessment.candidates.find((entry) => entry.limitKgNHa === assessment.minLimitKgNHa)!
    )

    findings.push({
      code: 'NVZ_CROP_N_LIMIT_NEAR',
      severity: 'info',
      title: `Limit přívodu dusíku ${period} je téměř vyčerpaný`,
      detail:
        `Na osevu je ${formatNitrogen(season.totalKgHa)}; ${assessment.certain ? 'limit je' : 'nejnižší z limitů, které mohou platit, je'} ${minLimit} (${Math.round((season.totalKgHa / assessment.minLimitKgNHa) * 100)} %).` +
        (assessment.uncertainty.length > 0
          ? ` K jednoznačnému určení limitu chybí: ${assessment.uncertainty.join('; ')}.`
          : ''),
    })
  }
}

function checkPostHarvestNitrogen(
  input: CheckInput,
  nitrate: NitrateContext,
  zone: ReturnType<typeof parseApplicationZone>['zone'],
  infiltrationRisk: ReturnType<typeof parseApplicationZone>['infiltrationRisk'],
  findings: CheckFinding[]
): void {
  if (!zone || !input.parcelCrop) return

  const method = resolvePostHarvestMethod({
    applicationDate: input.applicationDate,
    season: input.parcelCrop.season,
    cropSeasonForm: input.parcelCrop.crop?.season ?? null,
    previousCropCategory: nitrate.previousCropCategory,
  })

  if (!method) return

  const current = currentNitrogen(input)
  if (current.totalKgHa <= 0) return

  const label = nitrate.postHarvestMethods.get(method.methodNumber)?.label ?? ''

  // Způsob 4: k plodinám pěstovaným v příštím roce lze hnojit až od 1. října
  if (method.methodNumber === 4 && Number(input.applicationDate.slice(5, 7)) < 10) {
    findings.push({
      code: 'NVZ_AUTUMN_BEFORE_OCTOBER',
      severity: 'error',
      title: 'Podzimní hnojení před 1. říjnem',
      detail: `${label} – hnojit lze až od 1. října, aplikace je z ${formatDate(input.applicationDate)}.`,
    })
  }

  const autumn = addNitrogen(nitrate.otherAutumnNitrogen, current)
  const limits = assessPostHarvestLimits(nitrate.postHarvestLimits, {
    methodNumber: method.methodNumber,
    applicationZone: zone,
    infiltrationRisk,
  })

  for (const limit of limits) {
    const applied = limit.fertilizerGroup === 'mineralni' ? autumn.mineralKgHa : autumn.fastKgHa

    if (applied > limit.certainLimitKgNHa) {
      findings.push({
        code: 'NVZ_POST_HARVEST_LIMIT',
        severity: method.assumed ? 'warning' : 'error',
        title: `Překročena maximální dávka dusíku po sklizni (${NITROGEN_GROUP_LABELS[limit.fertilizerGroup]})`,
        detail:
          `Na podzim je na osevu ${formatNitrogen(applied)}, ${zone} aplikační pásmo povoluje ${formatNitrogen(limit.certainLimitKgNHa)}.` +
          ` Posuzováno jako „${label}" (${method.reason}).` +
          (limit.note ? ` ${limit.note}` : ''),
      })
      continue
    }

    // III. pásmo bez rozlišeného rizika infiltrace: přísnější limit může platit
    if (limit.possibleLimitKgNHa !== null && applied > limit.possibleLimitKgNHa) {
      findings.push({
        code: 'NVZ_POST_HARVEST_LIMIT_UNVERIFIABLE',
        severity: 'warning',
        title: `Dávku dusíku po sklizni nelze ověřit (${NITROGEN_GROUP_LABELS[limit.fertilizerGroup]})`,
        detail:
          `Na podzim je na osevu ${formatNitrogen(applied)}. Ve III. aplikačním pásmu platí pro půdy s vysokým rizikem infiltrace ${formatNitrogen(limit.possibleLimitKgNHa)}, pro ostatní ${formatNitrogen(limit.certainLimitKgNHa)} – LPIS u pozemku riziko nerozlišuje. Doplňte kód BPEJ u dílu půdního bloku, aby šlo pásmo zařadit přesně.` +
          ` Posuzováno jako „${label}" (${method.reason}).`,
      })
    }
  }
}
