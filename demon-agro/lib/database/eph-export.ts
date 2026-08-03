/**
 * PŘÍPRAVA EVIDENCE PRO EXPORT DO EPH
 *
 * Sestaví z evidence podklad pro soubor podle rozhraní Portálu farmáře a
 * vypíše, co exportu brání. Do souboru se dostane jen aplikace, u které jsou
 * všechny povinné údaje známé – výstup jde do oficiálního hlášení, takže
 * chybějící hodnotu nelze nahradit odhadem ani nulou „aby to prošlo".
 *
 * Neúplná aplikace se vynechává celá, ne po položkách. Kdyby se vypustila jen
 * jedna položka, hlášení by u té aplikace vypadalo úplně, ale chyběl by v něm
 * skutečně použitý přípravek nebo hnojivo.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  loadFertilizerNutrients,
  resolveCatalogRow,
  type FertilizerCatalogRow,
} from '@/lib/database/fertilizer-nutrient-data'
import { doseToKgPerHa } from '@/lib/utils/fertilizer-nutrients'
import {
  buildEphXml,
  EPH_FERTILIZER_UNITS,
  EPH_NITROGEN_CATEGORY_CODES,
  EPH_PRODUCT_UNITS,
  type EphApplication,
  type EphApplicationMethod,
  type EphFertilizer,
  type EphParcel,
  type EphProduct,
} from '@/lib/utils/eph-xml'

type Client = SupabaseClient<any, 'public', any>

export interface EphExportProblem {
  /** Blokující zjištění vyřadí aplikaci z exportu, upozornění ji jen provází. */
  severity: 'blocking' | 'warning'
  message: string
  /** Kolika aplikací se týká */
  count: number
  /** Příklady, ať je poznat, kde údaj doplnit */
  examples: string[]
  /** Kam jít údaj doplnit */
  href?: string
}

export interface EphExportResult {
  xml: string | null
  filename: string
  problems: EphExportProblem[]
  /** Počet aplikací, které do souboru šly */
  exportedApplications: number
  /** Počet aplikací, které z něj vypadly */
  skippedApplications: number
  parcels: number
  fertilizerItems: number
  productItems: number
}

interface LoadedItem {
  kind: string
  product_name: string
  por_item_id: number | null
  fert_evidence_number: string | null
  dose: number
  unit: string
  total_amount: number | null
  target_pest: string | null
  batch: string | null
  notes: string | null
  position: number
}

interface LoadedApplication {
  id: string
  application_date: string
  applied_area: number
  method: string | null
  notes: string | null
  items: LoadedItem[]
  parcel: {
    id: string
    name: string
    area: number
    block_code: string | null
    land_block: { square_code: string; dpb_code: string; area: number } | null
  } | null
  parcel_crop: {
    id: string
    crop_name: string
    sowing_date: string | null
    harvest_date: string | null
    area: number | null
    crop: { name: string; lpis_crop_id: number | null } | null
  } | null
}

const SELECT = `
  id, application_date, applied_area, method, notes,
  items:application_items(kind, product_name, por_item_id, fert_evidence_number, dose, unit,
    total_amount, target_pest, batch, notes, position),
  parcel:crop_parcels(id, name, area, block_code,
    land_block:land_blocks(square_code, dpb_code, area)),
  parcel_crop:parcel_crops(id, crop_name, sowing_date, harvest_date, area,
    crop:crops(name, lpis_crop_id))
`

/** Sběrač zjištění – stejná příčina se hlásí jednou i s počtem a příklady. */
class ProblemCollector {
  private readonly problems = new Map<string, EphExportProblem>()

  add(
    key: string,
    problem: Omit<EphExportProblem, 'count' | 'examples'>,
    example: string
  ): void {
    const existing = this.problems.get(key)

    if (existing) {
      existing.count++
      if (existing.examples.length < 3) existing.examples.push(example)
      return
    }

    this.problems.set(key, { ...problem, count: 1, examples: [example] })
  }

  list(): EphExportProblem[] {
    return Array.from(this.problems.values()).sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'blocking' ? -1 : 1
      return b.count - a.count
    })
  }
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-')
  return day && month && year ? `${Number(day)}. ${Number(month)}. ${year}` : value
}

