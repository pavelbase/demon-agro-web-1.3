'use client'

import type { FertilizationPlan } from '@/lib/utils/fertilization-plan'
import type { Parcel } from '@/lib/types/database'

interface PlanRecommendationsTableProps {
  plan: FertilizationPlan
  parcel: Parcel
}

function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function PlanRecommendationsTable({ plan, parcel }: PlanRecommendationsTableProps) {
  if (!plan.predictions) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Doporučení po jednotlivých letech
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Rok
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">
                pH
              </th>
              <th className="text-right py-3 px-4 font-semibold text-red-700">
                P
              </th>
              <th className="text-right py-3 px-4 font-semibold text-blue-700">
                K
              </th>
              <th className="text-right py-3 px-4 font-semibold text-purple-700">
                Mg
              </th>
              <th className="text-right py-3 px-4 font-semibold text-yellow-700">
                S
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Stav
              </th>
            </tr>
          </thead>
          <tbody>
            {plan.predictions.years.map((year, index) => {
              const ph = plan.predictions!.ph[index]
              const p = plan.predictions!.p[index]
              const k = plan.predictions!.k[index]
              const mg = plan.predictions!.mg[index]
              const s = plan.predictions!.s[index]

              // Determine status
              const issues = []
              if (ph < 5.5) issues.push('Nízké pH')
              if (p < 50) issues.push('Nízký P')
              if (k < 100) issues.push('Nízký K')
              if (mg < 60) issues.push('Nízký Mg')

              const statusText = issues.length > 0 ? issues.join(', ') : 'V normě'
              const statusColor = issues.length > 0 ? 'text-yellow-600' : 'text-green-600'

              return (
                <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {year}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    ph < 5.5 ? 'text-red-600' : ph < 6.0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {ph.toFixed(1)}
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    p < 50 ? 'text-red-600' : p < 80 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {Math.round(p)}
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    k < 100 ? 'text-red-600' : k < 150 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {Math.round(k)}
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    mg < 60 ? 'text-red-600' : mg < 90 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {Math.round(mg)}
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    s < 10 ? 'text-red-600' : s < 15 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {Math.round(s)}
                  </td>
                  <td className={`py-3 px-4 text-sm ${statusColor}`}>
                    {statusText}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Optimální</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Nízká zásobenost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Kriticky nízká</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Poznámka:</strong> Hodnoty jsou predikce na základě plánovaného osevního postupu 
          a doporučeného hnojení. Aktuální hodnoty mohou být ovlivněny počasím, půdními podmínkami 
          a přesností aplikace hnojiv.
        </p>
      </div>
    </div>
  )
}
