'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParcelInsert } from '@/lib/types/database'

export type ParcelActionResult = {
  success: boolean
  error?: string
  data?: any
}

/**
 * Create a new parcel
 */
export async function createParcel(data: Omit<ParcelInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ParcelActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    const { data: parcel, error } = await supabase
      .from('parcels')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Create parcel error:', error)
      return {
        success: false,
        error: 'Nepodařilo se vytvořit pozemek. Zkuste to prosím znovu.',
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Vytvořen pozemek: ${data.name}`,
      table_name: 'parcels',
      record_id: parcel.id,
      new_data: parcel,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')

    return {
      success: true,
      data: parcel,
    }
  } catch (error) {
    console.error('Create parcel error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Update a parcel
 */
export async function updateParcel(id: string, data: Partial<Omit<ParcelInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ParcelActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    // Check ownership
    const { data: existingParcel } = await supabase
      .from('parcels')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!existingParcel || existingParcel.user_id !== user.id) {
      return {
        success: false,
        error: 'Pozemek nenalezen nebo nemáte oprávnění',
      }
    }

    const { data: parcel, error } = await supabase
      .from('parcels')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update parcel error:', error)
      return {
        success: false,
        error: 'Nepodařilo se aktualizovat pozemek. Zkuste to prosím znovu.',
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Aktualizován pozemek: ${parcel.name}`,
      table_name: 'parcels',
      record_id: parcel.id,
      new_data: parcel,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')
    revalidatePath(`/portal/pozemky/${id}`)

    return {
      success: true,
      data: parcel,
    }
  } catch (error) {
    console.error('Update parcel error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}

/**
 * Delete (archive) a parcel
 */
export async function deleteParcel(id: string): Promise<ParcelActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Uživatel není přihlášen',
      }
    }

    // Check ownership
    const { data: existingParcel } = await supabase
      .from('parcels')
      .select('id, user_id, name')
      .eq('id', id)
      .single()

    if (!existingParcel || existingParcel.user_id !== user.id) {
      return {
        success: false,
        error: 'Pozemek nenalezen nebo nemáte oprávnění',
      }
    }

    // Soft delete by adding a deleted_at timestamp or archive flag
    // For now, we'll actually delete (can be changed to soft delete later)
    const { error } = await supabase
      .from('parcels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete parcel error:', error)
      return {
        success: false,
        error: 'Nepodařilo se smazat pozemek. Zkuste to prosím znovu.',
      }
    }

    // Log action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Smazán pozemek: ${existingParcel.name}`,
      table_name: 'parcels',
      record_id: id,
    })

    revalidatePath('/portal/pozemky')
    revalidatePath('/portal/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Delete parcel error:', error)
    return {
      success: false,
      error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
    }
  }
}
