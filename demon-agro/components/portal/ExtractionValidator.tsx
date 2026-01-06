'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, Save, ArrowLeft, Loader2, Plus, Link as LinkIcon, ChevronDown, ChevronRight, Check, X as XIcon } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'

interface Analysis {
  parcel_name: string | null
  parcel_code: string | null
  area_ha: number | null
  soil_type: string | null
  analysis_date: string
  ph: number
  ph_category?: string | null
  phosphorus: number
  phosphorus_category?: string | null
  potassium: number
  potassium_category?: string | null
  magnesium: number
  magnesium_category?: string | null
  calcium: number | null
  calcium_category?: string | null
  sulfur: number | null
  methodology: string | null
  notes: string | null
}

interface ExtractedData {
  analyses: Analysis[]
  laboratory: string | null
  document_type: string
  document_date: string | null
  confidence: 'high' | 'medium' | 'low'
  validationErrors?: string[]
  pdfUrl: string
}

interface ExtractionValidatorProps {
  extractedData: ExtractedData
  parcels: Parcel[]
  userId: string
}

interface AnalysisState extends Analysis {
  id: string
  selected: boolean
  expanded: boolean
  parcelAction: 'select' | 'create' // select existing or create new
  selectedParcelId: string
  // For new parcel creation
  newParcelName: string
  newParcelArea: number | ''
  newParcelCode: string
  newParcelSoilType: string
  newParcelCulture: 'orna' | 'ttp'
  // Editable analysis fields
  editedAnalysisDate: string
  editedPh: number | ''
  editedPhosphorus: number | ''
  editedPotassium: number | ''
  editedMagnesium: number | ''
  editedCalcium: number | ''
  editedSulfur: number | ''
  editedMethodology: string
  editedNotes: string
}

