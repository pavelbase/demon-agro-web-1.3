import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Trash2, Upload, AlertCircle, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getCategoryColor, getCategoryLabel } from '@/lib/utils/soil-categories'
import type { PhCategory, NutrientCategory } from '@/lib/utils/soil-categories'
import IndividualSamples from '@/components/portal/IndividualSamples'
import { groupAndAverageAnalyses } from '@/lib/utils/soil-analysis-helpers'

interface RozboryPageProps {
  params: { id: string }
}

// Helper to format Czech date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper to get Tailwind classes for category badge
function getCategoryBadgeClasses(category: PhCategory | NutrientCategory | null): string {
  if (!category) return 'bg-gray-100 text-gray-700'
  
  const color = getCategoryColor(category)
  const classes: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  }
  
  return classes[color] || 'bg-gray-100 text-gray-700'
}

// Helper pro výpočet trendu
function getTrendInfo(current: number, previous: number | undefined) {
  if (!previous) return null
  
  const diff = current - previous
  const percentChange = (diff / previous) * 100
  
  let icon = Minus
  let color = 'text-gray-500'
  
  if (Math.abs(percentChange) < 2) {
    icon = Minus
    color = 'text-gray-500'
  } else if (diff > 0) {
    icon = TrendingUp
    color = 'text-green-600'
  } else {
    icon = TrendingDown
    color = 'text-red-600'
  }
  
  return {
    icon,
    color,
    diff: diff.toFixed(1),
    percent: percentChange.toFixed(1),
  }
}

