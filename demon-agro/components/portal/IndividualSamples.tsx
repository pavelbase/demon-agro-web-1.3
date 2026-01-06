'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getCategoryColor, getCategoryLabel } from '@/lib/utils/soil-categories'
import type { PhCategory, NutrientCategory } from '@/lib/utils/soil-categories'

interface IndividualSample {
  id: string
  ph: number
  p: number
  k: number
  mg: number
  ca: number | null
  s: number | null
  ph_category: PhCategory | null
  p_category: NutrientCategory | null
  k_category: NutrientCategory | null
  mg_category: NutrientCategory | null
  s_category: NutrientCategory | null
}

interface IndividualSamplesProps {
  samples: IndividualSample[]
}

// Helper to get Tailwind classes for category badge (client-side version)
function getCategoryBadgeClasses(category: PhCategory | NutrientCategory | null): string {
  if (!category) return 'bg-gray-100 text-gray-700'
  
  const color = getCategoryColor(category)
  const classes: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  }
  
  return classes[color] || 'bg-gray-100 text-gray-700'
}

export default function IndividualSamples({ samples }: IndividualSamplesProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (samples.length <= 1) return null

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Skrýt jednotlivé vzorky
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Zobrazit jednotlivé vzorky ({samples.length})
          </>
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {samples.map((sample, idx) => (
            <div key={sample.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Vzorek {idx + 1}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* pH */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">pH</div>
                  <div className="text-lg font-bold text-gray-900">
                    {sample.ph.toFixed(2)}
                  </div>
                  {sample.ph_category && (
                    <div className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(sample.ph_category)}`}>
                      {getCategoryLabel(sample.ph_category)}
                    </div>
                  )}
                </div>

                {/* Phosphorus */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">P</div>
                  <div className="text-lg font-bold text-gray-900">
                    {sample.p.toFixed(0)}
                    <span className="text-xs text-gray-500 ml-1">mg/kg</span>
                  </div>
                  {sample.p_category && (
                    <div className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(sample.p_category)}`}>
                      {getCategoryLabel(sample.p_category)}
                    </div>
                  )}
                </div>

                {/* Potassium */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">K</div>
                  <div className="text-lg font-bold text-gray-900">
                    {sample.k.toFixed(0)}
                    <span className="text-xs text-gray-500 ml-1">mg/kg</span>
                  </div>
                  {sample.k_category && (
                    <div className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(sample.k_category)}`}>
                      {getCategoryLabel(sample.k_category)}
                    </div>
                  )}
                </div>

                {/* Magnesium */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">Mg</div>
                  <div className="text-lg font-bold text-gray-900">
                    {sample.mg.toFixed(0)}
                    <span className="text-xs text-gray-500 ml-1">mg/kg</span>
                  </div>
                  {sample.mg_category && (
                    <div className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(sample.mg_category)}`}>
                      {getCategoryLabel(sample.mg_category)}
                    </div>
                  )}
                </div>

                {/* Calcium */}
                {sample.ca && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Ca</div>
                    <div className="text-lg font-bold text-gray-900">
                      {sample.ca.toFixed(0)}
                      <span className="text-xs text-gray-500 ml-1">mg/kg</span>
                    </div>
                  </div>
                )}

                {/* Sulfur */}
                {sample.s && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">S</div>
                    <div className="text-lg font-bold text-gray-900">
                      {sample.s.toFixed(2)}
                      <span className="text-xs text-gray-500 ml-1">mg/kg</span>
                    </div>
                    {sample.s_category && (
                      <div className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryBadgeClasses(sample.s_category)}`}>
                        {getCategoryLabel(sample.s_category)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

