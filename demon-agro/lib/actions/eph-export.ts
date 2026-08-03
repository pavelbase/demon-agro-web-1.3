'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildEphExportForUser, type EphExportResult } from '@/lib/database/eph-export'

/**
 * Server actions exportu evidence do EPH
 *
 * Soubor se skládá na serveru – potřebuje číselník hnojiv, číselník plodin
 * i atributy dílů půdních bloků, které klient nemá. Klient dostane hotový text
 * a uloží ho jako soubor.
 */

const rangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Zadejte datum od'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Zadejte datum do'),
})

const szrSchema = z
  .string()
  .trim()
  .max(50, 'Identifikátor je příliš dlouhý')
  // Jednotný identifikátor ze SZR je číselný; písmena by znamenala překlep
  .regex(/^\d*$/, 'Identifikátor subjektu ze SZR je číslo')

export interface EphExportActionResult {
  success: boolean
  error?: string
  data?: EphExportResult
}

/** Uloží identifikátor subjektu ze SZR k profilu. */
export async function saveSzrId(value: string): Promise<{ success: boolean; error?: string }> {
  const parsed = szrSchema.safeParse(value)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatný identifikátor' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Nejste přihlášeni' }

  const { error } = await supabase
    .from('profiles')
    .update({ szr_id: parsed.data.length > 0 ? parsed.data : null })
    .eq('id', user.id)

  if (error) {
    console.error('Chyba při ukládání identifikátoru SZR:', error)
    return { success: false, error: 'Identifikátor se nepodařilo uložit' }
  }

  revalidatePath('/portal/hnojiva-por/evidence')
  return { success: true }
}

/**
 * Sestaví soubor evidence za období.
 *
 * Vrací se i tehdy, když se nic vyexportovat nedá – seznam zjištění je pak to
 * podstatné, protože říká, co v evidenci doplnit.
 */
export async function buildEphExport(input: {
  from: string
  to: string
}): Promise<EphExportActionResult> {
  const parsed = rangeSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Neplatné období' }
  }

  if (parsed.data.from > parsed.data.to) {
    return { success: false, error: 'Datum od musí být dřív než datum do' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Nejste přihlášeni' }

    const data = await buildEphExportForUser(supabase, user.id, parsed.data.from, parsed.data.to)
    return { success: true, data }
  } catch (error) {
    console.error('Chyba při sestavení exportu do EPH:', error)
    return { success: false, error: 'Export se nepodařilo sestavit' }
  }
}
