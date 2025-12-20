'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Calculator } from 'lucide-react'
import type { FertilizationPlan } from '@/lib/utils/fertilization-plan'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'

interface PlanDecisionAssistantProps {
  plan: FertilizationPlan
  parcel: Parcel
  analysis: SoilAnalysis
}

function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function PlanDecisionAssistant({ plan, parcel, analysis }: PlanDecisionAssistantProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Calculate explanations
  const sections = [
    {
      id: 'lime',
      title: 'Proč právě toto množství vápna?',
      icon: Lightbulb,
      content: (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Současné pH</div>
                <div className="text-xl font-bold text-gray-900">{analysis.ph.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Cílové pH</div>
                <div className="text-xl font-bold text-green-600">
                  {parcel.culture === 'orna' ? '6.5' : '6.0'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Výpočet:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Půdní typ: <strong>{parcel.soil_type === 'L' ? 'Lehká' : parcel.soil_type === 'S' ? 'Střední' : 'Těžká'}</strong>
              </li>
              <li>
                Rozdíl pH: <strong>{(parcel.culture === 'orna' ? 6.5 : 6.0) - analysis.ph > 0 ? '+' : ''}{((parcel.culture === 'orna' ? 6.5 : 6.0) - analysis.ph).toFixed(1)}</strong>
              </li>
              <li>
                Dávka vápna se určuje podle tabulky pro {parcel.soil_type} půdu
              </li>
            </ul>

            {plan.lime_reasoning && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-900">{plan.lime_reasoning}</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'nutrients',
      title: 'Jak jsou spočítané dávky živin?',
      icon: Calculator,
      content: (
        <div className="space-y-4">
          {/* P */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-red-900">Fosfor (P₂O₅)</h4>
              <span className="text-2xl font-bold text-red-600">
                {plan.recommended_nutrients.p2o5} kg/ha
              </span>
            </div>
            <div className="text-sm text-red-800 space-y-1">
              <p>• Kategorie zásobenosti: <strong>{analysis.phosphorus_category || 'Neurčeno'}</strong></p>
              <p>• Měřená hodnota: <strong>{analysis.phosphorus} mg/kg</strong></p>
              <p>• Základní dávka podle kategorie + korekce pro kulturu</p>
              {plan.recommended_nutrients.p2o5 === 0 && (
                <p className="text-red-900 font-medium mt-2">
                  ⚠️ Aplikace zakázána - velmi vysoká zásobenost (legislativa 377/2013 Sb.)
                </p>
              )}
            </div>
          </div>

          {/* K */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">Draslík (K₂O)</h4>
              <span className="text-2xl font-bold text-blue-600">
                {plan.recommended_nutrients.k2o} kg/ha
              </span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Kategorie zásobenosti: <strong>{analysis.potassium_category || 'Neurčeno'}</strong></p>
              <p>• Měřená hodnota: <strong>{analysis.potassium} mg/kg</strong></p>
              <p>• Základní dávka podle kategorie</p>
              {plan.km_ratio_corrected && (
                <p className="text-blue-900 font-medium mt-2">
                  ✓ Upraveno pro optimální poměr K:Mg ({plan.km_ratio?.toFixed(2)})
                </p>
              )}
            </div>
          </div>

          {/* Mg */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-purple-900">Hořčík (MgO)</h4>
              <span className="text-2xl font-bold text-purple-600">
                {plan.recommended_nutrients.mgo} kg/ha
              </span>
            </div>
            <div className="text-sm text-purple-800 space-y-1">
              <p>• Kategorie zásobenosti: <strong>{analysis.magnesium_category || 'Neurčeno'}</strong></p>
              <p>• Měřená hodnota: <strong>{analysis.magnesium} mg/kg</strong></p>
              <p>• Základní dávka podle kategorie</p>
              {plan.km_ratio_corrected && (
                <p className="text-purple-900 font-medium mt-2">
                  ✓ Upraveno pro optimální poměr K:Mg
                </p>
              )}
            </div>
          </div>

          {/* S */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-yellow-900">Síra (S)</h4>
              <span className="text-2xl font-bold text-yellow-600">
                {plan.recommended_nutrients.s} kg/ha
              </span>
            </div>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Měřená hodnota: <strong>{analysis.sulfur ? `${analysis.sulfur} mg/kg` : 'Neměřeno'}</strong></p>
              {!analysis.sulfur && (
                <p>• Odhadnuto podle kategorie P a typu kultury</p>
              )}
            </div>
          </div>

          {/* Yield factor */}
          {plan.base_yield_factor && plan.base_yield_factor !== 1.0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Výnosová úroveň:</strong> {plan.base_yield_factor.toFixed(1)}×
                <br />
                <span className="text-xs text-gray-600">
                  Všechny dávky jsou upraveny podle očekávané výnosové úrovně
                </span>
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'methodology',
      title: 'Jaká metodika je použita?',
      icon: Lightbulb,
      content: (
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">České zemědělské normy</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Vyhláška 377/2013 Sb. (hnojení)</li>
              <li>Metodika ÚKZÚZ (vápnění)</li>
              <li>Výzkumné údaje VÚRV (odběr živin)</li>
              <li>Metoda extrakce: Mehlich 3</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Kategorie zásobenosti</h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-red-600">N</div>
                <div className="text-gray-600">Velmi nízká</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600">VH</div>
                <div className="text-gray-600">Nízká</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">D</div>
                <div className="text-gray-600">Dobrá</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">V</div>
                <div className="text-gray-600">Vysoká</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">VV</div>
                <div className="text-gray-600">Velmi vysoká</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">K:Mg poměr</h4>
            <p>
              Optimální poměr draslíku a hořčíku je <strong>1.5-2.5</strong>.
              Příliš vysoký poměr může způsobit nedostatek Mg, nízký poměr snižuje využití K.
            </p>
            {plan.km_ratio && (
              <div className="mt-2 text-sm">
                Váš aktuální poměr: <strong className={
                  plan.km_ratio < 1.5 || plan.km_ratio > 2.5 ? 'text-yellow-700' : 'text-green-700'
                }>{plan.km_ratio.toFixed(2)}</strong>
              </div>
            )}
          </div>

          {plan.plan_type === 'advanced' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">4letá predikce</h4>
              <p>
                Predikce je založena na:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Plánovaném osevním postupu</li>
                <li>Odběru živin plodinou (kg/t hlavního produktu)</li>
                <li>Přirozeném okyselování půdy (300-500 kg CaCO₃/ha/rok)</li>
                <li>Účinku hnojiv na pH (acidifikace)</li>
              </ul>
            </div>
          )}
        </div>
      ),
    },
  ]

  // Only show lime section if there's lime recommendation
  const visibleSections = sections.filter(section => 
    section.id !== 'lime' || plan.recommended_lime_kg_ha > 0
  )

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-purple-100 rounded-lg p-3">
          <Lightbulb className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Asistent rozhodování</h2>
          <p className="text-sm text-gray-600">Vysvětlení doporučení a kalkulací</p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleSections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSection === section.id

          return (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 text-left">
                    {section.title}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="pt-4">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
