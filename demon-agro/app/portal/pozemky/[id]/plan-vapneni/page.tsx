import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calculator, ShoppingCart, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { calculateLimeNeed, selectLimeType } from '@/lib/utils/calculations'
import { LimingProductSelector } from '@/components/portal/LimingProductSelector'

export default async function LimingPlanPage({
  params,
}: {
  params: { id: string }
}) {
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

  const latestAnalysis = analyses?.[0] || null

  // If no analysis, show empty state
  if (!latestAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/portal/pozemky/${params.id}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary-green mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Zpět na detail pozemku
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Plán vápnění - {parcel.name}
            </h1>
            <p className="text-gray-600 mt-1">{parcel.area} ha</p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chybí rozbor půdy
            </h2>
            <p className="text-gray-600 mb-6">
              Pro vytvoření plánu vápnění je potřeba aktuální rozbor půdy s hodnotou pH.
              Nahrajte rozbor a my automaticky vypočítáme doporučené množství vápna.
            </p>
            <Link
              href={`/portal/upload?parcel=${params.id}`}
              className="inline-flex items-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
            >
              Nahrát rozbor půdy
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate liming need
  const targetPh = parcel.culture === 'orna' ? 6.5 : 6.0
  const limeNeedResult = calculateLimeNeed(
    latestAnalysis.ph,
    parcel.soil_type,
    parcel.culture,
    targetPh
  )
  const limeNeedKgHa = limeNeedResult.amount

  // Calculate total need for parcel
  const parcelArea = Number(parcel.area)
  const totalLimeNeedTons = (limeNeedKgHa * parcelArea) / 1000

  // Select lime type recommendation
  const limeTypeRecommendation = selectLimeType(latestAnalysis)

  // Fetch liming products
  const { data: allProducts } = await supabase
    .from('liming_products')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const products = allProducts || []

  // Filter products by recommended type
  let recommendedProducts = products
  if (limeTypeRecommendation === 'calcitic') {
    recommendedProducts = products.filter(p => p.type === 'calcitic' || p.type === 'both')
  } else if (limeTypeRecommendation === 'dolomite') {
    recommendedProducts = products.filter(p => p.type === 'dolomite' || p.type === 'both')
  }

  // Check if liming is needed
  const limingNeeded = limeNeedKgHa > 0

  // Get K:Mg ratio
  const kmgRatio = latestAnalysis.potassium / latestAnalysis.magnesium

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/portal/pozemky/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-green mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zpět na detail pozemku
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Plán vápnění - {parcel.name}
          </h1>
          <p className="text-gray-600 mt-1">{parcel.area} ha • {parcel.cadastral_number || 'Bez kódu'}</p>
        </div>

        {!limingNeeded ? (
          // No liming needed
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-start">
              <CheckCircle className="h-12 w-12 text-green-500 mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Vápnění není potřeba
                </h2>
                <p className="text-gray-600 mb-4">
                  Aktuální pH půdy je v optimálním rozmezí. Vápnění v tuto chvíli není nutné.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Aktuální stav</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Aktuální pH</p>
                      <p className="text-2xl font-bold text-green-600">{latestAnalysis.ph.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cílové pH</p>
                      <p className="text-2xl font-bold text-gray-900">{targetPh.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kategorie</p>
                      <p className="text-lg font-semibold text-gray-900">{latestAnalysis.ph_category || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Doporučení:</strong> Provádějte pravidelné rozbory půdy každé 4 roky 
                        pro monitoring pH. Pokud pH klesne pod {targetPh - 0.5}, naplánujte vápnění.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Liming needed
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Přehled potřeby */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-primary-green" />
                  Přehled potřeby vápnění
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Aktuální pH</p>
                    <p className="text-3xl font-bold text-orange-600">{latestAnalysis.ph.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">Kategorie: {latestAnalysis.ph_category}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cílové pH</p>
                    <p className="text-3xl font-bold text-green-600">{targetPh.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {parcel.culture === 'orna' ? 'Orná půda' : 'TTP'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Rozdíl pH</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(targetPh - latestAnalysis.ph).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">jednotek</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary-green/10 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-1">Potřeba CaO</p>
                    <p className="text-2xl font-bold text-primary-green">
                      {(limeNeedKgHa / 1000).toFixed(2)} t/ha
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      = {limeNeedKgHa.toLocaleString('cs-CZ')} kg/ha
                    </p>
                  </div>
                  
                  <div className="bg-primary-brown/10 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-1">Celková potřeba pro pozemek</p>
                    <p className="text-2xl font-bold text-primary-brown">
                      {totalLimeNeedTons.toFixed(2)} t
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Pro {parcel.area} ha
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Doporučený typ vápence */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Doporučený typ vápence
                </h2>
                
                <div className="flex items-start">
                  <div className={`
                    flex-shrink-0 w-24 h-24 rounded-lg flex items-center justify-center text-3xl font-bold text-white
                    ${limeTypeRecommendation === 'calcitic' ? 'bg-blue-500' : 
                      limeTypeRecommendation === 'dolomite' ? 'bg-purple-500' : 
                      'bg-gray-500'}
                  `}>
                    {limeTypeRecommendation === 'calcitic' ? 'Ca' :
                     limeTypeRecommendation === 'dolomite' ? 'Ca+Mg' : '?'}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {limeTypeRecommendation === 'calcitic' && 'Vápenatý (kalcitický) vápenec'}
                      {limeTypeRecommendation === 'dolomite' && 'Dolomitický vápenec'}
                      {limeTypeRecommendation === 'either' && 'Libovolný typ vápence'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {limeTypeRecommendation === 'dolomite' 
                        ? 'Doporučujeme dolomitický vápenec pro zvýšení obsahu hořčíku v půdě.'
                        : limeTypeRecommendation === 'calcitic'
                        ? 'Doporučujeme vápenatý vápenec pro optimalizaci pH bez zvýšení hořčíku.'
                        : 'Můžete použít jakýkoliv typ vápence podle dostupnosti a ceny.'}
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Aktuální Mg</p>
                          <p className="text-lg font-semibold">
                            {latestAnalysis.magnesium} mg/kg
                          </p>
                          <p className="text-xs text-gray-500">
                            Kategorie: {latestAnalysis.magnesium_category}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Poměr K:Mg</p>
                          <p className="text-lg font-semibold">
                            {kmgRatio.toFixed(2)}:1
                          </p>
                          <p className={`text-xs font-medium ${
                            kmgRatio >= 1.5 && kmgRatio <= 2.5 ? 'text-green-600' :
                            kmgRatio >= 1.2 && kmgRatio <= 3.5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {kmgRatio >= 1.5 && kmgRatio <= 2.5 ? 'Optimální' :
                             kmgRatio < 1.5 ? 'Nízký K' : 'Nízký Mg'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Produkty Démon Agro */}
              <LimingProductSelector
                products={recommendedProducts}
                limeNeedKgHa={limeNeedKgHa}
                parcelArea={parcel.area}
                parcelId={parcel.id}
                parcelName={parcel.name}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">O výpočtu</h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Potřeba vápna je vypočtena podle půdního typu ({parcel.soil_type}) 
                      a rozdílu mezi aktuálním a cílovým pH.
                    </p>
                    <p className="text-sm text-blue-800">
                      Výpočet zohledňuje české zemědělské normy a doporučení ÚKZÚZ.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timing recommendation */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Doporučený termín aplikace</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Podzim:</strong> Po sklizni, ideálně do konce října</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span><strong>Jaro:</strong> Před setím, únor-březen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Nevhodné: V zimě nebo na zmrzlou půdu</span>
                  </li>
                </ul>
              </div>

              {/* Data source */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Použitá data</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Rozbor půdy</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(latestAnalysis.date).toLocaleDateString('cs-CZ')}
                    </dd>
                  </div>
                  {latestAnalysis.lab_name && (
                    <div>
                      <dt className="text-gray-600">Laboratoř</dt>
                      <dd className="font-medium text-gray-900">{latestAnalysis.lab_name}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-600">Půdní typ</dt>
                    <dd className="font-medium text-gray-900">
                      {parcel.soil_type === 'L' ? 'Lehká' : 
                       parcel.soil_type === 'S' ? 'Střední' : 'Těžká'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Kultura</dt>
                    <dd className="font-medium text-gray-900">
                      {parcel.culture === 'orna' ? 'Orná půda' : 'TTP'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
