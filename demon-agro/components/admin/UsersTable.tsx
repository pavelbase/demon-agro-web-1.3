'use client'

import { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Download,
  Eye,
  Edit,
  Key,
  Power,
  Trash2,
  Building2,
  User as UserIcon
} from 'lucide-react'
import { CreateUserModal } from './CreateUserModal'
import { EditUserModal } from './EditUserModal'
import { UserDetailModal } from './UserDetailModal'
import { sendPasswordResetEmailClient } from '@/lib/utils/email-client'
import * as XLSX from 'xlsx'

interface User {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  ico: string | null
  district: string | null
  phone: string | null
  address: string | null
  role: string
  is_active: boolean
  ai_extractions_limit: number
  ai_extractions_used_today: number
  created_at: string
  last_sign_in_at: string | null
  parcel_count: number
  total_area: number
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [districtFilter, setDistrictFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Get unique districts
  const districts = useMemo(() => {
    const unique = new Set(users.map(u => u.district).filter(Boolean))
    return Array.from(unique).sort()
  }, [users])

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        user.email.toLowerCase().includes(searchLower) ||
        user.company_name?.toLowerCase().includes(searchLower) ||
        user.ico?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !user.is_active) return false
        if (statusFilter === 'inactive' && user.is_active) return false
      }

      // District filter
      if (districtFilter !== 'all' && user.district !== districtFilter) return false

      return true
    })
  }, [users, searchQuery, statusFilter, districtFilter])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isActive = (user: User) => user.is_active

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Opravdu chcete resetovat heslo uživateli ${user.email}?`)) return
    
    setActionLoading(user.id)
    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se resetovat heslo')
      }

      // Send password reset email from client-side
      if (result.newPassword) {
        const displayName = result.fullName || user.company_name || user.email
        const emailResult = await sendPasswordResetEmailClient(
          result.email,
          displayName,
          result.newPassword
        )

        if (!emailResult.success) {
          console.warn('Failed to send password reset email:', emailResult.error)
          alert(
            `Heslo bylo resetováno, ale email se nepodařilo odeslat.\n\n` +
            `Email: ${result.email}\n` +
            `Nové heslo: ${result.newPassword}\n\n` +
            `Poznamenejte si heslo a sdělte ho uživateli!`
          )
        } else {
          alert('Heslo bylo úspěšně resetováno a odesláno emailem uživateli.')
        }
      }

      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Došlo k chybě')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (user: User) => {
    const action = user.is_active ? 'deaktivovat' : 'aktivovat'
    if (!confirm(`Opravdu chcete ${action} uživatele ${user.email}?`)) return
    
    setActionLoading(user.id)
    try {
      const response = await fetch('/api/admin/users/toggle-active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se změnit stav')
      }

      alert(result.message)
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Došlo k chybě')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`VAROVÁNÍ: Opravdu chcete SMAZAT uživatele ${user.email}?\n\nTato akce je nevratná!`)) return
    if (!confirm('Jste si opravdu jistí? Tato akce je nevratná!')) return
    
    setActionLoading(user.id)
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se smazat uživatele')
      }

      alert('Uživatel byl úspěšně smazán.')
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Došlo k chybě')
    } finally {
      setActionLoading(null)
    }
  }

  const handleExport = () => {
    const exportData = filteredUsers.map(user => ({
      'Email': user.email,
      'Jméno': user.full_name || '',
      'Firma': user.company_name || '',
      'IČO': user.ico || '',
      'Okres': user.district || '',
      'Telefon': user.phone || '',
      'Počet pozemků': user.parcel_count,
      'Výměra (ha)': user.total_area.toFixed(2),
      'AI limit': user.ai_extractions_limit,
      'AI použito dnes': user.ai_extractions_used_today,
      'Registrován': formatDate(user.created_at),
      'Poslední přihlášení': formatDate(user.last_sign_in_at),
      'Status': isActive(user) ? 'Aktivní' : 'Neaktivní',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Uživatelé')
    XLSX.writeFile(wb, `uzivatele_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle emailu, firmy, IČO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Všechny stavy</option>
            <option value="active">Aktivní</option>
            <option value="inactive">Neaktivní</option>
          </select>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Všechny okresy</option>
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Vytvořit uživatele
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Zobrazeno: {filteredUsers.length} z {users.length} uživatelů
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IČO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Okres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pozemky
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Výměra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poslední přihlášení
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {user.company_name ? (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        ) : (
                          <UserIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.company_name || user.full_name || 'Nepojmenovaný'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.ico || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.district || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.parcel_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.total_area.toFixed(2)} ha
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.ai_extractions_used_today}/{user.ai_extractions_limit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isActive(user) ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Aktivní
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Neaktivní
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Zobrazit data"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Upravit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={actionLoading === user.id}
                        className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                        title="Resetovat heslo"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={actionLoading === user.id}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        title={isActive(user) ? "Deaktivovat" : "Aktivovat"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      {user.parcel_count === 0 && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={actionLoading === user.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Smazat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Žádní uživatelé neodpovídají filtru</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}
      
      {viewingUser && (
        <UserDetailModal 
          user={viewingUser} 
          onClose={() => setViewingUser(null)} 
        />
      )}
    </div>
  )
}
