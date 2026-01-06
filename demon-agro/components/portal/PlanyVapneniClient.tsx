'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Calendar, MapPin, ChevronRight, ShoppingCart, Check, LayoutGrid, Table2, Trash2, AlertTriangle, FileDown } from 'lucide-react'
import { useLimingCart, type LimingCartApplication } from '@/lib/contexts/LimingCartContext'
import { toast } from 'react-hot-toast'
import { calculateEstimatedCost, formatPrice } from '@/lib/constants/liming-prices'
import TabulkovyPrehledVapneni from './TabulkovyPrehledVapneni'
import ExportAllLimingPlansPDF from './ExportAllLimingPlansPDF'
import type { SoilAnalysis, SoilType, Culture } from '@/lib/types/database'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  year: number
  season: 'jaro' | 'leto' | 'podzim'
  product_name: string
  dose_per_ha: number
  total_dose: number
  cao_per_ha: number
  mgo_per_ha: number
  ph_before: number
  ph_after: number
  status: string
  product_price_per_ton?: number | null
}

interface Parcel {
  id: string
  name: string
  code: string
  area: number
  soil_type: string
  user_id: string
}

interface Plan {
  id: string
  total_cao_need: number
  total_cao_need_per_ha: number
  current_ph: number
  target_ph: number
  status: string
  created_at: string
  parcels: Parcel
  applications: Application[]
}

interface ParcelWithAnalysis {
  id: string
  name: string
  area: number
  soil_type: SoilType
  culture: Culture
  latest_analysis: SoilAnalysis | null
}

interface LimingProduct {
  id: string
  name: string
  cao_content: number
  mgo_content: number
  type: 'calcitic' | 'dolomite' | 'both'
}

interface PlanyVapneniClientProps {
  plans: Plan[]
  stats: {
    totalPlans: number
    totalParcels: number
    totalCaoNeed: number
    totalArea: number
    activeApplications: number
    totalPrice: number
  }
  allParcels: ParcelWithAnalysis[]
  limingProducts: LimingProduct[]
  userProfile: {
    full_name: string | null
    company_name: string | null
  } | null
}

type TabType = 'karty' | 'tabulka'

