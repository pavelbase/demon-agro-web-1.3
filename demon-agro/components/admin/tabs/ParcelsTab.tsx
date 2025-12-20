'use client'

import { MapPin } from 'lucide-react'

interface Parcel {
  id: string
  code: string
  name: string
  area: number
  soil_type: string
  culture: string
  latest_analysis: {
    ph: number
    ph_category: string
    phosphorus_category: string
    potassium_category: string
    magnesium_category: string
  } | null
}

interface ParcelsTabProps {
  parcels: Parcel[]
}

const CATEGORY_COLORS: Record<string, string> = {
  EK: 'bg-red-100 text-red-800',
  SK: 'bg-orange-100 text-orange-800',
  N: 'bg-yellow-100 text-yellow-800',
  SZ: 'bg-blue-100 text-blue-800',
  EZ: 'bg-green-100 text-green-800',
  VH: 'bg-red-100 text-red-800',
  D: 'bg-orange-100 text-orange-800',
  V: 'bg-green-100 text-green-800',
  VV: 'bg-blue-100 text-blue-800',
}

export function ParcelsTab({ parcels }: ParcelsTabProps) {
  if (parcels.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Uživatel nemá žádné pozemky</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Pozemky uživatele ({parcels.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kód
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Název
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Výměra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Půdní druh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kultura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                pH
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zásobenost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parcels.map((parcel) => (
              <tr key={parcel.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {parcel.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parcel.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parcel.area.toFixed(2)} ha
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parcel.soil_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parcel.culture}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parcel.latest_analysis ? (
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {parcel.latest_analysis.ph.toFixed(1)}
                      </span>
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${
                          CATEGORY_COLORS[parcel.latest_analysis.ph_category] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {parcel.latest_analysis.ph_category}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parcel.latest_analysis ? (
                    <div className="flex gap-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          CATEGORY_COLORS[parcel.latest_analysis.phosphorus_category] || 'bg-gray-100'
                        }`}
                        title="Fosfor"
                      >
                        P: {parcel.latest_analysis.phosphorus_category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          CATEGORY_COLORS[parcel.latest_analysis.potassium_category] || 'bg-gray-100'
                        }`}
                        title="Draslík"
                      >
                        K: {parcel.latest_analysis.potassium_category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          CATEGORY_COLORS[parcel.latest_analysis.magnesium_category] || 'bg-gray-100'
                        }`}
                        title="Hořčík"
                      >
                        Mg: {parcel.latest_analysis.magnesium_category}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
