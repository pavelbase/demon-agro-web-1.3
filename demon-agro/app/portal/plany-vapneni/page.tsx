import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import PlanyVapneniClient from '@/components/portal/PlanyVapneniClient'

/**
 * PŘEHLED PLÁNŮ VÁPNĚNÍ
 * =====================
 * Souhrný seznam všech plánů vápnění ze všech pozemků uživatele
 * NOVĚ: Tabulkový přehled všech pozemků s rozbory a doporučeními
 * 
 * Funkce:
 * - Záložky: Karty pozemků / Tabulkový přehled
 * - Agregovaný přehled všech plánů
 * - Tabulka všech pozemků s rozbory, pH, živinami
 * - Statistiky (celková potřeba CaO, počet pozemků, atd.)
 * - Export do PDF
 * - Rychlý přístup k detailům jednotlivých plánů
 * - Filtry podle stavu, roku aplikace
 * - Hromadné přidání do poptávky
 */

export default async function PlanyVapneniPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // -------------------------------------------------
  // 1. NAČTENÍ VŠECH POZEMKŮ S ROZBORY
  // -------------------------------------------------
  
  const { data: allParcels, error: parcelsError } = await supabase
    .from('parcels')
    .select(`
      id,
      name,
      code,
      area,
      soil_type,
      culture,
      notes,
      status,
      created_at
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  console.log('=== PLANY VAPNENI DEBUG ===')
  console.log('User ID:', user.id)
  console.log('Parcels query error:', parcelsError)
  console.log('Parcels loaded:', allParcels?.length || 0)
  
  // Načíst všechny rozbory pro tyto pozemky
  const parcelIds = allParcels?.map(p => p.id) || []
  console.log('Parcel IDs:', parcelIds)
  
  const { data: allAnalyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .in('parcel_id', parcelIds)
    .order('analysis_date', { ascending: false })

  console.log('Analyses loaded:', allAnalyses?.length || 0)

  // Spojit pozemky s jejich nejnovějšími rozbory
  const parcelsWithAnalyses = allParcels?.map(parcel => {
    const parcelAnalyses = allAnalyses?.filter(a => a.parcel_id === parcel.id) || []
    const latestAnalysis = parcelAnalyses.length > 0 ? parcelAnalyses[0] : null
    
    return {
      ...parcel,
      latest_analysis: latestAnalysis
    }
  }) || []

  console.log('Parcels with analyses:', parcelsWithAnalyses.length)

  // -------------------------------------------------
  // 2. NAČTENÍ PLÁNŮ VÁPNĚNÍ (pro záložku Karty)
  // -------------------------------------------------

  const { data: plans, error: plansError } = await supabase
    .from('liming_plans')
    .select(`
      *,
      parcels(
        id,
        name,
        code,
        area,
        soil_type,
        culture,
        user_id
      ),
      applications:liming_applications(
        id,
        year,
        season,
        sequence_order,
        product_name,
        cao_content,
        mgo_content,
        dose_per_ha,
        total_dose,
        cao_per_ha,
        mgo_per_ha,
        ph_before,
        ph_after,
        mg_after,
        notes,
        status,
        product_price_per_ton
      )
    `)
    .in('parcel_id', parcelIds)
    .order('created_at', { ascending: false })
  
  console.log('Plans loaded:', plans?.length || 0)
  console.log('Plans error:', plansError)
  if (plansError) {
    console.error('Error loading liming plans:', plansError)
  }

  // -------------------------------------------------
  // 3. NAČTENÍ PRODUKTŮ VÁPNĚNÍ (pro doporučení)
  // -------------------------------------------------
  
  const { data: limingProducts } = await supabase
    .from('liming_products')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // -------------------------------------------------
  // 4. VÝPOČET STATISTIK
  // -------------------------------------------------
  
  // Spočítat celkovou cenu všech aktivních aplikací
  const totalPrice = plans?.flatMap(p => p.applications || [])
    .filter(a => a.status === 'planned' || a.status === 'ordered')
    .reduce((sum, app) => {
      if (app.product_price_per_ton && app.total_dose) {
        return sum + (app.product_price_per_ton * app.total_dose)
      }
      return sum
    }, 0) || 0
  
  const stats = {
    totalPlans: plans?.length || 0,
    totalParcels: new Set(plans?.map(p => p.parcels.id)).size,
    totalCaoNeed: plans?.reduce((sum, p) => sum + (p.total_cao_need || 0), 0) || 0,
    totalArea: plans?.reduce((sum, p) => sum + (p.parcels?.area || 0), 0) || 0,
    activeApplications: plans?.flatMap(p => p.applications || [])
      .filter(a => a.status === 'planned' || a.status === 'ordered').length || 0,
    totalPrice: totalPrice
  }

  // Načíst jméno uživatele/společnosti pro PDF export
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name')
    .eq('id', user.id)
    .single()

  return (
    <PlanyVapneniClient 
      plans={plans || []} 
      stats={stats}
      allParcels={parcelsWithAnalyses}
      limingProducts={limingProducts || []}
      userProfile={profile}
    />
  )
}

