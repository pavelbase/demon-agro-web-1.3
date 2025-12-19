import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  ShoppingCart,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  Beaker,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { ParcelHealthCard } from '@/components/portal/ParcelHealthCard'
import { ParcelActionButtons } from '@/components/portal/ParcelActionButtons'
import {
  SOIL_TYPE_LABELS,
  CULTURE_LABELS,
} from '@/lib/constants/database'

interface ParcelDetailPageProps {
  params: { id: string }
  searchParams?: { tab?: string }
}

// Helper to format Czech number
function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Helper to format Czech date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ParcelDetailPage({
  params,
  searchParams,
}: ParcelDetailPageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch parcel with all related data
  const { data: parcel, error: parcelError } = await supabase
    .from('parcels')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (parcelError || !parcel) {
    notFound()
  }

  // Fetch all soil analyses for this parcel (ordered by date)
  const { data: analyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .eq('parcel_id', params.id)
    .order('date', { ascending: false })

  const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null

  // Fetch fertilization history (last 3 years)
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

  const { data: fertilizationHistory } = await supabase
    .from('fertilization_history')
    .select('*')
    .eq('parcel_id', params.id)
    .gte('date', threeYearsAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(10)

  // Fetch crop rotation (last 5 years)
  const currentYear = new Date().getFullYear()
  const { data: cropRotation } = await supabase
    .from('crop_rotation')
    .select('*')
    .eq('parcel_id', params.id)
    .gte('year', currentYear - 4)
    .order('year', { ascending: false })

  // Get active tab (default: overview)
  const activeTab = searchParams?.tab || 'overview'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link
                href="/portal/pozemky"
                className="hover:text-[#4A7C59] transition-colors"
              >
                Pozemky
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Detail pozemku</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {parcel.name}
            </h1>
            {parcel.cadastral_number && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Kód: {parcel.cadastral_number}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <ParcelActionButtons parcel={parcel} />
        </div>

        {/* Parcel Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <span className="text-sm text-gray-600">Výměra</span>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(parcel.area)} ha
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Půdní druh</span>
            <p className="text-lg font-semibold text-gray-900">
              {SOIL_TYPE_LABELS[parcel.soil_type as keyof typeof SOIL_TYPE_LABELS]}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Kultura</span>
            <p className="text-lg font-semibold text-gray-900">
              {CULTURE_LABELS[parcel.culture as keyof typeof CULTURE_LABELS]}
            </p>
          </div>
        </div>
      </div>

      {/* Health Card */}
      <div className="mb-6">
        <ParcelHealthCard parcel={parcel} analysis={latestAnalysis} />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4">
            <Link
              href={`/portal/pozemky/${params.id}`}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#4A7C59] text-[#4A7C59]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Přehled
            </Link>
            <Link
              href={`/portal/pozemky/${params.id}/rozbory`}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium transition-colors"
            >
              <Beaker className="w-4 h-4" />
              Historie rozborů
            </Link>
            <Link
              href={`/portal/pozemky/${params.id}/plan-hnojeni`}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Plán hnojení
            </Link>
            <Link
              href={`/portal/pozemky/${params.id}/plan-vapneni`}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Plán vápnění
            </Link>
          </nav>
        </div>

        {/* Tab Content: Overview */}
        <div className="p-6">
          {/* Current Analysis Table */}
          {latestAnalysis ? (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Aktuální rozbor půdy
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-gray-600 uppercase">pH</span>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestAnalysis.ph.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 uppercase">Fosfor (P)</span>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestAnalysis.phosphorus}
                      <span className="text-sm text-gray-600 ml-1">mg/kg</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 uppercase">Draslík (K)</span>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestAnalysis.potassium}
                      <span className="text-sm text-gray-600 ml-1">mg/kg</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 uppercase">Hořčík (Mg)</span>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestAnalysis.magnesium}
                      <span className="text-sm text-gray-600 ml-1">mg/kg</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  Datum rozboru: <strong>{formatDate(latestAnalysis.date)}</strong>
                  {latestAnalysis.lab_name && (
                    <span className="ml-4">
                      Laboratoř: <strong>{latestAnalysis.lab_name}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800">
                Tento pozemek zatím nemá žádný rozbor půdy.
              </p>
            </div>
          )}

          {/* Crop Rotation */}
          {cropRotation && cropRotation.length > 0 ? (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Osevní postup
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Rok
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Plodina
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Očekávaný výnos
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Skutečný výnos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cropRotation.map((crop) => (
                      <tr key={crop.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {crop.year}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {crop.crop_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {crop.expected_yield
                            ? `${formatNumber(crop.expected_yield, 1)} t/ha`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {crop.actual_yield
                            ? `${formatNumber(crop.actual_yield, 1)} t/ha`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Fertilization History */}
          {fertilizationHistory && fertilizationHistory.length > 0 ? (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Historie hnojení (poslední 3 roky)
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Datum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Produkt
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Množství
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        N-P-K-Mg
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fertilizationHistory.map((fert) => (
                      <tr key={fert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(fert.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {fert.product_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatNumber(fert.quantity, 0)} {fert.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center font-mono">
                          {fert.nitrogen || 0}-{fert.phosphorus || 0}-
                          {fert.potassium || 0}-{fert.magnesium || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Notes */}
          {parcel.notes && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Poznámky</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{parcel.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Link
              href={`/portal/upload?parcel=${params.id}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4A7C59] hover:bg-[#5C4033] text-white font-medium rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Nahrát nový rozbor
            </Link>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white font-medium rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              Přidat do poptávky vápnění
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
