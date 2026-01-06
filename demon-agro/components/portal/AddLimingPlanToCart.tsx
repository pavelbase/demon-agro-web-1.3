'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useLimingCart, type LimingCartApplication } from '@/lib/contexts/LimingCartContext'
import { toast } from 'react-hot-toast'

interface LimingApplication {
  id: string
  year: number
  season: 'jaro' | 'leto' | 'podzim'
  product_name: string
  dose_per_ha: number
  total_dose: number
  cao_per_ha: number
  status: string
}

interface AddLimingPlanToCartProps {
  planId: string
  parcelId: string
  parcelName: string
  parcelCode?: string
  parcelArea: number
  applications: LimingApplication[]
  planStatus: string
}

export default function AddLimingPlanToCart({
  planId,
  parcelId,
  parcelName,
  parcelCode,
  parcelArea,
  applications,
  planStatus,
}: AddLimingPlanToCartProps) {
  const { addItem } = useLimingCart()
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set())
  const [showYearSelection, setShowYearSelection] = useState(false)

  // Filtrovat pouze naplánované aplikace
  const plannedApplications = applications.filter(
    (app) => app.status === 'planned' || app.status === 'ordered'
  )

  const toggleYear = (appId: string) => {
    setSelectedYears((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(appId)) {
        newSet.delete(appId)
      } else {
        newSet.add(appId)
      }
      return newSet
    })
  }

  const handleAddToCart = () => {
    // Kontrola stavu plánu
    if (planStatus !== 'approved') {
      toast.error('Nejdříve musíte plán schválit a uložit')
      return
    }

    if (plannedApplications.length === 0) {
      toast.error('Žádné naplánované aplikace k přidání')
      return
    }

    // Pokud není zobrazený výběr roků, zobrazit
    if (!showYearSelection) {
      setShowYearSelection(true)
      // Předvybrat všechny roky
      setSelectedYears(new Set(plannedApplications.map((app) => app.id)))
      return
    }

    // Pokud není nic vybráno, přidat všechny
    const appsToAdd = selectedYears.size === 0
      ? plannedApplications
      : plannedApplications.filter((app) => selectedYears.has(app.id))

    if (appsToAdd.length === 0) {
      toast.error('Vyberte alespoň jeden rok aplikace')
      return
    }

    // Převést na formát pro košík
    const cartApplications: LimingCartApplication[] = appsToAdd.map((app) => ({
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
    const totalCao = appsToAdd.reduce((sum, app) => sum + app.cao_per_ha, 0)
    const totalProduct = appsToAdd.reduce((sum, app) => sum + app.total_dose, 0)

    // Přidat do košíku
    addItem({
      parcel_id: parcelId,
      parcel_name: parcelName,
      parcel_code: parcelCode,
      area_ha: parcelArea,
      recommended_type: 'either',
      quantity_cao_t: totalCao * parcelArea,
      quantity_product_t: totalProduct,
      reason: `Plán vápnění - ${appsToAdd.length}x aplikace (${appsToAdd.map(a => a.year).join(', ')})`,
      applications: cartApplications,
    })

    toast.success(`✅ Přidáno do poptávky (${appsToAdd.length}x aplikace)`)
    setShowYearSelection(false)
    setSelectedYears(new Set())
  }

  if (plannedApplications.length === 0) {
    return null
  }

  const isPlanApproved = planStatus === 'approved'

  return (
    <div className="space-y-3">
      {/* Hlavní tlačítko */}
      <button
        onClick={handleAddToCart}
        disabled={!isPlanApproved}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isPlanApproved
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={!isPlanApproved ? 'Nejdříve schvalte a uložte plán' : ''}
      >
        <ShoppingCart className="w-5 h-5" />
        {showYearSelection ? 'Potvrdit výběr' : 'Přidat do poptávky'}
      </button>
      
      {/* Info text pokud není schválený */}
      {!isPlanApproved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Pro přidání do poptávky musíte nejdříve plán schválit a uložit pomocí tlačítka <strong>"Schválit plán"</strong> níže.
          </p>
        </div>
      )}

      {/* Výběr roků */}
      {showYearSelection && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Vyberte roky pro poptávku:
          </h4>
          <div className="space-y-2">
            {plannedApplications.map((app) => (
              <label
                key={app.id}
                className="flex items-center gap-3 p-2 hover:bg-green-100 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedYears.has(app.id)}
                  onChange={() => toggleYear(app.id)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{app.year}</span>
                    <span className="text-sm text-gray-600 capitalize">
                      ({app.season === 'jaro' ? '🌱 Jaro' : app.season === 'leto' ? '☀️ Léto' : '🍂 Podzim'})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {app.product_name} • {app.dose_per_ha.toFixed(2)} t/ha • celkem {app.total_dose.toFixed(1)} t
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-green-300">
            <button
              onClick={() => {
                setShowYearSelection(false)
                setSelectedYears(new Set())
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Zrušit výběr
            </button>
            <span className="text-sm text-gray-500 ml-3">
              ({selectedYears.size} {selectedYears.size === 1 ? 'rok vybrán' : selectedYears.size > 1 && selectedYears.size < 5 ? 'roky vybrány' : 'roků vybráno'})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}


