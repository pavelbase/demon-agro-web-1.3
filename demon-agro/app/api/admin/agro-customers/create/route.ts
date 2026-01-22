import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

/**
 * POST /api/admin/agro-customers/create
 * Vytvořit nového zákazníka (zakázku)
 * Pouze pro adminy
 */
export async function POST(request: NextRequest) {
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

    // Parse request body (může být prázdné pro nového zákazníka s výchozími hodnotami)
    const body = await request.json().catch(() => ({}))

    // Připravit data s výchozími hodnotami
    const customerData = {
      user_id: user.id,
      jmeno: body.jmeno || 'Nový zákazník',
      vymera_ha: body.vymera_ha ?? 120,
      davka_kg_ha: body.davka_kg_ha ?? 500,
      cena_nakup_material_tuna: body.cena_nakup_material_tuna ?? 610,
      cena_prodej_sluzba_ha: body.cena_prodej_sluzba_ha ?? 780,
      cena_najem_traktor_mth: body.cena_najem_traktor_mth ?? 1200,
      vykonnost_ha_mth: body.vykonnost_ha_mth ?? 10,
      cena_nafta_tuna_materialu: body.cena_nafta_tuna_materialu ?? 70,
      cena_traktorista_mth: body.cena_traktorista_mth ?? 400,
      cena_traktorista_tuna: body.cena_traktorista_tuna ?? 50,
      traktorista_typ: body.traktorista_typ || 'hodina',
      pozadovany_zisk_ha: body.pozadovany_zisk_ha ?? 330,
      pocet_kamionu: body.pocet_kamionu ?? null,
    }

    // Create customer
    const { data: newCustomer, error } = await supabase
      .from('agro_customers')
      .insert(customerData)
      .select()
      .single()

    if (error) {
      throw new Error(`Nepodařilo se vytvořit zákazníka: ${error.message}`)
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Admin vytvořil AgroManažer zákazníka: ${customerData.jmeno}`,
      table_name: 'agro_customers',
      record_id: newCustomer.id,
      new_data: customerData,
    })

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: 'Zákazník byl úspěšně vytvořen',
    })
  } catch (error) {
    console.error('Create agro customer error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}

