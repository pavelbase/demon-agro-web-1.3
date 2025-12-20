import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin
    const user = await requireAuth()
    const supabase = createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const userId = params.userId

    // Fetch user's parcels with analyses count
    const { data: parcels, error: parcelsError } = await supabase
      .from('parcels')
      .select(`
        id,
        code,
        name,
        area,
        soil_type,
        culture,
        soil_analyses (
          id,
          analysis_date
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (parcelsError) {
      throw new Error(`Nepodařilo se načíst pozemky: ${parcelsError.message}`)
    }

    // Transform data (count analyses, get latest date, NO actual values)
    const parcelsWithStats = (parcels || []).map(parcel => {
      const analyses = (parcel as any).soil_analyses || []
      const latestAnalysis = analyses.length > 0 
        ? analyses.sort((a: any, b: any) => 
            new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
          )[0]
        : null

      return {
        id: parcel.id,
        code: parcel.code,
        name: parcel.name,
        area: parcel.area,
        soil_type: parcel.soil_type,
        culture: parcel.culture,
        soil_analyses_count: analyses.length,
        latest_analysis_date: latestAnalysis?.analysis_date || null,
        // NOTE: NO pH, nutrients, or other sensitive values
      }
    })

    return NextResponse.json({
      success: true,
      parcels: parcelsWithStats,
    })
  } catch (error) {
    console.error('Get user data error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}
