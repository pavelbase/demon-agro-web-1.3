/**
 * Utility pro kaskádový přepočet pH hodnot v plánu vápnění
 * 
 * Zajišťuje správný přepočet ph_before a ph_after pro všechny aplikace
 * s respektováním přirozené acidifikace mezi roky.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { calculatePhChange } from './liming-calculator'
import { generateLimingRecommendation } from './liming-recommendations'

/**
 * Roční pokles pH podle typu půdy
 */
const ANNUAL_PH_DROP = {
  L: 0.09, // lehká půda
  S: 0.07, // střední půda
  T: 0.04  // těžká půda
}


interface Application {
  id: string
  year: number
  season: 'jaro' | 'leto' | 'podzim'
  cao_per_ha: number
  ph_before: number
  ph_after: number
}

/**
 * Přepočítá všechny aplikace v plánu s respektováním acidifikace
 * 
 * @param supabase - Supabase client
 * @param planId - ID plánu vápnění
 * @param soilType - Typ půdy (L/S/T)
 * @param startFromApplicationId - ID aplikace, od které začít přepočet (null = přepočítat vše)
 * @returns Promise<void>
 */
export async function recalculateAllApplications(
  supabase: SupabaseClient,
  planId: string,
  soilType: 'L' | 'S' | 'T',
  startFromApplicationId?: string
): Promise<void> {
  // Načti plán pro získání target_ph
  const { data: plan } = await supabase
    .from('liming_plans')
    .select('target_ph')
    .eq('id', planId)
    .single()
  
  const targetPh = plan?.target_ph || 6.5 // Default 6.5 pokud není specifikováno
  
  // Načti všechny aplikace plánu seřazené podle sequence_order
  const { data: applications, error } = await supabase
    .from('liming_applications')
    .select('*')
    .eq('liming_plan_id', planId)
    .order('sequence_order', { ascending: true })
  
  if (error || !applications || applications.length === 0) {
    console.error('Error loading applications for recalculation:', error)
    return
  }
  
  // Aplikace jsou už seřazené podle sequence_order z databáze
  // sequence_order zajišťuje správné pořadí i pro více aplikací ve stejném roce
  const sortedApps = applications
  
  // Najdi index, od kterého začít přepočet
  let startIndex = 0
  if (startFromApplicationId) {
    startIndex = sortedApps.findIndex(app => app.id === startFromApplicationId)
    if (startIndex < 0) startIndex = 0
    // Začneme od NÁSLEDUJÍCÍ aplikace
    startIndex += 1
  }
  
  // Pokud není co přepočítávat
  if (startIndex >= sortedApps.length) {
    return
  }
  
  // Roční pokles pH
  const annualPhDrop = ANNUAL_PH_DROP[soilType] || 0.07
  
  // Mapování typu půdy na detailní typ pro calculatePhChange
  const soilDetailType = soilType === 'L' ? 'hlinitopiscita' : 
                         soilType === 'S' ? 'hlinita' : 'jilovitohlinita'
  
  // Přepočítej aplikace od startIndex
  for (let i = startIndex; i < sortedApps.length; i++) {
    const currentApp = sortedApps[i]
    const previousApp = sortedApps[i - 1]
    
    // Vypočítej pH před aplikací (s acidifikací od předchozí aplikace)
    let phBefore: number
    
    if (!previousApp) {
      // První aplikace - ponecháme původní ph_before
      phBefore = currentApp.ph_before
    } else {
      // Časový odstup v letech
      const yearsGap = currentApp.year - previousApp.year
      
      if (yearsGap === 0) {
        // Více aplikací ve stejném roce - ŽÁDNÁ acidifikace mezi nimi
        // Druhá aplikace začíná s pH PO první aplikaci
        phBefore = previousApp.ph_after
      } else {
        // Aplikace v různých letech - započítat acidifikaci
        // pH po předchozí aplikaci mínus acidifikace za uplynulé roky
        phBefore = previousApp.ph_after - (yearsGap * annualPhDrop)
        
        // Minimální pH je 3.5 (extrémně kyselá půda)
        phBefore = Math.max(phBefore, 3.5)
      }
    }
    
    // ✅ ENV CALCULATION - Account for MgO neutralizing power (1.39x stronger than CaO)
    // Dolomite has BOTH CaO and MgO, so effective neutralizing power is higher
    const MGO_NEUTRALIZING_FACTOR = 1.39
    const env = (currentApp.cao_content / 100) + ((currentApp.mgo_content / 100) * MGO_NEUTRALIZING_FACTOR)
    const effectiveCaoApplied = currentApp.dose_per_ha * env
    
    // Vypočítej pH po aplikaci (efekt vápnění) - USE EFFECTIVE CaO (not physical CaO)
    const phChange = calculatePhChange(
      effectiveCaoApplied,
      soilDetailType as any,
      phBefore
    )
    const phAfter = Math.min(phBefore + phChange, 8.0)
    
    // Vygeneruj doporučení podle metodiky
    const recommendation = generateLimingRecommendation(
      phBefore,
      phAfter,
      targetPh,
      currentApp.mg_after || null,
      currentApp.mgo_per_ha
    )
    
    // Aktualizuj aplikaci v databázi
    const { error: updateError } = await supabase
      .from('liming_applications')
      .update({
        ph_before: parseFloat(phBefore.toFixed(2)),
        ph_after: parseFloat(phAfter.toFixed(2)),
        notes: recommendation,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentApp.id)
    
    if (updateError) {
      console.error(`Error updating application ${currentApp.id}:`, updateError)
      // Pokračuj i při chybě, ať se přepočítají ostatní
    }
    
    // Aktualizuj pro další iteraci
    sortedApps[i].ph_before = phBefore
    sortedApps[i].ph_after = phAfter
  }
}

/**
 * Přepočítá všechny aplikace PO smazání jedné aplikace
 * 
 * @param supabase - Supabase client
 * @param planId - ID plánu vápnění
 * @param soilType - Typ půdy (L/S/T)
 * @param deletedApplicationYear - Rok smazané aplikace
 * @returns Promise<void>
 */
export async function recalculateAfterDeletion(
  supabase: SupabaseClient,
  planId: string,
  soilType: 'L' | 'S' | 'T',
  deletedApplicationYear: number
): Promise<void> {
  // Načti všechny zbývající aplikace seřazené podle sequence_order
  const { data: applications, error } = await supabase
    .from('liming_applications')
    .select('*')
    .eq('liming_plan_id', planId)
    .order('sequence_order', { ascending: true })
  
  if (error || !applications || applications.length === 0) {
    return
  }
  
  // Aplikace jsou už seřazené podle sequence_order z databáze
  const sortedApps = applications
  
  // Najdi první aplikaci po smazaném roce
  const firstAppAfterDeletion = sortedApps.find(app => app.year >= deletedApplicationYear)
  
  if (!firstAppAfterDeletion) {
    // Nebyla smazána aplikace uprostřed, není co přepočítávat
    return
  }
  
  // Přepočítej od této aplikace
  const startIndex = sortedApps.indexOf(firstAppAfterDeletion)
  
  // Použij obecnou funkci pro přepočet
  if (startIndex > 0) {
    // Najdeme předchozí aplikaci a začneme přepočet od následující
    const previousAppId = sortedApps[startIndex - 1].id
    await recalculateAllApplications(supabase, planId, soilType, previousAppId)
  } else {
    // Přepočítat vše od začátku
    await recalculateAllApplications(supabase, planId, soilType)
  }
}

