import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * API Route: Schválení plánu vápnění
 * PATCH /api/portal/liming-plans/[planId]/approve
 * 
 * Změní status plánu z 'draft' na 'approved'
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Autentizace
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Ověření vlastnictví plánu
    const { data: plan, error: planError } = await supabase
      .from('liming_plans')
      .select(`
        id,
        status,
        parcels!inner(
          id,
          user_id
        )
      `)
      .eq('id', params.planId)
      .single()
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plán nenalezen' },
        { status: 404 }
      )
    }
    
    const parcel = plan.parcels as any
    if (parcel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění' },
        { status: 403 }
      )
    }
    
    // Aktualizace statusu
    const { error: updateError } = await supabase
      .from('liming_plans')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.planId)
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Chyba při schvalování: ' + updateError.message },
        { status: 500 }
      )
    }
    
    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_plan_approved',
        entity_type: 'liming_plan',
        entity_id: params.planId,
        details: {
          plan_id: params.planId
        }
      })
    
    // Revalidace
    revalidatePath(`/portal/pozemky/${parcel.id}/plan-vapneni`)
    revalidatePath('/portal/plany-vapneni')
    
    return NextResponse.json({ 
      success: true,
      message: 'Plán byl schválen'
    })
    
  } catch (error) {
    console.error('Error approving plan:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při schvalování plánu',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}



