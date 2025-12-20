'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Registration {
  created_at: string
}

interface RegistrationsChartProps {
  data: Registration[]
}

export function RegistrationsChart({ data }: RegistrationsChartProps) {
  const chartData = useMemo(() => {
    // Group registrations by date
    const grouped = data.reduce((acc, reg) => {
      const date = new Date(reg.created_at).toLocaleDateString('cs-CZ')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Create array for last 30 days
    const result = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('cs-CZ')
      
      result.push({
        date: dateStr,
        registrations: grouped[dateStr] || 0,
      })
    }

    return result
  }, [data])

  const totalRegistrations = useMemo(() => {
    return chartData.reduce((sum, day) => sum + day.registrations, 0)
  }, [chartData])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-sm">Žádné registrace za posledních 30 dní</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Celkem za období</p>
          <p className="text-2xl font-bold text-primary-green">{totalRegistrations}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Průměr/den</p>
          <p className="text-2xl font-bold text-gray-900">
            {(totalRegistrations / 30).toFixed(1)}
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="registrations" 
            stroke="#2d5016" 
            strokeWidth={2}
            dot={{ fill: '#2d5016', r: 4 }}
            activeDot={{ r: 6 }}
            name="Registrace"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
