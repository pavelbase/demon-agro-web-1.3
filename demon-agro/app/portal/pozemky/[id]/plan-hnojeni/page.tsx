import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  Info,
  TrendingUp,
  AlertTriangle,
  FileDown,
  ShoppingCart,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { 
  generateSimplePlan, 
  generateAdvancedPlan,
  formatPlanSummary,
  estimateFertilizerCost,
} from '@/lib/utils/fertilization-plan'
import { detectUserType } from '@/lib/utils/calculations'
import { FertilizationPlanChart } from '@/components/portal/FertilizationPlanChart'
import { PlanRecommendationsTable } from '@/components/portal/PlanRecommendationsTable'
import { PlanDecisionAssistant } from '@/components/portal/PlanDecisionAssistant'
import { ExportPlanPDFButton } from '@/components/portal/ExportPlanPDFButton'
import { ExportPlanExcelButton } from '@/components/portal/ExportPlanExcelButton'

interface PlanHnojeniPageProps {
  params: { id: string }
}

// Helper to format number in Czech locale
function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// Get user type badge info
function getUserTypeBadge(userType: 'A' | 'B' | 'C') {
  switch (userType) {
    case 'A':
      return {
        label: 'Typ A - Základní',
        color: 'bg-blue-100 text-blue-800',
        description: 'Máte základní data (rozbor půdy). Plán je orientační a doporučujeme ho zpřesnit zadáním osevního postupu.',
      }
    case 'B':
      return {
        label: 'Typ B - Pokročilý',
        color: 'bg-purple-100 text-purple-800',
        description: 'Máte pokročilá data včetně osevního postupu. Plán zohledňuje plánované plodiny.',
      }
    case 'C':
      return {
        label: 'Typ C - Profesionální',
        color: 'bg-green-100 text-green-800',
        description: 'Máte kompletní data včetně historie hnojení. Plán obsahuje 4letou predikci a je nejvíce přesný.',
      }
  }
}

// Get warning icon and color
function getWarningStyle(severity: 'error' | 'warning' | 'info') {
  switch (severity) {
    case 'error':
      return {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-500',
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500',
      }
    case 'info':
      return {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-500',
      }
  }
}

