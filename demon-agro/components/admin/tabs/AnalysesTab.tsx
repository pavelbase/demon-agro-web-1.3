'use client'

import { FlaskConical } from 'lucide-react'

interface Analysis {
  id: string
  analysis_date: string
  ph: number
  phosphorus: number
  potassium: number
  magnesium: number
  sulfur: number | null
  lab_name: string | null
  parcels: {
    name: string
    code: string
  }
}

interface AnalysesTabProps {
  analyses: Analysis[]
}

export function AnalysesTab({ analyses }: AnalysesTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Žádné rozbory</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Historie rozborů ({analyses.length})
        </h3>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {analyses.map((analysis, index) => (
          <div key={analysis.id} className="relative">
            {/* Timeline line */}
            {index < analyses.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Timeline item */}
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-green/10 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-primary-green" />
              </div>
              
              <div className="ml-4 flex-1 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {analysis.parcels.name} ({analysis.parcels.code})
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(analysis.analysis_date)}
                      {analysis.lab_name && (
                        <span className="ml-2">• {analysis.lab_name}</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">pH</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {analysis.ph.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">P (mg/kg)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {analysis.phosphorus.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">K (mg/kg)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {analysis.potassium.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mg (mg/kg)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {analysis.magnesium.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">S (mg/kg)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {analysis.sulfur ? analysis.sulfur.toFixed(0) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
