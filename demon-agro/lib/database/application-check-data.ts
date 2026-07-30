/**
 * Načtení podkladů pro kontroly evidence
 *
 * Kontrolní engine (lib/utils/application-checks.ts) je čistý – tenhle modul mu
 * připraví jen to, co potřebuje: registrovaná použití přípravků, rizikové
 * příznaky a číselník plodin.
 *
 * Data z registru se stahují hromadně pro všechny přípravky dané dávky
 * kontrol, aby kontrola stovek aplikací nedělala tisíce dotazů.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { CropDefinition, RegistryPorProduct, RegistryUsage } from '@/lib/utils/application-checks'

type Client = SupabaseClient<any, 'public', any>

/** Rizikové věty, ze kterých se odvozují příznaky omezení. */
const WATER_ORGANISM_ATTRIBUTE = 'Riziko pro vodní organismy'
const BEE_ATTRIBUTE = 'Riziko pro včely'
const WATER_ZONE_ATTRIBUTE = 'Ochranná pásma vod'
const NO_LABEL = 'bez označení'

export async function loadCropCatalog(supabase: Client): Promise<Map<string, CropDefinition>> {
  const { data, error } = await supabase
    .from('crops')
    .select('id, name, season, category, registry_aliases, nitrate_limit_key')
    .eq('is_active', true)

  if (error) {
    console.error('Chyba při načítání číselníku plodin:', error)
    return new Map()
  }

  const byName = new Map<string, CropDefinition>()
  for (const crop of data ?? []) {
    byName.set(crop.name.toLowerCase(), {
      id: crop.id,
      name: crop.name,
      season: crop.season,
      category: crop.category,
      registryAliases: crop.registry_aliases ?? [],
      nitrateLimitKey: crop.nitrate_limit_key,
    })
  }

  return byName
}

/**
 * Registrovaná použití a omezení pro zadané přípravky.
 *
 * Dávky jsou v registru rozpadlé do více řádků (různé varianty tank-mixu i
 * nulové hodnoty), proto se pro každou kombinaci plodina + cílový organismus
 * agreguje nejnižší a nejvyšší nenulová dávka.
 */
export async function loadPorRegistryForChecks(
  supabase: Client,
  itemIds: number[]
): Promise<Record<number, RegistryPorProduct>> {
  const unique = Array.from(new Set(itemIds.filter((id) => Number.isFinite(id))))
  if (unique.length === 0) return {}

  const [products, usages, dosages, attributes] = await Promise.all([
    supabase
      .from('por_products')
      .select('item_id, name, is_authorized, valid_until, use_until')
      .in('item_id', unique),
    supabase
      .from('por_usages')
      .select('product_item_id, crop, pest, protection_period_days, application_notes')
      .in('product_item_id', unique),
    supabase
      .from('por_dosages')
      .select('product_item_id, crop, pest, dose_min, dose_max, unit')
      .in('product_item_id', unique),
    supabase
      .from('por_product_attributes')
      .select('product_item_id, attribute, abbreviation, meaning')
      .in('product_item_id', unique)
      .in('attribute', [WATER_ORGANISM_ATTRIBUTE, BEE_ATTRIBUTE, WATER_ZONE_ATTRIBUTE]),
  ])

  if (products.error) {
    console.error('Chyba při načítání přípravků pro kontrolu:', products.error)
    return {}
  }

  // Dávky podle plodiny a cílového organismu
  const doseKey = (itemId: number, crop: string | null, pest: string | null) =>
    `${itemId}|${crop ?? ''}|${pest ?? ''}`

  const doseRanges = new Map<string, { min: number | null; max: number | null; unit: string | null }>()

  for (const dosage of dosages.data ?? []) {
    const key = doseKey(dosage.product_item_id, dosage.crop, dosage.pest)
    const current = doseRanges.get(key) ?? { min: null, max: null, unit: null }

    const min = dosage.dose_min !== null ? Number(dosage.dose_min) : null
    const max = dosage.dose_max !== null ? Number(dosage.dose_max) : null

    if (min !== null && min > 0) current.min = current.min === null ? min : Math.min(current.min, min)
    if (max !== null && max > 0) current.max = current.max === null ? max : Math.max(current.max, max)
    if (dosage.unit && !current.unit) current.unit = dosage.unit

    doseRanges.set(key, current)
  }

  // Použití s doplněnou dávkou
  const usagesByProduct = new Map<number, RegistryUsage[]>()

  for (const usage of usages.data ?? []) {
    const range =
      doseRanges.get(doseKey(usage.product_item_id, usage.crop, usage.pest)) ??
      doseRanges.get(doseKey(usage.product_item_id, usage.crop, null))

    const list = usagesByProduct.get(usage.product_item_id) ?? []
    list.push({
      crop: usage.crop ?? '',
      pest: usage.pest,
      doseMin: range?.min ?? null,
      doseMax: range?.max ?? null,
      unit: range?.unit ?? null,
      protectionPeriodDays: usage.protection_period_days,
      note: usage.application_notes,
    })
    usagesByProduct.set(usage.product_item_id, list)
  }

  // Rizikové příznaky
  const flagsByProduct = new Map<
    number,
    {
      waterBufferRestriction: boolean
      beeRisk: boolean
      waterProtectionZoneExcluded: boolean
      waterProtectionZoneNote: string | null
    }
  >()

  for (const attribute of attributes.data ?? []) {
    const flags =
      flagsByProduct.get(attribute.product_item_id) ?? {
        waterBufferRestriction: false,
        beeRisk: false,
        waterProtectionZoneExcluded: false,
        waterProtectionZoneNote: null,
      }

    const abbreviation = (attribute.abbreviation ?? '').trim()
    const meaning = attribute.meaning ?? ''
    const isEmptyLabel = meaning.toLowerCase().includes(NO_LABEL) || abbreviation === '- -'

    if (attribute.attribute === WATER_ORGANISM_ATTRIBUTE && abbreviation.startsWith('SPe')) {
      flags.waterBufferRestriction = true
    }

    if (attribute.attribute === BEE_ATTRIBUTE && !isEmptyLabel) {
      flags.beeRisk = true
    }

    // Registr uvádí i výslovné povolení ("není vyloučen"), to omezení není
    if (
      attribute.attribute === WATER_ZONE_ATTRIBUTE &&
      /vylou[čc]en/i.test(meaning) &&
      !/nen[íi]\s+vylou[čc]en/i.test(meaning)
    ) {
      flags.waterProtectionZoneExcluded = true
      flags.waterProtectionZoneNote = meaning
    }

    flagsByProduct.set(attribute.product_item_id, flags)
  }

  const registry: Record<number, RegistryPorProduct> = {}

  for (const product of products.data ?? []) {
    const flags = flagsByProduct.get(product.item_id)

    registry[product.item_id] = {
      itemId: product.item_id,
      name: product.name,
      isAuthorized: product.is_authorized ?? false,
      validUntil: product.valid_until,
      useUntil: product.use_until,
      usages: usagesByProduct.get(product.item_id) ?? [],
      waterBufferRestriction: flags?.waterBufferRestriction ?? false,
      beeRisk: flags?.beeRisk ?? false,
      waterProtectionZoneExcluded: flags?.waterProtectionZoneExcluded ?? false,
      waterProtectionZoneNote: flags?.waterProtectionZoneNote ?? null,
    }
  }

  return registry
}
