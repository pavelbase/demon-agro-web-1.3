'use client'

import { useState } from 'react'
import { Search, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

interface AuditLog {
  id: string
  action: string
  created_at: string
  admin: {
    email: string
    full_name: string | null
    company_name: string | null
  }
  target_user: {
    company_name: string | null
    full_name: string | null
    email: string
  } | null
  new_data: any
}

interface AuditLogTableProps {
  logs: AuditLog[]
  admins: Array<{ id: string; email: string; full_name: string | null }>
  currentPage: number
  totalPages: number
  totalCount: number
}

const ACTION_LABELS: Record<string, string> = {
  'view_user_detail': 'Zobrazení detailu uživatele',
  'view_user_parcels': 'Zobrazení pozemků',
  'view_user_analyses': 'Zobrazení rozborů',
  'reset_password': 'Reset hesla',
  'create_user': 'Vytvoření uživatele',
  'deactivate_user': 'Deaktivace uživatele',
  'activate_user': 'Aktivace uživatele',
  'update_ai_limit': 'Změna AI limitu',
}

export function AuditLogTable({ logs, admins, currentPage, totalPages, totalCount }: AuditLogTableProps) {
  const [selectedAdmin, setSelectedAdmin] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionLabel = (action: string) => {
    const cleanAction = action.replace('[ADMIN] ', '')
    
    for (const [key, label] of Object.entries(ACTION_LABELS)) {
      if (cleanAction.includes(key)) {
        return label
      }
    }
    
    return cleanAction
  }

  const handleExport = () => {
    const exportData = logs.map(log => ({
      'Datum a čas': formatDate(log.created_at),
      'Admin': log.admin.email,
      'Cílový uživatel': log.target_user 
        ? (log.target_user.company_name || log.target_user.full_name || log.target_user.email)
        : '—',
      'Akce': getActionLabel(log.action),
      'Detaily': JSON.stringify(log.new_data),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Log')
    XLSX.writeFile(wb, `audit_log_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const buildFilterUrl = () => {
    const params = new URLSearchParams()
    if (selectedAdmin) params.set('admin', selectedAdmin)
    if (searchQuery) params.set('search', searchQuery)
    params.set('page', '1')
    return `?${params.toString()}`
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
                placeholder="Hledat v akci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = buildFilterUrl()
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedAdmin}
            onChange={(e) => {
              setSelectedAdmin(e.target.value)
              const params = new URLSearchParams()
              if (e.target.value) params.set('admin', e.target.value)
              if (searchQuery) params.set('search', searchQuery)
              window.location.href = `?${params.toString()}`
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="">Všichni admini</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.email}
              </option>
            ))}
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
          Zobrazeno: {logs.length} z {totalCount} záznamů (stránka {currentPage} z {totalPages})
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum a čas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cílový uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Akce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Detaily
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.admin.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.target_user 
                        ? (log.target_user.company_name || log.target_user.full_name || log.target_user.email)
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.new_data && Object.keys(log.new_data).length > 0 && (
                        <button
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="text-primary-green hover:text-primary-brown font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {expandedLog === log.id ? 'Skrýt' : 'Zobrazit'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedLog === log.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 mb-2">Detaily:</p>
                          <pre className="bg-white border border-gray-200 rounded p-3 text-xs overflow-x-auto">
                            {JSON.stringify(log.new_data, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Žádné záznamy</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Stránka {currentPage} z {totalPages}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link
                  href={`?page=${currentPage - 1}${selectedAdmin ? `&admin=${selectedAdmin}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Předchozí
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`?page=${currentPage + 1}${selectedAdmin ? `&admin=${selectedAdmin}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Další
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>GDPR Compliance:</strong> Tento log zaznamenává všechny admin přístupy k datům uživatelů
        pro transparentnost a kontrolu. Záznamy jsou uchovávány po dobu 12 měsíců.
      </div>
    </div>
  )
}
