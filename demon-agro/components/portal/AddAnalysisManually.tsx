'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createSoilAnalysis } from '@/lib/actions/soil-analyses'

const analysisSchema = z.object({
  analysisDate: z.string().min(1, 'Datum rozboru je povinné'),
  ph: z.number().min(0).max(14, 'pH musí být mezi 0 a 14'),
  p: z.number().min(0, 'P musí být kladné číslo'),
  k: z.number().min(0, 'K musí být kladné číslo'),
  mg: z.number().min(0, 'Mg musí být kladné číslo'),
  ca: z.number().min(0).optional(),
  s: z.number().min(0).optional(),
})

type AnalysisFormData = z.infer<typeof analysisSchema>

interface AddAnalysisManuallyProps {
  parcelId: string
  parcelName: string
  soilType: 'L' | 'S' | 'T'
}

export function AddAnalysisManually({ parcelId, parcelName, soilType }: AddAnalysisManuallyProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      analysisDate: new Date().toISOString().split('T')[0],
      ph: undefined,
      p: undefined,
      k: undefined,
      mg: undefined,
      ca: undefined,
      s: undefined,
    },
  })

  // Check for action query parameter to auto-open modal
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add-analysis') {
      setShowModal(true)
      // Remove the query parameter from URL without reload
      router.replace(`/portal/pozemky/${parcelId}`, { scroll: false })
    }
  }, [searchParams, router, parcelId])

  const handleSubmit = async (data: AnalysisFormData) => {
    setIsSubmitting(true)
    setError(null)

    const result = await createSoilAnalysis({
      parcelId,
      analysisDate: data.analysisDate,
      ph: data.ph,
      p: data.p,
      k: data.k,
      mg: data.mg,
      ca: data.ca,
      s: data.s,
      soilType,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Nepodařilo se přidat rozbor')
      return
    }

    // Close modal and refresh page
    setShowModal(false)
    form.reset()
    router.refresh()
  }

  if (!showModal) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Přidat rozbor půdy ručně
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Pozemek: <strong>{parcelName}</strong>
              </p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Analysis Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum rozboru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...form.register('analysisDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                  {form.formState.errors.analysisDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.analysisDate.message}
                    </p>
                  )}
                </div>

                {/* pH */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    pH <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    {...form.register('ph', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="6.5"
                  />
                  {form.formState.errors.ph && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.ph.message}
                    </p>
                  )}
                </div>

                {/* P, K, Mg in grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      P (mg/kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register('p', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="150"
                    />
                    {form.formState.errors.p && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.p.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      K (mg/kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register('k', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="200"
                    />
                    {form.formState.errors.k && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.k.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mg (mg/kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register('mg', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="100"
                    />
                    {form.formState.errors.mg && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.mg.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ca and S - Optional */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ca (mg/kg) - volitelné
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register('ca', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      S (mg/kg) - volitelné
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register('s', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-green text-base font-medium text-white hover:bg-primary-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Ukládání...' : 'Přidat rozbor'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

