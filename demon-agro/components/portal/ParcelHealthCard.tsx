'use client'

import { AlertTriangle, Info } from 'lucide-react'
import { useState } from 'react'
import type { Parcel, SoilAnalysis, PhCategory, NutrientCategory } from '@/lib/types/database'
import {
  PH_CATEGORY_LABELS,
  PH_CATEGORY_DESCRIPTIONS,
  NUTRIENT_CATEGORY_LABELS,
  NUTRIENT_CATEGORY_DESCRIPTIONS,
  SOIL_TYPE_LABELS,
  CULTURE_LABELS,
} from '@/lib/constants/database'

interface ParcelHealthCardProps {
  parcel: Parcel
  analysis: SoilAnalysis | null
  compact?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get pH category color (according to spec)
function getPhCategoryColor(category: PhCategory | null): string {
  if (!category) return 'bg-gray-400'
  
  switch (category) {
    case 'EK':
      return 'bg-[#ef4444]' // Red
    case 'SK':
      return 'bg-[#f97316]' // Orange
    case 'N':
      return 'bg-[#eab308]' // Yellow
    case 'SZ':
      return 'bg-[#84cc16]' // Lime
    case 'EZ':
      return 'bg-[#06b6d4]' // Cyan
    default:
      return 'bg-gray-400'
  }
}

// Get pH text color
function getPhTextColor(category: PhCategory | null): string {
  if (!category) return 'text-gray-600'
  
  switch (category) {
    case 'EK':
      return 'text-[#ef4444]'
    case 'SK':
      return 'text-[#f97316]'
    case 'N':
      return 'text-[#eab308]'
    case 'SZ':
      return 'text-[#84cc16]'
    case 'EZ':
      return 'text-[#06b6d4]'
    default:
      return 'text-gray-600'
  }
}

// Get nutrient category color (according to spec)
function getNutrientCategoryColor(category: NutrientCategory | null): string {
  if (!category) return 'bg-gray-400'
  
  switch (category) {
    case 'VH':
      return 'bg-[#ef4444]' // Red - Very Low
    case 'N':
      return 'bg-[#f97316]' // Orange - Low
    case 'D':
      return 'bg-[#22c55e]' // Green - Good
    case 'V':
      return 'bg-[#3b82f6]' // Blue - High
    case 'VV':
      return 'bg-[#8b5cf6]' // Purple - Very High
    default:
      return 'bg-gray-400'
  }
}

// Get nutrient text color
function getNutrientTextColor(category: NutrientCategory | null): string {
  if (!category) return 'text-gray-600'
  
  switch (category) {
    case 'VH':
      return 'text-[#ef4444]'
    case 'N':
      return 'text-[#f97316]'
    case 'D':
      return 'text-[#22c55e]'
    case 'V':
      return 'text-[#3b82f6]'
    case 'VV':
      return 'text-[#8b5cf6]'
    default:
      return 'text-gray-600'
  }
}

// Calculate progress bar percentage (0-100)
function getNutrientProgress(category: NutrientCategory | null): number {
  if (!category) return 0
  
  switch (category) {
    case 'VH':
      return 10
    case 'N':
      return 30
    case 'D':
      return 60
    case 'V':
      return 85
    case 'VV':
      return 100
    default:
      return 0
  }
}

// Calculate K:Mg ratio and status
function getKMgRatio(potassium: number, magnesium: number): {
  ratio: number
  status: 'good' | 'warning' | 'critical'
  message: string
  color: string
} {
  const ratio = potassium / magnesium
  
  // Optimal range: 1.5 - 2.5 (per spec)
  if (ratio >= 1.5 && ratio <= 2.5) {
    return {
      ratio,
      status: 'good',
      message: 'Optimální poměr K:Mg',
      color: 'text-green-600',
    }
  } else if (ratio >= 1.2 && ratio < 1.5) {
    return {
      ratio,
      status: 'warning',
      message: 'Nízký poměr K:Mg - doporučeno doplnit draslík',
      color: 'text-yellow-600',
    }
  } else if (ratio > 2.5 && ratio <= 3.5) {
    return {
      ratio,
      status: 'warning',
      message: 'Vysoký poměr K:Mg - doporučeno doplnit hořčík',
      color: 'text-yellow-600',
    }
  } else {
    return {
      ratio,
      status: 'critical',
      message: 'Kritický nepoměr K:Mg - nutná korekce',
      color: 'text-red-600',
    }
  }
}

// Check if analysis is old (>4 years)
function isAnalysisOld(date: string): boolean {
  const analysisDate = new Date(date)
  const now = new Date()
  const yearsDiff = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return yearsDiff > 4
}

// Check if phosphorus is too high (legislative limit)
function isPhosphorusTooHigh(phosphorus: number, category: NutrientCategory | null): boolean {
  return category === 'VV' || phosphorus > 300 // Example threshold
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TooltipProps {
  content: string
  children: React.ReactNode
}

function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

interface NutrientBarProps {
  label: string
  value: number
  unit: string
  category: PhCategory | NutrientCategory | null
  categoryLabel: string
  categoryDescription: string
  isPh?: boolean
  compact?: boolean
}

function NutrientBar({
  label,
  value,
  unit,
  category,
  categoryLabel,
  categoryDescription,
  isPh = false,
  compact = false,
}: NutrientBarProps) {
  const barColor = isPh ? getPhCategoryColor(category as PhCategory) : getNutrientCategoryColor(category as NutrientCategory)
  const textColor = isPh ? getPhTextColor(category as PhCategory) : getNutrientTextColor(category as NutrientCategory)
  const progress = isPh ? Math.min((value / 9) * 100, 100) : getNutrientProgress(category as NutrientCategory)

  if (compact) {
    return (
      <Tooltip content={`${categoryLabel}: ${categoryDescription}`}>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-600">{label}</span>
          <span className={`text-xs font-bold ${textColor}`}>
            {value.toFixed(isPh ? 1 : 0)}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${textColor} bg-opacity-10`}>
            {categoryLabel}
          </span>
        </div>
      </Tooltip>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Tooltip content={categoryDescription}>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-700">{label}</span>
              <Info className="w-3 h-3 text-gray-400" />
            </div>
          </Tooltip>
          <span className="text-lg font-bold text-gray-900">
            {isPh ? value.toFixed(1) : value}
            {unit && <span className="text-sm text-gray-600 ml-1">{unit}</span>}
          </span>
        </div>
        {category && (
          <Tooltip content={categoryDescription}>
            <span className={`text-xs font-medium px-2 py-1 rounded ${textColor} bg-opacity-10`}>
              {categoryLabel}
            </span>
          </Tooltip>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {isPh && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>4.0</span>
          <span>7.0</span>
          <span>9.0</span>
        </div>
      )}
    </div>
  )
}

interface RatioIndicatorProps {
  potassium: number
  magnesium: number
  compact?: boolean
}

function RatioIndicator({ potassium, magnesium, compact = false }: RatioIndicatorProps) {
  const kmgRatio = getKMgRatio(potassium, magnesium)
  
  const dotColor =
    kmgRatio.status === 'good'
      ? 'bg-green-500'
      : kmgRatio.status === 'warning'
      ? 'bg-yellow-500'
      : 'bg-red-500'

  if (compact) {
    return (
      <Tooltip content={kmgRatio.message}>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-600">K:Mg</span>
          <span className={`text-xs font-bold ${kmgRatio.color}`}>
            {kmgRatio.ratio.toFixed(1)}:1
          </span>
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        </div>
      </Tooltip>
    )
  }

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <Tooltip content="Optimální poměr draslíku k hořčíku je 1.5:1 až 2.5:1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-700">Poměr K:Mg</span>
            <Info className="w-3 h-3 text-gray-400" />
          </div>
        </Tooltip>
        <span className="text-lg font-bold text-gray-900">
          {kmgRatio.ratio.toFixed(2)}:1
        </span>
      </div>
      <div className="flex items-start gap-2">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${dotColor}`} />
        <div>
          <p className={`text-sm font-medium ${kmgRatio.color}`}>
            {kmgRatio.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Optimální rozmezí: 1.5:1 až 2.5:1
          </p>
        </div>
      </div>
    </div>
  )
}

interface WarningBadgeProps {
  type: 'low-ph' | 'high-p' | 'unbalanced-kmg' | 'old-analysis'
  message: string
}

function WarningBadge({ type, message }: WarningBadgeProps) {
  const colors = {
    'low-ph': 'bg-red-50 text-red-700 border-red-200',
    'high-p': 'bg-orange-50 text-orange-700 border-orange-200',
    'unbalanced-kmg': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'old-analysis': 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors[type]}`}>
      <AlertTriangle className="w-4 h-4" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ParcelHealthCard({ parcel, analysis, compact = false }: ParcelHealthCardProps) {
  // No analysis state
  if (!analysis) {
    if (compact) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs text-orange-700 font-medium">Chybí rozbor</span>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-12 h-12 text-orange-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chybí rozbor půdy
            </h3>
            <p className="text-gray-600 mb-4">
              Pozemek <strong>{parcel.name}</strong> zatím nemá žádný rozbor půdy. 
              Pro zobrazení zdravotní karty a doporučení je nutné nahrát výsledky rozboru.
            </p>
            <a
              href={`/portal/upload?parcel=${parcel.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A7C59] hover:bg-[#5C4033] text-white font-medium rounded-lg transition-colors"
            >
              Nahrát rozbor
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Check warnings
  const isOld = isAnalysisOld(analysis.date)
  const hasLowPh = analysis.ph < 5.5
  const hasHighP = isPhosphorusTooHigh(analysis.phosphorus, analysis.phosphorus_category)
  const kmgRatio = getKMgRatio(analysis.potassium, analysis.magnesium)
  const hasUnbalancedKMg = kmgRatio.status !== 'good'

  const warnings: WarningBadgeProps[] = []
  if (hasLowPh) {
    warnings.push({
      type: 'low-ph',
      message: `Nízké pH (${analysis.ph.toFixed(1)}) - doporučeno vápnění`,
    })
  }
  if (hasHighP) {
    warnings.push({
      type: 'high-p',
      message: 'Vysoká zásobenost P - legislativní omezení hnojení',
    })
  }
  if (hasUnbalancedKMg) {
    warnings.push({
      type: 'unbalanced-kmg',
      message: 'Nevyvážený poměr K:Mg',
    })
  }
  if (isOld) {
    warnings.push({
      type: 'old-analysis',
      message: 'Rozbor starší než 4 roky - doporučen nový rozbor',
    })
  }

  const analysisDate = new Date(analysis.date).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // COMPACT VERSION
  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{parcel.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{parcel.area.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha</span>
              <span>•</span>
              <span>{SOIL_TYPE_LABELS[parcel.soil_type]}</span>
              <span>•</span>
              <span>{CULTURE_LABELS[parcel.culture]}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <NutrientBar
            label="pH"
            value={analysis.ph}
            unit=""
            category={analysis.ph_category}
            categoryLabel={analysis.ph_category ? PH_CATEGORY_LABELS[analysis.ph_category] : '-'}
            categoryDescription={analysis.ph_category ? PH_CATEGORY_DESCRIPTIONS[analysis.ph_category] : ''}
            isPh={true}
            compact={true}
          />
          <NutrientBar
            label="P"
            value={analysis.phosphorus}
            unit="mg/kg"
            category={analysis.phosphorus_category}
            categoryLabel={analysis.phosphorus_category ? NUTRIENT_CATEGORY_LABELS[analysis.phosphorus_category] : '-'}
            categoryDescription={analysis.phosphorus_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.phosphorus_category] : ''}
            compact={true}
          />
          <NutrientBar
            label="K"
            value={analysis.potassium}
            unit="mg/kg"
            category={analysis.potassium_category}
            categoryLabel={analysis.potassium_category ? NUTRIENT_CATEGORY_LABELS[analysis.potassium_category] : '-'}
            categoryDescription={analysis.potassium_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.potassium_category] : ''}
            compact={true}
          />
          <NutrientBar
            label="Mg"
            value={analysis.magnesium}
            unit="mg/kg"
            category={analysis.magnesium_category}
            categoryLabel={analysis.magnesium_category ? NUTRIENT_CATEGORY_LABELS[analysis.magnesium_category] : '-'}
            categoryDescription={analysis.magnesium_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.magnesium_category] : ''}
            compact={true}
          />
        </div>

        <div className="mb-3">
          <RatioIndicator
            potassium={analysis.potassium}
            magnesium={analysis.magnesium}
            compact={true}
          />
        </div>

        {warnings.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {warnings.slice(0, 2).map((warning, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700"
              >
                <AlertTriangle className="w-3 h-3" />
                {warning.type === 'low-ph' && 'Nízké pH'}
                {warning.type === 'high-p' && 'Vysoké P'}
                {warning.type === 'unbalanced-kmg' && 'K:Mg'}
                {warning.type === 'old-analysis' && 'Starý rozbor'}
              </span>
            ))}
            {warnings.length > 2 && (
              <span className="text-xs text-gray-600">+{warnings.length - 2}</span>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          Rozbor: {analysisDate}
        </div>
      </div>
    )
  }

  // FULL VERSION
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Zdravotní karta půdy</h2>
        <div className="text-sm text-gray-600">
          Poslední rozbor: <strong>{analysisDate}</strong>
        </div>
      </div>

      {/* Warning Badges */}
      {warnings.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {warnings.map((warning, idx) => (
            <WarningBadge key={idx} {...warning} />
          ))}
        </div>
      )}

      {/* pH Progress Bar */}
      <div className="mb-6">
        <NutrientBar
          label="pH"
          value={analysis.ph}
          unit=""
          category={analysis.ph_category}
          categoryLabel={analysis.ph_category ? PH_CATEGORY_LABELS[analysis.ph_category] : '-'}
          categoryDescription={analysis.ph_category ? PH_CATEGORY_DESCRIPTIONS[analysis.ph_category] : ''}
          isPh={true}
        />
      </div>

      {/* Nutrients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Phosphorus (P) */}
        <NutrientBar
          label="Fosfor (P)"
          value={analysis.phosphorus}
          unit="mg/kg"
          category={analysis.phosphorus_category}
          categoryLabel={analysis.phosphorus_category ? NUTRIENT_CATEGORY_LABELS[analysis.phosphorus_category] : '-'}
          categoryDescription={analysis.phosphorus_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.phosphorus_category] : ''}
        />

        {/* Potassium (K) */}
        <NutrientBar
          label="Draslík (K)"
          value={analysis.potassium}
          unit="mg/kg"
          category={analysis.potassium_category}
          categoryLabel={analysis.potassium_category ? NUTRIENT_CATEGORY_LABELS[analysis.potassium_category] : '-'}
          categoryDescription={analysis.potassium_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.potassium_category] : ''}
        />

        {/* Magnesium (Mg) */}
        <NutrientBar
          label="Hořčík (Mg)"
          value={analysis.magnesium}
          unit="mg/kg"
          category={analysis.magnesium_category}
          categoryLabel={analysis.magnesium_category ? NUTRIENT_CATEGORY_LABELS[analysis.magnesium_category] : '-'}
          categoryDescription={analysis.magnesium_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.magnesium_category] : ''}
        />

        {/* Calcium (Ca) - Optional */}
        {analysis.calcium && (
          <NutrientBar
            label="Vápník (Ca)"
            value={analysis.calcium}
            unit="mg/kg"
            category={analysis.calcium_category}
            categoryLabel={analysis.calcium_category ? NUTRIENT_CATEGORY_LABELS[analysis.calcium_category] : '-'}
            categoryDescription={analysis.calcium_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.calcium_category] : ''}
          />
        )}
      </div>

      {/* K:Mg Ratio */}
      <RatioIndicator potassium={analysis.potassium} magnesium={analysis.magnesium} />

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
