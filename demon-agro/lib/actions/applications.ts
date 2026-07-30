'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { runChecksForApplications } from '@/lib/database/application-check-runner'
import {
  loadFertilizerNutrients,
  resolveNutrientContent,
} from '@/lib/database/fertilizer-nutrient-data'
import {
  computeNutrientSupply,
  type NutrientSupply,
} from '@/lib/utils/fertilizer-nutrients'
import {
  classifyNitrogenGroup,
  isLivestockManure,
  type NitrogenGroup,
} from '@/lib/utils/nitrate-directive'
import type { CheckFinding } from '@/lib/utils/application-checks'
import type { ApplicationCheckStatus, ApplicationItemKind } from '@/lib/types/database'

/**
 * Server actions evidence použití hnojiv a POR
 *
 * Každé uložení aplikace spustí kontroly a jejich výsledek uloží k záznamu.
 * Kontroly nikdy uložení nezablokují – evidence musí odpovídat skutečnosti,
 * problém se jen označí, aby se dal dohledat.
 */

const itemSchema = z.object({
  kind: z.enum(['hnojivo', 'por', 'pomocna']),
  productName: z.string().min(1, 'Vyberte produkt').max(300),
  productCardId: z.string().uuid().nullable().optional(),
  porItemId: z.number().int().positive().nullable().optional(),
  fertEvidenceNumber: z.string().max(50).nullable().optional(),
  dose: z.number().positive('Dávka musí být větší než nula').max(1_000_000),
  unit: z.string().min(1).max(20),
  targetPest: z.string().max(500).nullable().optional(),
  nKgHa: z.number().min(0).max(10_000).nullable().optional(),
  p2o5KgHa: z.number().min(0).max(10_000).nullable().optional(),
  k2oKgHa: z.number().min(0).max(10_000).nullable().optional(),
  batch: z.string().max(100).nullable().optional(),
  warehouse: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

const applicationSchema = z.object({
  id: z.string().uuid().optional(),
  cropParcelId: z.string().uuid('Vyberte parcelu'),
  parcelCropId: z.string().uuid().nullable().optional(),
  applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Zadejte datum aplikace'),
  appliedArea: z.number().positive('Ošetřená výměra musí být větší než nula').max(100_000),
  mode: z.enum(['skutecnost', 'plan']).default('skutecnost'),
  method: z.string().max(200).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  items: z.array(itemSchema).min(1, 'Přidejte alespoň jedno hnojivo nebo přípravek'),
})

export type SaveApplicationPayload = z.input<typeof applicationSchema>

type ItemInput = z.infer<typeof itemSchema>

/** Co se u položky dopočítá z číselníku hnojiv */
interface FertilizerFacts {
  supply: NutrientSupply | null
  /** Zařazení podle uvolnitelnosti dusíku – vstup pro akční program */
  nitrogenGroup: NitrogenGroup | null
  isLivestockManure: boolean
}

const NO_FERTILIZER_FACTS: FertilizerFacts = {
  supply: null,
  nitrogenGroup: null,
  isLivestockManure: false,
}

/**
 * Dopočítá u hnojiv přívod živin a jejich zařazení z číselníku hnojiv.
 *
 * Registr ÚKZÚZ obsah živin neuvádí, číselník ano – přívod N, P₂O₅ a K₂O na
 * hektar se proto počítá z dávky a obsahu. Ruční zadání má vždy přednost,
 * protože skutečná šarže se od číselníku může lišit.
 *
 * Spolu s živinami se přebírá i kategorie dusíku a příznak statkového hnojiva:
 * na nich stojí termíny a limity akčního programu, a musí zůstat takové, jaké
 * platily v době aplikace.
 */
async function computeFertilizerFacts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: ItemInput[]
): Promise<FertilizerFacts[]> {
  const fertilizers = items.filter((item) => item.kind === 'hnojivo')

  if (fertilizers.length === 0) return items.map(() => NO_FERTILIZER_FACTS)

  const lookup = await loadFertilizerNutrients(supabase, {
    evidenceNumbers: fertilizers.map((item) => item.fertEvidenceNumber),
    names: fertilizers.map((item) => item.productName),
  })

  return items.map((item) => {
    if (item.kind !== 'hnojivo') return NO_FERTILIZER_FACTS

    const content = resolveNutrientContent(lookup, {
      fertEvidenceNumber: item.fertEvidenceNumber,
      productName: item.productName,
      unit: item.unit,
    })

    if (!content) return NO_FERTILIZER_FACTS

    const supply = computeNutrientSupply(item.dose, item.unit, content)

    return {
      // Živina, kterou číselník u hnojiva neuvádí, v něm není obsažená – přívod
      // je tedy nulový, ne neznámý (např. hořká sůl nepřináší žádný dusík)
      supply: supply
        ? {
            massKgHa: supply.massKgHa,
            nKgHa: supply.nKgHa ?? 0,
            p2o5KgHa: supply.p2o5KgHa ?? 0,
            k2oKgHa: supply.k2oKgHa ?? 0,
          }
        : null,
      nitrogenGroup: classifyNitrogenGroup(content),
      isLivestockManure: isLivestockManure(content),
    }
  })
}

export interface SaveApplicationResult {
  success: boolean
  error?: string
  applicationId?: string
  checkStatus?: ApplicationCheckStatus
  findings?: CheckFinding[]
}

export async function saveApplication(
  payload: SaveApplicationPayload
): Promise<SaveApplicationResult> {
  const parsed = applicationSchema.safeParse(payload)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatná data aplikace' }
  }

  const input = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    // Parcela musí patřit uživateli
    const { data: parcel, error: parcelError } = await supabase
      .from('crop_parcels')
      .select('id')
      .eq('id', input.cropParcelId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (parcelError || !parcel) {
      return { success: false, error: 'Parcela nebyla nalezena' }
    }

    const record = {
      user_id: user.id,
      crop_parcel_id: input.cropParcelId,
      parcel_crop_id: input.parcelCropId ?? null,
      application_date: input.applicationDate,
      applied_area: input.appliedArea,
      mode: input.mode,
      method: input.method ?? null,
      is_tankmix: input.items.length > 1,
      notes: input.notes ?? null,
    }

    let applicationId = input.id

    if (applicationId) {
      const { error } = await supabase
        .from('applications')
        .update(record)
        .eq('id', applicationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Chyba při úpravě aplikace:', error)
        return { success: false, error: 'Aplikaci se nepodařilo uložit' }
      }

      await supabase
        .from('application_items')
        .delete()
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
    } else {
      const { data, error } = await supabase
        .from('applications')
        .insert({ ...record, source: 'manual' })
        .select('id')
        .single()

      if (error || !data) {
        console.error('Chyba při vytváření aplikace:', error)
        return { success: false, error: 'Aplikaci se nepodařilo uložit' }
      }

      applicationId = data.id
    }

    const facts = await computeFertilizerFacts(supabase, input.items)

    const items = input.items.map((item, index) => ({
      user_id: user.id,
      application_id: applicationId!,
      kind: item.kind as ApplicationItemKind,
      product_name: item.productName,
      product_card_id: item.productCardId ?? null,
      por_item_id: item.porItemId ?? null,
      fert_evidence_number: item.fertEvidenceNumber ?? null,
      dose: item.dose,
      unit: item.unit,
      total_amount: Number((item.dose * input.appliedArea).toFixed(4)),
      target_pest: item.targetPest ?? null,
      n_kg_ha: item.nKgHa ?? facts[index].supply?.nKgHa ?? null,
      p2o5_kg_ha: item.p2o5KgHa ?? facts[index].supply?.p2o5KgHa ?? null,
      k2o_kg_ha: item.k2oKgHa ?? facts[index].supply?.k2oKgHa ?? null,
      nitrogen_group: facts[index].nitrogenGroup,
      is_livestock_manure: facts[index].isLivestockManure,
      batch: item.batch ?? null,
      warehouse: item.warehouse ?? null,
      notes: item.notes ?? null,
      position: index,
    }))

    const { error: itemsError } = await supabase.from('application_items').insert(items)

    if (itemsError) {
      console.error('Chyba při ukládání položek aplikace:', itemsError)
      return { success: false, error: 'Položky aplikace se nepodařilo uložit' }
    }

    const checked = await runChecksForApplications(supabase, user.id, [applicationId!])

    revalidatePath('/portal/hnojiva-por/evidence')

    return {
      success: true,
      applicationId,
      checkStatus: checked.statuses[applicationId!],
      findings: checked.findings[applicationId!],
    }
  } catch (error) {
    console.error('Neočekávaná chyba ukládání aplikace:', error)
    return { success: false, error: 'Aplikaci se nepodařilo uložit' }
  }
}

