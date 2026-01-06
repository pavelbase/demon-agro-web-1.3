import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Map, 
  Upload, 
  ShoppingCart, 
  AlertTriangle,
  TrendingDown,
  Calendar,
  Plus,
  ChevronRight
} from 'lucide-react'
import type { Parcel, SoilAnalysis, LimingRequest, AuditLog } from '@/lib/types/database'

// Helper to get Czech date format
function getCzechDate() {
  return new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

// Helper to format area
function formatArea(area: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(area)
}

// Helper to get time ago
function getTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Právě teď'
  if (diffMins < 60) return `Před ${diffMins} min`
  if (diffHours < 24) return `Před ${diffHours} h`
  if (diffDays < 7) return `Před ${diffDays} dny`
  return new Intl.DateTimeFormat('cs-CZ').format(past)
}

interface ParcelWithAnalysis extends Parcel {
  latest_analysis?: SoilAnalysis | null
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch user profile for company name
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, full_name')
    .eq('id', user.id)
    .single()

  // Fetch all parcels with their latest analysis
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
    .order('created_at', { ascending: false })

  // Process parcels to get latest analysis for each
  const parcelsWithLatestAnalysis: ParcelWithAnalysis[] = (parcels || []).map(parcel => {
    const analyses = (parcel.soil_analyses || []) as any[]
    const latestAnalysis = analyses.length > 0 
      ? analyses.sort((a: any, b: any) => 
          new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
        )[0]
      : null
    return {
      ...parcel,
      latest_analysis: latestAnalysis || null
    }
  })

  // Fetch liming requests
  const { data: limingRequests } = await supabase
    .from('liming_requests')
    .select('id, status, created_at')
    .eq('user_id', user.id)

  // Fetch recent audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate statistics
  const totalParcels = parcelsWithLatestAnalysis.length
  const totalArea = parcelsWithLatestAnalysis.reduce((sum, p) => sum + p.area, 0)
  const pendingRequests = (limingRequests || []).filter(r => 
    r.status === 'new' || r.status === 'in_progress'
  ).length

  // Find parcels requiring attention
  const parcelsNeedingAttention: Array<{
    parcel: ParcelWithAnalysis
    reason: string
    severity: 'high' | 'medium' | 'low'
  }> = []

