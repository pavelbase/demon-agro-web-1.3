'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, MapPin, FlaskConical } from 'lucide-react'

interface User {
  id: string
  email: string
  company_name: string | null
  full_name: string | null
}

interface UserDetailModalProps {
  user: User
  onClose: () => void
}

interface Parcel {
  id: string
  code: string
  name: string
  area: number
  soil_type: string
  culture: string
  soil_analyses_count: number
  latest_analysis_date: string | null
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [user.id])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/data`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se načíst data')
      }

      setParcels(result.parcels || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo k chybě')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  const totalArea = parcels.reduce((sum, p) => sum + p.area, 0)
  const totalAnalyses = parcels.reduce((sum, p) => sum + p.soil_analyses_count, 0)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Data uživatele (READ-ONLY)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {user.company_name || user.full_name} - {user.email}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                  {error}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Celkem pozemků</p>
                          <p className="text-2xl font-bold text-gray-900">{parcels.length}</p>
                        </div>
                        <MapPin className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Celková výměra</p>
                          <p className="text-2xl font-bold text-gray-900">{totalArea.toFixed(2)} ha</p>
                        </div>
                        <MapPin className="h-8 w-8 text-yellow-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Celkem rozborů</p>
                          <p className="text-2xl font-bold text-gray-900">{totalAnalyses}</p>
                        </div>
                        <FlaskConical className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Parcels List */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Seznam pozemků
                    </h4>
                    
                    {parcels.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Uživatel zatím nemá žádné pozemky</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {parcels.map((parcel) => (
                          <div
                            key={parcel.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-primary-green transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {parcel.name}
                                </h5>
                                <p className="text-sm text-gray-500">Kód: {parcel.code}</p>
                              </div>
                              <span className="text-lg font-semibold text-primary-green">
                                {parcel.area.toFixed(2)} ha
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500">Půdní typ</p>
                                <p className="font-medium text-gray-900">{parcel.soil_type}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Kultura</p>
                                <p className="font-medium text-gray-900">{parcel.culture}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Počet rozborů</p>
                                <p className="font-medium text-gray-900">{parcel.soil_analyses_count}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Poslední rozbor</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(parcel.latest_analysis_date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Privacy Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Ochrana dat:</strong> Zobrazeny jsou pouze metadata o pozemcích.
                      Konkrétní hodnoty rozborů (pH, živiny) nejsou z důvodu ochrany dat zobrazovány.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