export default function PlanyVapneniClient({ 
  plans: initialPlans, 
  stats, 
  allParcels, 
  limingProducts,
  userProfile 
}: PlanyVapneniClientProps) {
  const router = useRouter()
  const { addItem } = useLimingCart()
  const [plans, setPlans] = useState(initialPlans)
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<TabType>('karty')
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Aktualizovat lokální stav, když se změní props
  useEffect(() => {
    setPlans(initialPlans)
  }, [initialPlans])

  const togglePlan = (planId: string) => {
    setSelectedPlans((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(planId)) {
        newSet.delete(planId)
      } else {
        newSet.add(planId)
      }
      return newSet
    })
  }

  const toggleAll = () => {
    if (selectedPlans.size === plans.length) {
      setSelectedPlans(new Set())
    } else {
      setSelectedPlans(new Set(plans.map((p) => p.id)))
    }
  }

  const addSelectedToCart = () => {
    if (selectedPlans.size === 0) {
      toast.error('Vyberte alespoň jeden plán')
      return
    }

    let addedCount = 0
    let skippedCount = 0
    selectedPlans.forEach((planId) => {
      const plan = plans.find((p) => p.id === planId)
      if (!plan) return

      // Kontrola stavu plánu
      if (plan.status !== 'approved') {
        skippedCount++
        return
      }

      const plannedApplications = plan.applications.filter(
        (app) => app.status === 'planned' || app.status === 'ordered'
      )

      if (plannedApplications.length === 0) return

      // Převést na formát pro košík
      const cartApplications: LimingCartApplication[] = plannedApplications.map((app) => ({
        year: app.year,
        season: app.season === 'leto' ? 'podzim' : (app.season as 'jaro' | 'podzim'),
        product_name: app.product_name,
        dose_per_ha: app.dose_per_ha,
        total_tons: app.total_dose,
        cao_per_ha: app.cao_per_ha,
        plan_id: planId,
        application_id: app.id,
      }))

      // Spočítat celkové hodnoty
      const totalCao = plannedApplications.reduce((sum, app) => sum + app.cao_per_ha, 0)
      const totalProduct = plannedApplications.reduce((sum, app) => sum + app.total_dose, 0)

      addItem({
        parcel_id: plan.parcels.id,
        parcel_name: plan.parcels.name,
        parcel_code: plan.parcels.code,
        area_ha: plan.parcels.area,
        recommended_type: 'either',
        quantity_cao_t: totalCao * plan.parcels.area,
        quantity_product_t: totalProduct,
        reason: `Plán vápnění - ${plannedApplications.length}x aplikace (${plannedApplications.map((a) => a.year).join(', ')})`,
        applications: cartApplications,
      })

      addedCount++
    })

    if (addedCount > 0) {
      toast.success(`✅ Přidáno ${addedCount} plánů do poptávky`)
    }
    if (skippedCount > 0) {
      toast.error(`⚠️ Přeskočeno ${skippedCount} neschválených plánů`)
    }
    setSelectedPlans(new Set())
  }

  const addSingleToCart = (plan: Plan) => {
    // Kontrola stavu plánu
    if (plan.status !== 'approved') {
      toast.error('Nejdříve musíte plán schválit a uložit')
      return
    }

    const plannedApplications = plan.applications.filter(
      (app) => app.status === 'planned' || app.status === 'ordered'
    )

    if (plannedApplications.length === 0) {
      toast.error('Žádné naplánované aplikace')
      return
    }

    // Převést na formát pro košík
    const cartApplications: LimingCartApplication[] = plannedApplications.map((app) => ({
      year: app.year,
      season: app.season === 'leto' ? 'podzim' : (app.season as 'jaro' | 'podzim'),
      product_name: app.product_name,
      dose_per_ha: app.dose_per_ha,
      total_tons: app.total_dose,
      cao_per_ha: app.cao_per_ha,
      plan_id: plan.id,
      application_id: app.id,
    }))

    const totalCao = plannedApplications.reduce((sum, app) => sum + app.cao_per_ha, 0)
    const totalProduct = plannedApplications.reduce((sum, app) => sum + app.total_dose, 0)

    addItem({
      parcel_id: plan.parcels.id,
      parcel_name: plan.parcels.name,
      parcel_code: plan.parcels.code,
      area_ha: plan.parcels.area,
      recommended_type: 'either',
      quantity_cao_t: totalCao * plan.parcels.area,
      quantity_product_t: totalProduct,
      reason: `Plán vápnění - ${plannedApplications.length}x aplikace (${plannedApplications.map((a) => a.year).join(', ')})`,
      applications: cartApplications,
    })

    toast.success('✅ Přidáno do poptávky')
  }

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete({
      id: plan.id,
      name: plan.parcels.name
    })
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/portal/liming-plans/${planToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Chyba při mazání plánu')
      }

      // Optimistic update - odebrat plán ze seznamu ihned
      setPlans(prevPlans => prevPlans.filter(p => p.id !== planToDelete.id))
      
      // Odebrat ze selected plans pokud tam byl
      setSelectedPlans(prev => {
        const newSet = new Set(prev)
        newSet.delete(planToDelete.id)
        return newSet
      })

      toast.success('✅ Plán vápnění byl smazán')
      setPlanToDelete(null)
      
      // Refresh v pozadí pro jistotu
      router.refresh()
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při mazání plánu')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setPlanToDelete(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Plány vápnění</h1>
          </div>
          <p className="text-gray-600">
            {activeTab === 'karty' 
              ? 'Souhrný přehled všech plánů vápnění z vašich pozemků'
              : 'Kompletní tabulkový přehled všech pozemků s doporučeními vápnění'}
          </p>
        </div>

        {/* Záložky */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('karty')}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'karty'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <LayoutGrid className="w-5 h-5" />
                Karty pozemků
              </button>
              <button
                onClick={() => setActiveTab('tabulka')}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'tabulka'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Table2 className="w-5 h-5" />
                Tabulkový přehled
              </button>
            </nav>
          </div>
        </div>

        {/* Zobrazení podle aktivní záložky */}
        {activeTab === 'tabulka' ? (
          <TabulkovyPrehledVapneni 
            parcels={allParcels}
            limingProducts={limingProducts}
            userProfile={userProfile}
          />
        ) : (
          <>
            {/* Statistiky a Export */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Statistiky */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 mb-1">Aktivních plánů</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 mb-1">Pozemků s plánem</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalParcels}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 mb-1">Celková potřeba CaO</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCaoNeed.toFixed(1)} t</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({(stats.totalCaoNeed / stats.totalArea || 0).toFixed(2)} t/ha)
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 mb-1">Aktivních aplikací</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeApplications}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow-md p-4">
                  <p className="text-sm text-green-700 font-medium mb-1">Odhadovaná cena</p>
                  <p className="text-2xl font-bold text-green-900">{formatPrice(stats.totalPrice)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.totalPrice > 0 ? 'bez DPH, dopravy a aplikace' : 'cena bude stanovena individuálně'}
                  </p>
                </div>
              </div>

              {/* Export tlačítko */}
              {plans && plans.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">📄 Export do PDF</h3>
                      <p className="text-sm text-gray-600">
                        Exportujte všechny plány vápnění do jednoho PDF souboru s kompletními detaily, produkty, termíny a cenami
                      </p>
                    </div>
                    <div className="ml-4">
                      <ExportAllLimingPlansPDF 
                        plans={plans}
                        userProfile={userProfile}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

        {/* Hromadná akce */}
        {plans && plans.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlans.size === plans.length && plans.length > 0}
                  onChange={toggleAll}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="font-medium text-gray-900">
                  Vybrat vše ({selectedPlans.size}/{plans.length})
                </span>
              </label>
              <button
                onClick={addSelectedToCart}
                disabled={selectedPlans.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                Přidat vybrané do poptávky
              </button>
            </div>
          </div>
        )}

        {/* Seznam plánů */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {!plans || plans.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Žádné plány vápnění</h3>
              <p className="text-gray-600 mb-4">
                Zatím nemáte žádné plány vápnění. Vytvořte si první plán u některého pozemku.
              </p>
              <Link
                href="/portal/pozemky"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Přejít na pozemky
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {plans.map((plan) => {
                const parcel = plan.parcels
                const applications = plan.applications || []
                const nextApp = applications
                  .filter((a) => a.status === 'planned' || a.status === 'ordered')
                  .sort((a, b) => a.year - b.year)[0]

                // Výpočet odhadované ceny
                const estimatedCost = applications
                  .filter((a) => a.status === 'planned' || a.status === 'ordered')
                  .reduce((sum, app) => sum + calculateEstimatedCost(app.product_price_per_ton || 0, app.total_dose), 0)

                return (
                  <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedPlans.has(plan.id)}
                          onChange={() => togglePlan(plan.id)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Obsah */}
                      <div className="flex-1">
                        {/* Pozemek */}
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {parcel.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {parcel.code} • {parcel.area.toFixed(2)} ha • Půda: {parcel.soil_type}
                            </p>
                          </div>
                        </div>

                        {/* Info o plánu */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 ml-8">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">pH</p>
                            <p className="font-semibold text-gray-900">
                              {plan.current_ph.toFixed(1)} → {plan.target_ph.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Potřeba CaO</p>
                            <p className="font-semibold text-gray-900">{plan.total_cao_need.toFixed(2)} t</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Aplikací</p>
                            <p className="font-semibold text-gray-900">{applications.length}x</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Nejbližší aplikace</p>
                            {nextApp ? (
                              <p className="font-semibold text-green-600">
                                {nextApp.year} ({nextApp.season})
                              </p>
                            ) : (
                              <p className="text-gray-400 text-sm">-</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Odhadovaná cena</p>
                            <p className="font-semibold text-gray-900">{formatPrice(estimatedCost)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Akce */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addSingleToCart(plan)
                          }}
                          disabled={plan.status !== 'approved'}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.status === 'approved'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={plan.status === 'approved' ? 'Přidat do poptávky' : 'Nejdříve schvalte plán'}
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(plan)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Smazat plán"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/portal/pozemky/${parcel.id}/plan-vapneni`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

            {/* Info box */}
            {plans && plans.length > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Vyberte plány pomocí checkboxů a přidejte je hromadně do poptávky,
                  nebo klikněte na ikonu košíku u jednotlivých plánů.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Potvrzovací dialog pro smazání */}
      {planToDelete && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleDeleteCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              {/* Nadpis */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Smazat plán vápnění?
              </h3>

              {/* Text */}
              <p className="text-sm text-gray-600 text-center mb-6">
                Opravdu chcete smazat plán vápnění pro pozemek <strong>{planToDelete.name}</strong>? 
                Tato akce je nevratná a budou smazány všechny související aplikace.
              </p>

              {/* Tlačítka */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Mažu...' : 'Smazat'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