/** Popis aplikace do výpisu problémů. */
function describe(application: LoadedApplication): string {
  const parcel = application.parcel?.name ?? 'bez parcely'
  return `${parcel} · ${formatDate(application.application_date)}`
}

/**
 * Způsob aplikace. Rozhraní zná jen letecky, službou a vlastním zařízením;
 * evidence tuhle informaci nevede povinně a rozhraní pro nevyplněné pole
 * předepisuje vlastní zařízení.
 */
function resolveMethod(method: string | null): EphApplicationMethod {
  const value = (method ?? '').toLowerCase()
  if (value.includes('letec')) return 'L'
  if (value.includes('služb') || value.includes('sluzb')) return 'S'
  return 'V'
}

/**
 * Přívod živiny z dávky a deklarovaného obsahu.
 *
 * Nedeklarovaná živina znamená nulový přívod – číselník u hnojiva uvádí, co
 * obsahuje, a co v něm není uvedeno, hnojivo nedodává.
 */
function nutrientFromMass(massKgHa: number, percent: number | null): number {
  if (percent === null) return 0
  return (massKgHa * Number(percent)) / 100
}

/** Důvod, proč položka do exportu nemůže – hlásí se souhrnně za všechny výskyty. */
interface ItemProblem {
  code: string
  message: string
  /** Čeho se týká, aby bylo poznat, kde údaj doplnit */
  detail: string
}

function buildFertilizerItem(
  item: LoadedItem,
  catalog: FertilizerCatalogRow | null,
  treatedArea: number
): { fertilizer: EphFertilizer } | { problem: ItemProblem } {
  if (!(EPH_FERTILIZER_UNITS as readonly string[]).includes(item.unit)) {
    return {
      problem: {
        code: 'fert-unit',
        message: `Hnojivo je zapsané v jednotce, kterou rozhraní nezná. Povolené jsou ${EPH_FERTILIZER_UNITS.join(', ')}.`,
        detail: `${item.product_name} (${item.unit})`,
      },
    }
  }

  if (!catalog) {
    return {
      problem: {
        code: 'fert-unknown',
        message:
          'Hnojivo se nepodařilo najít v číselníku hnojiv, takže k němu nejsou obsahy živin ani kategorie dusíku.',
        detail: item.product_name,
      },
    }
  }

  const code = catalog.nitrogen_category
    ? EPH_NITROGEN_CATEGORY_CODES[catalog.nitrogen_category] ?? null
    : null

  if (code === null) {
    return {
      problem: {
        code: 'fert-category',
        message: 'Hnojivo má v číselníku kategorii dusíku, kterou rozhraní EPH nezná.',
        detail: `${item.product_name} (${catalog.nitrogen_category ?? 'bez kategorie'})`,
      },
    }
  }

  const percentages = [
    catalog.n_percent,
    catalog.p2o5_percent,
    catalog.k2o_percent,
    catalog.mgo_percent,
    catalog.cao_percent,
    catalog.s_percent,
  ]

  // Hnojivo, které žádnou z vykazovaných živin nedeklaruje, jich dodá nula bez
  // ohledu na hmotnost dávky – měrná hmotnost proto u něj není potřeba
  const declaresNothing = percentages.every((percent) => percent === null || Number(percent) === 0)

  const massKgHa = declaresNothing
    ? 0
    : doseToKgPerHa(Number(item.dose), item.unit, catalog.density_kg_l)

  if (massKgHa === null) {
    return {
      problem: {
        code: 'fert-density',
        message:
          'U hnojiva dávkovaného objemově chybí měrná hmotnost, takže přívod živin v kg/ha nelze doložit. Číselník ji u něj neuvádí – doplňte ji podle etikety nebo dodacího listu.',
        detail: `${item.product_name} (${item.dose} ${item.unit})`,
      },
    }
  }

  return {
    fertilizer: {
      id: catalog.catalog_id,
      name: item.product_name,
      totalAmount: item.total_amount !== null ? Number(item.total_amount) : Number(item.dose) * treatedArea,
      dosePerHa: Number(item.dose),
      unit: item.unit,
      nKgHa: nutrientFromMass(massKgHa, catalog.n_percent),
      p2o5KgHa: nutrientFromMass(massKgHa, catalog.p2o5_percent),
      k2oKgHa: nutrientFromMass(massKgHa, catalog.k2o_percent),
      mgoKgHa: nutrientFromMass(massKgHa, catalog.mgo_percent),
      caoKgHa: nutrientFromMass(massKgHa, catalog.cao_percent),
      sKgHa: nutrientFromMass(massKgHa, catalog.s_percent),
      nitrogenCategory: code,
      isOrganic: Boolean(catalog.is_organic),
      note: item.notes,
    },
  }
}

