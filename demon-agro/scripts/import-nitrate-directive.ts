/**
 * Import legislativních číselníků akčního programu nitrátové směrnice
 *
 * Období zákazu hnojení, maximální dávky N po sklizni a limity přívodu N
 * k plodině jsou přílohy č. 2 a 3 nařízení vlády č. 262/2012 Sb. Hodnoty se
 * přepisují strojově ze zdrojového souboru, aby se do kontrol nedostala chyba
 * v opisu čísla nebo datumu.
 *
 * Zdroj: data/legislativa/NV_262-2012_prilohy_2_a_3.xlsx
 *   (přepis vyhlášeného znění ve znění NV 193/2024 Sb. – 6. akční program,
 *   účinné od 1. 7. 2024)
 *
 * Spuštění:
 *   npx tsx scripts/import-nitrate-directive.ts [cesta/k/souboru.xlsx]
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

dotenv.config({ path: '.env.local' })

const SOURCE =
  process.argv[2] ?? path.join(process.cwd(), 'data', 'legislativa', 'NV_262-2012_prilohy_2_a_3.xlsx')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ----------------------------------------------------------------------------
// POMOCNÉ FUNKCE
// ----------------------------------------------------------------------------

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function text(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : null
}

function num(value: string | undefined): number | null {
  const trimmed = (value ?? '').trim()
  if (trimmed.length === 0) return null
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

/** „15.2." → { day: 15, month: 2 } */
function parseDayMonth(value: string): { day: number; month: number } {
  const match = value.match(/(\d{1,2})\s*\.\s*(\d{1,2})/)
  if (!match) throw new Error(`Nečitelné datum: ${value}`)
  return { day: Number(match[1]), month: Number(match[2]) }
}

/** „0-5" → { from: 0, to: 5 } */
function parseRegionRange(value: string): { from: number; to: number } {
  const match = value.match(/(\d)\s*-\s*(\d)/)
  if (!match) throw new Error(`Nečitelný klimatický region: ${value}`)
  return { from: Number(match[1]), to: Number(match[2]) }
}

function fertilizerGroup(value: string): 'mineralni' | 'rychle' | 'pomalu' {
  const normalized = slug(value)
  if (normalized.includes('mineraln')) return 'mineralni'
  if (normalized.includes('rychle')) return 'rychle'
  if (normalized.includes('pomalu')) return 'pomalu'
  throw new Error(`Neznámá skupina hnojiva: ${value}`)
}

function rows(sheet: XLSX.WorkSheet): Record<string, string>[] {
  return XLSX.utils
    .sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
    .map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value).trim()]))
    )
}

// ----------------------------------------------------------------------------
// PŘÍLOHA 2, TABULKA 1 – OBDOBÍ ZÁKAZU HNOJENÍ
// ----------------------------------------------------------------------------

const VARIANTS: Record<string, string> = {
  zakladni: 'zakladni',
  'pozemky-se-sklonitosti-do-5-s-porostem-plodin': 'sklon_do_5_s_porostem',
}

/**
 * Letní zákaz u hnojiv s pomalu uvolnitelným dusíkem je v předpisu v poznámce
 * pod tabulkou, ne samostatným řádkem. Platí jen tam, kde v témže roce
 * nenásleduje hlavní plodina ani meziplodina, proto se ukládá jako podmíněný –
 * kontrola z něj dělá upozornění, ne porušení.
 */
const SUMMER_BAN_NOTE =
  'Platí jen na pozemcích, kde v témže roce nenásleduje hlavní plodina ani meziplodina (poznámka pod tabulkou č. 1 přílohy 2).'

function banPeriods(sheet: XLSX.WorkSheet) {
  const records: Record<string, unknown>[] = []

  for (const row of rows(sheet)) {
    const region = parseRegionRange(row.klimaticky_region)
    const group = fertilizerGroup(row.skupina_hnojiva)
    const variant = VARIANTS[slug(row.varianta)]
    if (!variant) throw new Error(`Neznámá varianta: ${row.varianta}`)

    const from = parseDayMonth(row.zakaz_od)
    const to = parseDayMonth(row.zakaz_do)

    records.push({
      id: records.length + 1,
      climatic_region_from: region.from,
      climatic_region_to: region.to,
      fertilizer_group: group,
      variant,
      ban_from_month: from.month,
      ban_from_day: from.day,
      ban_to_month: to.month,
      ban_to_day: to.day,
      is_conditional: false,
      note: text(row.poznamka),
    })

    if (group === 'pomalu') {
      records.push({
        id: records.length + 1,
        climatic_region_from: region.from,
        climatic_region_to: region.to,
        fertilizer_group: group,
        variant: 'letni_bez_nasledne_plodiny',
        ban_from_month: 6,
        ban_from_day: 1,
        ban_to_month: 7,
        ban_to_day: 31,
        is_conditional: true,
        note: SUMMER_BAN_NOTE,
      })
    }
  }

  return records
}

