'use client'

import { useState, useMemo } from 'react'
import { Search, Download, Eye, ShoppingCart } from 'lucide-react'
import { RequestDetailModal } from './RequestDetailModal'
import * as XLSX from 'xlsx'

interface Request {
  id: string
  status: string
  total_area: number
  total_quantity: number | null
  created_at: string
  profiles: {
    company_name: string | null
    district: string | null
    full_name: string | null
    email: string
    phone: string | null
  }
  liming_request_items: Array<{
    id: string
    parcel_id: string
    product_name: string
    quantity: number
  }>
}

interface AdminRequestsTableProps {
  requests: Request[]
  newCount: number
}

const STATUS_CONFIG = {
  new: { label: 'Nová', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'Zpracovává se', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  quoted: { label: 'Nacenéno', color: 'bg-green-100 text-green-800 border-green-200' },
  completed: { label: 'Dokončeno', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  cancelled: { label: 'Zrušeno', color: 'bg-red-100 text-red-800 border-red-200' },
}

export function AdminRequestsTable({ requests, newCount }: AdminRequestsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingRequest, setViewingRequest] = useState<Request | null>(null)

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false
      
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        const company = req.profiles.company_name?.toLowerCase() || ''
        const name = req.profiles.full_name?.toLowerCase() || ''
        if (!company.includes(search) && !name.includes(search)) return false
      }
      
      return true
    })
  }, [requests, statusFilter, searchQuery])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleExport = () => {
    const exportData = filteredRequests.map(req => ({
      'Datum': formatDate(req.created_at),
      'Firma': req.profiles.company_name || req.profiles.full_name,
      'Okres': req.profiles.district || '',
      'Email': req.profiles.email,
      'Telefon': req.profiles.phone || '',
      'Počet pozemků': req.liming_request_items.length,
      'Výměra (ha)': req.total_area.toFixed(2),
      'Množství (t)': req.total_quantity?.toFixed(2) || '',
      'Status': STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG]?.label || req.status,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Poptávky')
    XLSX.writeFile(wb, `poptavky_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle firmy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Všechny statusy</option>
            <option value="new">Nové ({requests.filter(r => r.status === 'new').length})</option>
            <option value="in_progress">Zpracovává se</option>
            <option value="quoted">Nacenéno</option>
            <option value="completed">Dokončeno</option>
            <option value="cancelled">Zrušeno</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Zobrazeno: {filteredRequests.length} z {requests.length} poptávek
          {newCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {newCount} nových
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Firma / Zákazník
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pozemky
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Výměra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Množství
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
                const isNew = request.status === 'new'

                return (
                  <tr 
                    key={request.id} 
                    className={`hover:bg-gray-50 ${isNew ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.created_at)}
                      {isNew && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {request.profiles.company_name || request.profiles.full_name}
                        </div>
                        {request.profiles.district && (
                          <div className="text-xs text-gray-500">{request.profiles.district}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.liming_request_items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.total_area.toFixed(2)} ha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.total_quantity?.toFixed(2) || '—'} t
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setViewingRequest(request)}
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

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Žádné poptávky neodpovídají filtru</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingRequest && (
        <RequestDetailModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
          onUpdate={() => {
            setViewingRequest(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