export default async function RozboryPage({ params }: RozboryPageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch parcel
  const { data: parcel, error: parcelError } = await supabase
    .from('parcels')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (parcelError || !parcel) {
    notFound()
  }

  // Fetch all soil analyses for this parcel
  const { data: analyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .eq('parcel_id', params.id)
    .order('analysis_date', { ascending: false })

  // Group and average analyses by date
  const groupedAnalyses = groupAndAverageAnalyses(analyses || [], parcel.soil_type)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/portal/pozemky/${params.id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na detail pozemku
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rozbory půdy
            </h1>
            <p className="text-gray-600">
              {parcel.name}
              {parcel.code && ` - ${parcel.code}`}
            </p>
          </div>

          <Link
            href={`/portal/upload?parcel=${params.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Nahrát nový rozbor
          </Link>
        </div>
      </div>

      {/* Analyses List */}
      {!groupedAnalyses || groupedAnalyses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Zatím žádné rozbory
          </h3>
          <p className="text-gray-600 mb-6">
            Pro tento pozemek ještě nebyl nahrán žádný rozbor půdy.
          </p>
          <Link
            href={`/portal/upload?parcel=${params.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Nahrát první rozbor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedAnalyses.map((analysis, index) => {
            const isLatest = index === 0
            const previousAnalysis = index < groupedAnalyses.length - 1 ? groupedAnalyses[index + 1] : null
            const analysisAge = Math.floor(
              (Date.now() - new Date(analysis.analysis_date).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
            const isOld = analysisAge >= 4

            // Výpočet trendů
            const phTrend = getTrendInfo(analysis.ph, previousAnalysis?.ph)
            const pTrend = getTrendInfo(analysis.p, previousAnalysis?.p)
            const kTrend = getTrendInfo(analysis.k, previousAnalysis?.k)
            const mgTrend = getTrendInfo(analysis.mg, previousAnalysis?.mg)

            return (
              <div
                key={analysis.ids.join('-')}
                className={`bg-white border rounded-lg p-6 ${
                  isLatest ? 'border-primary-green shadow-md' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className={`h-6 w-6 mt-1 ${
                      isLatest ? 'text-primary-green' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Rozbor z {formatDate(analysis.analysis_date)}
                        </h3>
                        {isLatest && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Aktuální (další rozbor doporučen {new Date(new Date(analysis.analysis_date).getTime() + 4 * 365 * 24 * 60 * 60 * 1000).getFullYear()})
                          </span>
                        )}
                        {analysis.count > 1 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {analysis.count} vzorky (průměr)
                          </span>
                        )}
                        {isOld && !isLatest && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Starší než 4 roky
                          </span>
                        )}
                      </div>
                      {analysis.lab_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          Laboratoř: {analysis.lab_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {analysis.source_documents && analysis.source_documents.length > 0 && (
                      <a
                        href={analysis.source_documents[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Stáhnout PDF"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* pH */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">pH (CaCl₂)</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {analysis.ph.toFixed(2)}
                      </div>
                      {phTrend && (
                        <div className={`flex items-center text-xs ${phTrend.color}`} title={`Změna: ${phTrend.diff} (${phTrend.percent}%)`}>
                          <phTrend.icon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {analysis.ph_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(analysis.ph_category)}`}>
                        {getCategoryLabel(analysis.ph_category)}
                      </div>
                    )}
                    {phTrend && (
                      <div className="text-xs text-gray-500 mt-1">
                        {phTrend.diff > 0 ? '+' : ''}{phTrend.diff}
                      </div>
                    )}
                  </div>

                  {/* Phosphorus */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Fosfor (P)</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {analysis.p.toFixed(0)}
                        <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                      </div>
                      {pTrend && (
                        <div className={`flex items-center text-xs ${pTrend.color}`} title={`Změna: ${pTrend.diff} mg/kg (${pTrend.percent}%)`}>
                          <pTrend.icon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {analysis.p_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(analysis.p_category)}`}>
                        {getCategoryLabel(analysis.p_category)}
                      </div>
                    )}
                    {pTrend && (
                      <div className="text-xs text-gray-500 mt-1">
                        {pTrend.diff > 0 ? '+' : ''}{pTrend.diff} mg/kg
                      </div>
                    )}
                  </div>

                  {/* Potassium */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Draslík (K)</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {analysis.k.toFixed(0)}
                        <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                      </div>
                      {kTrend && (
                        <div className={`flex items-center text-xs ${kTrend.color}`} title={`Změna: ${kTrend.diff} mg/kg (${kTrend.percent}%)`}>
                          <kTrend.icon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {analysis.k_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(analysis.k_category)}`}>
                        {getCategoryLabel(analysis.k_category)}
                      </div>
                    )}
                    {kTrend && (
                      <div className="text-xs text-gray-500 mt-1">
                        {kTrend.diff > 0 ? '+' : ''}{kTrend.diff} mg/kg
                      </div>
                    )}
                  </div>

                  {/* Magnesium */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Hořčík (Mg)</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {analysis.mg.toFixed(0)}
                        <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                      </div>
                      {mgTrend && (
                        <div className={`flex items-center text-xs ${mgTrend.color}`} title={`Změna: ${mgTrend.diff} mg/kg (${mgTrend.percent}%)`}>
                          <mgTrend.icon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {analysis.mg_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(analysis.mg_category)}`}>
                        {getCategoryLabel(analysis.mg_category)}
                      </div>
                    )}
                    {mgTrend && (
                      <div className="text-xs text-gray-500 mt-1">
                        {mgTrend.diff > 0 ? '+' : ''}{mgTrend.diff} mg/kg
                      </div>
                    )}
                  </div>

                  {/* Calcium */}
                  {analysis.ca && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Vápník (Ca)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {analysis.ca.toFixed(0)}
                        <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                      </div>
                      {analysis.ca_category && (
                        <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(analysis.ca_category)}`}>
                          {getCategoryLabel(analysis.ca_category)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sulfur */}
                  {analysis.s && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Síra (S)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {analysis.s.toFixed(2)}
                        <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                      </div>
                      {analysis.s_category && (
                        <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(analysis.s_category)}`}>
                          {getCategoryLabel(analysis.s_category)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Individual Samples - expandable */}
                <IndividualSamples 
                  samples={analysis.originalAnalyses}
                />

                {/* Notes */}
                {analysis.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <strong>Poznámky:</strong> {analysis.notes}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info Box */}
      {groupedAnalyses && groupedAnalyses.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Doporučení pro rozbory půdy
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Rozbory půdy doporučujeme provádět každé 4 roky</li>
            <li>• Nejlepší doba pro odběr vzorků je na podzim nebo na jaře</li>
            <li>• Aktuální rozbor je základem pro správné hnojení a vápnění</li>
            <li>• Při více vzorcích ze stejného dne se zobrazuje aritmetický průměr hodnot</li>
          </ul>
        </div>
      )}
    </div>
  )
}