function buildProductItem(
  item: LoadedItem,
  treatedArea: number
): { product: EphProduct } | { problem: ItemProblem } {
  if (!(EPH_PRODUCT_UNITS as readonly string[]).includes(item.unit)) {
    return {
      problem: {
        code: 'por-unit',
        message: `Přípravek je zapsaný v jednotce, kterou rozhraní nezná. Povolené jsou ${EPH_PRODUCT_UNITS.join(', ')}.`,
        detail: `${item.product_name} (${item.unit})`,
      },
    }
  }

  const target = (item.target_pest ?? '').trim()
  if (target.length === 0) {
    return {
      problem: {
        code: 'por-target',
        message:
          'U přípravku není zapsaný účel použití – škodlivý organismus, plevel nebo choroba. Evidence ho vede povinně a rozhraní EPH bez něj aplikaci nepřijme.',
        detail: item.product_name,
      },
    }
  }

  return {
    product: {
      id: item.por_item_id,
      name: item.product_name,
      totalAmount: item.total_amount !== null ? Number(item.total_amount) : Number(item.dose) * treatedArea,
      dosePerHa: Number(item.dose),
      unit: item.unit,
      batch: item.batch,
      targetOrganism: target,
      note: item.notes,
    },
  }
}

/**
 * Podklad pro soubor evidence za zadané období.
 *
 * Exportují se jen skutečně provedené a schválené aplikace – plán ani zápis
 * z pole čekající na schválení do hlášení nepatří.
 *
 * Klient se předává zvenčí, aby stejný kód obsloužil portál i dávkový skript.
 */
