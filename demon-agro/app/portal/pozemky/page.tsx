import { Suspense } from 'react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { ParcelsTable } from '@/components/portal/ParcelsTable'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'
import { groupAndAverageAnalyses } from '@/lib/utils/soil-analysis-helpers'
import { calculateTotalCaoNeedSimple } from '@/lib/utils/liming-calculator'

export interface ParcelWithAnalysis extends Parcel {
  latest_analysis?: SoilAnalysis | null
  health_status: 'ok' | 'warning' | 'critical'
  status_reason?: string
  has_liming_plan?: boolean
  liming_plan_id?: string
}

async function ParcelsContent() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch active parcels with their latest analysis
  const { data: parcels } = await supabase
    .from('parcels')
    .select(`
      *,
      soil_analyses (
        id,
        parcel_id,
        analysis_date,
        ph,
        p,
        p_category,
        k,
        k_category,
        mg,
        mg_category,
        ca,
        ca_category,
        s,
        s_category,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch liming plans for all parcels
  const { data: limingPlans } = await supabase
    .from('liming_plans')
    .select('id, parcel_id')
    .in('parcel_id', (parcels || []).map(p => p.id))

  // Create a map of parcel_id -> liming_plan
  const limingPlanMap = new Map(
    (limingPlans || []).map(plan => [plan.parcel_id, plan.id])
  )

  // Filter only active parcels (not archived)
  // If status column doesn't exist or is null, treat as active
  const activeParcels = (parcels || []).filter(p => !p.status || p.status === 'active')

  // Process parcels to get latest analysis and status
  const parcelsWithStatus: ParcelWithAnalysis[] = activeParcels.map(parcel => {
    const analyses = parcel.soil_analyses || []
    
    // Group and average analyses by date (AZZP methodology)
    const groupedAnalyses = groupAndAverageAnalyses(analyses, parcel.soil_type)
    const latestAnalysis = groupedAnalyses.length > 0 ? groupedAnalyses[0] : null

    // Determine status
    let status: 'ok' | 'warning' | 'critical' = 'ok'
    let statusReason: string | undefined

    if (!latestAnalysis) {
      status = 'warning'
      statusReason = 'Chybí rozbor'
    } else {
      const analysisAge = Math.floor(
        (new Date().getTime() - new Date(latestAnalysis.analysis_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )

      // Výpočet potřeby vápnění podle ÚKZÚZ metodiky
      const landUse = parcel.culture === 'orna' ? 'orna' : 'ttp'
      const limeNeedTCao = calculateTotalCaoNeedSimple(
        latestAnalysis.ph,
        parcel.soil_type || 'S', // Default na střední půdu, pokud není zadán typ
        landUse
      )

      // Critical: pH < 5.0
      if (latestAnalysis.ph && latestAnalysis.ph < 5.0) {
        status = 'critical'
        statusReason = `pH ${latestAnalysis.ph.toFixed(1)}`
      }
      // Warning: pH < 5.5 (doporučeno vápnění)
      else if (latestAnalysis.ph && latestAnalysis.ph < 5.5) {
        status = 'warning'
        statusReason = `pH ${latestAnalysis.ph.toFixed(1)}`
      }
      // Warning: Potřeba údržbového vápnění (pH 5.5-6.5, ale je potřeba vápnit)
      else if (limeNeedTCao > 0) {
        status = 'warning'
        statusReason = 'Údržba'
      }
      // Warning: Old analysis
      else if (analysisAge > 4) {
        status = 'warning'
        statusReason = `Rozbor ${analysisAge} let`
      } else if (
        latestAnalysis.p_category === 'nizky' || latestAnalysis.p_category === 'vyhovujici' ||
        latestAnalysis.k_category === 'nizky' || latestAnalysis.k_category === 'vyhovujici' ||
        latestAnalysis.mg_category === 'nizky' || latestAnalysis.mg_category === 'vyhovujici'
      ) {
        status = 'warning'
        statusReason = 'Nízké živiny'
      }
    }

    return {
      ...parcel,
      latest_analysis: latestAnalysis || null,
      health_status: status,
      status_reason: statusReason,
      has_liming_plan: limingPlanMap.has(parcel.id),
      liming_plan_id: limingPlanMap.get(parcel.id),
    }
  })

  return <ParcelsTable parcels={parcelsWithStatus} />
}

export default function PozemkyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
          <p className="mt-2 text-gray-600">Načítání pozemků...</p>
        </div>
      </div>
    }>
      <ParcelsContent />
    </Suspense>
  )
}
