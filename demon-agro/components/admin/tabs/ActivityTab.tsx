'use client'

import { Activity as ActivityIcon } from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  table_name: string
  created_at: string
}

interface ActivityTabProps {
  logs: ActivityLog[]
}

export function ActivityTab({ logs }: ActivityTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionColor = (action: string) => {
    if (action.includes('vytvo')) return 'bg-green-100 text-green-800'
    if (action.includes('uprav') || action.includes('změn')) return 'bg-blue-100 text-blue-800'
    if (action.includes('smaz') || action.includes('arch')) return 'bg-red-100 text-red-800'
    if (action.includes('AI')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Žádná aktivita</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Poslední aktivita ({logs.length})
        </h3>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {logs.map((log, index) => (
          <div key={log.id} className="relative">
            {/* Timeline line */}
            {index < logs.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Timeline item */}
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <ActivityIcon className="h-5 w-5 text-gray-600" />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{log.action}</p>
                      {log.table_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tabulka: {log.table_name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action.split(':')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(log.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
