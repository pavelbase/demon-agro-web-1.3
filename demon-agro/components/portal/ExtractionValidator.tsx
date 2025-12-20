'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, X, Save, ArrowLeft, Loader2, Plus, Link as LinkIcon } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'

interface ExtractionValidatorProps {
  extractedData: any
  parcels: Parcel[]
  userId: string
}

interface ParcelFormData {
  selectedParcelId: string // 'new' for creating new parcel, or existing parcel ID
  newParcelName: string
  newParcelArea: number | ''
  newParcelCadastralNumber: string
  newParcelSoilType: string
  newParcelCulture: 'orna' | 'ttp'
}

export function ExtractionValidator({ extractedData, parcels, userId }: ExtractionValidatorProps) {
  const router = useRouter()
  
  // Parcel selection/creation
  const [parcelData, setParcelData] = useState<ParcelFormData>({
    selectedParcelId: '',
    newParcelName: extractedData.parcel_name || '',
    newParcelArea: '',
    newParcelCadastralNumber: extractedData.cadastral_number || '',
    newParcelSoilType: '',
    newParcelCulture: 'orna',
  })

  // Soil analysis data
  const [formData, setFormData] = useState({
    analysis_date: extractedData.analysis_date || '',
    ph: extractedData.ph || '',
    phosphorus: extractedData.phosphorus || '',
    potassium: extractedData.potassium || '',
    magnesium: extractedData.magnesium || '',
    calcium: extractedData.calcium || '',
    nitrogen: extractedData.nitrogen || '',
    lab_name: extractedData.lab_name || '',
    notes: extractedData.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const confidence = extractedData.confidence || 'medium'
  const validationErrors = extractedData.validationErrors || []

  const handleParcelChange = (field: keyof ParcelFormData, value: any) => {
    setParcelData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate parcel selection/creation
    if (!parcelData.selectedParcelId) {
      newErrors.selectedParcelId = 'Prosím vyberte existující pozemek nebo vytvořte nový'
    } else if (parcelData.selectedParcelId === 'new') {
      if (!parcelData.newParcelName) {
        newErrors.newParcelName = 'Název pozemku je povinný'
      }
      if (!parcelData.newParcelArea || parcelData.newParcelArea <= 0) {
        newErrors.newParcelArea = 'Výměra musí být větší než 0'
      }
    }

    // Validate soil analysis data
    if (!formData.analysis_date) {
      newErrors.analysis_date = 'Datum analýzy je povinné'
    }

    const ph = parseFloat(formData.ph as string)
    if (isNaN(ph) || ph < 4 || ph > 9) {
      newErrors.ph = 'pH musí být mezi 4.0 a 9.0'
    }

    const p = parseFloat(formData.phosphorus as string)
    if (isNaN(p) || p < 0) {
      newErrors.phosphorus = 'Fosfor musí být kladné číslo'
    }

    const k = parseFloat(formData.potassium as string)
    if (isNaN(k) || k < 0) {
      newErrors.potassium = 'Draslík musí být kladné číslo'
    }

    const mg = parseFloat(formData.magnesium as string)
    if (isNaN(mg) || mg < 0) {
      newErrors.magnesium = 'Hořčík musí být kladné číslo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      let parcelId = parcelData.selectedParcelId

      // If creating new parcel, create it first
      if (parcelData.selectedParcelId === 'new') {
        const createParcelResponse = await fetch('/api/portal/create-parcel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            name: parcelData.newParcelName,
            area: parseFloat(String(parcelData.newParcelArea)),
            cadastral_number: parcelData.newParcelCadastralNumber || null,
            soil_type: parcelData.newParcelSoilType || null,
            culture: parcelData.newParcelCulture,
          }),
        })

        if (!createParcelResponse.ok) {
          const error = await createParcelResponse.json()
          throw new Error(error.error || 'Chyba při vytváření pozemku')
        }

        const { parcelId: newParcelId } = await createParcelResponse.json()
        parcelId = newParcelId
      }

      // Save soil analysis
      const response = await fetch('/api/portal/save-soil-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId,
          userId,
          pdfUrl: extractedData.pdfUrl,
          ...formData,
          ph: parseFloat(formData.ph as string),
          phosphorus: parseFloat(formData.phosphorus as string),
          potassium: parseFloat(formData.potassium as string),
          magnesium: parseFloat(formData.magnesium as string),
          calcium: formData.calcium ? parseFloat(formData.calcium as string) : null,
          nitrogen: formData.nitrogen ? parseFloat(formData.nitrogen as string) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      const { analysisId } = await response.json()

      // Redirect to parcel detail
      router.push(`/portal/pozemky/${parcelId}?success=analysis-saved`)

    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : 'Nepodařilo se uložit rozbor')
    } finally {
      setIsSaving(false)
    }
  }

  const getConfidenceBadge = () => {
    if (confidence === 'high') {
      return (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Vysoká spolehlivost
        </div>
      )
    } else if (confidence === 'medium') {
      return (
        <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          Střední spolehlivost
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          Nízká spolehlivost
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na upload
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kontrola extrahovaných dat
            </h1>
            <p className="text-gray-600">
              Zkontrolujte data z PDF a přiřaďte rozbor k pozemku
            </p>
          </div>
          {getConfidenceBadge()}
        </div>
      </div>

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-900 mb-2">
                Upozornění při extrakci
              </h3>
              <ul className="space-y-1">
                {validationErrors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-orange-800">
                    • {error}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-orange-700 mt-2">
                Zkontrolujte prosím hodnoty níže a opravte je ručně.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parcel Selection/Creation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Přiřazení k pozemku
        </h2>

        {/* Show extracted parcel info if available */}
        {(extractedData.parcel_name || extractedData.cadastral_number) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Informace o pozemku z PDF:
            </p>
            <div className="text-sm text-blue-800 space-y-1">
              {extractedData.parcel_name && (
                <p><strong>Název:</strong> {extractedData.parcel_name}</p>
              )}
              {extractedData.cadastral_number && (
                <p><strong>Katastrální číslo:</strong> {extractedData.cadastral_number}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vyberte možnost <span className="text-red-500">*</span>
          </label>
          
          {/* Option buttons */}
          <div className="space-y-2">
            {parcels.length > 0 && (
              <button
                type="button"
                onClick={() => handleParcelChange('selectedParcelId', parcels.length > 0 ? (parcelData.selectedParcelId && parcelData.selectedParcelId !== 'new' ? parcelData.selectedParcelId : '') : '')}
                className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                  parcelData.selectedParcelId && parcelData.selectedParcelId !== 'new'
                    ? 'border-primary-green bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Spárovat s existujícím pozemkem</p>
                    <p className="text-sm text-gray-600">Vyberte pozemek ze seznamu</p>
                  </div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleParcelChange('selectedParcelId', 'new')}
              className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                parcelData.selectedParcelId === 'new'
                  ? 'border-primary-green bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Vytvořit nový pozemek</p>
                  <p className="text-sm text-gray-600">Pozemek bude vytvořen automaticky</p>
                </div>
              </div>
            </button>
          </div>

          {errors.selectedParcelId && (
            <p className="text-sm text-red-600 mt-2">{errors.selectedParcelId}</p>
          )}
        </div>

        {/* Existing parcel selection */}
        {parcelData.selectedParcelId && parcelData.selectedParcelId !== 'new' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vyberte pozemek
            </label>
            <select
              value={parcelData.selectedParcelId}
              onChange={(e) => handleParcelChange('selectedParcelId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            >
              <option value="">-- Vyberte pozemek --</option>
              {parcels.map((parcel) => (
                <option key={parcel.id} value={parcel.id}>
                  {parcel.name} ({parcel.area} ha)
                  {parcel.cadastral_number && ` - ${parcel.cadastral_number}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* New parcel form */}
        {parcelData.selectedParcelId === 'new' && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900">Nový pozemek</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={parcelData.newParcelName}
                  onChange={(e) => handleParcelChange('newParcelName', e.target.value)}
                  placeholder="např. Pole u lesa"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors.newParcelName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.newParcelName && (
                  <p className="text-sm text-red-600 mt-1">{errors.newParcelName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Výměra (ha) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={parcelData.newParcelArea}
                  onChange={(e) => handleParcelChange('newParcelArea', e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="např. 5.5"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors.newParcelArea ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.newParcelArea && (
                  <p className="text-sm text-red-600 mt-1">{errors.newParcelArea}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Katastrální číslo
                </label>
                <input
                  type="text"
                  value={parcelData.newParcelCadastralNumber}
                  onChange={(e) => handleParcelChange('newParcelCadastralNumber', e.target.value)}
                  placeholder="např. 123/4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kultura
                </label>
                <select
                  value={parcelData.newParcelCulture}
                  onChange={(e) => handleParcelChange('newParcelCulture', e.target.value as 'orna' | 'ttp')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                >
                  <option value="orna">Orná půda</option>
                  <option value="ttp">TTP (Trvalý travní porost)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum analýzy <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.analysis_date}
              onChange={(e) => handleChange('analysis_date', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                errors.analysis_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.analysis_date && (
              <p className="text-sm text-red-600 mt-1">{errors.analysis_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Laboratoř
            </label>
            <input
              type="text"
              value={formData.lab_name}
              onChange={(e) => handleChange('lab_name', e.target.value)}
              placeholder="např. ÚKZÚZ, ZEPOS..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
          </div>
        </div>

        {/* pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            pH (CaCl₂) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.ph}
            onChange={(e) => handleChange('ph', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
              errors.ph ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.ph && (
            <p className="text-sm text-red-600 mt-1">{errors.ph}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">Očekávaná hodnota: 4.0 - 9.0</p>
        </div>

        {/* Nutrients */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fosfor (P) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.phosphorus}
                onChange={(e) => handleChange('phosphorus', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                  errors.phosphorus ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-gray-500">mg/kg</span>
            </div>
            {errors.phosphorus && (
              <p className="text-sm text-red-600 mt-1">{errors.phosphorus}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Draslík (K) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.potassium}
                onChange={(e) => handleChange('potassium', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                  errors.potassium ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-gray-500">mg/kg</span>
            </div>
            {errors.potassium && (
              <p className="text-sm text-red-600 mt-1">{errors.potassium}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hořčík (Mg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.magnesium}
                onChange={(e) => handleChange('magnesium', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                  errors.magnesium ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-gray-500">mg/kg</span>
            </div>
            {errors.magnesium && (
              <p className="text-sm text-red-600 mt-1">{errors.magnesium}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vápník (Ca)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.calcium}
                onChange={(e) => handleChange('calcium', e.target.value)}
                placeholder="Volitelné"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <span className="absolute right-4 top-2.5 text-gray-500">mg/kg</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poznámky
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            placeholder="Jakékoliv důležité poznámky nebo doporučení z rozboru..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Uložit rozbor
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/portal/upload')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  )
}