export default async function PlanHnojeniPage({ params }: PlanHnojeniPageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch parcel
  const { data: parcel, error: parcelError } = await supabase
    .from('parcels')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (parcelError || !parcel) {
    notFound()
  }

  // Fetch latest soil analysis
  const { data: analyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .eq('parcel_id', params.id)
    .order('date', { ascending: false })
    .limit(1)

  const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null

  // If no analysis, show empty state
  if (!latestAnalysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plán hnojení</h1>
              <p className="text-gray-600 mt-1">Pozemek: {parcel.name}</p>
            </div>
            <Link
              href={`/portal/pozemky/${params.id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Zpět na pozemek
            </Link>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chybí rozbor půdy
            </h2>
            <p className="text-gray-600 mb-8">
              Pro vytvoření plánu hnojení je potřeba aktuální rozbor půdy.
              Nahrajte PDF s rozborem a systém automaticky extrahuje data pomocí AI.
            </p>
            <Link
              href={`/portal/upload?parcel=${params.id}`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Nahrát rozbor
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch crop rotation (last 5 years + future 4 years)
  const currentYear = new Date().getFullYear()
  const { data: cropRotation } = await supabase
    .from('crop_rotation')
    .select('*')
    .eq('parcel_id', params.id)
    .gte('year', currentYear - 5)
    .order('year', { ascending: true })

  // Fetch fertilization history (last 5 years)
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
  const { data: fertilizationHistory } = await supabase
    .from('fertilization_history')
    .select('*')
    .eq('parcel_id', params.id)
    .gte('date', fiveYearsAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  // Fetch all analyses for user type detection
  const { data: allAnalyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .eq('parcel_id', params.id)
    .order('date', { ascending: false })

  // Detect user type
  const userType = detectUserType(
    parcel,
    allAnalyses || [],
    cropRotation || [],
    fertilizationHistory || []
  )

  // Generate appropriate plan
  let plan
  try {
    if (userType === 'C' && cropRotation && cropRotation.length >= 4) {
      // Advanced plan with predictions
      plan = generateAdvancedPlan(
        parcel,
        latestAnalysis,
        cropRotation,
        fertilizationHistory || []
      )
    } else {
      // Simple plan
      plan = generateSimplePlan(parcel, latestAnalysis)
    }
  } catch (error) {
    console.error('Error generating plan:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Chyba při generování plánu
              </h3>
              <p className="text-red-800">
                {error instanceof Error ? error.message : 'Neznámá chyba'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const userTypeBadge = getUserTypeBadge(userType)
  const estimatedCost = estimateFertilizerCost(plan)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plán hnojení {plan.target_year}</h1>
            <p className="text-gray-600 mt-1">
              Pozemek: {parcel.name} • {formatNumber(parcel.area, 2)} ha
            </p>
          </div>
          <Link
            href={`/portal/pozemky/${params.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Zpět
          </Link>
        </div>

        {/* User Type Badge */}
        <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${userTypeBadge.color}`}>
            {userTypeBadge.label}
          </span>
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                {userTypeBadge.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Liming Section */}
          {plan.recommended_lime_kg_ha > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Vápnění</h2>
                  <p className="text-sm text-gray-600">Korekce pH půdy</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Doporučené množství</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(plan.recommended_lime_kg_ha / 1000, 1)} t/ha
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Celkem: {formatNumber((plan.recommended_lime_kg_ha / 1000) * parcel.area, 1)} t
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Typ vápna</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {plan.recommended_lime_type === 'calcitic' && 'Vápenatý CaCO₃'}
                    {plan.recommended_lime_type === 'dolomite' && 'Dolomitický CaCO₃·MgCO₃'}
                    {plan.recommended_lime_type === 'either' && 'Libovolný'}
                  </div>
                </div>
              </div>

              {plan.lime_reasoning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-900">{plan.lime_reasoning}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nutrient Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Doporučené dávky hnojiv
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* P */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">P₂O₅</div>
                <div className="text-3xl font-bold text-red-600">
                  {plan.recommended_nutrients.p2o5}
                </div>
                <div className="text-sm text-gray-600 mt-1">kg/ha</div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatNumber(plan.recommended_nutrients.p2o5 * parcel.area)} kg celkem
                </div>
              </div>

              {/* K */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">K₂O</div>
                <div className="text-3xl font-bold text-blue-600">
                  {plan.recommended_nutrients.k2o}
                </div>
                <div className="text-sm text-gray-600 mt-1">kg/ha</div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatNumber(plan.recommended_nutrients.k2o * parcel.area)} kg celkem
                </div>
              </div>

              {/* Mg */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">MgO</div>
                <div className="text-3xl font-bold text-purple-600">
                  {plan.recommended_nutrients.mgo}
                </div>
                <div className="text-sm text-gray-600 mt-1">kg/ha</div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatNumber(plan.recommended_nutrients.mgo * parcel.area)} kg celkem
                </div>
              </div>

              {/* S */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">S</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {plan.recommended_nutrients.s}
                </div>
                <div className="text-sm text-gray-600 mt-1">kg/ha</div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatNumber(plan.recommended_nutrients.s * parcel.area)} kg celkem
                </div>
              </div>
            </div>

            {/* K:Mg Ratio Info */}
            {plan.km_ratio && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Poměr K:Mg</span>
                  <span className="text-sm font-bold text-gray-900">
                    {plan.km_ratio.toFixed(2)}
                  </span>
                </div>
                {plan.km_ratio_corrected && (
                  <div className="flex items-start gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Dávky upraveny pro optimální poměr (1.5-2.5)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Predictions Chart (Type C only) */}
          {plan.predictions && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Predikce vývoje živin (4 roky)
              </h2>
              <FertilizationPlanChart predictions={plan.predictions} />
            </div>
          )}

          {/* Recommendations Table (Type C only) */}
          {plan.predictions && (
            <PlanRecommendationsTable 
              plan={plan}
              parcel={parcel}
            />
          )}

          {/* Warnings */}
          {plan.warnings.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Upozornění a doporučení
              </h2>
              <div className="space-y-3">
                {plan.warnings.map((warning, index) => {
                  const style = getWarningStyle(warning.severity)
                  const Icon = style.icon

                  return (
                    <div
                      key={index}
                      className={`${style.bgColor} border ${style.borderColor} rounded-lg p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1">
                          <p className={`font-medium ${style.textColor} mb-1`}>
                            {warning.message}
                          </p>
                          {warning.recommendation && (
                            <p className={`text-sm ${style.textColor} opacity-90`}>
                              → {warning.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Decision Assistant */}
          <PlanDecisionAssistant 
            plan={plan}
            parcel={parcel}
            analysis={latestAnalysis}
          />
        </div>

        {/* Right Column - Actions & Summary */}
        <div className="space-y-6">
          {/* Cost Estimate */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Orientační náklady
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">Celkem na hektar</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatNumber(estimatedCost)} Kč
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">
                Pro {formatNumber(parcel.area, 2)} ha
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(estimatedCost * parcel.area)} Kč
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Orientační cena za živiny, bez DPH, dopravy a aplikace
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Akce</h3>
            <div className="space-y-3">
              {/* Export PDF */}
              <ExportPlanPDFButton 
                plan={plan}
                parcel={parcel}
                analysis={latestAnalysis}
              />

              {/* Export Excel */}
              <ExportPlanExcelButton 
                plan={plan}
                parcel={parcel}
                analysis={latestAnalysis}
              />

              {/* Add to liming request */}
              {plan.recommended_lime_kg_ha > 0 && (
                <button className="w-full flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  Přidat do poptávky vápnění
                </button>
              )}

              {/* Recalculate */}
              <button className="w-full flex items-center gap-3 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-5 h-5" />
                Přepočítat
              </button>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Použitá data
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rozbor půdy</span>
                <span className="font-medium text-gray-900">
                  {new Date(latestAnalysis.date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
              {cropRotation && cropRotation.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Osevní postup</span>
                  <span className="font-medium text-gray-900">
                    {cropRotation.length} let
                  </span>
                </div>
              )}
              {fertilizationHistory && fertilizationHistory.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Historie hnojení</span>
                  <span className="font-medium text-gray-900">
                    {fertilizationHistory.length} záznamů
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-gray-600">Typ plánu</span>
                <span className="font-medium text-gray-900">
                  {plan.plan_type === 'simple' && 'Jednoduchý'}
                  {plan.plan_type === 'detailed' && 'Detailní'}
                  {plan.plan_type === 'advanced' && 'Pokročilý'}
                </span>
              </div>
            </div>
          </div>

          {/* Improve Plan CTA */}
          {userType !== 'C' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 mb-2">
                    Zpřesněte svůj plán
                  </h3>
                  <p className="text-sm text-green-800 mb-4">
                    {userType === 'A' && 'Zadejte osevní postup pro přesnější doporučení.'}
                    {userType === 'B' && 'Doplňte historii hnojení pro 4letou predikci.'}
                  </p>
                  <Link
                    href={`/portal/pozemky/${params.id}?tab=rotation`}
                    className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    {userType === 'A' && 'Zadat osevní postup →'}
                    {userType === 'B' && 'Doplnit historii →'}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {plan.notes && plan.notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Poznámky</h3>
          <ul className="space-y-2">
            {plan.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-400 mt-1">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
