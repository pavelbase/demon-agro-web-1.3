'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LimingCartButton } from './LimingCartButton'
import type { Profile } from '@/lib/types/database'

interface PortalLayoutClientProps {
  user: {
    email: string
    profile: Profile | null
  }
  isAdmin: boolean
  children: React.ReactNode
}

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/portal/dashboard': 'Dashboard',
  '/portal/pozemky': 'Moje pozemky',
  '/portal/upload': 'Upload rozborů půdy',
  '/portal/historie-hnojeni': 'Historie hnojení',
  '/portal/osevni-postup': 'Osevní postup',
  '/portal/poptavky': 'Moje poptávky',
  '/portal/nastaveni': 'Nastavení',
  '/portal/onboarding': 'Vítejte',
  // Admin pages
  '/portal/admin': 'Administrace',
  '/portal/admin/uzivatele': 'Správa uživatelů',
  '/portal/admin/produkty': 'Produkty hnojení',
  '/portal/admin/produkty-vapneni': 'Produkty vápnění',
  '/portal/admin/poptavky': 'Správa poptávek',
  '/portal/admin/obrazky-portalu': 'Obrázky portálu',
  '/portal/admin/audit-log': 'Audit log',
  '/portal/admin/statistiky': 'Statistiky',
}

export function PortalLayoutClient({ user, isAdmin, children }: PortalLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Get page title
  const getPageTitle = () => {
    // Try exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname]
    }
    
    // Try to match parent route (e.g., /portal/pozemky/123 → Moje pozemky)
    const parentPath = pathname.split('/').slice(0, 3).join('/')
    if (pageTitles[parentPath]) {
      return pageTitles[parentPath]
    }
    
    // Default
    return 'Portál'
  }

  const pageTitle = getPageTitle()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar isAdmin={isAdmin} />
        </div>

        {/* Sidebar - Mobile (overlay) */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
              <Sidebar 
                isAdmin={isAdmin} 
                onClose={() => setSidebarOpen(false)}
                isMobile
              />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            user={user} 
            pageTitle={pageTitle}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Cart Button - visible on all portal pages */}
      <LimingCartButton />
    </div>
  )
}
