'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, X, Save, ArrowLeft, Loader2 } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'

interface ExtractionValidatorProps {
  extractedData: any
  parcel: Parcel
  userId: string
}

export function ExtractionValidator({ extractedData, parcel, userId }: ExtractionValidatorProps) {
  const router = useRouter()
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
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
      const response = await fetch('/api/portal/save-soil-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: parcel.id,
          userId,
          pdfUrl: extractedData.pdfUrl,
          ...formData,
          // Convert strings to numbers
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
      router.push(`/portal/pozemky/${parcel.id}?success=analysis-saved`)

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
              Zkontrolujte a upravte data z PDF před uložením do systému
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

      {/* Parcel Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Pozemek</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Název:</span>
            <p className="font-medium text-blue-900">{parcel.name}</p>
          </div>
          <div>
            <span className="text-blue-700">Výměra:</span>
            <p className="font-medium text-blue-900">{parcel.area} ha</p>
          </div>
          {parcel.cadastral_number && (
            <div>
              <span className="text-blue-700">Katastr:</span>
              <p className="font-medium text-blue-900">{parcel.cadastral_number}</p>
            </div>
          )}
          <div>
            <span className="text-blue-700">Kultura:</span>
            <p className="font-medium text-blue-900">
              {parcel.culture === 'orna' ? 'Orná půda' : 'TTP'}
            </p>
          </div>
        </div>
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
