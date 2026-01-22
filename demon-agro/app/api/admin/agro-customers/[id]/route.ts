import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

/**
 * PUT /api/admin/agro-customers/[id]
 * Aktualizovat zákazníka
 * Pouze pro adminy
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await requireAuth()
    const supabase = await createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const customerId = params.id

    // Parse request body
    const body = await request.json()

    // Get old data for audit log
    const { data: oldCustomer } = await supabase
      .from('agro_customers')
      .select('*')
      .eq('id', customerId)
      .single()

    // Připravit data k aktualizaci (pouze poskytnutá pole)
    const updateData: any = {}
    
    if (body.jmeno !== undefined) updateData.jmeno = body.jmeno
    if (body.vymera_ha !== undefined) updateData.vymera_ha = Number(body.vymera_ha)
    if (body.davka_kg_ha !== undefined) updateData.davka_kg_ha = Number(body.davka_kg_ha)
    if (body.cena_nakup_material_tuna !== undefined) updateData.cena_nakup_material_tuna = Number(body.cena_nakup_material_tuna)
    if (body.cena_prodej_sluzba_ha !== undefined) updateData.cena_prodej_sluzba_ha = Number(body.cena_prodej_sluzba_ha)
    if (body.cena_najem_traktor_mth !== undefined) updateData.cena_najem_traktor_mth = Number(body.cena_najem_traktor_mth)
    if (body.vykonnost_ha_mth !== undefined) updateData.vykonnost_ha_mth = Number(body.vykonnost_ha_mth)
    if (body.cena_nafta_tuna_materialu !== undefined) updateData.cena_nafta_tuna_materialu = Number(body.cena_nafta_tuna_materialu)

    // Update customer
    const { data: updatedCustomer, error } = await supabase
      .from('agro_customers')
      .update(updateData)
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      throw new Error(`Nepodařilo se aktualizovat zákazníka: ${error.message}`)
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin aktualizoval AgroManažer zákazníka: ${updatedCustomer.jmeno}`,
      table_name: 'agro_customers',
      record_id: customerId,
      old_data: oldCustomer,
      new_data: updatedCustomer,
    })

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      message: 'Zákazník byl úspěšně aktualizován',
    })
  } catch (error) {
    console.error('Update agro customer error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/agro-customers/[id]
 * Smazat zákazníka
 * Pouze pro adminy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await requireAuth()
    const supabase = await createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const customerId = params.id

    // Get customer data for audit log
    const { data: customer } = await supabase
      .from('agro_customers')
      .select('*')
      .eq('id', customerId)
      .single()

    // Delete customer
    const { error } = await supabase
      .from('agro_customers')
      .delete()
      .eq('id', customerId)

    if (error) {
      throw new Error(`Nepodařilo se smazat zákazníka: ${error.message}`)
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin smazal AgroManažer zákazníka: ${customer?.jmeno || 'Neznámý'}`,
      table_name: 'agro_customers',
      record_id: customerId,
      old_data: customer,
    })

    return NextResponse.json({
      success: true,
      message: 'Zákazník byl úspěšně smazán',
    })
  } catch (error) {
    console.error('Delete agro customer error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}

