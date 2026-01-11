import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import LimingPlanGenerator from '@/components/portal/LimingPlanGenerator'
import LimingPlanTable from '@/components/portal/LimingPlanTable'
import ExportLimingPlan from '@/components/portal/ExportLimingPlan'
import AddLimingPlanToCart from '@/components/portal/AddLimingPlanToCart'
import RegenerateLimingPlanButton from '@/components/portal/RegenerateLimingPlanButton'
import { groupAndAverageAnalyses } from '@/lib/utils/soil-analysis-helpers'

/**
 * PLÁN VÁPNĚNÍ - VÍCEDETÝ SYSTÉM
 * ================================
 * 
 * Nová verze s automatickým návrhem víceletého plánu vápnění
 * dle oficiální metodiky ČZU Praha.
 * 
 * Funkce:
 * - Automatický výpočet potřeby CaO na základě pH a typu půdy
 * - Rozložení do více aplikací s intervalem 3 roky
 * - Predikce změn pH po každé aplikaci
 * - Inteligentní výběr produktu (vápenec vs. dolomit)
 * - Export do Excelu
 */

// 🔴 FORCE DYNAMIC - NO CACHING
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LimingPlanPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  // -------------------------------------------------
  // 1. NAČTENÍ POZEMKU
  // -------------------------------------------------
  
  const { data: parcel, error: parcelError } = await supabase
    .from('parcels')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (parcelError || !parcel) {
    notFound()
  }

  // -------------------------------------------------
  // 2. NAČTENÍ ROZBORŮ A VÝPOČET PRŮMĚRU
  // -------------------------------------------------
  
  // Načíst všechny rozbory (stejně jako na zdravotní kartě)
  const { data: analyses } = await supabase
    .from('soil_analyses')
    .select('*')
    .eq('parcel_id', params.id)
    .order('analysis_date', { ascending: false })
  
  // Průměrovat rozbory podle data (AZZP metodika)
  const groupedAnalyses = groupAndAverageAnalyses(analyses || [], parcel.soil_type)
  const latestAnalysis = groupedAnalyses.length > 0 ? groupedAnalyses[0] : null

  // -------------------------------------------------
  // 3. NAČTENÍ EXISTUJÍCÍHO PLÁNU
  // -------------------------------------------------
  
  const { data: existingPlan } = await supabase
    .from('liming_plans')
    .select(`
      *,
      applications:liming_applications(
        *
      )
    `)
    .eq('parcel_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Seřadit aplikace podle pořadí
  if (existingPlan?.applications) {
    existingPlan.applications.sort((a, b) => a.sequence_order - b.sequence_order)
  }

  // -------------------------------------------------
  // 4. RENDER
  // -------------------------------------------------
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/portal/pozemky/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zpět na detail pozemku
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Plán vápnění - {parcel.name}
            </h1>
            <div className="flex items-center gap-3 text-gray-600 mt-1">
              <p>Kód pozemku: {parcel.code}</p>
              <span>•</span>
              <p>{parcel.area} ha</p>
            </div>
            </div>
            
            {existingPlan && (
              <div className="flex flex-wrap gap-3">
                <AddLimingPlanToCart
                  planId={existingPlan.id}
                  parcelId={parcel.id}
                  parcelName={parcel.name}
                  parcelCode={parcel.code}
                  parcelArea={parcel.area}
                  applications={existingPlan.applications || []}
                  planStatus={existingPlan.status}
                />
                <ExportLimingPlan 
                  plan={existingPlan} 
                  parcel={{
                    custom_name: parcel.name,
                    area_ha: parcel.area
                  }}
                />
                {existingPlan.status === 'approved' && (
                  <RegenerateLimingPlanButton
                    planId={existingPlan.id}
                    parcelId={parcel.id}
                    parcelName={parcel.name}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!existingPlan ? (
          // Žádný plán neexistuje - zobrazit generátor
          <div className="space-y-6">
            {!latestAnalysis && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 mb-1">
                      Žádný půdní rozbor nenalezen
                    </p>
                    <p className="text-yellow-800">
                      Pro přesnější výsledky doporučujeme nejdříve{' '}
                      <Link 
                        href={`/portal/upload?parcel=${params.id}`}
                        className="underline font-medium"
                      >
                        nahrát půdní rozbor
                      </Link>
                      . I bez rozboru můžete plán vytvořit ručním zadáním hodnot.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <LimingPlanGenerator
              parcelId={params.id}
              latestAnalysis={latestAnalysis ? {
                id: latestAnalysis.id,
                ph: latestAnalysis.ph,
                mg: latestAnalysis.mg,
                soil_type: parcel.soil_type as 'L' | 'S' | 'T'
              } : null}
              parcelArea={parcel.area}
            />
            
            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                ℹ️ O automatickém plánu vápnění
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Vícedetý plán:</strong> Systém automaticky rozloží potřebu vápnění 
                  do více aplikací s intervalem 3 roky, respektující maximální jednorázové dávky.
                </p>
                <p>
                  <strong>Oficiální metodika:</strong> Výpočty vycházejí z oficiálních tabulek 
                  potřeby vápnění ČZU Praha pro různé půdní typy.
                </p>
                <p>
                  <strong>Inteligentní výběr produktu:</strong> Při nízkém obsahu Mg automaticky 
                  doporučuje dolomit, jinak čistý vápenec.
                </p>
                <p>
                  <strong>Predikce pH:</strong> Každá aplikace obsahuje predikci změny pH 
                  na základě pufrační kapacity půdy.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Plán existuje - zobrazit tabulku
          <div className="space-y-6">
            {/* Info pro uživatele - jak přidat další roky */}
            {existingPlan.status === 'approved' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-sm text-blue-900">
                    <p className="font-medium mb-2">
                      💡 Jak přidat další rok aplikace?
                    </p>
                    <ol className="list-decimal list-inside text-blue-800 space-y-1">
                      <li>Použijte tlačítko <strong>"Přidat další rok aplikace"</strong> v tabulce níže</li>
                      <li>Vyplňte rok, období, produkt a dávku</li>
                      <li>Klikněte na <strong>"Přidat aplikaci"</strong></li>
                      <li>✅ <strong>Hotovo!</strong> Změny se uloží automaticky</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            <LimingPlanTable
              plan={existingPlan}
              parcelArea={parcel.area}
            />
            
            {/* Informace o rozboru */}
            {latestAnalysis && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📊 Použitá data z půdního rozboru
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Datum rozboru:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(latestAnalysis.analysis_date || latestAnalysis.date).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Výchozí pH:</span>
                    <p className="font-medium text-gray-900">
                      {latestAnalysis.ph.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Hořčík (Mg):</span>
                    <p className="font-medium text-gray-900">
                      {Math.round(latestAnalysis.mg)} mg/kg
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Draslík (K):</span>
                    <p className="font-medium text-gray-900">
                      {Math.round(latestAnalysis.k)} mg/kg
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Půdní typ:</span>
                    <p className="font-medium text-gray-900">
                      {parcel.soil_type === 'L' ? 'Lehká' : 
                       parcel.soil_type === 'S' ? 'Střední' : 'Těžká'}
                    </p>
                  </div>
                </div>
                
                {latestAnalysis.lab_name && (
                  <p className="text-sm text-gray-600 mt-3">
                    Laboratoř: {latestAnalysis.lab_name}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
