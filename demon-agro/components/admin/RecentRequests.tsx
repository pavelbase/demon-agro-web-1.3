'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface LimingRequest {
  id: string
  status: string
  total_area: number
  total_quantity: number | null
  created_at: string
  profiles: {
    full_name: string | null
    company_name: string | null
  }
}

interface RecentRequestsProps {
  requests: LimingRequest[]
}

const STATUS_CONFIG = {
  new: {
    label: 'Nová',
    color: 'bg-blue-100 text-blue-800',
  },
  in_progress: {
    label: 'Zpracovává se',
    color: 'bg-yellow-100 text-yellow-800',
  },
  quoted: {
    label: 'Nacenéno',
    color: 'bg-green-100 text-green-800',
  },
  completed: {
    label: 'Dokončeno',
    color: 'bg-gray-100 text-gray-800',
  },
  cancelled: {
    label: 'Zrušeno',
    color: 'bg-red-100 text-red-800',
  },
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUserName = (profile: LimingRequest['profiles']) => {
    return profile.company_name || profile.full_name || 'Nepojmenovaný uživatel'
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Zatím žádné poptávky</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new

        return (
          <div
            key={request.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-green transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {getUserName(request.profiles)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(request.created_at)}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
              >
                {status.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Plocha</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.total_area.toFixed(1)} ha
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Množství</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.total_quantity?.toFixed(1) || '—'} t
                </p>
              </div>
            </div>

            <Link
              href={`/portal/admin/poptavky/${request.id}`}
              className="inline-flex items-center text-sm text-primary-green hover:text-primary-brown font-medium"
            >
              Zobrazit detail
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )
      })}

      <Link
        href="/portal/admin/poptavky"
        className="block text-center text-sm text-primary-green hover:text-primary-brown font-medium py-2"
      >
        Zobrazit všechny poptávky →
      </Link>
    </div>
  )
}
