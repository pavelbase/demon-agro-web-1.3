'use client'

import { AlertTriangle, Info } from 'lucide-react'
import { useState } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { Parcel, SoilAnalysis, PhCategory, NutrientCategory } from '@/lib/types/database'
import type { GroupedAnalysis } from '@/lib/utils/soil-analysis-helpers'
import {
  PH_CATEGORY_LABELS,
  PH_CATEGORY_DESCRIPTIONS,
  NUTRIENT_CATEGORY_LABELS,
  NUTRIENT_CATEGORY_DESCRIPTIONS,
  SOIL_TYPE_LABELS,
  CULTURE_LABELS,
} from '@/lib/constants/database'
import { evaluatePhForSoilType, getLimingStatusLabel } from '@/lib/utils/soil-categories'

interface ParcelHealthCardProps {
  parcel: Parcel
  analysis: SoilAnalysis | GroupedAnalysis | null
  compact?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get pH category color (according to spec)
function getPhCategoryColor(category: PhCategory | null): string {
  if (!category) return 'bg-gray-400'
  
  switch (category) {
    case 'extremne_kysela':
      return 'bg-[#ef4444]' // Red
    case 'silne_kysela':
      return 'bg-[#f97316]' // Orange
    case 'slabe_kysela':
      return 'bg-[#fb923c]' // Light Orange
    case 'neutralni':
      return 'bg-[#22c55e]' // Green
    case 'slabe_alkalicka':
      return 'bg-[#3b82f6]' // Blue
    case 'alkalicka':
      return 'bg-[#8b5cf6]' // Purple
    default:
      return 'bg-gray-400'
  }
}

// Get pH text color
function getPhTextColor(category: PhCategory | null): string {
  if (!category) return 'text-gray-600'
  
  switch (category) {
    case 'extremne_kysela':
      return 'text-[#ef4444]'
    case 'silne_kysela':
      return 'text-[#f97316]'
    case 'slabe_kysela':
      return 'text-[#fb923c]'
    case 'neutralni':
      return 'text-[#22c55e]'
    case 'slabe_alkalicka':
      return 'text-[#3b82f6]'
    case 'alkalicka':
      return 'text-[#8b5cf6]'
    default:
      return 'text-gray-600'
  }
}

// Get nutrient category color (according to spec)
function getNutrientCategoryColor(category: NutrientCategory | null): string {
  if (!category) return 'bg-gray-400'
  
  switch (category) {
    case 'nizky':
      return 'bg-[#ef4444]' // Red - Low
    case 'vyhovujici':
      return 'bg-[#f97316]' // Orange - Adequate
    case 'dobry':
      return 'bg-[#22c55e]' // Green - Good
    case 'vysoky':
      return 'bg-[#3b82f6]' // Blue - High
    case 'velmi_vysoky':
      return 'bg-[#8b5cf6]' // Purple - Very High
    default:
      return 'bg-gray-400'
  }
}

// Get nutrient text color
function getNutrientTextColor(category: NutrientCategory | null): string {
  if (!category) return 'text-gray-600'
  
  switch (category) {
    case 'nizky':
      return 'text-[#ef4444]'
    case 'vyhovujici':
      return 'text-[#f97316]'
    case 'dobry':
      return 'text-[#22c55e]'
    case 'vysoky':
      return 'text-[#3b82f6]'
    case 'velmi_vysoky':
      return 'text-[#8b5cf6]'
    default:
      return 'text-gray-600'
  }
}

// Calculate progress bar percentage (0-100)
function getNutrientProgress(category: NutrientCategory | null): number {
  if (!category) return 0
  
  switch (category) {
    case 'nizky':
      return 10
    case 'vyhovujici':
      return 30
    case 'dobry':
      return 60
    case 'vysoky':
      return 85
    case 'velmi_vysoky':
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
  return category === 'velmi_vysoky' || phosphorus > 300 // Example threshold
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TooltipProps {
  content: string
  children: React.ReactNode
}

function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>
        <span className="cursor-help inline-flex">
          {children}
        </span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50 shadow-lg"
          sideOffset={5}
          collisionPadding={10}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
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
            <div className="flex gap-3">
              <a
                href={`/portal/upload?parcel=${parcel.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A7C59] hover:bg-[#5C4033] text-white font-medium rounded-lg transition-colors"
              >
                Nahrát rozbor
              </a>
              <a
                href={`/portal/pozemky/${parcel.id}?action=add-analysis`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Zadat ručně
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check warnings
  const isOld = isAnalysisOld(analysis.analysis_date)
  const hasLowPh = analysis.ph < 5.5
  const hasHighP = isPhosphorusTooHigh(analysis.p, analysis.p_category)
  const kmgRatio = getKMgRatio(analysis.k, analysis.mg)
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

  const analysisDate = new Date(analysis.analysis_date).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Wrap everything in TooltipProvider
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      {renderContent()}
    </TooltipPrimitive.Provider>
  )

  function renderContent() {
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
              value={analysis.p}
              unit="mg/kg"
              category={analysis.p_category}
              categoryLabel={analysis.p_category ? NUTRIENT_CATEGORY_LABELS[analysis.p_category] : '-'}
              categoryDescription={analysis.p_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.p_category] : ''}
              compact={true}
            />
            <NutrientBar
              label="K"
              value={analysis.k}
              unit="mg/kg"
              category={analysis.k_category}
              categoryLabel={analysis.k_category ? NUTRIENT_CATEGORY_LABELS[analysis.k_category] : '-'}
              categoryDescription={analysis.k_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.k_category] : ''}
              compact={true}
            />
            <NutrientBar
              label="Mg"
              value={analysis.mg}
              unit="mg/kg"
              category={analysis.mg_category}
              categoryLabel={analysis.mg_category ? NUTRIENT_CATEGORY_LABELS[analysis.mg_category] : '-'}
              categoryDescription={analysis.mg_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.mg_category] : ''}
              compact={true}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <RatioIndicator potassium={analysis.k} magnesium={analysis.mg} compact />
            <span>{analysisDate}</span>
          </div>

          {warnings.length > 0 && (
            <div className="space-y-1">
              {warnings.slice(0, 2).map((warning, idx) => (
                <WarningBadge key={idx} {...warning} compact />
              ))}
            </div>
          )}
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
          
          {/* pH Evaluation for Soil Type */}
          {(() => {
            const phEval = evaluatePhForSoilType(analysis.ph, parcel.soil_type, parcel.culture)
            return (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Status pro {SOIL_TYPE_LABELS[parcel.soil_type]} {CULTURE_LABELS[parcel.culture]}:
                    </span>
                    {phEval.isOptimal ? (
                      <span className="text-sm font-semibold text-green-600">
                        ✓ Optimální pH
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-orange-600">
                        {getLimingStatusLabel(phEval.status)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    Cíl: pH {phEval.targetPh}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{phEval.recommendation}</p>
              </div>
            )
          })()}
        </div>

        {/* Nutrients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Phosphorus (P) */}
          <NutrientBar
            label="Fosfor (P)"
            value={analysis.p}
            unit="mg/kg"
            category={analysis.p_category}
            categoryLabel={analysis.p_category ? NUTRIENT_CATEGORY_LABELS[analysis.p_category] : '-'}
            categoryDescription={analysis.p_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.p_category] : ''}
          />

          {/* Potassium (K) */}
          <NutrientBar
            label="Draslík (K)"
            value={analysis.k}
            unit="mg/kg"
            category={analysis.k_category}
            categoryLabel={analysis.k_category ? NUTRIENT_CATEGORY_LABELS[analysis.k_category] : '-'}
            categoryDescription={analysis.k_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.k_category] : ''}
          />

          {/* Magnesium (Mg) */}
          <NutrientBar
            label="Hořčík (Mg)"
            value={analysis.mg}
            unit="mg/kg"
            category={analysis.mg_category}
            categoryLabel={analysis.mg_category ? NUTRIENT_CATEGORY_LABELS[analysis.mg_category] : '-'}
            categoryDescription={analysis.mg_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.mg_category] : ''}
          />

          {/* Calcium (Ca) - Optional */}
          {analysis.ca && (
            <NutrientBar
              label="Vápník (Ca)"
              value={analysis.ca}
              unit="mg/kg"
              category={analysis.ca_category}
              categoryLabel={analysis.ca_category ? NUTRIENT_CATEGORY_LABELS[analysis.ca_category] : '-'}
              categoryDescription={analysis.ca_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.ca_category] : 'Vápník je klíčový pro strukturu buněčných stěn a stabilitu půdy'}
            />
          )}

          {/* Sulfur (S) - Optional */}
          {analysis.s && (
            <NutrientBar
              label="Síra (S)"
              value={analysis.s}
              unit="mg/kg"
              category={analysis.s_category}
              categoryLabel={analysis.s_category ? NUTRIENT_CATEGORY_LABELS[analysis.s_category] : '-'}
              categoryDescription={analysis.s_category ? NUTRIENT_CATEGORY_DESCRIPTIONS[analysis.s_category] : 'Síra je důležitá pro syntézu bílkovin a kvalitu plodin'}
            />
          )}
        </div>

        {/* K:Mg Ratio */}
        <RatioIndicator potassium={analysis.k} magnesium={analysis.mg} />

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
}