export function ExtractionValidator({ extractedData, parcels, userId }: ExtractionValidatorProps) {
  const router = useRouter()
  
  // Initialize state for each analysis
  const [analyses, setAnalyses] = useState<AnalysisState[]>(
    extractedData.analyses.map((analysis, index) => ({
      ...analysis,
      id: `analysis-${index}`,
      selected: true, // Select all by default
      expanded: extractedData.analyses.length === 1, // Expand if only one
      parcelAction: 'create', // Default to create new
      selectedParcelId: '',
      // Pre-fill new parcel data from extracted info
      newParcelName: analysis.parcel_name || '',
      newParcelArea: analysis.area_ha || '',
      newParcelCode: analysis.parcel_code || '',
      newParcelSoilType: analysis.soil_type || '',
      newParcelCulture: 'orna',
      // Editable analysis fields
      editedAnalysisDate: analysis.analysis_date,
      editedPh: analysis.ph,
      editedPhosphorus: analysis.phosphorus,
      editedPotassium: analysis.potassium,
      editedMagnesium: analysis.magnesium,
      editedCalcium: analysis.calcium || '',
      editedSulfur: analysis.sulfur || '',
      editedMethodology: analysis.methodology || '',
      editedNotes: analysis.notes || '',
    }))
  )

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const confidence = extractedData.confidence || 'medium'
  const validationErrors = extractedData.validationErrors || []
  const selectedCount = analyses.filter(a => a.selected).length

  const toggleSelectAll = () => {
    const allSelected = analyses.every(a => a.selected)
    setAnalyses(analyses.map(a => ({ ...a, selected: !allSelected })))
  }

  const toggleAnalysis = (id: string, field: keyof AnalysisState, value: any) => {
    setAnalyses(analyses.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ))
    // Clear error for this field
    const errorKey = `${id}.${field}`
    if (errors[errorKey]) {
      const newErrors = { ...errors }
      delete newErrors[errorKey]
      setErrors(newErrors)
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

  const validateAndSave = async () => {
    const newErrors: Record<string, string> = {}
    const selectedAnalyses = analyses.filter(a => a.selected)

    if (selectedAnalyses.length === 0) {
      alert('Vyberte alespoň jeden rozbor k uložení')
      return
    }

    // Validate each selected analysis
    selectedAnalyses.forEach(analysis => {
      // Validate parcel action
      if (analysis.parcelAction === 'select' && !analysis.selectedParcelId) {
        newErrors[`${analysis.id}.selectedParcelId`] = 'Vyberte pozemek'
      } else if (analysis.parcelAction === 'create') {
        // Název je volitelný - pokud není, použije se kód pozemku
        if (!analysis.newParcelArea || analysis.newParcelArea <= 0) {
          newErrors[`${analysis.id}.newParcelArea`] = 'Výměra musí být větší než 0'
        }
        if (!analysis.newParcelCode && !analysis.newParcelName) {
          newErrors[`${analysis.id}.newParcelName`] = 'Vyplňte název nebo kód pozemku'
        }
      }

      // Validate analysis data
      if (!analysis.editedAnalysisDate) {
        newErrors[`${analysis.id}.editedAnalysisDate`] = 'Datum je povinné'
      }

      const ph = typeof analysis.editedPh === 'number' ? analysis.editedPh : parseFloat(String(analysis.editedPh))
      if (isNaN(ph) || ph < 4 || ph > 9) {
        newErrors[`${analysis.id}.editedPh`] = 'pH musí být 4-9'
      }

      const p = typeof analysis.editedPhosphorus === 'number' ? analysis.editedPhosphorus : parseFloat(String(analysis.editedPhosphorus))
      if (isNaN(p) || p < 0) {
        newErrors[`${analysis.id}.editedPhosphorus`] = 'Musí být ≥ 0'
      }

      const k = typeof analysis.editedPotassium === 'number' ? analysis.editedPotassium : parseFloat(String(analysis.editedPotassium))
      if (isNaN(k) || k < 0) {
        newErrors[`${analysis.id}.editedPotassium`] = 'Musí být ≥ 0'
      }

      const mg = typeof analysis.editedMagnesium === 'number' ? analysis.editedMagnesium : parseFloat(String(analysis.editedMagnesium))
      if (isNaN(mg) || mg < 0) {
        newErrors[`${analysis.id}.editedMagnesium`] = 'Musí být ≥ 0'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      alert('Opravte prosím chyby ve formuláři')
      return
    }

    setIsSaving(true)

    try {
      // Prepare data for batch save
      const analysesToSave = selectedAnalyses.map(analysis => ({
        parcelId: analysis.parcelAction === 'select' ? analysis.selectedParcelId : undefined,
        createNewParcel: analysis.parcelAction === 'create',
        parcelName: analysis.newParcelName || analysis.newParcelCode || 'Nový pozemek',
        parcelArea: typeof analysis.newParcelArea === 'number' ? analysis.newParcelArea : parseFloat(String(analysis.newParcelArea)),
        parcelCode: analysis.newParcelCode || null,
        parcelSoilType: analysis.newParcelSoilType || null,
        parcelCulture: analysis.newParcelCulture,
        analysis_date: analysis.editedAnalysisDate,
        ph: typeof analysis.editedPh === 'number' ? analysis.editedPh : parseFloat(String(analysis.editedPh)),
        phosphorus: typeof analysis.editedPhosphorus === 'number' ? analysis.editedPhosphorus : parseFloat(String(analysis.editedPhosphorus)),
        potassium: typeof analysis.editedPotassium === 'number' ? analysis.editedPotassium : parseFloat(String(analysis.editedPotassium)),
        magnesium: typeof analysis.editedMagnesium === 'number' ? analysis.editedMagnesium : parseFloat(String(analysis.editedMagnesium)),
        calcium: analysis.editedCalcium ? (typeof analysis.editedCalcium === 'number' ? analysis.editedCalcium : parseFloat(String(analysis.editedCalcium))) : null,
        sulfur: analysis.editedSulfur ? (typeof analysis.editedSulfur === 'number' ? analysis.editedSulfur : parseFloat(String(analysis.editedSulfur))) : null,
        lab_name: extractedData.laboratory,
        methodology: analysis.editedMethodology || null,
        notes: analysis.editedNotes || null,
        pdfUrl: extractedData.pdfUrl,
      }))

      const response = await fetch('/api/portal/save-soil-analyses-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          analyses: analysesToSave,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      const result = await response.json()

      // Show summary
      if (result.errors && result.errors.length > 0) {
        alert(`Uloženo: ${result.analysesCreated} rozborů, ${result.parcelsCreated} pozemků\n\nChyby:\n${result.errors.join('\n')}`)
      }

      // Redirect to parcels list
      router.push(`/portal/pozemky?success=batch-saved&parcels=${result.parcelsCreated}&analyses=${result.analysesCreated}`)

    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : 'Nepodařilo se uložit rozbory')
    } finally {
      setIsSaving(false)
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

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kontrola extrahovaných dat
            </h1>
            <p className="text-gray-600">
              {analyses.length === 1 
                ? 'Zkontrolujte data a přiřaďte rozbor k pozemku'
                : `Extrahováno ${analyses.length} rozborů - vyberte které chcete uložit`
              }
            </p>
          </div>
          {getConfidenceBadge()}
        </div>

        {/* Summary info */}
        {extractedData.laboratory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Laboratoř:</strong> {extractedData.laboratory}
              {extractedData.document_date && (
                <span className="ml-4"><strong>Datum dokumentu:</strong> {extractedData.document_date}</span>
              )}
            </p>
          </div>
        )}
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
            </div>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {analyses.length > 1 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                analyses.every(a => a.selected) 
                  ? 'bg-primary-green border-primary-green' 
                  : 'border-gray-300'
              }`}>
                {analyses.every(a => a.selected) && <Check className="h-3 w-3 text-white" />}
              </div>
              {analyses.every(a => a.selected) ? 'Zrušit vše' : 'Vybrat vše'}
            </button>
            <span className="text-sm text-gray-600">
              Vybráno: {selectedCount} z {analyses.length}
            </span>
          </div>
          <button
            onClick={() => setAnalyses(analyses.map(a => ({ ...a, expanded: !analyses.every(x => x.expanded) })))}
            className="text-sm font-medium text-primary-green hover:text-green-700"
          >
            {analyses.every(a => a.expanded) ? 'Sbalit vše' : 'Rozbalit vše'}
          </button>
        </div>
      )}

      {/* Analyses list */}
      <div className="space-y-4">
        {analyses.map((analysis, index) => (
          <AnalysisCard
            key={analysis.id}
            analysis={analysis}
            index={index}
            parcels={parcels}
            errors={errors}
            onChange={(field, value) => toggleAnalysis(analysis.id, field, value)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-4">
        <button
          type="button"
          onClick={validateAndSave}
          disabled={isSaving || selectedCount === 0}
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
              Uložit vybrané ({selectedCount})
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
    </div>
  )
}

// Analysis card component
interface AnalysisCardProps {
  analysis: AnalysisState
  index: number
  parcels: Parcel[]
  errors: Record<string, string>
  onChange: (field: keyof AnalysisState, value: any) => void
}

function AnalysisCard({ analysis, index, parcels, errors, onChange }: AnalysisCardProps) {
  return (
    <div className={`border-2 rounded-lg ${
      analysis.selected ? 'border-primary-green bg-white' : 'border-gray-200 bg-gray-50 opacity-75'
    }`}>
      {/* Card header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChange('selected', !analysis.selected)}
              className="flex-shrink-0"
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                analysis.selected 
                  ? 'bg-primary-green border-primary-green' 
                  : 'border-gray-300'
              }`}>
                {analysis.selected && <Check className="h-3 w-3 text-white" />}
              </div>
            </button>
            <div>
              <h3 className="font-semibold text-gray-900">
                Rozbor #{index + 1}: {analysis.parcel_name || analysis.parcel_code || 'Bez názvu'}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {analysis.parcel_code && `Kód: ${analysis.parcel_code}`}
                {analysis.area_ha && ` • ${analysis.area_ha} ha`}
                {analysis.soil_type && ` • ${analysis.soil_type}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onChange('expanded', !analysis.expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {analysis.expanded ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Card content (expanded) */}
      {analysis.expanded && analysis.selected && (
        <div className="p-6 space-y-6">
          {/* Parcel assignment */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Přiřazení k pozemku</h4>
            
            <div className="space-y-2 mb-4">
              {parcels.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange('parcelAction', 'select')}
                  className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                    analysis.parcelAction === 'select'
                      ? 'border-primary-green bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Spárovat s existujícím</p>
                      <p className="text-sm text-gray-600">Vyberte pozemek ze seznamu</p>
                    </div>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => onChange('parcelAction', 'create')}
                className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                  analysis.parcelAction === 'create'
                    ? 'border-primary-green bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Vytvořit nový pozemek</p>
                    <p className="text-sm text-gray-600">Z extrahovaných dat</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Select existing parcel */}
            {analysis.parcelAction === 'select' && (
              <div>
                <select
                  value={analysis.selectedParcelId}
                  onChange={(e) => onChange('selectedParcelId', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors[`${analysis.id}.selectedParcelId`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Vyberte pozemek --</option>
                  {parcels.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.area} ha) {p.code && `- ${p.code}`}
                    </option>
                  ))}
                </select>
                {errors[`${analysis.id}.selectedParcelId`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`${analysis.id}.selectedParcelId`]}</p>
                )}
              </div>
            )}

            {/* Create new parcel */}
            {analysis.parcelAction === 'create' && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Název (volitelné)
                    </label>
                    <input
                      type="text"
                      value={analysis.newParcelName}
                      onChange={(e) => onChange('newParcelName', e.target.value)}
                      placeholder="např. U lesa"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                        errors[`${analysis.id}.newParcelName`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`${analysis.id}.newParcelName`] && (
                      <p className="text-xs text-red-600 mt-0.5">{errors[`${analysis.id}.newParcelName`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Výměra (ha) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={analysis.newParcelArea}
                      onChange={(e) => onChange('newParcelArea', e.target.value ? parseFloat(e.target.value) : '')}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                        errors[`${analysis.id}.newParcelArea`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`${analysis.id}.newParcelArea`] && (
                      <p className="text-xs text-red-600 mt-0.5">{errors[`${analysis.id}.newParcelArea`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kód pozemku (LPIS)
                    </label>
                    <input
                      type="text"
                      value={analysis.newParcelCode}
                      onChange={(e) => onChange('newParcelCode', e.target.value)}
                      placeholder="např. 0701/27"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kultura
                    </label>
                    <select
                      value={analysis.newParcelCulture}
                      onChange={(e) => onChange('newParcelCulture', e.target.value as 'orna' | 'ttp')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    >
                      <option value="orna">Orná půda</option>
                      <option value="ttp">TTP</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis data */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data rozboru</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={analysis.editedAnalysisDate}
                  onChange={(e) => onChange('editedAnalysisDate', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors[`${analysis.id}.editedAnalysisDate`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  pH <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={analysis.editedPh}
                  onChange={(e) => onChange('editedPh', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors[`${analysis.id}.editedPh`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P (mg/kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={analysis.editedPhosphorus}
                  onChange={(e) => onChange('editedPhosphorus', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors[`${analysis.id}.editedPhosphorus`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  K (mg/kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={analysis.editedPotassium}
                  onChange={(e) => onChange('editedPotassium', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors[`${analysis.id}.editedPotassium`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mg (mg/kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={analysis.editedMagnesium}
                  onChange={(e) => onChange('editedMagnesium', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent ${
                    errors[`${analysis.id}.editedMagnesium`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ca (mg/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={analysis.editedCalcium}
                  onChange={(e) => onChange('editedCalcium', e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="Volitelné"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  S (mg/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={analysis.editedSulfur}
                  onChange={(e) => onChange('editedSulfur', e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="Volitelné"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          {analysis.editedNotes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poznámky
              </label>
              <textarea
                value={analysis.editedNotes}
                onChange={(e) => onChange('editedNotes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