  parcelsWithLatestAnalysis.forEach(parcel => {
    if (!parcel.latest_analysis) {
      parcelsNeedingAttention.push({
        parcel,
        reason: 'Chybí rozbor půdy',
        severity: 'medium'
      })
      return
    }

    const analysis = parcel.latest_analysis
    const analysisAge = Math.floor(
      (new Date().getTime() - new Date(analysis.date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )

    // pH < 5.5
    if (analysis.ph && analysis.ph < 5.5) {
      parcelsNeedingAttention.push({
        parcel,
        reason: `Nízké pH (${analysis.ph.toFixed(1)})`,
        severity: 'high'
      })
    }

    // Old analysis (> 4 years)
    if (analysisAge > 4) {
      parcelsNeedingAttention.push({
        parcel,
        reason: `Rozbor starý ${analysisAge} let`,
        severity: 'medium'
      })
    }

    // Low nutrient categories (nizky or vyhovujici)
    const lowNutrients = []
    const pCat = (analysis as any).p_category
    const kCat = (analysis as any).k_category
    const mgCat = (analysis as any).mg_category
    
    if (pCat === 'nizky' || pCat === 'vyhovujici') {
      lowNutrients.push('P')
    }
    if (kCat === 'nizky' || kCat === 'vyhovujici') {
      lowNutrients.push('K')
    }
    if (mgCat === 'nizky' || mgCat === 'vyhovujici') {
      lowNutrients.push('Mg')
    }

    if (lowNutrients.length > 0) {
      parcelsNeedingAttention.push({
        parcel,
        reason: `Nízká zásobenost (${lowNutrients.join(', ')})`,
        severity: 'low'
      })
    }
  })

  // Sort by severity and limit to 5
  const sortedAttention = parcelsNeedingAttention
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
    .slice(0, 5)

  const displayName = profile?.company_name || profile?.full_name || 'uživateli'
  const hasActivity = (auditLogs && auditLogs.length > 0) || totalParcels > 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-green to-primary-brown text-white rounded-lg p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-2">
          Dobrý den, {displayName}! 👋
        </h1>
        <p className="text-white/90 capitalize">{getCzechDate()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Parcels */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-green">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Počet pozemků</h3>
            <Map className="h-8 w-8 text-primary-green" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalParcels}</p>
          <p className="text-sm text-gray-500 mt-1">
            {totalParcels === 0 ? 'Zatím žádné pozemky' : 'Aktivních pozemků'}
          </p>
        </div>

        {/* Total Area */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Celková výměra</h3>
            <Map className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatArea(totalArea)}</p>
          <p className="text-sm text-gray-500 mt-1">hektarů</p>
        </div>

        {/* Attention Required */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Vyžadují pozornost</h3>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{parcelsNeedingAttention.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {parcelsNeedingAttention.length === 0 ? 'Vše v pořádku' : 'Pozemků s varováním'}
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Nevyřízené poptávky</h3>
            <ShoppingCart className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingRequests}</p>
          <p className="text-sm text-gray-500 mt-1">
            {pendingRequests === 0 ? 'Žádné čekající' : 'Čeká na vyřízení'}
          </p>
        </div>
      </div>

      {/* Parcels Needing Attention */}
      {sortedAttention.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Pozemky vyžadující pozornost
            </h2>
            {parcelsNeedingAttention.length > 5 && (
              <Link
                href="/portal/pozemky"
                className="text-primary-green hover:text-primary-brown font-medium text-sm flex items-center gap-1"
              >
                Zobrazit vše
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {sortedAttention.map((item, index) => (
              <Link
                key={`${item.parcel.id}-${index}`}
                href={`/portal/pozemky/${item.parcel.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-green hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.parcel.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{formatArea(item.parcel.area)} ha</span>
                      <span className="text-gray-400">•</span>
                      <span>{item.parcel.cadastral_number || 'Bez KÚ'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        item.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : item.severity === 'medium'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.severity === 'high' && <TrendingDown className="h-4 w-4" />}
                      {item.severity === 'medium' && <Calendar className="h-4 w-4" />}
                      {item.reason}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rychlé akce</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/portal/upload"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-green hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-primary-green/10 rounded-full flex items-center justify-center group-hover:bg-primary-green/20 transition-colors">
              <Upload className="h-6 w-6 text-primary-green" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Nahrát rozbor</h3>
              <p className="text-sm text-gray-600">Nahrát nový PDF rozbor</p>
            </div>
          </Link>

          <Link
            href="/portal/pozemky?action=add"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-green hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Přidat pozemek</h3>
              <p className="text-sm text-gray-600">Zaregistrovat nový pozemek</p>
            </div>
          </Link>

          <Link
            href="/portal/poptavky/nova"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-green hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <ShoppingCart className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vytvořit poptávku</h3>
              <p className="text-sm text-gray-600">Nová poptávka vápnění</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Poslední aktivita</h2>
        
        {!hasActivity ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">
              Zatím žádná aktivita. Začněte nahráním rozborů nebo přidáním pozemků.
            </p>
            <Link
              href="/portal/upload"
              className="inline-flex items-center gap-2 bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-brown transition-colors"
            >
              <Upload className="h-5 w-5" />
              Nahrát první rozbor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-primary-green rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{log.action}</p>
                    {log.table_name && (
                      <p className="text-sm text-gray-600">
                        {log.table_name === 'parcels' && 'Pozemky'}
                        {log.table_name === 'soil_analyses' && 'Rozbory půdy'}
                        {log.table_name === 'liming_requests' && 'Poptávky vápnění'}
                        {log.table_name === 'fertilization_history' && 'Historie hnojení'}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {getTimeAgo(log.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Historie aktivit se zobrazí po vašich prvních akcích v portálu.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
