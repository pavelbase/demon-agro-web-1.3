'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { saveApplication, type SaveApplicationResult } from '@/lib/actions/applications'

/**
 * Zápis aplikace přímo z provozu a jeho schválení
 *
 * Obsluha na poli zadává jen to, co bezpečně ví: parcelu, datum, produkt a
 * dávku. Ošetřená výměra se bere z parcely a osev z nejnovější sezóny, protože
 * na telefonu v traktoru se tyhle údaje dohledávají špatně a v drtivé většině
 * případů jsou správně – schvalovatel je stejně vidí a může je opravit.
 *
 * Záznam se ukládá do stejné tabulky jako evidence, ale ve stavu 'ceka'.
 * Do evidenční knihy, bilancí a výkazů se dostane až schválením.
 */

const fieldItemSchema = z.object({
  kind: z.enum(['hnojivo', 'por', 'pomocna']),
  productName: z.string().min(1, 'Vyberte produkt').max(300),
  porItemId: z.number().int().positive().nullable().optional(),
  fertEvidenceNumber: z.string().max(50).nullable().optional(),
  dose: z.number().positive('Zadejte dávku'),
  unit: z.string().min(1).max(20),
})

const fieldLogSchema = z.object({
  cropParcelId: z.string().uuid('Vyberte parcelu'),
  applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Zadejte datum aplikace'),
  /** Bez zadání se použije výměra parcely */
  appliedArea: z.number().positive().max(100_000).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  items: z.array(fieldItemSchema).min(1, 'Přidejte alespoň jedno hnojivo nebo přípravek'),
})

export type SaveFieldLogPayload = z.input<typeof fieldLogSchema>

export async function saveFieldLog(payload: SaveFieldLogPayload): Promise<SaveApplicationResult> {
  const parsed = fieldLogSchema.safeParse(payload)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatný zápis' }
  }

  const input = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { data: parcel } = await supabase
      .from('crop_parcels')
      .select('id, area, crops:parcel_crops(id, season)')
      .eq('id', input.cropParcelId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!parcel) return { success: false, error: 'Parcela nebyla nalezena' }

    // Osev poslední sezóny – na poli se plodina nevybírá, ale kontroly
    // (registrované použití, ochranná lhůta) ji potřebují
    const parcelCropId =
      [...((parcel.crops ?? []) as { id: string; season: number }[])].sort(
        (a, b) => b.season - a.season
      )[0]?.id ?? null

    return await saveApplication({
      cropParcelId: input.cropParcelId,
      parcelCropId,
      applicationDate: input.applicationDate,
      appliedArea: input.appliedArea ?? Number(parcel.area),
      mode: 'skutecnost',
      notes: input.notes ?? null,
      items: input.items,
      recordStatus: 'ceka',
      source: 'pole',
    })
  } catch (error) {
    console.error('Neočekávaná chyba zápisu z pole:', error)
    return { success: false, error: 'Zápis se nepodařilo uložit' }
  }
}

export interface ApproveFieldLogsResult {
  success: boolean
  error?: string
  approved?: number
}

/**
 * Propíše vybrané zápisy z pole do evidenční knihy.
 *
 * Zjištění kontrol schválení nebrání – stejně jako u zápisu v kanceláři musí
 * evidence odpovídat skutečnosti a problém zůstane u záznamu vyznačený.
 */
export async function approveFieldLogs(ids: string[]): Promise<ApproveFieldLogsResult> {
  if (ids.length === 0) return { success: false, error: 'Nevybrali jste žádný zápis' }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { data, error } = await supabase
      .from('applications')
      .update({ record_status: 'schvaleno', approved_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('record_status', 'ceka')
      .in('id', ids)
      .select('id')

    if (error) {
      console.error('Chyba při schvalování zápisů z pole:', error)
      return { success: false, error: 'Zápisy se nepodařilo schválit' }
    }

    revalidatePath('/portal/hnojiva-por/evidence')
    revalidatePath('/portal/hnojiva-por/schvaleni')

    return { success: true, approved: data?.length ?? 0 }
  } catch (error) {
    console.error('Neočekávaná chyba schvalování zápisů:', error)
    return { success: false, error: 'Zápisy se nepodařilo schválit' }
  }
}

/** Zahodí zápis z pole – chybný záznam se do evidence nepropisuje. */
export async function discardFieldLogs(ids: string[]): Promise<ApproveFieldLogsResult> {
  if (ids.length === 0) return { success: false, error: 'Nevybrali jste žádný zápis' }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { data, error } = await supabase
      .from('applications')
      .delete()
      .eq('user_id', user.id)
      // Pojistka, aby se přes frontu nedal smazat už zaevidovaný záznam
      .eq('record_status', 'ceka')
      .in('id', ids)
      .select('id')

    if (error) {
      console.error('Chyba při mazání zápisů z pole:', error)
      return { success: false, error: 'Zápisy se nepodařilo smazat' }
    }

    revalidatePath('/portal/hnojiva-por/schvaleni')

    return { success: true, approved: data?.length ?? 0 }
  } catch (error) {
    console.error('Neočekávaná chyba mazání zápisů:', error)
    return { success: false, error: 'Zápisy se nepodařilo smazat' }
  }
}
