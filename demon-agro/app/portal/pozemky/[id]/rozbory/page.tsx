import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Trash2, Upload, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getCategoryColor, getCategoryLabel } from '@/lib/utils/soil-categories'

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

export default async function RozboryPage({ params }: RozboryPageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch parcel
  const { data: parcel, error: parcelError } = await supabase
    .from('parcels')
    .select('id, name, cadastral_number, area')
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
    .order('date', { ascending: false })

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
              {parcel.cadastral_number && ` - ${parcel.cadastral_number}`}
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
      {!analyses || analyses.length === 0 ? (
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
          {analyses.map((analysis, index) => {
            const isLatest = index === 0
            const analysisAge = Math.floor(
              (Date.now() - new Date(analysis.date).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
            const isOld = analysisAge >= 4

            return (
              <div
                key={analysis.id}
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
                          Rozbor z {formatDate(analysis.date)}
                        </h3>
                        {isLatest && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Aktuální
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
                    {analysis.pdf_url && (
                      <a
                        href={analysis.pdf_url}
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
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analysis.ph.toFixed(2)}
                    </div>
                    {analysis.ph_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium bg-${getCategoryColor(analysis.ph_category)}-100 text-${getCategoryColor(analysis.ph_category)}-700`}>
                        {getCategoryLabel(analysis.ph_category)}
                      </div>
                    )}
                  </div>

                  {/* Phosphorus */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Fosfor (P)</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analysis.phosphorus.toFixed(0)}
                      <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                    </div>
                    {analysis.phosphorus_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium bg-${getCategoryColor(analysis.phosphorus_category)}-100 text-${getCategoryColor(analysis.phosphorus_category)}-700`}>
                        {getCategoryLabel(analysis.phosphorus_category)}
                      </div>
                    )}
                  </div>

                  {/* Potassium */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Draslík (K)</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analysis.potassium.toFixed(0)}
                      <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                    </div>
                    {analysis.potassium_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium bg-${getCategoryColor(analysis.potassium_category)}-100 text-${getCategoryColor(analysis.potassium_category)}-700`}>
                        {getCategoryLabel(analysis.potassium_category)}
                      </div>
                    )}
                  </div>

                  {/* Magnesium */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Hořčík (Mg)</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analysis.magnesium.toFixed(0)}
                      <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                    </div>
                    {analysis.magnesium_category && (
                      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium bg-${getCategoryColor(analysis.magnesium_category)}-100 text-${getCategoryColor(analysis.magnesium_category)}-700`}>
                        {getCategoryLabel(analysis.magnesium_category)}
                      </div>
                    )}
                  </div>

                  {/* Calcium */}
                  {analysis.calcium && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-600 mb-1">Vápník (Ca)</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {analysis.calcium.toFixed(0)}
                        <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                      </div>
                      {analysis.calcium_category && (
                        <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium bg-${getCategoryColor(analysis.calcium_category)}-100 text-${getCategoryColor(analysis.calcium_category)}-700`}>
                          {getCategoryLabel(analysis.calcium_category)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
      {analyses && analyses.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Doporučení pro rozbory půdy
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Rozbory půdy doporučujeme provádět každé 4 roky</li>
            <li>• Nejlepší doba pro odběr vzorků je na podzim nebo na jaře</li>
            <li>• Aktuální rozbor je základem pro správné hnojení a vápnění</li>
          </ul>
        </div>
      )}
    </div>
  )
}