// ============================================================================
// SOUHRNNÉ (HROMADNÉ) ZADÁNÍ
// ============================================================================

const batchTargetSchema = z.object({
  cropParcelId: z.string().uuid(),
  parcelCropId: z.string().uuid().nullable().optional(),
  appliedArea: z.number().positive('Ošetřená výměra musí být větší než nula').max(100_000),
})

const batchSchema = z.object({
  applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Zadejte datum aplikace'),
  mode: z.enum(['skutecnost', 'plan']).default('skutecnost'),
  method: z.string().max(200).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  items: z.array(itemSchema).min(1, 'Přidejte alespoň jedno hnojivo nebo přípravek'),
  targets: z.array(batchTargetSchema).min(1, 'Vyberte alespoň jednu parcelu'),
})

export type SaveApplicationsBatchPayload = z.input<typeof batchSchema>

export interface BatchTargetResult {
  applicationId: string
  cropParcelId: string
  parcelName: string
  appliedArea: number
  checkStatus: ApplicationCheckStatus
  findings: CheckFinding[]
}

export interface SaveApplicationsBatchResult {
  success: boolean
  error?: string
  created?: number
  errorCount?: number
  warningCount?: number
  results?: BatchTargetResult[]
}

/**
 * Zapíše jednu sadu hnojiv a přípravků k jednomu datu na více parcel.
 *
 * Evidenční kniha vede každou parcelu samostatně, takže vzniká jeden záznam
 * na parcelu s vlastní ošetřenou výměrou a vlastním výsledkem kontrol –
 * omezení DPB (zranitelná oblast, vzdálenost od vody) i termíny osevu se
 * mezi parcelami liší.
 */
