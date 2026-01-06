'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import type { SoilType } from '@/lib/utils/soil-categories'

interface LimingPlanGeneratorProps {
  parcelId: string
  latestAnalysis: {
    id: string
    ph: number
    mg: number  // Správný název sloupce v DB
    soil_type: SoilType
  } | null
  parcelArea: number
}

export default function LimingPlanGenerator({
  parcelId,
  latestAnalysis,
  parcelArea
}: LimingPlanGeneratorProps) {
  const router = useRouter()
  
  // Funkce pro určení cílového pH podle kultury A typu půdy
  // Podle ÚKZÚZ metodiky
  const getTargetPh = (landUse: 'orna' | 'ttp', soilType: SoilType): number => {
    if (landUse === 'orna') {
      // Orná půda - Optimální pH podle ÚKZÚZ
      if (soilType === 'L') return 6.0  // Lehká: 5.5-6.0 (volíme horní)
      if (soilType === 'S') return 6.5  // Střední: 6.5
      if (soilType === 'T') return 6.8  // Těžká: 7.0±0.5 (prakticky 6.8)
    } else {
      // TTP (travní porost) - Nižší nároky
      if (soilType === 'L') return 5.5  // Lehká
      if (soilType === 'S') return 5.8  // Střední
      if (soilType === 'T') return 6.0  // Těžká
    }
    return 6.5 // Fallback
  }
  
  // Uložíme původní typ půdy pro detekci změny
  const originalSoilType = (latestAnalysis?.soil_type || 'S') as SoilType
  
  const [formData, setFormData] = useState({
    currentPh: latestAnalysis?.ph || 5.5,
    targetPh: getTargetPh('orna', originalSoilType),
    soilType: originalSoilType,
    landUse: 'orna' as 'orna' | 'ttp',
    currentMg: latestAnalysis?.mg || 100  // Opraveno z magnesium na mg
  })
  
  const [generating, setGenerating] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showSoilTypeConfirm, setShowSoilTypeConfirm] = useState(false)
  
  // Detekce změny typu půdy
  const soilTypeChanged = formData.soilType !== originalSoilType
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Automaticky přepočítej cílové pH při změně kultury NEBO typu půdy
      if (field === 'landUse' || field === 'soilType') {
        const landUse = field === 'landUse' ? value : prev.landUse
        const soilType = field === 'soilType' ? value : prev.soilType
        newData.targetPh = getTargetPh(landUse, soilType)
      }
      
      return newData
    })
    setError(null)
  }
  
  async function handleGenerate() {
    // Pokud se změnil typ půdy, ukážeme potvrzovací dialog
    if (soilTypeChanged && !showSoilTypeConfirm) {
      setShowSoilTypeConfirm(true)
      return
    }
    
    setGenerating(true)
    setWarnings([])
    setError(null)
    
    try {
      // Validace
      if (formData.currentPh >= formData.targetPh) {
        setError('Cílové pH musí být vyšší než aktuální pH')
        return
      }
      
      if (formData.currentPh < 4.0 || formData.currentPh > 8.0) {
        setError('Aktuální pH musí být v rozsahu 4.0 - 8.0')
        return
      }
      
      if (formData.targetPh < 4.0 || formData.targetPh > 8.0) {
        setError('Cílové pH musí být v rozsahu 4.0 - 8.0')
        return
      }
      
      // Pokud se změnil typ půdy, uložíme ho do pozemku
      if (soilTypeChanged) {
        const updateResponse = await fetch(`/api/portal/parcels/${parcelId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            soil_type: formData.soilType
          })
        })
        
        if (!updateResponse.ok) {
          throw new Error('Chyba při aktualizaci typu půdy pozemku')
        }
      }
      
      // Zavolání API pro generování plánu
      const response = await fetch('/api/portal/liming-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId,
          soilAnalysisId: latestAnalysis?.id,
          currentPh: formData.currentPh,
          targetPh: formData.targetPh,
          soilType: formData.soilType,
          landUse: formData.landUse,
          currentMg: formData.currentMg,
          area: parcelArea
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Chyba při generování plánu')
      }
      
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings)
      }
      
      if (result.success) {
        // Refresh stránky
        router.refresh()
      }
      
    } catch (err) {
      console.error('Error generating plan:', err)
      setError(err instanceof Error ? err.message : 'Chyba při generování plánu')
    } finally {
      setGenerating(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generovat plán vápnění</h2>
          <p className="text-sm text-gray-500 mt-1">
            Automatický návrh víceletého plánu dle metodiky ČZU Praha
          </p>
        </div>
      </div>
      
      {/* Varování o změně typu půdy */}
      {soilTypeChanged && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-900">
              <p className="font-semibold mb-1">⚠️ Změna typu půdy</p>
              <p className="text-orange-800">
                Změnili jste typ půdy z <strong>{originalSoilType === 'L' ? 'Lehká' : originalSoilType === 'S' ? 'Střední' : 'Těžká'} ({originalSoilType})</strong> na{' '}
                <strong>{formData.soilType === 'L' ? 'Lehká' : formData.soilType === 'S' ? 'Střední' : 'Těžká'} ({formData.soilType})</strong>.
              </p>
              <p className="text-orange-800 mt-2">
                🔄 Tato změna bude <strong>uložena do pozemku</strong> a projeví se ve všech výpočtech.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Info box */}
      {latestAnalysis ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Načteny data z půdního rozboru</p>
              <p className="text-blue-700">
                pH: {latestAnalysis.ph.toFixed(1)}, Mg: {Math.round(latestAnalysis.mg)} mg/kg, 
                Půda: {latestAnalysis.soil_type === 'L' ? 'Lehká' : latestAnalysis.soil_type === 'S' ? 'Střední' : 'Těžká'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium">Žádný půdní rozbor nenalezen</p>
              <p className="text-yellow-700 mt-1">
                Doporučujeme nejdříve provést půdní rozbor pro přesnější výsledky.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aktuální pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktuální pH <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="4.0"
            max="8.0"
            value={formData.currentPh}
            onChange={(e) => handleChange('currentPh', parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Rozsah: 4.0 - 8.0</p>
        </div>
        
        {/* Cílové pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cílové pH <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-gray-500 font-normal">(automaticky dle kultury a půdy)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="4.0"
            max="8.0"
            value={formData.targetPh}
            onChange={(e) => handleChange('targetPh', parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="mt-2 text-xs text-gray-500">
            Doporučeno (ÚKZÚZ): 
            {formData.landUse === 'orna' 
              ? ` Orná ${formData.soilType === 'L' ? '5.5-6.0' : formData.soilType === 'S' ? '6.5' : '6.8-7.0'}`
              : ` TTP ${formData.soilType === 'L' ? '5.5' : formData.soilType === 'S' ? '5.5-6.0' : '6.0'}`
            }
          </p>
        </div>
        
        {/* Typ půdy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ půdy <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.soilType || 'S'}
            onChange={(e) => handleChange('soilType', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="L">Lehká (L)</option>
            <option value="S">Střední (S)</option>
            <option value="T">Těžká (T)</option>
          </select>
        </div>
        
        {/* Využití půdy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Využití půdy <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.landUse}
            onChange={(e) => handleChange('landUse', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="orna">Orná půda</option>
            <option value="ttp">TTP (trvalý travní porost)</option>
          </select>
        </div>
        
        {/* Aktuální Mg */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktuální Mg (mg/kg)
          </label>
          <input
            type="number"
            step="1"
            min="0"
            max="1000"
            value={formData.currentMg}
            onChange={(e) => handleChange('currentMg', parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.currentMg < 80 ? '🔴 Kriticky nízké - nutný dolomit' :
             formData.currentMg < 105 ? '🟡 Nízké - doporučen dolomit' :
             '🟢 Vyhovující'}
          </p>
        </div>
        
        {/* Výměra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Výměra pozemku
          </label>
          <input
            type="text"
            value={`${parcelArea.toFixed(2)} ha`}
            disabled
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
      </div>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-semibold text-yellow-800 mb-2">⚠️ Upozornění:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* Potvrzovací dialog pro změnu typu půdy */}
      {showSoilTypeConfirm && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Potvrďte změnu typu půdy
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Chystáte se změnit typ půdy pozemku z{' '}
                <strong>{originalSoilType === 'L' ? 'Lehká' : originalSoilType === 'S' ? 'Střední' : 'Těžká'} ({originalSoilType})</strong> na{' '}
                <strong>{formData.soilType === 'L' ? 'Lehká' : formData.soilType === 'S' ? 'Střední' : 'Těžká'} ({formData.soilType})</strong>.
              </p>
              <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-900 font-medium mb-2">
                  📝 Co se stane:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                  <li>Typ půdy bude <strong>trvale uložen</strong> do pozemku</li>
                  <li>Změna se projeví ve všech výpočtech a plánech</li>
                  <li>Ovlivní to doporučení pro vápnění a hnojení</li>
                  <li>Můžete to později změnit v nastavení pozemku</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSoilTypeConfirm(false)
                    handleGenerate()
                  }}
                  className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  ✓ Potvrdit změnu a generovat plán
                </button>
                <button
                  onClick={() => {
                    setShowSoilTypeConfirm(false)
                    handleChange('soilType', originalSoilType)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Zrušit změnu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Submit button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generuji plán...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>{soilTypeChanged && !showSoilTypeConfirm ? 'Potvrdit změnu půdy a generovat' : 'Vygenerovat plán vápnění'}</span>
          </>
        )}
      </button>
      
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Informace o metodice</p>
            <p>Výpočty jsou orientační podle <strong>metodiky ÚKZÚZ</strong> (Metodický pokyn č. 01/AZZP).</p>
            <p className="mt-2">Doporučujeme kontrolní rozbor půdy 1 rok po aplikaci vápna.</p>
            <p className="mt-2 text-xs text-blue-700 italic">
              💡 <strong>Nové:</strong> Plán nyní zohledňuje přirozené okyselování půdy mezi aplikacemi 
              (~{formData.soilType === 'L' ? '0.09' : formData.soilType === 'S' ? '0.07' : '0.04'} jednotky pH/rok 
              pro {formData.soilType === 'L' ? 'lehkou' : formData.soilType === 'S' ? 'střední' : 'těžkou'} půdu).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