// ----------------------------------------------------------------------------
// PŘÍLOHA 2, TABULKA 6 – MAXIMÁLNÍ DÁVKA N PO SKLIZNI
// ----------------------------------------------------------------------------

const INFILTRATION: Record<string, string | null> = {
  '': null,
  'stredni-riziko-infiltrace': 'stredni',
  'vysoke-riziko-infiltrace': 'vysoke',
}

function postHarvest(sheet: XLSX.WorkSheet) {
  const methods = new Map<number, { method_number: number; label: string; note: string | null }>()
  const limits: Record<string, unknown>[] = []

  for (const row of rows(sheet)) {
    const risk = INFILTRATION[slug(row.riziko_infiltrace)]
    if (risk === undefined) throw new Error(`Neznámé riziko infiltrace: ${row.riziko_infiltrace}`)

    const methodNumber = Number(row.cislo_zpusobu)
    const note = text(row.poznamka)
    const existing = methods.get(methodNumber)

    // Poznámka se v předpisu vztahuje ke způsobu hnojení, v dlouhém formátu se
    // proto opakuje u každého řádku; u pásma III. je navíc podmínka inhibitoru
    if (!existing) {
      methods.set(methodNumber, { method_number: methodNumber, label: row.zpusob_hnojeni, note })
    } else if (note && !existing.note) {
      existing.note = note
    }

    limits.push({
      id: limits.length + 1,
      method_number: methodNumber,
      application_zone: row.aplikacni_pasmo,
      infiltration_risk: risk,
      fertilizer_group: fertilizerGroup(row.skupina_hnojiva),
      limit_kg_n_ha: num(row.limit_kg_N_ha),
      // U řádku ponecháváme jen poznámku, která se od poznámky způsobu liší
      note: note && note !== methods.get(methodNumber)!.note ? note : null,
    })
  }

  return { methods: Array.from(methods.values()), limits }
}

// ----------------------------------------------------------------------------
// ZAŘAZENÍ POZEMKU PODLE BPEJ (P2 T2–5, P3 T1–3)
// ----------------------------------------------------------------------------

/** „18, 20, 35-38" → [18, 20, 35, 36, 37, 38]; zbytkové kategorie vrací prázdno. */
function parseCodeList(value: string): number[] {
  const codes: number[] = []

  for (const part of value.split(',')) {
    const range = part.trim().match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      for (let code = Number(range[1]); code <= Number(range[2]); code++) codes.push(code)
      continue
    }

    const single = part.trim().match(/^\d+$/)
    if (single) codes.push(Number(part.trim()))
  }

  return codes
}

/** Podmínka sklonitosti u III. aplikačního pásma se váže na sklon pozemku, ne na BPEJ. */
function parseSlopeCondition(value: string): 'do_7' | 'nad_7' | null {
  const normalized = slug(value)
  if (normalized.includes('neprevysujici')) return 'do_7'
  if (normalized.includes('prevysujici')) return 'nad_7'
  return null
}

