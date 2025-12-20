'use client'

import { ShoppingCart } from 'lucide-react'

interface LimingRequest {
  id: string
  status: string
  total_area: number
  total_quantity: number | null
  created_at: string
}

interface LimingRequestsTabProps {
  requests: LimingRequest[]
}

const STATUS_CONFIG = {
  new: { label: 'Nová', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Zpracovává se', color: 'bg-yellow-100 text-yellow-800' },
  quoted: { label: 'Nacenéno', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Dokončeno', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Zrušeno', color: 'bg-red-100 text-red-800' },
}

export function LimingRequestsTab({ requests }: LimingRequestsTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Žádné poptávky vápnění</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Historie poptávek ({requests.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plocha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Množství
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => {
              const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new

              return (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.total_area.toFixed(2)} ha
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.total_quantity?.toFixed(2) || '—'} t
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
