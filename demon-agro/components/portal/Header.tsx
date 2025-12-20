'use client'

import { Menu, User, Building2 } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

interface HeaderProps {
  user: {
    email: string
    profile: Profile | null
  }
  pageTitle: string
  onMenuClick: () => void
}

export function Header({ user, pageTitle, onMenuClick }: HeaderProps) {
  // Get user initials for avatar
  const getInitials = () => {
    if (user.profile?.full_name) {
      return user.profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email.slice(0, 2).toUpperCase()
  }

  const initials = getInitials()
  const displayName = user.profile?.full_name || user.email
  const companyName = user.profile?.company_name

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left: Mobile menu button + Page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Otevřít menu"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {pageTitle}
            </h1>
            {companyName && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{companyName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: User info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
          
          {/* Avatar */}
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-green text-white font-semibold text-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
