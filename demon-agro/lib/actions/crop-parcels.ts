'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server actions pro evidenční parcely a osevy
 *
 * Parcela je evidenční jednotka uvnitř dílu půdního bloku (jako „parcela /
 * objekt" v EPH). Osev drží plodinu v sezóně a termíny setí a sklizně – z nich
 * vychází kontrola ochranných lhůt a smysluplnosti data aplikace.
 */

const parcelSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Zadejte název parcely').max(200),
  area: z.number().positive('Výměra musí být větší než nula').max(100_000),
  landBlockId: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export type SaveCropParcelPayload = z.input<typeof parcelSchema>

export async function saveCropParcel(
  payload: SaveCropParcelPayload
): Promise<{ success: boolean; error?: string; id?: string }> {
  const parsed = parcelSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatná data parcely' }
  }

  const input = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    // Kód bloku se ukládá i textem, aby zůstal dohledatelný po aktualizaci LPIS
    let blockCode: string | null = null
    if (input.landBlockId) {
      const { data: block } = await supabase
        .from('land_blocks')
        .select('dpb_code')
        .eq('id', input.landBlockId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!block) return { success: false, error: 'Díl půdního bloku nebyl nalezen' }
      blockCode = block.dpb_code
    }

    const record = {
      user_id: user.id,
      name: input.name,
      area: input.area,
      land_block_id: input.landBlockId ?? null,
      block_code: blockCode,
      notes: input.notes ?? null,
    }

    if (input.id) {
      const { error } = await supabase
        .from('crop_parcels')
        .update(record)
        .eq('id', input.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Chyba při úpravě parcely:', error)
        return { success: false, error: 'Parcelu se nepodařilo uložit' }
      }

      revalidatePath('/portal/hnojiva-por/parcely')
      return { success: true, id: input.id }
    }

    const { data, error } = await supabase
      .from('crop_parcels')
      .insert(record)
      .select('id')
      .single()

    if (error || !data) {
      const isDuplicate = error?.code === '23505'
      console.error('Chyba při vytváření parcely:', error)
      return {
        success: false,
        error: isDuplicate ? 'Parcela s tímto názvem už existuje' : 'Parcelu se nepodařilo uložit',
      }
    }

    revalidatePath('/portal/hnojiva-por/parcely')
    return { success: true, id: data.id }
  } catch (error) {
    console.error('Neočekávaná chyba ukládání parcely:', error)
    return { success: false, error: 'Parcelu se nepodařilo uložit' }
  }
}

export async function deleteCropParcel(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { count } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('crop_parcel_id', id)
      .eq('user_id', user.id)

    if (count && count > 0) {
      return {
        success: false,
        error: `Parcela má v evidenci ${count} aplikací – smazáním by se ztratily. Nejdřív je smažte nebo přesuňte.`,
      }
    }

    const { error } = await supabase
      .from('crop_parcels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Chyba při mazání parcely:', error)
      return { success: false, error: 'Parcelu se nepodařilo smazat' }
    }

    revalidatePath('/portal/hnojiva-por/parcely')
    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba mazání parcely:', error)
    return { success: false, error: 'Parcelu se nepodařilo smazat' }
  }
}

const cropSchema = z.object({
  id: z.string().uuid().optional(),
  cropParcelId: z.string().uuid('Vyberte parcelu'),
  cropId: z.number().int().positive().nullable().optional(),
  cropName: z.string().min(1, 'Vyberte plodinu').max(200),
  season: z.number().int().min(2000).max(2100),
  sowingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  harvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  variety: z.string().max(200).nullable().optional(),
  area: z.number().positive().max(100_000).nullable().optional(),
  yieldTHa: z.number().min(0).max(1000).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export type SaveParcelCropPayload = z.input<typeof cropSchema>

export async function saveParcelCrop(
  payload: SaveParcelCropPayload
): Promise<{ success: boolean; error?: string; id?: string; recheckedApplications?: number }> {
  const parsed = cropSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatná data osevu' }
  }

  const input = parsed.data

  if (input.sowingDate && input.harvestDate && input.harvestDate < input.sowingDate) {
    return { success: false, error: 'Termín sklizně nemůže být před setím' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const record = {
      user_id: user.id,
      crop_parcel_id: input.cropParcelId,
      crop_id: input.cropId ?? null,
      crop_name: input.cropName,
      season: input.season,
      sowing_date: input.sowingDate ?? null,
      harvest_date: input.harvestDate ?? null,
      variety: input.variety ?? null,
      area: input.area ?? null,
      yield_t_ha: input.yieldTHa ?? null,
      notes: input.notes ?? null,
    }

    let cropId = input.id

    if (cropId) {
      const { error } = await supabase
        .from('parcel_crops')
        .update(record)
        .eq('id', cropId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Chyba při úpravě osevu:', error)
        return { success: false, error: 'Osev se nepodařilo uložit' }
      }
    } else {
      const { data, error } = await supabase
        .from('parcel_crops')
        .insert(record)
        .select('id')
        .single()

      if (error || !data) {
        const isDuplicate = error?.code === '23505'
        console.error('Chyba při vytváření osevu:', error)
        return {
          success: false,
          error: isDuplicate
            ? 'Tato plodina už je na parcele v dané sezóně vedená'
            : 'Osev se nepodařilo uložit',
        }
      }

      cropId = data.id
    }

    // Termíny setí a sklizně jsou vstupem kontrol, takže se dotčené aplikace
    // přepočítají – jinak by u nich zůstal starý výsledek
    const { data: affected } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('parcel_crop_id', cropId)

    const applicationIds = (affected ?? []).map((application) => application.id)

    if (applicationIds.length > 0) {
      const { recheckApplications } = await import('@/lib/actions/applications')
      await recheckApplications(applicationIds)
    }

    revalidatePath('/portal/hnojiva-por/parcely')
    revalidatePath('/portal/hnojiva-por/evidence')

    return { success: true, id: cropId, recheckedApplications: applicationIds.length }
  } catch (error) {
    console.error('Neočekávaná chyba ukládání osevu:', error)
    return { success: false, error: 'Osev se nepodařilo uložit' }
  }
}

export async function deleteParcelCrop(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Uživatel není přihlášen' }

    const { error } = await supabase
      .from('parcel_crops')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Chyba při mazání osevu:', error)
      return { success: false, error: 'Osev se nepodařilo smazat' }
    }

    revalidatePath('/portal/hnojiva-por/parcely')
    return { success: true }
  } catch (error) {
    console.error('Neočekávaná chyba mazání osevu:', error)
    return { success: false, error: 'Osev se nepodařilo smazat' }
  }
}
