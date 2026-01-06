import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePhChange } from '@/lib/utils/liming-calculator'
import { recalculateAllApplications } from '@/lib/utils/liming-recalculation'
import { revalidatePath } from 'next/cache'

/**
 * API Route: Přidání nové aplikace do plánu
 * POST /api/portal/liming-plans/[planId]/applications
 */
export async function POST(
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
    
    const body = await request.json()
    const {
      year,
      season,
      limeProductId,
      dosePerHa
    } = body
    
    // Validace
    if (!year || !season || !limeProductId || !dosePerHa) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
        { status: 400 }
      )
    }
    
    // Načti plán a ověř vlastnictví
    const { data: plan, error: planError } = await supabase
      .from('liming_plans')
      .select(`
        id,
        parcel_id,
        soil_type,
        parcels!inner(
          id,
          user_id,
          area,
          culture
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
    
    // Načti produkt
    const { data: product, error: productError } = await supabase
      .from('liming_products')
      .select('*')
      .eq('id', limeProductId)
      .single()
    
    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produkt nenalezen' },
        { status: 404 }
      )
    }
    
    // Najdi aplikaci PŘED nově vkládanou (podle roku a sezóny)
    const { data: allApps } = await supabase
      .from('liming_applications')
      .select('*')
      .eq('liming_plan_id', params.planId)
      .order('year', { ascending: true })
    
    // Seřaď podle času (rok + sezóna: jaro < léto < podzim)
    const seasonOrder: Record<string, number> = { jaro: 1, leto: 2, podzim: 3 }
    const sortedApps = (allApps || []).sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year
      return seasonOrder[a.season] - seasonOrder[b.season]
    })
    
    // Najdi aplikaci ČASOVĚ PŘED nově vkládanou
    const newAppTime = year * 10 + seasonOrder[season]
    let previousApp = null
    
    for (let i = sortedApps.length - 1; i >= 0; i--) {
      const appTime = sortedApps[i].year * 10 + seasonOrder[sortedApps[i].season]
      if (appTime < newAppTime) {
        previousApp = sortedApps[i]
        break
      }
    }
    
    // Výpočet pH před novou aplikací S ACIDIFIKACÍ od předchozí aplikace
    let phBefore: number
    if (!previousApp) {
      // První aplikace v plánu
      phBefore = 5.0
    } else {
      // Roční pokles pH podle typu půdy
      const annualPhDrop = plan.soil_type === 'L' ? 0.09 : 
                           plan.soil_type === 'S' ? 0.07 : 0.04
      
      // Časový odstup od předchozí aplikace
      const yearsGap = year - previousApp.year
      
      if (yearsGap === 0) {
        // Více aplikací ve stejném roce - ŽÁDNÁ acidifikace
        phBefore = previousApp.ph_after
      } else {
        // pH klesá kvůli acidifikaci mezi roky
        phBefore = previousApp.ph_after - (yearsGap * annualPhDrop)
        phBefore = Math.max(phBefore, 3.5) // Minimální pH
      }
    }
    
    // DŮLEŽITÉ: Najdeme správné sequence_order podle časové posloupnosti
    // Vložíme novou aplikaci MEZI existující aplikace podle roku a sezóny
    let sequenceOrder = 1
    for (let i = 0; i < sortedApps.length; i++) {
      const appTime = sortedApps[i].year * 10 + seasonOrder[sortedApps[i].season]
      if (appTime < newAppTime) {
        sequenceOrder = sortedApps[i].sequence_order + 1
      }
    }
    
    // Pokud je to poslední aplikace, dej ji sequence_order větší než všechny ostatní
    if (sortedApps.length > 0 && sequenceOrder <= sortedApps[sortedApps.length - 1].sequence_order) {
      // Aplikace bude uprostřed - použijeme dočasný vysoký sequence_order a pak přečíslujeme
      sequenceOrder = 9999
    }
    
    // Výpočty
    const totalDose = dosePerHa * parcel.area
    const caoPerHa = dosePerHa * (product.cao_content / 100)
    const mgoPerHa = dosePerHa * (product.mgo_content / 100)
    
    // pH změna
    const soilDetailType = plan.soil_type === 'L' ? 'hlinitopiscita' : 
                           plan.soil_type === 'S' ? 'hlinita' : 'jilovitohlinita'
    const phChange = calculatePhChange(caoPerHa, soilDetailType as any, phBefore)
    const phAfter = Math.min(phBefore + phChange, 8.0)
    
    // Mg změna (zjednodušeně)
    const mgAfter = previousApp?.mg_after ? 
      previousApp.mg_after + (mgoPerHa * 70) : null
    
    // Cílové pH podle kultury
    const targetPh = parcel.culture === 'orna' ? 6.5 : 6.0
    
    // Doporučení podle metodiky
    const { generateLimingRecommendation } = await import('@/lib/utils/liming-recommendations')
    const recommendation = generateLimingRecommendation(
      phBefore,
      phAfter,
      targetPh,
      mgAfter,
      mgoPerHa
    )
    
    // Vlož novou aplikaci
    const { data: newApp, error: insertError } = await supabase
      .from('liming_applications')
      .insert({
        liming_plan_id: params.planId,
        year,
        season,
        sequence_order: sequenceOrder,
        lime_product_id: limeProductId,
        product_name: product.name,
        cao_content: product.cao_content,
        mgo_content: product.mgo_content,
        dose_per_ha: dosePerHa,
        total_dose: totalDose,
        cao_per_ha: caoPerHa,
        mgo_per_ha: mgoPerHa,
        ph_before: phBefore,
        ph_after: phAfter,
        mg_after: mgAfter,
        notes: recommendation,
        status: 'planned',
        product_price_per_ton: product.price_per_ton || null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting application:', insertError)
      return NextResponse.json(
        { error: 'Chyba při ukládání: ' + insertError.message },
        { status: 500 }
      )
    }
    
    // -------------------------------------------------
    // PŘEČÍSLOVÁNÍ SEQUENCE_ORDER
    // -------------------------------------------------
    // Po vložení nové aplikace musíme všechny aplikace přečíslovat
    // podle správného časového pořadí (rok + sezóna)
    
    const { data: allAppsNow } = await supabase
      .from('liming_applications')
      .select('*')
      .eq('liming_plan_id', params.planId)
    
    if (allAppsNow) {
      // Seřaď podle času (rok + sezóna)
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
    
    // -------------------------------------------------
    // KASKÁDOVÝ PŘEPOČET s acidifikací
    // -------------------------------------------------
    // Aktualizuj všechny NÁSLEDUJÍCÍ aplikace s respektováním
    // přirozené acidifikace mezi roky
    // Po přečíslování voláme přepočet OD ZAČÁTKU (aby byly správné pořadí)
    
    await recalculateAllApplications(
      supabase,
      params.planId,
      plan.soil_type as 'L' | 'S' | 'T'
    )
    
    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'liming_application_created',
        entity_type: 'liming_application',
        entity_id: params.planId,
        details: {
          plan_id: params.planId,
          year,
          season,
          product_name: product.name,
          dose_per_ha: dosePerHa
        }
      })
    
    // Revalidace
    revalidatePath(`/portal/pozemky/${parcel.id}/plan-vapneni`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Aplikace byla přidána'
    })
    
  } catch (error) {
    console.error('Error adding application:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při přidávání aplikace',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}

