'use client'

import { useState } from 'react'
import { Eye, Calendar, MapPin, Package } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import { LimingRequestDetailModal } from './LimingRequestDetailModal'

type LimingRequest = Database['public']['Tables']['liming_requests']['Row'] & {
  liming_request_items: Array<{
    id: string
    parcel_id: string
    product_name: string
    quantity: number
    unit: string
  }>
}

interface LimingRequestsTableProps {
  requests: LimingRequest[]
}

const STATUS_CONFIG = {
  new: {
    label: 'Nová',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'Zpracovává se',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  quoted: {
    label: 'Nacenéno',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  completed: {
    label: 'Dokončeno',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  cancelled: {
    label: 'Zrušeno',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
}

export function LimingRequestsTable({ requests }: LimingRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<LimingRequest | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum vytvoření
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Počet pozemků
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Celková výměra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Celkové množství
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
                const itemsCount = request.liming_request_items?.length || 0

                return (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(request.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {itemsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.total_area.toFixed(2)} ha
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {request.total_quantity?.toFixed(2) || '—'} t
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center text-primary-green hover:text-primary-brown font-medium"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {requests.map((request) => {
            const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
            const itemsCount = request.liming_request_items?.length || 0

            return (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(request.created_at)}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Počet pozemků</p>
                    <p className="text-sm font-semibold text-gray-900">{itemsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Celková výměra</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {request.total_area.toFixed(2)} ha
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Celkové množství</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {request.total_quantity?.toFixed(2) || '—'} t
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequest(request)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 text-primary-green hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Zobrazit detail
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <LimingRequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  )
}
