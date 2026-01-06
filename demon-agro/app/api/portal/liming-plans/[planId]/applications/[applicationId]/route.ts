import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { recalculateAllApplications } from '@/lib/utils/liming-recalculation'

/**
 * API Route: Aktualizace aplikace vápna
 * PATCH /api/portal/liming-plans/[planId]/applications/[applicationId]
 * 
 * Umožňuje uživateli upravit parametry konkrétní aplikace
 * (rok, sezónu, dávku, status, atd.)
 * 
 * NOVĚ: Automaticky přepočítává všechny následující aplikace
 * s respektováním přirozené acidifikace mezi roky.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { planId: string; applicationId: string } }
) {
  try {
    const supabase = await createClient()
    
    // -------------------------------------------------
    // 1. AUTENTIZACE
    // -------------------------------------------------
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // -------------------------------------------------
    // 2. NAČTENÍ AKTUALIZACÍ
    // -------------------------------------------------
    
    const updates = await request.json()
    
    // -------------------------------------------------
    // 3. OVĚŘENÍ VLASTNICTVÍ A NAČTENÍ PLÁNU
    // -------------------------------------------------
    
    // Ověříme, že aplikace patří plánu a plán patří uživateli
    const { data: application, error: appError } = await supabase
      .from('liming_applications')
      .select(`
        id,
        liming_plan_id,
        liming_plans!inner(
          id,
          parcel_id,
          soil_type,
          parcels!inner(
            id,
            user_id
          )
        )
      `)
      .eq('id', params.applicationId)
      .eq('liming_plan_id', params.planId)
      .single()
    
    if (appError || !application) {
      return NextResponse.json(
        { error: 'Aplikace nenalezena' },
        { status: 404 }
      )
    }
    
    // TypeScript workaround pro vnořené objekty
    const plan = application.liming_plans as any
    const parcel = plan.parcels as any
    
    if (parcel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění upravovat tuto aplikaci' },
        { status: 403 }
      )
    }
    
    // -------------------------------------------------
    // 4. AKTUALIZACE APLIKACE
    // -------------------------------------------------
    
    const { error: updateError } = await supabase
      .from('liming_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.applicationId)
      .eq('liming_plan_id', params.planId)
    
    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json(
        { error: 'Chyba při aktualizaci: ' + updateError.message },
        { status: 500 }
      )
    }
    
    // -------------------------------------------------
    // 5. PŘEČÍSLOVÁNÍ PŘI ZMĚNĚ ROKU NEBO SEZÓNY
    // -------------------------------------------------
    
    // Pokud se změnil rok nebo sezóna, musíme přečíslovat všechny aplikace
    const shouldReorder = updates.year !== undefined || updates.season !== undefined
    
    if (shouldReorder) {
      const { data: allAppsNow } = await supabase
        .from('liming_applications')
        .select('*')
        .eq('liming_plan_id', params.planId)
      
      if (allAppsNow) {
        // Seřaď podle času (rok + sezóna)
        const seasonOrder: Record<string, number> = { jaro: 1, leto: 2, podzim: 3 }
        const reorderedApps = allAppsNow.sort((a: any, b: any) => {
          if (a.year !== b.year) return a.year - b.year
          return seasonOrder[a.season] - seasonOrder[b.season]
        })
        
        // Aktualizuj sequence_order pro všechny aplikace
        for (let i = 0; i < reorderedApps.length; i++) {
          const newSeqOrder = i + 1
          if (reorderedApps[i].sequence_order !== newSeqOrder) {
            await supabase
              .from('liming_applications')
              .update({ sequence_order: newSeqOrder })
              .eq('id', reorderedApps[i].id)
          }
        }
      }
    }
    
    // -------------------------------------------------
    // 6. KASKÁDOVÝ PŘEPOČET NÁSLEDUJÍCÍCH APLIKACÍ
    // -------------------------------------------------
    
    // Pokud se změnilo pH nebo rok, přepočítáme všechny aplikace
    const shouldRecalculate = updates.year !== undefined || 
                              updates.season !== undefined ||
                              updates.ph_after !== undefined ||
                              updates.cao_per_ha !== undefined ||
                              updates.dose_per_ha !== undefined
    
    if (shouldRecalculate) {
      const soilType = plan.soil_type as 'L' | 'S' | 'T'
      // Po přečíslování voláme přepočet od začátku aby bylo správné pořadí
      await recalculateAllApplications(
        supabase,
        params.planId,
        soilType
      )
    }
    
    // -------------------------------------------------
    // 7. AUDIT LOG
    // -------------------------------------------------
    
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_application_updated',
        entity_type: 'liming_application',
        entity_id: params.applicationId,
        details: {
          plan_id: params.planId,
          updates,
          recalculated: shouldRecalculate,
          reordered: shouldReorder
        }
      })
    
    // -------------------------------------------------
    // 8. REVALIDACE CACHŮ
    // -------------------------------------------------
    
    const parcelId = plan.parcel_id
    revalidatePath(`/portal/pozemky/${parcelId}/plan-vapneni`)
    
    // -------------------------------------------------
    // 9. VRÁCENÍ ODPOVĚDI
    // -------------------------------------------------
    
    return NextResponse.json({ 
      success: true,
      message: 'Aplikace byla úspěšně aktualizována a pH přepočítáno'
    })
    
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při aktualizaci aplikace',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/portal/liming-plans/[planId]/applications/[applicationId]
 * 
 * Smazání konkrétní aplikace z plánu
 * 
 * NOVĚ: Automaticky přepočítává všechny následující aplikace
 * po smazání, aby reflektovaly novou časovou posloupnost.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string; applicationId: string } }
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
    
    // Ověření vlastnictví a načtení informací o aplikaci
    const { data: application, error: appError } = await supabase
      .from('liming_applications')
      .select(`
        id,
        year,
        liming_plan_id,
        liming_plans!inner(
          id,
          parcel_id,
          soil_type,
          parcels!inner(
            id,
            user_id
          )
        )
      `)
      .eq('id', params.applicationId)
      .eq('liming_plan_id', params.planId)
      .single()
    
    if (appError || !application) {
      return NextResponse.json(
        { error: 'Aplikace nenalezena' },
        { status: 404 }
      )
    }
    
    const plan = application.liming_plans as any
    const parcel = plan.parcels as any
    
    if (parcel.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nemáte oprávnění smazat tuto aplikaci' },
        { status: 403 }
      )
    }
    
    // Uložíme rok smazané aplikace pro přepočet
    const deletedYear = (application as any).year
    const soilType = plan.soil_type as 'L' | 'S' | 'T'
    
    // Smazání aplikace
    const { error: deleteError } = await supabase
      .from('liming_applications')
      .delete()
      .eq('id', params.applicationId)
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Chyba při mazání: ' + deleteError.message },
        { status: 500 }
      )
    }
    
    // -------------------------------------------------
    // KASKÁDOVÝ PŘEPOČET po smazání
    // -------------------------------------------------
    
    const { recalculateAfterDeletion } = await import('@/lib/utils/liming-recalculation')
    await recalculateAfterDeletion(
      supabase,
      params.planId,
      soilType,
      deletedYear
    )
    
    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_application_deleted',
        entity_type: 'liming_application',
        entity_id: params.applicationId,
        details: {
          plan_id: params.planId,
          deleted_year: deletedYear
        }
      })
    
    // Revalidace
    const parcelId = plan.parcel_id
    revalidatePath(`/portal/pozemky/${parcelId}/plan-vapneni`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Aplikace byla smazána a pH přepočítáno'
    })
    
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při mazání aplikace',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}


