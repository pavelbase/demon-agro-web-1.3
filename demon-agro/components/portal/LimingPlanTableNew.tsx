'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Save, X, Trash2, Calendar, Leaf, Plus, Loader2, Info, Check } from 'lucide-react'
import { calculatePhChange } from '@/lib/utils/liming-calculator'
import { calculateEstimatedCost, formatPrice } from '@/lib/constants/liming-prices'

interface LimingApplication {
  id: string
  year: number
  season: 'jaro' | 'leto' | 'podzim'
  sequence_order: number
  product_name: string
  cao_content: number
  mgo_content: number
  dose_per_ha: number
  total_dose: number
  cao_per_ha: number
  mgo_per_ha: number
  ph_before: number
  ph_after: number
  mg_after: number | null
  notes: string | null
  status: 'planned' | 'ordered' | 'applied' | 'cancelled'
  product_price_per_ton: number | null
}

interface LimingPlan {
  id: string
  total_cao_need: number
  total_cao_need_per_ha: number
  soil_type: string
  status: string
  applications: LimingApplication[]
}

interface LimingPlanTableProps {
  plan: LimingPlan
  parcelArea: number
}

export default function LimingPlanTable({ 
  plan, 
  parcelArea
}: LimingPlanTableProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [calculatedValues, setCalculatedValues] = useState<any>({})
  const [warnings, setWarnings] = useState<string[]>([])
  const [newAppWarnings, setNewAppWarnings] = useState<string[]>([])
  const [newAppCalculated, setNewAppCalculated] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [deletingPlan, setDeletingPlan] = useState(false)
  const [approvingPlan, setApprovingPlan] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [newApplication, setNewApplication] = useState<any>({})
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const applications = plan.applications || []
  
  // Seřadit aplikace podle roku (časová posloupnost)
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    // Jaro < Léto < Podzim ve stejném roce
    const seasonOrder = { jaro: 1, leto: 2, podzim: 3 }
    return seasonOrder[a.season] - seasonOrder[b.season]
  })
  
  // Načti produkty při otevření formuláře
  useEffect(() => {
    if (addingNew && products.length === 0) {
      loadProducts()
    }
  }, [addingNew])
  
  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data } = await supabase
        .from('liming_products')
        .select('*')
        .eq('is_active', true)
        .order('cao_content', { ascending: false })
      
      if (data) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }
  
  // Real-time přepočty a VALIDACE při editaci
  useEffect(() => {
    if (!editingId || !editData.dose_per_ha) {
      setWarnings([])
      return
    }
    
    const currentApp = applications.find(a => a.id === editingId)
    if (!currentApp) return
    
    const newWarnings: string[] = []
    const dosePerHa = parseFloat(editData.dose_per_ha)
    const caoPerHa = dosePerHa * (currentApp.cao_content / 100)
    const mgoPerHa = dosePerHa * (currentApp.mgo_content / 100)
    const totalDose = dosePerHa * parcelArea
    
    // ✅ ENV CALCULATION - Account for MgO neutralizing power (1.39x stronger than CaO)
    const MGO_NEUTRALIZING_FACTOR = 1.39
    const env = (currentApp.cao_content / 100) + ((currentApp.mgo_content / 100) * MGO_NEUTRALIZING_FACTOR)
    const effectiveCaoApplied = dosePerHa * env // Effective CaO for pH prediction
    
    // Výpočet pH změny - USE EFFECTIVE CaO (not physical CaO)
    const soilDetailType = plan.soil_type === 'L' ? 'hlinitopiscita' : 
                           plan.soil_type === 'S' ? 'hlinita' : 'jilovitohlinita'
    const phChange = calculatePhChange(effectiveCaoApplied, soilDetailType, currentApp.ph_before)
    const phAfter = Math.min(currentApp.ph_before + phChange, 8.0)
    
    // ===== VALIDACE 1: MgO limit - ODSTRANĚNO =====
    // AGRONOMICKÉ POZNÁMKA: Limit 150 kg MgO/ha platí POUZE pro rozpustná hnojiva (Kieserit).
    // Dolomitické vápno (uhličitanová forma) uvolňuje Mg pomalu po 2-6 let.
    // Standardní dávky 2-4 t/ha (360-720 kg MgO celkem) jsou BEZPEČNÉ a běžné v praxi.
    // Ochrana proti nadměrnému Mg je řešena Smart Product Switching (přepnutí na čistý vápenec při Mg >140 mg/kg).
    
    // ===== VALIDACE 2: Max. jednorázová dávka CaO =====
    const maxDoseCao: Record<string, number> = {
      'hlinitopiscita': 1.4, 'piscitohlnita': 2.1,
      'hlinita': 2.8, 'hlinitojilova': 4.2,
      'jilova': 4.9, 'jilovitohlinita': 4.2
    }
    const maxCao = maxDoseCao[soilDetailType] || 2.8
    
    if (caoPerHa > maxCao * 1.2) {
      newWarnings.push(
        `🔴 KRITICKÉ: Dávka CaO ${caoPerHa.toFixed(2)} t/ha výrazně překračuje max. dávku ` +
        `${maxCao.toFixed(1)} t/ha! Riziko PŘEVÁPNĚNÍ - deficit mikroelementů (Fe, Mn, Zn, Cu).`
      )
    } else if (caoPerHa > maxCao) {
      newWarnings.push(`⚠️ Dávka CaO ${caoPerHa.toFixed(2)} t/ha překračuje doporučených ${maxCao.toFixed(1)} t/ha.`)
    }
    
    // ===== VALIDACE 3: Cílové pH =====
    if (phAfter > 7.5) {
      newWarnings.push(
        `🔴 KRITICKÉ: pH po aplikaci ${phAfter.toFixed(1)} je PŘÍLIŠ VYSOKÉ! ` +
        `Optimum je pH 6.0-7.0. Vysoké pH blokuje mikroelementy. SNIŽTE DÁVKU!`
      )
    } else if (phAfter > 7.2) {
      newWarnings.push(`⚠️ pH ${phAfter.toFixed(1)} je na horní hranici. Optimum: 6.0-7.0`)
    }
    
    setWarnings(newWarnings)
    setCalculatedValues({
      totalDose: totalDose.toFixed(1),
      caoPerHa: caoPerHa.toFixed(2),
      mgoPerHa: mgoPerHa.toFixed(2),
      phAfter: phAfter.toFixed(1)
    })
  }, [editData.dose_per_ha, editingId])
  
  // Real-time validace pro NOVOU aplikaci
  useEffect(() => {
    if (!addingNew || !newApplication.dosePerHa || !newApplication.productId) {
      setNewAppWarnings([])
      setNewAppCalculated({})
      return
    }
    
    const product = products.find(p => p.id === newApplication.productId)
    if (!product) return
    
    const newWarnings: string[] = []
    const dosePerHa = parseFloat(newApplication.dosePerHa)
    const caoPerHa = dosePerHa * (product.cao_content / 100)
    const mgoPerHa = dosePerHa * (product.mgo_content / 100)
    const totalDose = dosePerHa * parcelArea
    
    // ✅ ENV CALCULATION - Account for MgO neutralizing power (1.39x stronger than CaO)
    const MGO_NEUTRALIZING_FACTOR = 1.39
    const env = (product.cao_content / 100) + ((product.mgo_content / 100) * MGO_NEUTRALIZING_FACTOR)
    const effectiveCaoApplied = dosePerHa * env // Effective CaO for pH prediction
    
    // Odhad pH po aplikaci (pokud známe poslední pH)
    const lastApp = sortedApplications[sortedApplications.length - 1]
    const phBefore = lastApp?.ph_after || plan.current_ph || 5.0
    
    const soilDetailType = plan.soil_type === 'L' ? 'hlinitopiscita' : 
                           plan.soil_type === 'S' ? 'hlinita' : 'jilovitohlinita'
    const phChange = calculatePhChange(effectiveCaoApplied, soilDetailType, phBefore)
    const phAfter = Math.min(phBefore + phChange, 8.0)
    
    // ===== VALIDACE 1: MgO limit - ODSTRANĚNO =====
    // Limit 150 kg MgO/ha neplatí pro dolomitické vápno.
    // Ochrana proti nadměrnému Mg: Smart Product Switching při Mg >140 mg/kg.
    
    // ===== VALIDACE 2: Max. CaO =====
    const maxDoseCao: Record<string, number> = {
      'hlinitopiscita': 1.4, 'piscitohlnita': 2.1,
      'hlinita': 2.8, 'hlinitojilova': 4.2,
      'jilova': 4.9, 'jilovitohlinita': 4.2
    }
    const maxCao = maxDoseCao[soilDetailType] || 2.8
    
    if (caoPerHa > maxCao * 1.2) {
      newWarnings.push(
        `🔴 KRITICKÉ: Dávka CaO ${caoPerHa.toFixed(2)} t/ha výrazně překračuje max. ${maxCao.toFixed(1)} t/ha! ` +
        `Riziko PŘEVÁPNĚNÍ.`
      )
    } else if (caoPerHa > maxCao) {
      newWarnings.push(`⚠️ Dávka CaO ${caoPerHa.toFixed(2)} t/ha překračuje doporučených ${maxCao.toFixed(1)} t/ha.`)
    }
    
    // ===== VALIDACE 3: pH =====
    if (phAfter > 7.5) {
      newWarnings.push(
        `🔴 KRITICKÉ: pH po aplikaci ${phAfter.toFixed(1)} bude PŘÍLIŠ VYSOKÉ! SNIŽTE DÁVKU!`
      )
    } else if (phAfter > 7.2) {
      newWarnings.push(`⚠️ pH po aplikaci ${phAfter.toFixed(1)} bude na horní hranici.`)
    }
    
    setNewAppWarnings(newWarnings)
    setNewAppCalculated({
      totalDose: totalDose.toFixed(1),
      caoPerHa: caoPerHa.toFixed(2),
      mgoPerHa: mgoPerHa.toFixed(2),
      phAfter: phAfter.toFixed(1)
    })
  }, [newApplication.dosePerHa, newApplication.productId, addingNew, products])
  
  function startEdit(app: LimingApplication) {
    setEditingId(app.id)
    setEditData({
      year: app.year,
      season: app.season,
      dose_per_ha: app.dose_per_ha
    })
    setCalculatedValues({})
  }
  
  function cancelEdit() {
    setEditingId(null)
    setEditData({})
    setCalculatedValues({})
  }
  
  async function handleSave(applicationId: string) {
    setSaving(true)
    
    try {
      const currentApp = sortedApplications.find(a => a.id === applicationId)
      if (!currentApp) throw new Error('Aplikace nenalezena')
      
      // Uložíme aktuální změny
      const response = await fetch(
        `/api/portal/liming-plans/${plan.id}/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: editData.year,
            season: editData.season,
            dose_per_ha: editData.dose_per_ha,
            total_dose: calculatedValues.totalDose,
            cao_per_ha: calculatedValues.caoPerHa,
            mgo_per_ha: calculatedValues.mgoPerHa,
            ph_after: calculatedValues.phAfter
          })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }
      
      // KASKÁDOVÝ PŘEPOČET navazujících aplikací
      const currentIndex = sortedApplications.findIndex(a => a.id === applicationId)
      const followingApps = sortedApplications.slice(currentIndex + 1)
      
      if (followingApps.length > 0) {
        // Použijeme nové pH jako východisko pro další aplikace
        let previousPhAfter = parseFloat(calculatedValues.phAfter)
        
        for (const nextApp of followingApps) {
          // ✅ ENV CALCULATION for cascade recalculation
          const MGO_NEUTRALIZING_FACTOR = 1.39
          const nextEnv = (nextApp.cao_content / 100) + ((nextApp.mgo_content / 100) * MGO_NEUTRALIZING_FACTOR)
          const nextEffectiveCao = nextApp.dose_per_ha * nextEnv
          
          // Přepočítáme pH pro další aplikaci - USE EFFECTIVE CaO
          const soilDetailType = plan.soil_type === 'L' ? 'hlinitopiscita' : 
                                 plan.soil_type === 'S' ? 'hlinita' : 'jilovitohlinita'
          const phChange = calculatePhChange(nextEffectiveCao, soilDetailType as any, previousPhAfter)
          const newPhAfter = Math.min(previousPhAfter + phChange, 8.0)
          
          // Uložíme nové pH
          await fetch(
            `/api/portal/liming-plans/${plan.id}/applications/${nextApp.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ph_before: previousPhAfter,
                ph_after: newPhAfter
              })
            }
          )
          
          previousPhAfter = newPhAfter
        }
      }
      
      setEditingId(null)
      setEditData({})
      setCalculatedValues({})
      
      // Success feedback
      const { toast } = await import('react-hot-toast')
      toast.success('✅ Změny byly uloženy')
      
      router.refresh()
      
    } catch (error) {
      console.error('Error updating application:', error)
      alert(error instanceof Error ? error.message : 'Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }
  
  async function handleDeletePlan() {
    const confirmed = confirm(
      'Opravdu chcete smazat celý plán vápnění?\n\n' +
      'Tato akce je nevratná a smaže všechny naplánované aplikace.'
    )
    
    if (!confirmed) return
    
    setDeletingPlan(true)
    
    try {
      const response = await fetch(`/api/portal/liming-plans/${plan.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při mazání')
      }
      
      router.refresh()
      
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert(error instanceof Error ? error.message : 'Chyba při mazání plánu')
    } finally {
      setDeletingPlan(false)
    }
  }
  
  async function handleApprovePlan() {
    setApprovingPlan(true)
    
    try {
      const response = await fetch(`/api/portal/liming-plans/${plan.id}/approve`, {
        method: 'PATCH'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při schvalování')
      }
      
      setShowSuccessModal(true)
      
    } catch (error) {
      console.error('Error approving plan:', error)
      alert(error instanceof Error ? error.message : 'Chyba při schvalování plánu')
    } finally {
      setApprovingPlan(false)
    }
  }
  
  async function handleAddNew() {
    if (!newApplication.year || !newApplication.productId || !newApplication.dosePerHa) {
      alert('Vyplňte všechna pole')
      return
    }
    
    setSaving(true)
    
    try {
      const response = await fetch(
        `/api/portal/liming-plans/${plan.id}/applications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: newApplication.year,
            season: newApplication.season || 'podzim',
            limeProductId: newApplication.productId,
            dosePerHa: newApplication.dosePerHa
          })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při přidávání')
      }
      
      // Success feedback
      const { toast } = await import('react-hot-toast')
      toast.success('✅ Aplikace byla přidána a uložena do plánu')
      
      setAddingNew(false)
      setNewApplication({})
      setNewAppWarnings([])
      setNewAppCalculated({})
      router.refresh()
      
    } catch (error) {
      console.error('Error adding application:', error)
      alert(error instanceof Error ? error.message : 'Chyba při přidávání aplikace')
    } finally {
      setSaving(false)
    }
  }
  
  async function handleDeleteApplication(applicationId: string) {
    if (applications.length <= 1) {
      alert('Nemůžete smazat poslední aplikaci. Smažte celý plán.')
      return
    }
    
    const confirmed = confirm('Opravdu chcete smazat tuto aplikaci?')
    if (!confirmed) return
    
    setSaving(true)
    
    try {
      const response = await fetch(
        `/api/portal/liming-plans/${plan.id}/applications/${applicationId}`,
        {
          method: 'DELETE'
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při mazání')
      }
      
      router.refresh()
      
    } catch (error) {
      console.error('Error deleting application:', error)
      alert(error instanceof Error ? error.message : 'Chyba při mazání aplikace')
    } finally {
      setSaving(false)
    }
  }
  
  const getStatusBadge = (status: string) => {
    const badges = {
      planned: { text: 'Naplánováno', color: 'bg-blue-100 text-blue-800' },
      ordered: { text: 'Objednáno', color: 'bg-yellow-100 text-yellow-800' },
      applied: { text: 'Aplikováno', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Zrušeno', color: 'bg-gray-100 text-gray-800' }
    }
    const badge = badges[status as keyof typeof badges] || badges.planned
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Časový plán vápnění</h2>
                {/* Status badge - pouze pro návrh */}
                {plan.status === 'draft' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded mt-1">
                    📝 Návrh (neuloženo)
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 block mb-1">Celková potřeba CaO:</span>
                <p className="font-bold text-gray-900">
                  {plan.total_cao_need?.toFixed(2)} t
                </p>
                <p className="text-gray-500 text-xs">
                  ({plan.total_cao_need_per_ha?.toFixed(2)} t/ha)
                </p>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Max. dávka:</span>
                <p className="font-bold text-gray-900">
                  {plan.soil_type === 'L' ? '1.0-1.5 t/ha' : 
                   plan.soil_type === 'S' ? '2.0-3.0 t/ha' : 
                   '3.0-3.5 t/ha'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Interval:</span>
                <p className="font-bold text-gray-900">3 roky</p>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Počet aplikací:</span>
                <p className="font-bold text-gray-900">{applications.length}x</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Tlačítko schválení - pouze pro draft */}
            {plan.status === 'draft' && (
              <button
                onClick={handleApprovePlan}
                disabled={approvingPlan}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
              >
                {approvingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Schvaluji...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Schválit plán
                  </>
                )}
              </button>
            )}
            
            {/* Info badge pro schválené plány */}
            {plan.status === 'approved' && (
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">Všechny změny se ukládají automaticky</span>
              </div>
            )}
            
            {/* Tlačítko smazání */}
            <button
              onClick={handleDeletePlan}
              disabled={deletingPlan}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {deletingPlan ? 'Mažu...' : 'Smazat plán'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="liming-table-container">
        <table className="w-full" style={{ minWidth: '1200px' }}>
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="liming-sticky-col liming-sticky-col-1 px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider bg-gray-50">
                Rok
              </th>
              <th className="liming-sticky-col liming-sticky-col-2 px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider bg-gray-50" style={{ boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.15)' }}>
                Období
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Produkt
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 tracking-wider">
                Dávka (t/ha)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 tracking-wider">
                Celkem (t)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 tracking-wider">
                CaO (t/ha)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 tracking-wider">
                MgO (t/ha)
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                pH
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                <div className="flex items-center gap-1">
                  Doporučení
                  <button
                    className="text-gray-400 hover:text-gray-600 group relative"
                    type="button"
                  >
                    <Info className="w-3 h-3" />
                    <div className="invisible group-hover:visible absolute left-0 top-5 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                      <p className="font-semibold mb-2">Logika výběru produktu:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Dolomit: při nízkém Mg (&lt; 120 mg/kg)</li>
                        <li>Pálené vápno: pro rychlý účinek při pH &lt; 5.0</li>
                        <li>Vápenec: pro postupné zvyšování pH</li>
                      </ul>
                    </div>
                  </button>
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 tracking-wider group relative">
                <div className="flex items-center justify-end gap-1">
                  Odhadovaná cena
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    title="Orientační cena bez dopravy a aplikace"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedApplications.map((app, idx) => {
              const isEditing = editingId === app.id
              
              return (
                <tr key={app.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {/* Rok */}
                  <td className={`liming-sticky-col liming-sticky-col-1 px-4 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        value={editData.year}
                        onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">{app.year}</span>
                    )}
                  </td>
                  
                  {/* Období */}
                  <td className={`liming-sticky-col liming-sticky-col-2 px-4 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {isEditing ? (
                      <select
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        value={editData.season}
                        onChange={(e) => setEditData({ ...editData, season: e.target.value })}
                      >
                        <option value="jaro">Jaro</option>
                        <option value="leto">Léto</option>
                        <option value="podzim">Podzim</option>
                      </select>
                    ) : (
                      <span className="capitalize text-gray-700">
                        {app.season === 'jaro' ? '🌱 Jaro' : 
                         app.season === 'leto' ? '☀️ Léto' : '🍂 Podzim'}
                      </span>
                    )}
                  </td>
                  
                  {/* Produkt */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{app.product_name}</p>
                      <p className="text-xs text-gray-500">
                        {app.cao_content}% CaO, {app.mgo_content}% MgO
                      </p>
                    </div>
                  </td>
                  
                  {/* Dávka */}
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded focus:ring-2 text-right ${
                            warnings.length > 0 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                          }`}
                          value={editData.dose_per_ha}
                          onChange={(e) => setEditData({ ...editData, dose_per_ha: parseFloat(e.target.value) })}
                        />
                        {warnings.length > 0 && (
                          <div className="absolute mt-1 p-2 bg-red-50 border border-red-200 rounded shadow-lg text-left z-10 w-80">
                            {warnings.map((w, i) => (
                              <p key={i} className="text-xs text-red-800 mb-1 last:mb-0">{w}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-gray-900">{app.dose_per_ha?.toFixed(2)}</span>
                    )}
                  </td>
                  
                  {/* Celkem */}
                  <td className="px-4 py-3 text-right">
                    <span className={isEditing && calculatedValues.totalDose ? 
                      "font-mono text-blue-600 font-semibold" : 
                      "font-mono text-gray-900"
                    }>
                      {isEditing && calculatedValues.totalDose ? 
                        calculatedValues.totalDose : 
                        app.total_dose?.toFixed(1)
                      }
                    </span>
                  </td>
                  
                  {/* CaO */}
                  <td className="px-4 py-3 text-right">
                    <span className={isEditing && calculatedValues.caoPerHa ? 
                      "font-mono text-blue-600 font-semibold" : 
                      "font-mono text-gray-700"
                    }>
                      {isEditing && calculatedValues.caoPerHa ? 
                        calculatedValues.caoPerHa : 
                        app.cao_per_ha?.toFixed(2)
                      }
                    </span>
                  </td>
                  
                  {/* MgO */}
                  <td className="px-4 py-3 text-right">
                    <span className={isEditing && calculatedValues.mgoPerHa ? 
                      "font-mono text-blue-600 font-semibold" : 
                      "font-mono text-gray-700"
                    }>
                      {isEditing && calculatedValues.mgoPerHa ? 
                        calculatedValues.mgoPerHa : 
                        (app.mgo_per_ha ? app.mgo_per_ha.toFixed(2) : '-')
                      }
                    </span>
                  </td>
                  
                  {/* pH */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm text-gray-600">{app.ph_before?.toFixed(1)}</span>
                      <span className="text-gray-400">→</span>
                      <span className={isEditing && calculatedValues.phAfter ? 
                        "text-sm font-semibold text-blue-600" : 
                        "text-sm font-semibold text-green-600"
                      }>
                        {isEditing && calculatedValues.phAfter ? 
                          calculatedValues.phAfter : 
                          app.ph_after?.toFixed(1)
                        }
                      </span>
                    </div>
                  </td>
                  
                  {/* Doporučení */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{app.notes}</span>
                  </td>
                  
                  {/* Odhadovaná cena */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">
                      {app.product_price_per_ton 
                        ? formatPrice(calculateEstimatedCost(app.product_price_per_ton, app.total_dose))
                        : <span className="text-xs text-gray-500">individuální</span>
                      }
                    </span>
                  </td>
                  
                  {/* Akce */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(app.id)}
                            disabled={saving}
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                            title="Uložit"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                            title="Zrušit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(app)}
                            className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Upravit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {applications.length > 1 && (
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              disabled={saving}
                              className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          
          {/* Footer - Součty */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr className="font-semibold">
              <td colSpan={4} className="px-4 py-3 text-gray-900">
                CELKEM:
              </td>
              <td className="px-4 py-3 text-right text-gray-900">
                {applications.reduce((sum, app) => sum + (app.total_dose || 0), 0).toFixed(1)} t
              </td>
              <td className="px-4 py-3 text-right text-gray-900">
                {applications.reduce((sum, app) => sum + (app.cao_per_ha || 0), 0).toFixed(2)} t/ha
              </td>
              <td className="px-4 py-3 text-right text-gray-900">
                {applications.reduce((sum, app) => sum + (app.mgo_per_ha || 0), 0).toFixed(2)} t/ha
              </td>
              <td colSpan={2}></td>
              <td className="px-4 py-3 text-right text-gray-900">
                {formatPrice(
                  applications.reduce(
                    (sum, app) => sum + calculateEstimatedCost(app.product_price_per_ton || 0, app.total_dose),
                    0
                  )
                )}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Tlačítko přidat další rok */}
      {applications.length < 10 && !addingNew && (
        <div className="p-4 border-t">
          <button
            onClick={() => setAddingNew(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 border-2 border-green-200 border-dashed rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Přidat další rok aplikace (max 10)
          </button>
        </div>
      )}
      
      {/* Formulář pro novou aplikaci */}
      {addingNew && (
        <div className="p-6 bg-green-50 border-t border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4">➕ Přidat novou aplikaci</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rok</label>
              <input
                type="number"
                min={new Date().getFullYear()}
                max={2050}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="2026"
                value={newApplication.year || ''}
                onChange={(e) => setNewApplication({ ...newApplication, year: parseInt(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Období aplikace</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={newApplication.season || 'podzim'}
                onChange={(e) => setNewApplication({ ...newApplication, season: e.target.value })}
              >
                <option value="jaro">🌱 Jaro (únor-květen)</option>
                <option value="leto">☀️ Léto (červen-červenec)</option>
                <option value="podzim">🍂 Podzim (srpen-listopad)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Prakticky: únor až listopad
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produkt</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={newApplication.productId || ''}
                onChange={(e) => setNewApplication({ ...newApplication, productId: e.target.value })}
                disabled={loadingProducts}
              >
                <option value="">
                  {loadingProducts ? 'Načítám...' : 'Vyberte produkt...'}
                </option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cao_content}% CaO, {p.mgo_content}% MgO)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dávka (t/ha)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  newAppWarnings.length > 0 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="3.0"
                value={newApplication.dosePerHa || ''}
                onChange={(e) => setNewApplication({ ...newApplication, dosePerHa: parseFloat(e.target.value) })}
              />
              {newAppCalculated.mgoPerHa && (
                <p className="text-xs text-gray-500 mt-1">
                  → MgO: {newAppCalculated.mgoPerHa} t/ha ({(newAppCalculated.mgoPerHa * 1000).toFixed(0)} kg/ha)
                </p>
              )}
            </div>
          </div>
          
          {/* Varování pro novou aplikaci */}
          {newAppWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-800 mb-2">⚠️ Upozornění:</p>
              {newAppWarnings.map((w, i) => (
                <p key={i} className="text-sm text-red-700 mb-1 last:mb-0">{w}</p>
              ))}
            </div>
          )}
          
          {/* Náhled výpočtů */}
          {newAppCalculated.totalDose && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">📊 Náhled:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-blue-600">Celkem:</span>
                  <span className="ml-2 font-mono">{newAppCalculated.totalDose} t</span>
                </div>
                <div>
                  <span className="text-blue-600">CaO:</span>
                  <span className="ml-2 font-mono">{newAppCalculated.caoPerHa} t/ha</span>
                </div>
                <div>
                  <span className="text-blue-600">MgO:</span>
                  <span className="ml-2 font-mono">{newAppCalculated.mgoPerHa} t/ha</span>
                </div>
                <div>
                  <span className="text-blue-600">pH po:</span>
                  <span className="ml-2 font-mono">{newAppCalculated.phAfter}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setAddingNew(false)
                setNewApplication({})
                setNewAppWarnings([])
                setNewAppCalculated({})
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleAddNew}
              disabled={!newApplication.year || !newApplication.productId || !newApplication.dosePerHa || saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Přidávám...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Přidat aplikaci
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Info footer */}
      <div className="p-4 bg-blue-50 border-t text-sm text-blue-900">
        <div className="flex items-start gap-2">
          <Leaf className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">💡 Důležitá doporučení:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-0.5 ml-4">
              <li>Kontrolní půdní rozbor provádějte 1 rok po každé aplikaci</li>
              <li>Dodržujte minimální interval 3 let mezi aplikacemi</li>
              <li>Vápnění provádějte nejlépe na podzim po sklizni</li>
              <li>Aplikovanou dávku lze upravit dle aktuálních potřeb</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Plán úspěšně uložen
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Plán vápnění byl úspěšně schválen a uložen. Nyní můžete přidat jednotlivé aplikace do košíku nebo exportovat plán.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false)
                    router.refresh()
                  }}
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

