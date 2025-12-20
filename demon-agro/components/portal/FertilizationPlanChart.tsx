'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PlanPredictions } from '@/lib/utils/fertilization-plan'

interface FertilizationPlanChartProps {
  predictions: PlanPredictions
}

export function FertilizationPlanChart({ predictions }: FertilizationPlanChartProps) {
  // Transform data for Recharts
  const chartData = predictions.years.map((year, index) => ({
    year: year.replace('HY', ''),
    pH: predictions.ph[index],
    P: predictions.p[index],
    K: predictions.k[index],
    Mg: predictions.mg[index],
    S: predictions.s[index],
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-bold text-gray-900 mb-2">HY{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-bold text-gray-900">
                {entry.name === 'pH' 
                  ? entry.value.toFixed(1)
                  : `${Math.round(entry.value)} ${entry.name === 'pH' ? '' : 'mg/kg'}`
                }
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* pH Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">pH půdy</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[4, 8]}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="pH" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              name="pH"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span>Kritické (&lt;5.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span>Optimální (6.0-6.5)</span>
          </div>
        </div>
      </div>

      {/* Nutrients Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Zásoby živin (mg/kg)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="P" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="P"
            />
            <Line 
              type="monotone" 
              dataKey="K" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="K"
            />
            <Line 
              type="monotone" 
              dataKey="Mg" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="Mg"
            />
            <Line 
              type="monotone" 
              dataKey="S" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              name="S"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { name: 'P', values: predictions.p, color: 'red', unit: 'mg/kg' },
          { name: 'K', values: predictions.k, color: 'blue', unit: 'mg/kg' },
          { name: 'Mg', values: predictions.mg, color: 'purple', unit: 'mg/kg' },
          { name: 'pH', values: predictions.ph, color: 'green', unit: '' },
        ].map((nutrient) => {
          const trend = nutrient.values[nutrient.values.length - 1] - nutrient.values[0]
          const trendPercent = (trend / nutrient.values[0]) * 100

          return (
            <div key={nutrient.name} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">{nutrient.name} trend</div>
              <div className={`text-lg font-bold ${
                trend < 0 ? 'text-red-600' : trend > 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {trend > 0 && '+'}
                {nutrient.name === 'pH' ? trend.toFixed(1) : Math.round(trend)}
                {nutrient.unit && ` ${nutrient.unit}`}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.abs(trendPercent).toFixed(1)}% za 4 roky
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