function bpejRules(workbook: XLSX.WorkBook) {
  const records: Record<string, unknown>[] = []

  const push = (
    ruleKind: string,
    result: string,
    row: Record<string, string>,
    extra: Record<string, unknown> = {}
  ) => {
    const regions = parseCodeList(row.klimaticky_region)
    const hpj = parseCodeList(row.hpj)

    // Zbytkové kategorie („všechny ostatní BPEJ") jsou v kontrole fallback větev
    if (regions.length === 0 || hpj.length === 0) return

    records.push({
      id: records.length + 1,
      rule_kind: ruleKind,
      result,
      row_number: num(row.cislo_radku),
      climatic_regions: regions,
      hpj_codes: hpj,
      detail_codes: null,
      slope_condition: null,
      note: text(row.ucelova_charakteristika_pud),
      ...extra,
    })
  }

  for (const row of rows(workbook.Sheets['P3_T1-3_vynosove_hladiny'])) {
    push('vynosova_hladina', row.vynosova_hladina, row)
  }

  for (const row of rows(workbook.Sheets['P2_T2-4_aplikacni_pasma'])) {
    push('aplikacni_pasmo', row.pasmo, row, {
      slope_condition: parseSlopeCondition(row.podminka_sklonitosti),
    })
  }

  for (const row of rows(workbook.Sheets['P2_T5_riziko_infiltrace'])) {
    push('riziko_infiltrace', 'ano', row, {
      detail_codes: row.sklonitost_expozice_skeletovitost_hloubka
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.length > 0),
    })
  }

  return records
}

// ----------------------------------------------------------------------------
// PŘÍLOHA 3, TABULKY 4–6 – LIMITY PŘÍVODU DUSÍKU
// ----------------------------------------------------------------------------

/** Popisy v tabulce 5 jsou věty („Luskoviny – mimo hrách zahradní…"), klíč proto podle pořadí. */
const FLAT_LIMIT_KEYS: Record<string, string> = {
  '1': 'luskoviny',
  '2': 'soja',
  '3': 'jetel-vojteska',
  '4': 'travy-na-orne-pude',
  '5': 'trvale-travni-porosty',
  '6': 'jahody',
}

function cropLimits(workbook: XLSX.WorkBook) {
  const records: Record<string, unknown>[] = []

  for (const row of rows(workbook.Sheets['P3_T4_limity_plodiny'])) {
    records.push({
      crop_key: slug(row.plodina),
      crop_label: row.plodina,
      source_table: 'p3_t4',
      yield_unit: text(row.jednotka_vynosu),
      level1_yield: num(row.vh1_vynos_do),
      level1_limit_kg_n_ha: num(row.vh1_limit_kg_N_ha),
      level2_yield_from: num(row.vh2_vynos_od),
      level2_yield_to: num(row.vh2_vynos_do),
      level2_limit_kg_n_ha: num(row.vh2_limit_kg_N_ha),
      level3_yield_over: num(row.vh3_vynos_nad),
      level3_limit_kg_n_ha: num(row.vh3_limit_kg_N_ha),
      flat_limit_kg_n_ha: null,
      per_calendar_year: false,
      note: null,
    })
  }

  for (const row of rows(workbook.Sheets['P3_T5_limity_bez_hladin'])) {
    const key = FLAT_LIMIT_KEYS[row.poradi]
    if (!key) throw new Error(`Chybí klíč pro řádek tab. 5 č. ${row.poradi}`)

    records.push({
      crop_key: key,
      crop_label: row.plodina_kultura,
      source_table: 'p3_t5',
      flat_limit_kg_n_ha: num(row.limit_kg_N_ha),
      per_calendar_year: slug(row.poznamka).includes('kalendarni'),
      note: text(row.poznamka),
    })
  }

  for (const row of rows(workbook.Sheets['P3_T6_limity_zelenina'])) {
    records.push({
      crop_key: slug(row.plodina),
      crop_label: row.plodina,
      source_table: 'p3_t6',
      flat_limit_kg_n_ha: num(row.limit_kg_N_ha),
      per_calendar_year: false,
      note: null,
    })
  }

  return records
}

// ----------------------------------------------------------------------------
// PÁROVÁNÍ ČÍSELNÍKU PLODIN NA LIMITY
// ----------------------------------------------------------------------------

/**
 * Číselník evidence je hrubší než tabulky přílohy 3 (jeden „Ječmen jarní" proti
 * sladovnickému a krmnému). Kde předpis rozlišuje víc variant, ukládá se klíč
 * první z nich; skupiny variant drží CROP_LIMIT_VARIANTS v nitrate-directive.ts
 * a kontrola posuzuje všechny – nic se nedomýšlí, nejednoznačnost se hlásí.
 */
