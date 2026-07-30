/**
 * AKČNÍ PROGRAM NITRÁTOVÉ SMĚRNICE
 *
 * Pravidla pro hospodaření ve zranitelných oblastech dusíkem podle nařízení
 * vlády č. 262/2012 Sb. Modul drží výklad tabulek, hodnoty samotné jsou
 * v číselnících (nitrate_ban_periods, nitrate_post_harvest_limits,
 * nitrate_crop_limits) – viz lib/supabase/sql/create_nitrate_directive_tables.sql.
 *
 * Co se odsud počítá:
 *   • zařazení hnojiva do skupiny podle uvolnitelnosti dusíku,
 *   • období zákazu hnojení k datu aplikace (příloha 2 tab. 1),
 *   • maximální dávka N po sklizni hlavní plodiny (příloha 2 tab. 6),
 *   • limit přívodu N k plodině podle výnosové hladiny (příloha 3 tab. 4–6),
 *   • limit 170 kg N/ha ze statkových hnojiv na zemědělskou půdu podniku.
 *
 * Modul je čistý (bez databáze), aby stejný výklad platil při ukládání evidence,
 * v přehledu bilance i v nápovědě ve formuláři.
 *
 * Pozemek se do pravidel zařazuje podle BPEJ: klimatický region rozhoduje
 * o termínech, aplikační pásmo o dávkách po sklizni a výnosová hladina o limitu
 * k plodině. Výstup evidence jde do oficiálních hlášení, proto se chybějící
 * údaj nikdy nenahrazuje odhadem: posoudí se všechny varianty, které mohou
 * platit – shodnou-li se, je závěr jistý, jinak kontrola ohlásí, co v evidenci
 * chybí k jednoznačnému posouzení.
 */

// ============================================================================
// TYPY
// ============================================================================

/** Skupina hnojiva podle uvolnitelnosti dusíku (§ 2 NV 262/2012) */
export type NitrogenGroup = 'mineralni' | 'rychle' | 'pomalu' | 'bez_dusiku'

/** Skupiny, pro které předpis stanoví termíny a dávky */
export type NitrogenFertilizerGroup = Exclude<NitrogenGroup, 'bez_dusiku'>

export type ApplicationZone = 'I.' | 'II.' | 'III.'
export type InfiltrationRisk = 'stredni' | 'vysoke'
export type YieldLevel = 1 | 2 | 3

export interface BanPeriod {
  id: number
  climaticRegionFrom: number
  climaticRegionTo: number
  fertilizerGroup: NitrogenFertilizerGroup
  variant: 'zakladni' | 'sklon_do_5_s_porostem' | 'letni_bez_nasledne_plodiny'
  banFromMonth: number
  banFromDay: number
  banToMonth: number
  banToDay: number
  /** Zákaz platí jen za další podmínky (chybějící následná plodina) */
  isConditional: boolean
  note: string | null
}

export interface PostHarvestMethod {
  methodNumber: number
  label: string
  note: string | null
}

export interface PostHarvestLimit {
  id: number
  methodNumber: number
  applicationZone: ApplicationZone
  infiltrationRisk: InfiltrationRisk | null
  fertilizerGroup: 'mineralni' | 'rychle'
  limitKgNHa: number
  note: string | null
}

export interface CropNitrogenLimit {
  cropKey: string
  cropLabel: string
  sourceTable: 'p3_t4' | 'p3_t5' | 'p3_t6'
  yieldUnit: string | null
  levels: {
    level: YieldLevel
    limitKgNHa: number
    /** Výnos, ke kterému se limit v hladině vztahuje */
    referenceYield: number | null
    yieldFrom: number | null
    yieldTo: number | null
  }[]
  flatLimitKgNHa: number | null
  perCalendarYear: boolean
  note: string | null
}

/** Limit 170 kg N/ha ze statkových hnojiv – průměr na zemědělskou půdu podniku za rok */
export const LIVESTOCK_NITROGEN_LIMIT_KG_HA = 170

