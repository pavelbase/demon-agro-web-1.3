import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * API Route: Získání plánu vápnění
 * GET /api/portal/liming-plans/[planId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Načtení plánu s aplikacemi
    const { data: plan, error: planError } = await supabase
      .from('liming_plans')
      .select(`
        *,
        applications:liming_applications(*)
      `)
      .eq('id', params.planId)
      .single()
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plán nenalezen' },
        { status: 404 }
      )
    }
    
    // Ověření vlastnictví přes parcel
    const { data: parcel } = await supabase
      .from('parcels')
      .select('user_id')
      .eq('id', plan.parcel_id)
      .single()
    
    if (!parcel || parcel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění zobrazit tento plán' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ plan })
    
  } catch (error) {
    console.error('Error fetching liming plan:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání plánu' },
      { status: 500 }
    )
  }
}

/**
 * API Route: Aktualizace plánu vápnění
 * PATCH /api/portal/liming-plans/[planId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const updates = await request.json()
    
    // Ověření vlastnictví
    const { data: plan } = await supabase
      .from('liming_plans')
      .select('parcel_id, parcels!inner(user_id)')
      .eq('id', params.planId)
      .single()
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plán nenalezen' },
        { status: 404 }
      )
    }
    
    const parcel = plan.parcels as any
    if (parcel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění upravit tento plán' },
        { status: 403 }
      )
    }
    
    // Aktualizace
    const { error: updateError } = await supabase
      .from('liming_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.planId)
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Chyba při aktualizaci: ' + updateError.message },
        { status: 500 }
      )
    }
    
    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_plan_updated',
        entity_type: 'liming_plan',
        entity_id: params.planId,
        details: { updates }
      })
    
    revalidatePath(`/portal/pozemky/${plan.parcel_id}/plan-vapneni`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Plán byl aktualizován'
    })
    
  } catch (error) {
    console.error('Error updating liming plan:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci plánu' },
      { status: 500 }
    )
  }
}

/**
 * API Route: Smazání plánu vápnění
 * DELETE /api/portal/liming-plans/[planId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Ověření vlastnictví
    const { data: plan } = await supabase
      .from('liming_plans')
      .select('parcel_id, parcels!inner(user_id)')
      .eq('id', params.planId)
      .single()
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plán nenalezen' },
        { status: 404 }
      )
    }
    
    const parcel = plan.parcels as any
    if (parcel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění smazat tento plán' },
        { status: 403 }
      )
    }
    
    // Smazání plánu (cascade smaže i aplikace)
    const { error: deleteError } = await supabase
      .from('liming_plans')
      .delete()
      .eq('id', params.planId)
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Chyba při mazání: ' + deleteError.message },
        { status: 500 }
      )
    }
    
    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_plan_deleted',
        entity_type: 'liming_plan',
        entity_id: params.planId,
        details: { parcel_id: plan.parcel_id }
      })
    
    revalidatePath(`/portal/pozemky/${plan.parcel_id}/plan-vapneni`)
    revalidatePath(`/portal/pozemky/${plan.parcel_id}`)
    revalidatePath('/portal/plany-vapneni')
    
    return NextResponse.json({ 
      success: true,
      message: 'Plán byl smazán'
    })
    
  } catch (error) {
    console.error('Error deleting liming plan:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání plánu' },
      { status: 500 }
    )
  }
}

