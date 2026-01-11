'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NutrientCategory, PhCategory } from '@/lib/types/database'

interface SoilAnalysisFormProps {
  parcelId: string
  initialData?: {
    date: string
    ph: number
    phosphorus: number
    potassium: number
    magnesium: number
    calcium?: number
    nitrogen?: number
    lab_name?: string
    confidence?: 'high' | 'medium' | 'low'
  }
  onCancel: () => void
  onSuccess: () => void
}

export function SoilAnalysisForm({ parcelId, initialData, onCancel, onSuccess }: SoilAnalysisFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    ph: initialData?.ph?.toString() || '',
    phosphorus: initialData?.phosphorus?.toString() || '',
    potassium: initialData?.potassium?.toString() || '',
    magnesium: initialData?.magnesium?.toString() || '',
    calcium: initialData?.calcium?.toString() || '',
    nitrogen: initialData?.nitrogen?.toString() || '',
    lab_name: initialData?.lab_name || '',
    notes: '',
  })

  // Get user ID on mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      } else {
        setError('Uživatel není přihlášen')
      }
    }
    getUser()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Check if user is authenticated
      if (!userId) {
        throw new Error('Uživatel není přihlášen')
      }

      // Validate required fields
      if (!formData.date || !formData.ph || !formData.phosphorus || !formData.potassium || !formData.magnesium) {
        throw new Error('Vyplňte všechna povinná pole (datum, pH, P, K, Mg)')
      }

      // Validate numeric values
      const ph = parseFloat(formData.ph)
      const phosphorus = parseFloat(formData.phosphorus)
      const potassium = parseFloat(formData.potassium)
      const magnesium = parseFloat(formData.magnesium)

      if (isNaN(ph) || isNaN(phosphorus) || isNaN(potassium) || isNaN(magnesium)) {
        throw new Error('Zadejte platné číselné hodnoty')
      }

      // Validate ranges
      if (ph < 4 || ph > 9) {
        throw new Error('pH musí být v rozsahu 4.0 - 9.0')
      }

      if (phosphorus < 0 || phosphorus > 1000) {
        throw new Error('P musí být v rozsahu 0 - 1000 mg/kg')
      }

      if (potassium < 0 || potassium > 1000) {
        throw new Error('K musí být v rozsahu 0 - 1000 mg/kg')
      }

      if (magnesium < 0 || magnesium > 1000) {
        throw new Error('Mg musí být v rozsahu 0 - 1000 mg/kg')
      }

      // Prepare data for submission
      const submitData = {
        parcelId,
        userId,
        analysis_date: formData.date,
        ph,
        phosphorus,
        potassium,
        magnesium,
        calcium: formData.calcium ? parseFloat(formData.calcium) : null,
        nitrogen: formData.nitrogen ? parseFloat(formData.nitrogen) : null,
        lab_name: formData.lab_name || null,
        notes: formData.notes || null,
      }

      // Submit to API
      const response = await fetch('/api/portal/save-soil-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chyba při ukládání rozboru')
      }

      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        onSuccess()
        router.push(`/portal/pozemky/${parcelId}`)
        router.refresh()
      }, 2000)

    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rozbor úspěšně uložen!
        </h2>
        <p className="text-gray-600">
          Přesměrování na detail pozemku...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {initialData ? 'Zkontrolujte extrahovaná data' : 'Manuální zadání rozboru'}
        </h2>
        {initialData?.confidence && (
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            initialData.confidence === 'high' ? 'bg-green-100 text-green-800' :
            initialData.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            Jistota AI: {
              initialData.confidence === 'high' ? 'Vysoká' :
              initialData.confidence === 'medium' ? 'Střední' :
              'Nízká'
            }
          </div>
        )}
        <p className="text-gray-600 mt-2">
          Zkontrolujte a případně upravte hodnoty před uložením.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Lab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Datum rozboru <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="lab_name" className="block text-sm font-medium text-gray-700 mb-2">
              Název laboratoře
            </label>
            <input
              type="text"
              id="lab_name"
              name="lab_name"
              value={formData.lab_name}
              onChange={handleChange}
              placeholder="např. ÚKZÚZ, ZEPOS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Nutrients */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hlavní parametry <span className="text-red-500">*</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ph" className="block text-sm font-medium text-gray-700 mb-2">
                pH (H₂O)
              </label>
              <input
                type="number"
                id="ph"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
                required
                step="0.1"
                min="4"
                max="9"
                placeholder="6.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Rozsah: 4.0 - 9.0</p>
            </div>

            <div>
              <label htmlFor="phosphorus" className="block text-sm font-medium text-gray-700 mb-2">
                Fosfor (P) - mg/kg
              </label>
              <input
                type="number"
                id="phosphorus"
                name="phosphorus"
                value={formData.phosphorus}
                onChange={handleChange}
                required
                step="1"
                min="0"
                max="1000"
                placeholder="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Mehlich 3</p>
            </div>

            <div>
              <label htmlFor="potassium" className="block text-sm font-medium text-gray-700 mb-2">
                Draslík (K) - mg/kg
              </label>
              <input
                type="number"
                id="potassium"
                name="potassium"
                value={formData.potassium}
                onChange={handleChange}
                required
                step="1"
                min="0"
                max="1000"
                placeholder="180"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Mehlich 3</p>
            </div>

            <div>
              <label htmlFor="magnesium" className="block text-sm font-medium text-gray-700 mb-2">
                Hořčík (Mg) - mg/kg
              </label>
              <input
                type="number"
                id="magnesium"
                name="magnesium"
                value={formData.magnesium}
                onChange={handleChange}
                required
                step="1"
                min="0"
                max="1000"
                placeholder="85"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Mehlich 3</p>
            </div>
          </div>
        </div>

        {/* Optional Nutrients */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Volitelné parametry
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="calcium" className="block text-sm font-medium text-gray-700 mb-2">
                Vápník (Ca) - mg/kg
              </label>
              <input
                type="number"
                id="calcium"
                name="calcium"
                value={formData.calcium}
                onChange={handleChange}
                step="1"
                min="0"
                max="5000"
                placeholder="2500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nitrogen" className="block text-sm font-medium text-gray-700 mb-2">
                Dusík (N) - mg/kg
              </label>
              <input
                type="number"
                id="nitrogen"
                name="nitrogen"
                value={formData.nitrogen}
                onChange={handleChange}
                step="1"
                min="0"
                max="100"
                placeholder="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Poznámky
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Dodatečné informace k rozboru..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Ukládám...</span>
              </>
            ) : (
              'Uložit rozbor'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