export async function saveApplicationsBatch(
  payload: SaveApplicationsBatchPayload
): Promise<SaveApplicationsBatchResult> {
  const parsed = batchSchema.safeParse(payload)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatná data aplikace' }
  }

  const input = parsed.data

  // Jedna parcela může být ve výběru jen jednou
  const targets = Array.from(
    new Map(input.targets.map((target) => [target.cropParcelId, target])).values()
  )

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { data: parcels, error: parcelsError } = await supabase
      .from('crop_parcels')
      .select('id, name')
      .eq('user_id', user.id)
      .in(
        'id',
        targets.map((target) => target.cropParcelId)
      )

    if (parcelsError) {
      console.error('Chyba při načítání parcel pro hromadný zápis:', parcelsError)
      return { success: false, error: 'Parcely se nepodařilo načíst' }
    }

    const parcelNames = new Map((parcels ?? []).map((parcel) => [parcel.id, parcel.name]))

    if (parcelNames.size !== targets.length) {
      return { success: false, error: 'Některé vybrané parcely nebyly nalezeny' }
    }

    // ID se generují dopředu, aby položky šly vložit jednou dávkou
    const prepared = targets.map((target) => ({ id: crypto.randomUUID(), target }))

    const { error: applicationsError } = await supabase.from('applications').insert(
      prepared.map(({ id, target }) => ({
        id,
        user_id: user.id,
        crop_parcel_id: target.cropParcelId,
        parcel_crop_id: target.parcelCropId ?? null,
        application_date: input.applicationDate,
        applied_area: target.appliedArea,
        mode: input.mode,
        method: input.method ?? null,
        is_tankmix: input.items.length > 1,
        notes: input.notes ?? null,
        source: 'manual',
      }))
    )

    if (applicationsError) {
      console.error('Chyba při hromadném vytváření aplikací:', applicationsError)
      return { success: false, error: 'Aplikace se nepodařilo uložit' }
    }

    // Sada položek je stejná pro všechny parcely, číselník se řeší jednou
    const facts = await computeFertilizerFacts(supabase, input.items)

    const itemRows = prepared.flatMap(({ id, target }) =>
      input.items.map((item, index) => ({
        user_id: user.id,
        application_id: id,
        kind: item.kind as ApplicationItemKind,
        product_name: item.productName,
        product_card_id: item.productCardId ?? null,
        por_item_id: item.porItemId ?? null,
        fert_evidence_number: item.fertEvidenceNumber ?? null,
        dose: item.dose,
        unit: item.unit,
        total_amount: Number((item.dose * target.appliedArea).toFixed(4)),
        target_pest: item.targetPest ?? null,
        n_kg_ha: item.nKgHa ?? facts[index].supply?.nKgHa ?? null,
        p2o5_kg_ha: item.p2o5KgHa ?? facts[index].supply?.p2o5KgHa ?? null,
        k2o_kg_ha: item.k2oKgHa ?? facts[index].supply?.k2oKgHa ?? null,
        nitrogen_group: facts[index].nitrogenGroup,
        is_livestock_manure: facts[index].isLivestockManure,
        batch: item.batch ?? null,
        warehouse: item.warehouse ?? null,
        notes: item.notes ?? null,
        position: index,
      }))
    )

    const { error: itemsError } = await supabase.from('application_items').insert(itemRows)

    if (itemsError) {
      console.error('Chyba při hromadném ukládání položek:', itemsError)
      // Rozepsané aplikace bez položek by zůstaly v evidenci jako prázdné
      await supabase
        .from('applications')
        .delete()
        .eq('user_id', user.id)
        .in(
          'id',
          prepared.map(({ id }) => id)
        )
      return { success: false, error: 'Položky aplikací se nepodařilo uložit' }
    }

    const checked = await runChecksForApplications(
      supabase,
      user.id,
      prepared.map(({ id }) => id)
    )

    const results: BatchTargetResult[] = prepared
      .map(({ id, target }) => ({
        applicationId: id,
        cropParcelId: target.cropParcelId,
        parcelName: parcelNames.get(target.cropParcelId) ?? '—',
        appliedArea: target.appliedArea,
        checkStatus: checked.statuses[id] ?? 'unchecked',
        findings: checked.findings[id] ?? [],
      }))
      .sort((a, b) => a.parcelName.localeCompare(b.parcelName, 'cs'))

    revalidatePath('/portal/hnojiva-por/evidence')

    return {
      success: true,
      created: results.length,
      errorCount: results.filter((result) => result.checkStatus === 'error').length,
      warningCount: results.filter((result) => result.checkStatus === 'warning').length,
      results,
    }
  } catch (error) {
    console.error('Neočekávaná chyba hromadného zápisu evidence:', error)
    return { success: false, error: 'Aplikace se nepodařilo uložit' }
  }
}

export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Chyba při mazání aplikace:', error)
      return { success: false, error: 'Aplikaci se nepodařilo smazat' }
    }

    revalidatePath('/portal/hnojiva-por/evidence')
    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba mazání aplikace:', error)
    return { success: false, error: 'Aplikaci se nepodařilo smazat' }
  }
}

export interface RecheckResult {
  success: boolean
  error?: string
  checked?: number
  errors?: number
  warnings?: number
}

/** Přepočítá kontroly u celé evidence (nebo u vybraných aplikací). */
export async function recheckApplications(applicationIds?: string[]): Promise<RecheckResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    // Bez výběru se přepočítá celá evidence
    const ids = applicationIds && applicationIds.length > 0 ? applicationIds : null

    const result = await runChecksForApplications(supabase, user.id, ids)

    const statuses = Object.values(result.statuses)

    revalidatePath('/portal/hnojiva-por/evidence')

    return {
      success: true,
      checked: statuses.length,
      errors: statuses.filter((status) => status === 'error').length,
      warnings: statuses.filter((status) => status === 'warning').length,
    }
  } catch (error) {
    console.error('Neočekávaná chyba kontroly evidence:', error)
    return { success: false, error: 'Kontrolu se nepodařilo dokončit' }
  }
}