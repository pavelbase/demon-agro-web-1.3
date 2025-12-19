'use client'

import { AlertTriangle } from 'lucide-react'
import type { SoilAnalysis, PhCategory, NutrientCategory } from '@/lib/types/database'
import {
  PH_CATEGORY_LABELS,
  PH_CATEGORY_COLORS,
  NUTRIENT_CATEGORY_LABELS,
  NUTRIENT_CATEGORY_COLORS,
} from '@/lib/constants/database'

interface ParcelHealthCardProps {
  analysis: SoilAnalysis | null
  parcelName: string
}

// Helper to get pH category color for progress bar
function getPhCategoryColor(category: PhCategory | null): string {
  if (!category) return 'bg-gray-400'
  
  switch (category) {
    case 'EK':
      return 'bg-red-600'
    case 'SK':
      return 'bg-orange-500'
    case 'N':
      return 'bg-green-500'
    case 'SZ':
      return 'bg-blue-500'
    case 'EZ':
      return 'bg-purple-500'
    default:
      return 'bg-gray-400'
  }
}

// Helper to get nutrient category color for progress bar
function getNutrientCategoryColor(category: NutrientCategory | null): string {
  if (!category) return 'bg-gray-400'
  
  switch (category) {
    case 'N':
      return 'bg-red-600'
    case 'VH':
      return 'bg-orange-500'
    case 'D':
      return 'bg-green-500'
    case 'V':
      return 'bg-blue-500'
    case 'VV':
      return 'bg-purple-500'
    default:
      return 'bg-gray-400'
  }
}

// Helper to calculate progress bar percentage (0-100)
function getNutrientProgress(category: NutrientCategory | null): number {
  if (!category) return 0
  
  switch (category) {
    case 'N':
      return 20
    case 'VH':
      return 40
    case 'D':
      return 60
    case 'V':
      return 80
    case 'VV':
      return 100
    default:
      return 0
  }
}

// Helper to calculate K:Mg ratio and status
function getKMgRatio(potassium: number, magnesium: number): {
  ratio: number
  status: 'good' | 'warning' | 'critical'
  message: string
} {
  const ratio = potassium / magnesium
  
  if (ratio >= 2 && ratio <= 3) {
    return {
      ratio,
      status: 'good',
      message: 'Optimální poměr K:Mg',
    }
  } else if (ratio >= 1.5 && ratio < 2) {
    return {
      ratio,
      status: 'warning',
      message: 'Nízký poměr K:Mg - doporučeno doplnit draslík',
    }
  } else if (ratio > 3 && ratio <= 4) {
    return {
      ratio,
      status: 'warning',
      message: 'Vysoký poměr K:Mg - doporučeno doplnit hořčík',
    }
  } else {
    return {
      ratio,
      status: 'critical',
      message: 'Kritický nepoměr K:Mg - nutná korekce',
    }
  }
}

// Helper to check if analysis is old (>4 years)
function isAnalysisOld(date: string): boolean {
  const analysisDate = new Date(date)
  const now = new Date()
  const yearsDiff = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return yearsDiff > 4
}

