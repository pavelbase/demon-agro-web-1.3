'use client'

import Link from 'next/link'
import { ExternalLink, Building2, User as UserIcon } from 'lucide-react'

interface User {
  id: string
  full_name: string | null
  company_name: string | null
  email: string
  created_at: string
}

interface RecentRegistrationsProps {
  users: User[]
}

export function RecentRegistrations({ users }: RecentRegistrationsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUserName = (user: User) => {
    return user.full_name || user.email.split('@')[0]
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Zatím žádné registrace</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-primary-green transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center">
                {user.company_name ? (
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                ) : (
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                )}
                <p className="font-medium text-gray-900">
                  {getUserName(user)}
                </p>
              </div>
              {user.company_name && (
                <p className="text-sm text-gray-600 ml-6 mt-0.5">
                  {user.company_name}
                </p>
              )}
            </div>
          </div>
          
          <div className="ml-6 space-y-1">
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">
              Registrován: {formatDate(user.created_at)}
            </p>
          </div>

          <Link
            href={`/portal/admin/uzivatele/${user.id}`}
            className="inline-flex items-center text-sm text-primary-green hover:text-primary-brown font-medium mt-3 ml-6"
          >
            Zobrazit profil
            <ExternalLink className="h-4 w-4 ml-1" />
          </Link>
        </div>
      ))}

      <Link
        href="/portal/admin/uzivatele"
        className="block text-center text-sm text-primary-green hover:text-primary-brown font-medium py-2"
      >
        Zobrazit všechny uživatele →
      </Link>
    </div>
  )
}