// ============================================================================
// ZAŘAZENÍ HNOJIVA
// ============================================================================

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Skupina hnojiva podle kategorie dusíku z číselníku hnojiv.
 *
 * Číselník uvádí kategorii textem („Hnojivo s rychle uvol. dusíkem"), předpis
 * stejné dělení používá pro termíny i dávky. Rostlinné zbytky (sláma, zelené
 * hnojení) předpis řadí k hnojivům s pomalu uvolnitelným dusíkem.
 *
 * Vrací null, když kategorii nelze určit – kontrola v takovém případě termíny
 * neposuzuje a vyžádá si doplnění.
 */
export function classifyNitrogenGroup(content: {
  nitrogenCategory?: string | null
  productKind?: string | null
  nPercent?: number | null
}): NitrogenGroup | null {
  // Nulový obsah dusíku o hnojivu rozhoduje víc než jeho zařazení v číselníku
  if (content.nPercent !== null && content.nPercent !== undefined && content.nPercent === 0) {
    return 'bez_dusiku'
  }

  const category = normalize(content.nitrogenCategory ?? '')

  if (category.includes('rychle')) return 'rychle'
  if (category.includes('pomalu')) return 'pomalu'
  if (category.includes('rostlinny zbytek')) return 'pomalu'
  if (category.includes('mineraln')) return 'mineralni'
  if (category.includes('nedusikat') || category.includes('pomocn')) return 'bez_dusiku'

  return null
}

/**
 * Statkové hnojivo nebo hnojivo z exkrementů hospodářských zvířat.
 *
 * Rozhoduje o limitu 170 kg N/ha zemědělské půdy, který se na rozdíl od limitů
 * k plodině vztahuje na celý podnik.
 */
export function isLivestockManure(content: {
  productKind?: string | null
  isExcrement?: boolean | null
}): boolean {
  if (content.isExcrement) return true
  return normalize(content.productKind ?? '').includes('statkove hnojivo')
}

export const NITROGEN_GROUP_LABELS: Record<NitrogenGroup, string> = {
  mineralni: 'minerální dusíkaté hnojivo',
  rychle: 'hnojivo s rychle uvolnitelným dusíkem',
  pomalu: 'hnojivo s pomalu uvolnitelným dusíkem',
  bez_dusiku: 'hnojivo bez dusíku',
}

// ============================================================================
// ZAŘAZENÍ POZEMKU
// ============================================================================

/**
 * Rozpad aplikačního pásma z LPIS na pásmo předpisu a riziko infiltrace.
 *
 * Předpis rozlišuje pásma I.–III. a ve III. pásmu půdy s vysokým rizikem
 * infiltrace (tab. 5 přílohy 2). LPIS obojí spojuje do jedné hodnoty:
 * „III a." jsou půdy se středním rizikem, „III b." s vysokým.
 */
export function parseApplicationZone(value: string | null | undefined): {
  zone: ApplicationZone | null
  infiltrationRisk: InfiltrationRisk | null
} {
  const normalized = normalize(value ?? '').replace(/\s+/g, ' ')

  if (normalized.startsWith('iii')) {
    if (normalized.includes('b')) return { zone: 'III.', infiltrationRisk: 'vysoke' }
    if (normalized.includes('a')) return { zone: 'III.', infiltrationRisk: 'stredni' }
    return { zone: 'III.', infiltrationRisk: null }
  }
  if (normalized.startsWith('ii')) return { zone: 'II.', infiltrationRisk: null }
  if (normalized.startsWith('i')) return { zone: 'I.', infiltrationRisk: null }

  return { zone: null, infiltrationRisk: null }
}

/**
 * Klimatické regiony, které připadají v úvahu podle aplikačního pásma.
 *
 * I. aplikační pásmo tvoří jen BPEJ klimatických regionů 0, 1, 2 a 4 (tab. 2
 * přílohy 2), takže u něj je skupina regionů 0–5 jistá i bez zadaného BPEJ.
 * U ostatních pásem region z pásma odvodit nelze.
 */
export function climaticRegionsForZone(zone: ApplicationZone | null): number[] | null {
  return zone === 'I.' ? [0, 1, 2, 4] : null
}

export const YIELD_LEVEL_FALLBACK: YieldLevel = 2

/** Pravidlo zařazení BPEJ z přílohy 2 (tab. 2–5) a přílohy 3 (tab. 1–3) */
export interface BpejRule {
  id: number
  ruleKind: 'vynosova_hladina' | 'aplikacni_pasmo' | 'riziko_infiltrace'
  result: string
  climaticRegions: number[]
  hpjCodes: number[]
  /** 4. a 5. číslice BPEJ, na které se pravidlo omezuje */
  detailCodes: string[] | null
  slopeCondition: 'do_7' | 'nad_7' | null
  note: string | null
}

export interface BpejCode {
  /** Kód bez oddělovačů, pět číslic */
  code: string
  climaticRegion: number
  /** Hlavní půdní jednotka – 2. a 3. číslice */
  hpj: number
  /** Sklonitost s expozicí a skeletovitost s hloubkou – 4. a 5. číslice */
  detailCode: string
}

/**
 * Rozpad kódu BPEJ na složky.
 *
 * Kód má pět číslic: klimatický region, hlavní půdní jednotka, sklonitost
 * s expozicí a skeletovitost s hloubkou. Zapisuje se různě („5.29.01", „52901"),
 * proto se oddělovače ignorují.
 */
export function parseBpejCode(value: string | null | undefined): BpejCode | null {
  const digits = (value ?? '').replace(/\D/g, '')
  if (digits.length !== 5) return null

  return {
    code: digits,
    climaticRegion: Number(digits[0]),
    hpj: Number(digits.slice(1, 3)),
    detailCode: digits.slice(3, 5),
  }
}

export interface BpejClassification {
  climaticRegion: number
  yieldLevel: YieldLevel
  applicationZone: ApplicationZone
  infiltrationRisk: InfiltrationRisk | null
}

function matchesRule(rule: BpejRule, bpej: BpejCode, slopeDegrees: number | null): boolean {
  if (!rule.climaticRegions.includes(bpej.climaticRegion)) return false
  if (!rule.hpjCodes.includes(bpej.hpj)) return false
  if (rule.detailCodes && !rule.detailCodes.includes(bpej.detailCode)) return false

  // Podmínku sklonitosti nese pozemek, ne BPEJ; bez známého sklonu ji nelze ověřit
  if (rule.slopeCondition && slopeDegrees === null) return false
  if (rule.slopeCondition === 'do_7' && (slopeDegrees ?? 0) > 7) return false
  if (rule.slopeCondition === 'nad_7' && (slopeDegrees ?? 0) <= 7) return false

  return true
}

/**
 * Zařazení pozemku podle BPEJ.
 *
 * Výnosová hladina 2 a II. aplikační pásmo jsou v předpisu zbytkové kategorie
 * („všechny ostatní BPEJ"), proto nejsou v číselníku a použijí se, když žádné
 * pravidlo nesedí. Ze III. pásma je riziko infiltrace samostatná podmínka –
 * mimo III. pásmo se neposuzuje.
 */
export function classifyBpej(
  rules: BpejRule[],
  bpej: BpejCode,
  slopeDegrees: number | null = null
): BpejClassification {
  const matching = rules.filter((rule) => matchesRule(rule, bpej, slopeDegrees))

  const yieldRule = matching.find((rule) => rule.ruleKind === 'vynosova_hladina')
  const yieldLevel = yieldRule ? (Number(yieldRule.result) as YieldLevel) : YIELD_LEVEL_FALLBACK

  // Pásmo III. je přísnější než I., proto při shodě rozhoduje ono
  const zoneResults = matching
    .filter((rule) => rule.ruleKind === 'aplikacni_pasmo')
    .map((rule) => rule.result)
  const applicationZone: ApplicationZone = zoneResults.includes('III.')
    ? 'III.'
    : zoneResults.includes('I.')
      ? 'I.'
      : 'II.'

  const highRisk = matching.some((rule) => rule.ruleKind === 'riziko_infiltrace')

  return {
    climaticRegion: bpej.climaticRegion,
    yieldLevel,
    applicationZone,
    infiltrationRisk:
      applicationZone === 'III.' ? (highRisk ? 'vysoke' : 'stredni') : null,
  }
}

// ============================================================================
// OBDOBÍ ZÁKAZU HNOJENÍ (příloha 2, tabulka 1)
// ============================================================================

export interface BanPeriodContext {
  /** Datum aplikace ve tvaru YYYY-MM-DD */
  applicationDate: string
  fertilizerGroup: NitrogenFertilizerGroup
  climaticRegion: number | null
  applicationZone: ApplicationZone | null
  slopeDegrees: number | null
  /**
   * Byl na pozemku v době aplikace porost plodin? Na pozemcích do 5° s porostem
   * končí zákaz dřív. null = z evidence to nevyplývá.
   */
  hasCropStand: boolean | null
}

export interface BanPeriodResult {
  /** in_ban = zákaz platí, possible = platí jen pro část zvažovaných variant */
  status: 'in_ban' | 'possible' | 'allowed'
  matched: BanPeriod[]
  considered: BanPeriod[]
  /** Proč není výsledek jistý – co v evidenci chybí */
  uncertainty: string[]
}

/** Spadá den a měsíc datumu do období, které může přecházet přes konec roku? */
export function isWithinBanWindow(date: string, period: BanPeriod): boolean {
  const parsed = new Date(date)
  const value = (parsed.getMonth() + 1) * 100 + parsed.getDate()
  const from = period.banFromMonth * 100 + period.banFromDay
  const to = period.banToMonth * 100 + period.banToDay

  return from <= to ? value >= from && value <= to : value >= from || value <= to
}

export function formatBanWindow(period: BanPeriod): string {
  return `${period.banFromDay}. ${period.banFromMonth}. – ${period.banToDay}. ${period.banToMonth}.`
}

/**
 * Posoudí, zda aplikace spadá do období zákazu hnojení.
 *
 * Termíny se liší podle klimatického regionu a podle toho, jestli je pozemek
 * do 5° s porostem plodin. Když některý údaj chybí, posuzují se všechny
 * varianty, které mohou platit: shodnou-li se všechny, je zákaz jistý,
 * jinak jde jen o možné porušení a v nálezu se uvede, co doplnit.
 */
export function evaluateBanPeriod(
  periods: BanPeriod[],
  context: BanPeriodContext
): BanPeriodResult {
  const uncertainty: string[] = []
  const regionsFromZone = climaticRegionsForZone(context.applicationZone)

  let considered = periods.filter(
    (period) => period.fertilizerGroup === context.fertilizerGroup && !period.isConditional
  )

  if (context.climaticRegion !== null) {
    considered = considered.filter(
      (period) =>
        context.climaticRegion! >= period.climaticRegionFrom &&
        context.climaticRegion! <= period.climaticRegionTo
    )
  } else {
    if (regionsFromZone) {
      considered = considered.filter((period) =>
        regionsFromZone.some(
          (region) => region >= period.climaticRegionFrom && region <= period.climaticRegionTo
        )
      )
    }

    // I. pásmo vymezují jen regiony 0, 1, 2 a 4, takže skupina 0–5 je jistá
    if (new Set(considered.map((period) => period.climaticRegionFrom)).size > 1) {
      uncertainty.push('u dílu půdního bloku není zadaný klimatický region')
    }
  }

  const slopeVariantApplies =
    context.slopeDegrees !== null && context.slopeDegrees <= 5 && context.hasCropStand === true
  const slopeVariantExcluded =
    (context.slopeDegrees !== null && context.slopeDegrees > 5) || context.hasCropStand === false

  if (slopeVariantApplies) {
    // Hnojiva s pomalu uvolnitelným dusíkem mírnější variantu nemají
    const hasSlopeVariant = considered.some(
      (period) => period.variant === 'sklon_do_5_s_porostem'
    )
    considered = considered.filter((period) =>
      period.variant === (hasSlopeVariant ? 'sklon_do_5_s_porostem' : 'zakladni')
    )
  } else if (slopeVariantExcluded) {
    considered = considered.filter((period) => period.variant === 'zakladni')
  } else if (considered.some((period) => period.variant === 'sklon_do_5_s_porostem')) {
    uncertainty.push(
      'není zřejmé, zda byl na pozemku do 5° porost plodin (kratší zákaz podle tabulky č. 1)'
    )
  }

  const matched = considered.filter((period) =>
    isWithinBanWindow(context.applicationDate, period)
  )

  const status: BanPeriodResult['status'] =
    matched.length === 0 ? 'allowed' : matched.length === considered.length ? 'in_ban' : 'possible'

  return { status, matched, considered, uncertainty }
}

/**
 * Podmíněný letní zákaz u hnojiv s pomalu uvolnitelným dusíkem.
 *
 * Zákaz 1. 6. – 31. 7. platí jen tam, kde v témže roce nenásleduje hlavní
 * plodina ani meziplodina – z evidence to nevyplývá, proto se vrací jako
 * podmínka k ověření, ne jako porušení.
 */
export function findConditionalBan(
  periods: BanPeriod[],
  context: { applicationDate: string; fertilizerGroup: NitrogenFertilizerGroup }
): BanPeriod | null {
  return (
    periods.find(
      (period) =>
        period.isConditional &&
        period.fertilizerGroup === context.fertilizerGroup &&
        isWithinBanWindow(context.applicationDate, period)
    ) ?? null
  )
}

// ============================================================================
// MAXIMÁLNÍ DÁVKA N PO SKLIZNI (příloha 2, tabulka 6)
// ============================================================================

export interface PostHarvestMethodResult {
  methodNumber: number
  /** Způsob byl odvozen bez části údajů, proto se použil mírnější limit */
  assumed: boolean
  reason: string
}

/**
 * Který ze čtyř způsobů hnojení po sklizni na aplikaci sedí.
 *
 * Tabulka 6 se týká hnojení po sklizni jednoleté hlavní plodiny, tedy aplikací
 * na podzim před sezónou osevu. Rozhoduje, co na pozemku poroste:
 *   • ozim setý na podzim roste ještě v témže roce → způsob 1 nebo 2 podle toho,
 *     zda byla předplodinou obilnina,
 *   • jarní plodina poroste až příští rok → způsob 4 (hnojit lze od 1. října).
 *
 * Způsob 3 (meziplodiny a podpora rozkladu slámy) se z evidence poznat nedá,
 * proto se nepoužívá. Bez zapsané předplodiny se volí způsob 1 s mírnějším
 * limitem a zjištění se označí jako odvozené.
 */
export function resolvePostHarvestMethod(context: {
  applicationDate: string
  /** Hospodářský rok osevu (rok sklizně) */
  season: number | null
  cropSeasonForm: 'ozima' | 'jarni' | null
  /** Kategorie předplodiny z číselníku plodin */
  previousCropCategory: string | null
}): PostHarvestMethodResult | null {
  if (context.season === null) return null

  const year = Number(context.applicationDate.slice(0, 4))
  if (!Number.isFinite(year) || year !== context.season - 1) return null

  if (context.cropSeasonForm !== 'ozima') {
    return {
      methodNumber: 4,
      assumed: false,
      reason: 'hnojení na podzim k plodině pěstované v příštím kalendářním roce',
    }
  }

  if (context.previousCropCategory === null) {
    return {
      methodNumber: 1,
      assumed: true,
      reason: 'předplodina není v evidenci, počítá se mírnější limit po obilnině',
    }
  }

  return context.previousCropCategory === 'obilnina'
    ? { methodNumber: 1, assumed: false, reason: 'ozim setý po obilnině' }
    : { methodNumber: 2, assumed: false, reason: 'ozim setý po jiné předplodině než obilnině' }
}

export interface PostHarvestLimitAssessment {
  fertilizerGroup: 'mineralni' | 'rychle'
  /** Limit, jehož překročení je porušení jistě (při neznámém riziku ten mírnější) */
  certainLimitKgNHa: number
  /** Přísnější limit, který může platit, když riziko infiltrace není známé */
  possibleLimitKgNHa: number | null
  note: string | null
}

/**
 * Limity dávek po sklizni pro pásmo pozemku; ve III. pásmu rozhoduje riziko
 * infiltrace.
 *
 * Když LPIS uvádí jen „III." bez rozlišení rizika, nelze říct, který ze dvou
 * limitů platí – vrací se proto oba: překročení mírnějšího je porušení jistě,
 * pásmo mezi limity je neověřitelný stav k ohlášení.
 */
export function assessPostHarvestLimits(
  limits: PostHarvestLimit[],
  context: {
    methodNumber: number
    applicationZone: ApplicationZone
    infiltrationRisk: InfiltrationRisk | null
  }
): PostHarvestLimitAssessment[] {
  let forZone = limits.filter(
    (limit) =>
      limit.methodNumber === context.methodNumber &&
      limit.applicationZone === context.applicationZone
  )

  if (context.applicationZone === 'III.' && context.infiltrationRisk) {
    forZone = forZone.filter((limit) => limit.infiltrationRisk === context.infiltrationRisk)
  }

  const byGroup = new Map<'mineralni' | 'rychle', PostHarvestLimit[]>()
  for (const limit of forZone) {
    byGroup.set(limit.fertilizerGroup, [...(byGroup.get(limit.fertilizerGroup) ?? []), limit])
  }

  return Array.from(byGroup.entries()).map(([group, entries]) => {
    const sorted = entries.slice().sort((a, b) => b.limitKgNHa - a.limitKgNHa)
    const mildest = sorted[0]
    const strictest = sorted[sorted.length - 1]

    return {
      fertilizerGroup: group,
      certainLimitKgNHa: mildest.limitKgNHa,
      possibleLimitKgNHa:
        strictest.limitKgNHa < mildest.limitKgNHa ? strictest.limitKgNHa : null,
      note: mildest.note,
    }
  })
}

// ============================================================================
// LIMIT PŘÍVODU N K PLODINĚ (příloha 3, tabulky 4–6)
// ============================================================================

export interface ResolvedCropLimit {
  limitKgNHa: number
  /** null u plodin z tabulek 5 a 6, kde je limit jediný */
  level: YieldLevel | null
  /** Výnos, ke kterému se limit vztahuje */
  referenceYield: number | null
  yieldUnit: string | null
  /** Výnosová hladina pozemku není určena – limit je jen jedna z možností */
  levelAssumed: boolean
  perCalendarYear: boolean
  cropLabel: string
  note: string | null
}

/**
 * Varianty plodiny, které příloha 3 rozlišuje, ale číselník evidence ne.
 *
 * Evidence vede „Pšenice setá ozimá", předpis má zvlášť limit pro potravinářskou
 * a nepotravinářskou. Bez upřesnění osevu se proto posuzují všechny varianty:
 * překročení nejvyššího z limitů je porušení jistě, mezi limity jde
 * o neověřitelný stav, který kontrola ohlásí s výzvou k upřesnění.
 */
export const CROP_LIMIT_VARIANTS: Record<string, string[]> = {
  'psenice-ozima-potravinarska': ['psenice-ozima-potravinarska', 'psenice-ozima-nepotravinarska'],
  'jecmen-jarni-krmny': ['jecmen-jarni-krmny', 'jecmen-jarni-sladovnicky'],
  'brambory-ostatni': ['brambory-ostatni', 'brambory-rane', 'brambory-sadbove'],
}

/** Všechny limity přílohy 3, které pro klíč plodiny připadají v úvahu. */
export function cropLimitCandidates(
  catalog: Map<string, CropNitrogenLimit>,
  limitKey: string
): CropNitrogenLimit[] {
  const keys = CROP_LIMIT_VARIANTS[limitKey] ?? [limitKey]
  return keys
    .map((key) => catalog.get(key))
    .filter((limit): limit is CropNitrogenLimit => limit !== undefined)
}

export interface CropLimitAssessment {
  /** Jediný limit, který jistě platí; null, když varianta nebo hladina není jednoznačná */
  certain: ResolvedCropLimit | null
  /** Všechny limity, které mohou platit */
  candidates: ResolvedCropLimit[]
  minLimitKgNHa: number
  maxLimitKgNHa: number
  /** Co v evidenci chybí k jednoznačnému určení limitu */
  uncertainty: string[]
}

function toResolvedLimit(
  limit: CropNitrogenLimit,
  row: CropNitrogenLimit['levels'][number],
  levelAssumed: boolean
): ResolvedCropLimit {
  return {
    limitKgNHa: row.limitKgNHa,
    level: row.level,
    referenceYield: row.referenceYield,
    yieldUnit: limit.yieldUnit,
    levelAssumed,
    perCalendarYear: limit.perCalendarYear,
    cropLabel: limit.cropLabel,
    note: limit.note,
  }
}

/**
 * Limit přívodu dusíku k plodině.
 *
 * Tabulka 4 dělí limit podle výnosové hladiny pozemku (BPEJ), tabulky 5 a 6
 * mají limit jediný. Nic se nedomýšlí: když výnosová hladina nebo varianta
 * plodiny není známa, vrací se všechny limity, které mohou platit, a seznam
 * toho, co k jednoznačnému určení chybí. Rozhodnutí, jak s rozpětím naložit,
 * je na kontrole – porušení je jisté jen nad nejvyšším z limitů.
 */
export function assessCropLimit(
  limits: CropNitrogenLimit[],
  yieldLevel: YieldLevel | null
): CropLimitAssessment | null {
  if (limits.length === 0) return null

  const candidates: ResolvedCropLimit[] = []
  const uncertainty: string[] = []
  let levelUnknown = false

  if (limits.length > 1) {
    uncertainty.push(
      `předpis rozlišuje ${limits
        .map((limit) => limit.cropLabel.toLowerCase())
        .join(' / ')} – upřesněte plodinu osevu`
    )
  }

  for (const limit of limits) {
    if (limit.flatLimitKgNHa !== null) {
      candidates.push({
        limitKgNHa: limit.flatLimitKgNHa,
        level: null,
        referenceYield: null,
        yieldUnit: null,
        levelAssumed: false,
        perCalendarYear: limit.perCalendarYear,
        cropLabel: limit.cropLabel,
        note: limit.note,
      })
      continue
    }

    if (yieldLevel !== null) {
      const row = limit.levels.find((entry) => entry.level === yieldLevel)
      if (row) candidates.push(toResolvedLimit(limit, row, false))
      continue
    }

    levelUnknown ||= limit.levels.length > 1
    for (const row of limit.levels) candidates.push(toResolvedLimit(limit, row, true))
  }

  if (levelUnknown) {
    uncertainty.push(
      'výnosová hladina pozemku není známa – doplňte kód BPEJ u dílu půdního bloku'
    )
  }

  if (candidates.length === 0) return null

  return {
    certain: candidates.length === 1 ? candidates[0] : null,
    candidates,
    minLimitKgNHa: Math.min(...candidates.map((entry) => entry.limitKgNHa)),
    maxLimitKgNHa: Math.max(...candidates.map((entry) => entry.limitKgNHa)),
    uncertainty,
  }
}

// ============================================================================
// PŘÍVOD DUSÍKU
// ============================================================================

export interface NitrogenSupply {
  /** Celkový dusík ve všech hnojivech (kg N/ha) */
  totalKgHa: number
  /** Dusík v minerálních dusíkatých hnojivech (skupina A předpisu) */
  mineralKgHa: number
  /** Celkový dusík v hnojivech s rychle uvolnitelným dusíkem (skupina B) */
  fastKgHa: number
  /** Celkový dusík v hnojivech s pomalu uvolnitelným dusíkem */
  slowKgHa: number
  /** Dusík ve statkových hnojivech – vstup pro limit 170 kg N/ha */
  livestockKgHa: number
}

export const EMPTY_NITROGEN_SUPPLY: NitrogenSupply = {
  totalKgHa: 0,
  mineralKgHa: 0,
  fastKgHa: 0,
  slowKgHa: 0,
  livestockKgHa: 0,
}

export interface NitrogenItem {
  nitrogenGroup: NitrogenGroup | null
  isLivestockManure: boolean
  nKgHa: number | null
}

/** Sečte přívod dusíku podle skupin hnojiv. */
export function sumNitrogen(items: NitrogenItem[]): NitrogenSupply {
  return items.reduce<NitrogenSupply>((sum, item) => {
    const nitrogen = item.nKgHa ?? 0
    if (nitrogen <= 0) return sum

    return {
      totalKgHa: round(sum.totalKgHa + nitrogen),
      mineralKgHa: round(sum.mineralKgHa + (item.nitrogenGroup === 'mineralni' ? nitrogen : 0)),
      fastKgHa: round(sum.fastKgHa + (item.nitrogenGroup === 'rychle' ? nitrogen : 0)),
      slowKgHa: round(sum.slowKgHa + (item.nitrogenGroup === 'pomalu' ? nitrogen : 0)),
      livestockKgHa: round(sum.livestockKgHa + (item.isLivestockManure ? nitrogen : 0)),
    }
  }, EMPTY_NITROGEN_SUPPLY)
}

/** Součet dvou přívodů dusíku, např. dosavadní evidence a ukládané aplikace. */
export function addNitrogen(a: NitrogenSupply, b: NitrogenSupply): NitrogenSupply {
  return {
    totalKgHa: round(a.totalKgHa + b.totalKgHa),
    mineralKgHa: round(a.mineralKgHa + b.mineralKgHa),
    fastKgHa: round(a.fastKgHa + b.fastKgHa),
    slowKgHa: round(a.slowKgHa + b.slowKgHa),
    livestockKgHa: round(a.livestockKgHa + b.livestockKgHa),
  }
}

function round(value: number): number {
  return Number(value.toFixed(3))
}

/** Přívod dusíku v čitelném tvaru, např. „128,4 kg N/ha". */
export function formatNitrogen(value: number): string {
  return `${value.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} kg N/ha`
}