const CROP_LIMIT_MAPPING: { code: string; key: string }[] = [
  { code: 'psenice-ozima', key: 'psenice-ozima-potravinarska' },
  { code: 'psenice-jarni', key: 'psenice-jarni' },
  { code: 'zito-ozime', key: 'zito' },
  { code: 'jecmen-ozimy', key: 'jecmen-ozimy' },
  { code: 'jecmen-jarni', key: 'jecmen-jarni-krmny' },
  { code: 'oves-jarni', key: 'oves' },
  { code: 'tritikale-ozime', key: 'tritikale' },
  { code: 'kukurice-zrno', key: 'kukurice-na-zrno' },
  { code: 'kukurice-silaz', key: 'kukurice-na-silaz' },
  { code: 'brambory', key: 'brambory-ostatni' },
  { code: 'cukrovka', key: 'repa-cukrova' },
  { code: 'repka-ozima', key: 'repka' },
  { code: 'repka-jarni', key: 'repka' },
  { code: 'slunecnice', key: 'slunecnice' },
  { code: 'mak', key: 'mak' },
  { code: 'horcice-bila', key: 'horcice' },
  { code: 'hrach-polni', key: 'luskoviny' },
  { code: 'bob', key: 'luskoviny' },
  { code: 'lupina', key: 'luskoviny' },
  { code: 'soja', key: 'soja' },
  { code: 'jetel', key: 'jetel-vojteska' },
  { code: 'vojteska', key: 'jetel-vojteska' },
  { code: 'ttp', key: 'trvale-travni-porosty' },
  // Ostropestřec mariánský ani „Bez plodiny" limit v příloze 3 nemají
]

// ----------------------------------------------------------------------------
// IMPORT
// ----------------------------------------------------------------------------

async function main() {
  console.log(`Zdroj: ${SOURCE}`)
  const workbook = XLSX.readFile(SOURCE)

  const ban = banPeriods(workbook.Sheets['P2_T1_zakaz_hnojeni'])
  const { methods, limits } = postHarvest(workbook.Sheets['P2_T6_davky_po_sklizni'])
  const crops = cropLimits(workbook)
  const bpej = bpejRules(workbook)

  const steps: { label: string; table: string; rows: Record<string, unknown>[]; conflict: string }[] = [
    { label: 'Období zákazu hnojení', table: 'nitrate_ban_periods', rows: ban, conflict: 'id' },
    {
      label: 'Způsoby hnojení po sklizni',
      table: 'nitrate_post_harvest_methods',
      rows: methods as unknown as Record<string, unknown>[],
      conflict: 'method_number',
    },
    {
      label: 'Dávky N po sklizni',
      table: 'nitrate_post_harvest_limits',
      rows: limits,
      conflict: 'id',
    },
    { label: 'Limity přívodu N k plodině', table: 'nitrate_crop_limits', rows: crops, conflict: 'crop_key' },
    { label: 'Zařazení BPEJ', table: 'nitrate_bpej_rules', rows: bpej, conflict: 'id' },
  ]

  for (const step of steps) {
    const { error } = await supabase
      .from(step.table)
      .upsert(step.rows, { onConflict: step.conflict })

    if (error) {
      console.error(`  ${step.label}: chyba – ${error.message}`)
      process.exit(1)
    }

    console.log(`  ${step.label}: ${step.rows.length} řádků`)
  }

  // Napárování číselníku plodin
  let mapped = 0
  for (const entry of CROP_LIMIT_MAPPING) {
    const { data, error } = await supabase
      .from('crops')
      .update({ nitrate_limit_key: entry.key })
      .eq('code', entry.code)
      .select('code')

    if (error) {
      console.error(`  plodina ${entry.code}: chyba – ${error.message}`)
      continue
    }

    if ((data ?? []).length === 0) {
      console.warn(`  plodina ${entry.code}: v číselníku není`)
      continue
    }

    mapped += 1
  }

  console.log(`  Napárované plodiny: ${mapped} z ${CROP_LIMIT_MAPPING.length}`)

  const { data: unmapped } = await supabase
    .from('crops')
    .select('name')
    .is('nitrate_limit_key', null)
    .eq('is_active', true)

  if ((unmapped ?? []).length > 0) {
    console.log(
      `  Bez limitu (příloha 3 je neuvádí): ${(unmapped ?? []).map((row: any) => row.name).join(', ')}`
    )
  }
}

main().catch((error) => {
  console.error('Import selhal:', error)
  process.exit(1)
})