export function ParcelHealthCard({ analysis, parcelName }: ParcelHealthCardProps) {
  // No analysis state
  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-12 h-12 text-orange-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chybí rozbor půdy
            </h3>
            <p className="text-gray-600 mb-4">
              Pozemek <strong>{parcelName}</strong> zatím nemá žádný rozbor půdy. 
              Pro zobrazení zdravotní karty a doporučení je nutné nahrát výsledky rozboru.
            </p>
            <a
              href="/portal/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A7C59] hover:bg-[#5C4033] text-white font-medium rounded-lg transition-colors"
            >
              Nahrát rozbor
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Check if analysis is old
  const isOld = isAnalysisOld(analysis.date)
  const analysisDate = new Date(analysis.date).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Calculate K:Mg ratio
  const kmgRatio = getKMgRatio(analysis.potassium, analysis.magnesium)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Zdravotní karta půdy</h2>
        <div className="text-sm text-gray-600">
          Poslední rozbor: <strong>{analysisDate}</strong>
        </div>
      </div>

      {/* Warning if analysis is old */}
      {isOld && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Rozbor je starší než 4 roky
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Doporučujeme provést nový rozbor půdy pro aktuální data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* pH Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">pH</span>
            <span className="text-lg font-bold text-gray-900">{analysis.ph.toFixed(1)}</span>
          </div>
          {analysis.ph_category && (
            <span className={`text-sm font-medium ${PH_CATEGORY_COLORS[analysis.ph_category]}`}>
              {PH_CATEGORY_LABELS[analysis.ph_category]}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getPhCategoryColor(analysis.ph_category)} transition-all duration-300`}
            style={{ width: `${Math.min((analysis.ph / 9) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>4.0</span>
          <span>7.0</span>
          <span>9.0</span>
        </div>
      </div>

      {/* Nutrients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Phosphorus (P) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Fosfor (P)</span>
              <span className="text-base font-bold text-gray-900">
                {analysis.phosphorus} mg/kg
              </span>
            </div>
            {analysis.phosphorus_category && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${NUTRIENT_CATEGORY_COLORS[analysis.phosphorus_category]}`}>
                {NUTRIENT_CATEGORY_LABELS[analysis.phosphorus_category]}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getNutrientCategoryColor(analysis.phosphorus_category)} transition-all duration-300`}
              style={{ width: `${getNutrientProgress(analysis.phosphorus_category)}%` }}
            />
          </div>
        </div>

        {/* Potassium (K) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Draslík (K)</span>
              <span className="text-base font-bold text-gray-900">
                {analysis.potassium} mg/kg
              </span>
            </div>
            {analysis.potassium_category && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${NUTRIENT_CATEGORY_COLORS[analysis.potassium_category]}`}>
                {NUTRIENT_CATEGORY_LABELS[analysis.potassium_category]}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getNutrientCategoryColor(analysis.potassium_category)} transition-all duration-300`}
              style={{ width: `${getNutrientProgress(analysis.potassium_category)}%` }}
            />
          </div>
        </div>

        {/* Magnesium (Mg) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Hořčík (Mg)</span>
              <span className="text-base font-bold text-gray-900">
                {analysis.magnesium} mg/kg
              </span>
            </div>
            {analysis.magnesium_category && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${NUTRIENT_CATEGORY_COLORS[analysis.magnesium_category]}`}>
                {NUTRIENT_CATEGORY_LABELS[analysis.magnesium_category]}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getNutrientCategoryColor(analysis.magnesium_category)} transition-all duration-300`}
              style={{ width: `${getNutrientProgress(analysis.magnesium_category)}%` }}
            />
          </div>
        </div>

        {/* Calcium (Ca) - Optional */}
        {analysis.calcium && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Vápník (Ca)</span>
                <span className="text-base font-bold text-gray-900">
                  {analysis.calcium} mg/kg
                </span>
              </div>
              {analysis.calcium_category && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${NUTRIENT_CATEGORY_COLORS[analysis.calcium_category]}`}>
                  {NUTRIENT_CATEGORY_LABELS[analysis.calcium_category]}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getNutrientCategoryColor(analysis.calcium_category)} transition-all duration-300`}
                style={{ width: `${getNutrientProgress(analysis.calcium_category)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* K:Mg Ratio */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Poměr K:Mg</span>
          <span className="text-lg font-bold text-gray-900">
            {kmgRatio.ratio.toFixed(2)}:1
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
              kmgRatio.status === 'good'
                ? 'bg-green-500'
                : kmgRatio.status === 'warning'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
          />
          <p
            className={`text-sm ${
              kmgRatio.status === 'good'
                ? 'text-green-700'
                : kmgRatio.status === 'warning'
                ? 'text-orange-700'
                : 'text-red-700'
            }`}
          >
            {kmgRatio.message}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Optimální poměr K:Mg je 2:1 až 3:1
        </p>
      </div>

      {/* Lab info if available */}
      {analysis.lab_name && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600">
            Laboratoř: <strong>{analysis.lab_name}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