export async function buildEphExportForUser(
  supabase: Client,
  userId: string,
  from: string,
  to: string
): Promise<EphExportResult> {
  const empty: EphExportResult = {
    xml: null,
    filename: `EPH_evidence_${from}_${to}.xml`,
    problems: [],
    exportedApplications: 0,
    skippedApplications: 0,
    parcels: 0,
    fertilizerItems: 0,
    productItems: 0,
  }

  const [profileResult, applicationsResult] = await Promise.all([
    supabase.from('profiles').select('szr_id').eq('id', userId).maybeSingle(),
    supabase
      .from('applications')
      .select(SELECT)
      .eq('user_id', userId)
      .eq('record_status', 'schvaleno')
      .eq('mode', 'skutecnost')
      .gte('application_date', from)
      .lte('application_date', to)
      .order('application_date'),
  ])

  const collector = new ProblemCollector()
  const szrId = (profileResult.data?.szr_id ?? '').trim()

  if (szrId.length === 0) {
    collector.add(
      'szr',
      {
        severity: 'blocking',
        message:
          'Chybí identifikátor subjektu ze SZR. Bez něj nemá Portál farmáře import k čemu přiřadit.',
      },
      'doplňte ho v exportním okně'
    )
  }

  if (applicationsResult.error) {
    console.error('Chyba při načítání evidence pro export:', applicationsResult.error)
    return empty
  }

  const applications = (applicationsResult.data ?? []) as unknown as LoadedApplication[]

  if (applications.length === 0) {
    return { ...empty, problems: collector.list() }
  }

  const fertilizerItems = applications.flatMap((application) =>
    application.items.filter((item) => item.kind === 'hnojivo' || item.kind === 'pomocna')
  )

  const lookup = await loadFertilizerNutrients(supabase, {
    evidenceNumbers: fertilizerItems.map((item) => item.fert_evidence_number),
    names: fertilizerItems.map((item) => item.product_name),
  })

  // Parcelou se v rozhraní rozumí jedna plodina na jednom dílu půdního bloku,
  // takže se aplikace sdružují podle osevu
  const byStand = new Map<string, EphParcel>()
  let exported = 0
  let skipped = 0
  let fertilizerCount = 0
  let productCount = 0

  for (const application of applications) {
    const parcel = application.parcel
    const stand = application.parcel_crop
    const blockCode = parcel?.land_block?.dpb_code ?? parcel?.block_code ?? null

    if (!parcel || !blockCode) {
      skipped++
      collector.add(
        'block',
        {
          severity: 'blocking',
          message:
            'Parcela nemá kód dílu půdního bloku. Portál podle něj aplikaci přiřazuje k pozemku.',
          href: '/portal/hnojiva-por/parcely',
        },
        describe(application)
      )
      continue
    }

    if (!stand) {
      skipped++
      collector.add(
        'stand',
        {
          severity: 'blocking',
          message: 'Aplikace není navázaná na osev, takže k ní chybí plodina.',
          href: '/portal/hnojiva-por/parcely',
        },
        describe(application)
      )
      continue
    }

    const cropId = stand.crop?.lpis_crop_id ?? null
    if (cropId === null) {
      skipped++
      collector.add(
        `crop:${stand.crop_name}`,
        {
          severity: 'blocking',
          message: `Plodina „${stand.crop_name}" nemá přiřazené ID z číselníku plodin LPIS. Chybějící ID je podle rozhraní tvrdá chyba.`,
        },
        describe(application)
      )
      continue
    }

    const fertilizers: EphFertilizer[] = []
    const products: EphProduct[] = []
    let itemProblem: ItemProblem | null = null

    for (const item of [...application.items].sort((a, b) => a.position - b.position)) {
      // Pomocné látky jsou v obou registrech – rozhoduje, kam je evidence
      // navázala: registrovaný adjuvant patří mezi přípravky, půdní pomocná
      // látka mezi hnojiva
      const asProduct = item.kind === 'por' || (item.kind === 'pomocna' && item.por_item_id !== null)

      if (asProduct) {
        const result = buildProductItem(item, Number(application.applied_area))
        if ('problem' in result) {
          itemProblem = result.problem
          break
        }
        products.push(result.product)
        continue
      }

      const catalog = resolveCatalogRow(lookup, {
        fertEvidenceNumber: item.fert_evidence_number,
        productName: item.product_name,
        unit: item.unit,
      })

      const result = buildFertilizerItem(item, catalog, Number(application.applied_area))
      if ('problem' in result) {
        itemProblem = result.problem
        break
      }
      fertilizers.push(result.fertilizer)
    }

    if (itemProblem !== null) {
      skipped++
      collector.add(
        itemProblem.code,
        {
          severity: 'blocking',
          message: itemProblem.message,
          href: '/portal/hnojiva-por/evidence',
        },
        `${itemProblem.detail} – ${describe(application)}`
      )
      continue
    }

    if (fertilizers.length === 0 && products.length === 0) {
      skipped++
      collector.add(
        'empty',
        {
          severity: 'blocking',
          message: 'Aplikace nemá žádnou položku hnojiva ani přípravku.',
          href: '/portal/hnojiva-por/evidence',
        },
        describe(application)
      )
      continue
    }

    const key = stand.id
    let target = byStand.get(key)

    if (!target) {
      target = {
        squareCode: parcel.land_block?.square_code ?? null,
        blockCode,
        name: parcel.name,
        area: Number(stand.area ?? parcel.area),
        cropId,
        cropName: stand.crop?.name ?? stand.crop_name,
        cropFrom: stand.sowing_date,
        cropTo: stand.harvest_date,
        applications: [],
      }
      byStand.set(key, target)
    }

    const record: EphApplication = {
      date: application.application_date,
      treatedArea: Number(application.applied_area),
      method: resolveMethod(application.method),
      fertilizers,
      products,
    }

    target.applications.push(record)
    exported++
    fertilizerCount += fertilizers.length
    productCount += products.length
  }

  const parcels = Array.from(byStand.values())
  const problems = collector.list()
  const canExport = szrId.length > 0 && parcels.length > 0

  return {
    xml: canExport ? buildEphXml({ szrId, from, to }, parcels) : null,
    filename: `EPH_evidence_${from}_${to}.xml`,
    problems,
    exportedApplications: exported,
    skippedApplications: skipped,
    parcels: parcels.length,
    fertilizerItems: fertilizerCount,
    productItems: productCount,
  }
}
