import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLimingPlan, type LimingInput } from '@/lib/utils/liming-calculator'
import { revalidatePath } from 'next/cache'

/**
 * API Route: Generování nového plánu vápnění
 * POST /api/portal/liming-plans/generate
 * 
 * Generuje víceLetý plán vápnění na základě vstupních parametrů
 * a dostupných vápenatých produktů.
 */
export async function POST(request: NextRequest) {
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
    // 2. NAČTENÍ VSTUPNÍCH DAT
    // -------------------------------------------------
    
    const body = await request.json()
    const {
      parcelId,
      soilAnalysisId,
      currentPh,
      targetPh,
      soilType,
      landUse,
      currentMg,
      area
    } = body
    
    // Validace povinných polí
    if (!parcelId || !currentPh || !targetPh || !soilType || !area) {
      return NextResponse.json(
        { error: 'Chybí povinná pole (parcelId, currentPh, targetPh, soilType, area)' },
        { status: 400 }
      )
    }
    
    // -------------------------------------------------
    // 3. OVĚŘENÍ VLASTNICTVÍ POZEMKU
    // -------------------------------------------------
    
    const { data: parcel, error: parcelError } = await supabase
      .from('parcels')
      .select('id, user_id, name, area')
      .eq('id', parcelId)
      .eq('user_id', user.id)
      .single()
    
    if (parcelError || !parcel) {
      return NextResponse.json(
        { error: 'Pozemek nenalezen nebo nemáte oprávnění' },
        { status: 403 }
      )
    }
    
    // -------------------------------------------------
    // 4. NAČTENÍ DOSTUPNÝCH PRODUKTŮ
    // -------------------------------------------------
    
    const { data: products, error: productsError } = await supabase
      .from('liming_products')
      .select('*')
      .eq('is_active', true)
      .order('cao_content', { ascending: false })
    
    if (productsError || !products || products.length === 0) {
      return NextResponse.json(
        { error: 'Žádné vápenné produkty k dispozici' },
        { status: 400 }
      )
    }
    
    // Vytvoření mapy produktů s cenami pro pozdější použití
    const productsMap = new Map(products.map(p => [p.id, p]))
    
    // -------------------------------------------------
    // 5. GENEROVÁNÍ PLÁNU
    // -------------------------------------------------
    
    const input: LimingInput = {
      currentPh: parseFloat(currentPh),
      targetPh: parseFloat(targetPh),
      soilType,
      area: parseFloat(area),
      currentMg: parseFloat(currentMg || 100),
      landUse: landUse || 'orna'
    }
    
    const plan = generateLimingPlan(
      input,
      products.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        caoContent: parseFloat(p.cao_content),
        mgoContent: parseFloat(p.mgo_content || 0)
      }))
    )
    
    // -------------------------------------------------
    // 6. KONTROLA STARÉHO PLÁNU
    // -------------------------------------------------
    
    // Pokud existuje starý draft plán, smažeme ho
    const { data: existingPlans } = await supabase
      .from('liming_plans')
      .select('id')
      .eq('parcel_id', parcelId)
      .eq('status', 'draft')
    
    if (existingPlans && existingPlans.length > 0) {
      await supabase
        .from('liming_plans')
        .delete()
        .in('id', existingPlans.map(p => p.id))
    }
    
    // -------------------------------------------------
    // 7. ULOŽENÍ PLÁNU DO DATABÁZE
    // -------------------------------------------------
    
    const { data: limingPlan, error: planError } = await supabase
      .from('liming_plans')
      .insert({
        parcel_id: parcelId,
        soil_analysis_id: soilAnalysisId || null,
        current_ph: input.currentPh,
        target_ph: input.targetPh,
        soil_type: input.soilType,
        land_use: input.landUse,
        current_mg: input.currentMg,
        total_ca_need: plan.totalCaNeed,
        total_cao_need: plan.totalCaoNeed,
        total_ca_need_per_ha: plan.totalCaNeedPerHa,
        total_cao_need_per_ha: plan.totalCaoNeedPerHa,
        status: 'draft'
      })
      .select()
      .single()
    
    if (planError) {
      console.error('Error inserting liming plan:', planError)
      return NextResponse.json(
        { error: 'Chyba při ukládání plánu: ' + planError.message },
        { status: 500 }
      )
    }
    
    // -------------------------------------------------
    // 8. ULOŽENÍ APLIKACÍ
    // -------------------------------------------------
    // NOVÉ: Podporujeme více produktů v jedné aplikaci
    // Vytvoříme samostatný záznam pro každý produkt
    
    if (plan.applications.length > 0) {
      const applicationsToInsert: any[] = []
      
      plan.applications.forEach(app => {
        // Pokud existuje pole products[], vytvoř záznam pro každý produkt
        if (app.products && app.products.length > 0) {
          app.products.forEach((productDose, subIndex) => {
            const productData = productsMap.get(productDose.product.id)
            const productPrice = productData?.price_per_ton || null
            
            applicationsToInsert.push({
              liming_plan_id: limingPlan.id,
              year: app.year,
              season: app.season,
              sequence_order: app.sequenceOrder * 100 + subIndex, // 100, 101, 102 pro sub-produkty (celá čísla!)
              lime_product_id: productDose.product.id,
              product_name: productDose.product.name,
              cao_content: productDose.product.caoContent,
              mgo_content: productDose.product.mgoContent,
              dose_per_ha: productDose.dosePerHa,
              total_dose: productDose.totalDose,
              cao_per_ha: productDose.caoPerHa,  // Správná hodnota pro tento produkt
              mgo_per_ha: productDose.mgoPerHa,
              ph_before: app.phBefore,
              ph_after: app.phAfter,  // Stejné pro všechny produkty v aplikaci
              mg_after: app.mgAfter || null,
              notes: subIndex === 0 ? app.recommendation : `Doplňkový produkt v aplikaci ${app.sequenceOrder}`,
              status: 'planned',
              product_price_per_ton: productPrice
            })
          })
        } else {
          // Fallback: jen jeden produkt (backward compatibility)
          const productData = productsMap.get(app.product.id)
          const productPrice = productData?.price_per_ton || null
          
          applicationsToInsert.push({
            liming_plan_id: limingPlan.id,
            year: app.year,
            season: app.season,
            sequence_order: app.sequenceOrder * 100, // Také × 100 pro konzistenci
            lime_product_id: app.product.id,
            product_name: app.product.name,
            cao_content: app.product.caoContent,
            mgo_content: app.product.mgoContent,
            dose_per_ha: app.dosePerHa,
            total_dose: app.totalDose,
            cao_per_ha: app.caoPerHa,
            mgo_per_ha: app.mgoPerHa,
            ph_before: app.phBefore,
            ph_after: app.phAfter,
            mg_after: app.mgAfter || null,
            notes: app.recommendation,
            status: 'planned',
            product_price_per_ton: productPrice
          })
        }
      })
      
      const { error: appsError } = await supabase
        .from('liming_applications')
        .insert(applicationsToInsert)
      
      if (appsError) {
        console.error('Error inserting applications:', appsError)
        // Pokud se nepodaří uložit aplikace, smažeme i plán
        await supabase.from('liming_plans').delete().eq('id', limingPlan.id)
        
        return NextResponse.json(
          { error: 'Chyba při ukládání aplikací: ' + appsError.message },
          { status: 500 }
        )
      }
    }
    
    // -------------------------------------------------
    // 9. AUDIT LOG
    // -------------------------------------------------
    
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_plan_generated',
        entity_type: 'liming_plan',
        entity_id: limingPlan.id,
        details: {
          parcel_id: parcelId,
          parcel_name: parcel.name,
          current_ph: input.currentPh,
          target_ph: input.targetPh,
          applications_count: plan.applications.length,
          total_cao_need: plan.totalCaoNeed
        }
      })
    
    // -------------------------------------------------
    // 10. REVALIDACE CACHŮ
    // -------------------------------------------------
    
    revalidatePath('/portal/pozemky')
    revalidatePath(`/portal/pozemky/${parcelId}`)
    revalidatePath(`/portal/pozemky/${parcelId}/plan-vapneni`)
    
    // -------------------------------------------------
    // 11. VRÁCENÍ ODPOVĚDI
    // -------------------------------------------------
    
    return NextResponse.json({ 
      success: true, 
      planId: limingPlan.id,
      warnings: plan.warnings,
      applicationsCount: plan.applications.length,
      totalCaoNeed: plan.totalCaoNeed
    })
    
  } catch (error) {
    console.error('Error generating liming plan:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při generování plánu',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}

