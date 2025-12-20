'use client'

import { Sprout } from 'lucide-react'

interface Parcel {
  id: string
  name: string
  code: string
  latest_analysis: any | null
}

interface FertilizationPlansTabProps {
  parcels: Parcel[]
}

export function FertilizationPlansTab({ parcels }: FertilizationPlansTabProps) {
  // Filter parcels that have analyses (plans can be generated)
  const parcelsWithAnalyses = parcels.filter(p => p.latest_analysis)

  if (parcelsWithAnalyses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Sprout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Žádné plány hnojení</p>
        <p className="text-sm mt-2">Plány jsou generovány dynamicky na základě rozborů</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Pozemky s plány hnojení
        </h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Info:</strong> Plány hnojení jsou generovány dynamicky při zobrazení.
          Zde vidíte pouze pozemky, pro které lze plán vygenerovat (mají rozbor).
        </p>
      </div>

      <div className="space-y-3">
        {parcelsWithAnalyses.map((parcel) => (
          <div
            key={parcel.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {parcel.name} ({parcel.code})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Plán je dostupný v uživatelském portálu
                </p>
              </div>
              <Sprout className="h-8 w-8 text-primary-green" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
