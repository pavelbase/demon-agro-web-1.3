'use client'

import { Building2, User as UserIcon, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  ico: string | null
  district: string | null
  phone: string | null
  address: string | null
  created_at: string
  last_sign_in_at: string | null
}

interface UserDetailHeaderProps {
  user: User
}

export function UserDetailHeader({ user }: UserDetailHeaderProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isActive = () => {
    if (!user.last_sign_in_at) return false
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return new Date(user.last_sign_in_at) > thirtyDaysAgo
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {user.company_name ? (
              <Building2 className="h-16 w-16 text-gray-400" />
            ) : (
              <UserIcon className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.company_name || user.full_name || 'Nepojmenovaný uživatel'}
            </h1>
            {user.company_name && user.full_name && (
              <p className="text-gray-600 mt-1">{user.full_name}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              {user.ico && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">IČO:</span>
                  {user.ico}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          {isActive() ? (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
              Aktivní
            </span>
          ) : (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
              Neaktivní
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        {user.district && (
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Okres</p>
              <p className="text-sm font-medium text-gray-900">{user.district}</p>
            </div>
          </div>
        )}
        
        {user.phone && (
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Telefon</p>
              <p className="text-sm font-medium text-gray-900">{user.phone}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Registrace</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(user.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Poslední přihlášení</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(user.last_sign_in_at)}
            </p>
          </div>
        </div>

        {user.address && (
          <div className="flex items-start md:col-span-2">
            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Adresa</p>
              <p className="text-sm font-medium text-gray-900">{user.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* READ-ONLY Notice */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>READ-ONLY:</strong> Toto je pouze zobrazení dat uživatele. Pro úpravy použijte
          tlačítko &quot;Upravit&quot; v seznamu uživatelů.
        </p>
      </div>
    </div>
  )
}
