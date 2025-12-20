import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { ParcelsTable } from '@/components/portal/ParcelsTable'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'

export interface ParcelWithAnalysis extends Parcel {
  latest_analysis?: SoilAnalysis | null
  health_status: 'ok' | 'warning' | 'critical'
  status_reason?: string
}

export default async function PozemkyPage() {
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
        created_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Process parcels to get latest analysis and status
  const parcelsWithStatus: ParcelWithAnalysis[] = (parcels || []).map(parcel => {
    const analyses = parcel.soil_analyses || []
    const latestAnalysis = (analyses as any[]).sort((a: any, b: any) => 
      new Date(b.analysis_date || b.date).getTime() - new Date(a.analysis_date || a.date).getTime()
    )[0]

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

      // Critical: pH < 5.5
      if (latestAnalysis.ph && latestAnalysis.ph < 5.5) {
        status = 'critical'
        statusReason = `pH ${latestAnalysis.ph.toFixed(1)}`
      }
      // Warning: Old analysis or low nutrients
      else if (analysisAge > 4) {
        status = 'warning'
        statusReason = `Rozbor ${analysisAge} let`
      } else if (
        latestAnalysis.p_category === 'N' || latestAnalysis.p_category === 'VH' ||
        latestAnalysis.k_category === 'N' || latestAnalysis.k_category === 'VH' ||
        latestAnalysis.mg_category === 'N' || latestAnalysis.mg_category === 'VH'
      ) {
        status = 'warning'
        statusReason = 'Nízké živiny'
      }
    }

    return {
      ...parcel,
      latest_analysis: latestAnalysis || null,
      status,
      status_reason: statusReason,
    }
  })

  return <ParcelsTable parcels={parcelsWithStatus} />
}
