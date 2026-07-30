'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LimingCartButton } from './LimingCartButton'
import { Toaster } from 'react-hot-toast'
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
  '/portal/nastaveni': 'Nastavení',
  '/portal/onboarding': 'Vítejte',
  // Služba: Vápnění
  '/portal/vapneni': 'Vápnění',
  '/portal/vapneni/plany': 'Plány vápnění',
  '/portal/vapneni/kalkulacka-ztrat': 'Kalkulačka ztrát',
  '/portal/vapneni/poptavky': 'Moje poptávky',
  // Služba: Hnojiva a POR
  '/portal/hnojiva-por': 'Hnojiva a POR',
  '/portal/hnojiva-por/evidence': 'Evidence aplikací',
  '/portal/hnojiva-por/evidence/nova': 'Nová aplikace',
  '/portal/hnojiva-por/evidence/hromadne': 'Souhrnné zadání',
  '/portal/hnojiva-por/schvaleni': 'Zápisy ke schválení',
  '/portal/hnojiva-por/parcely': 'Parcely a osevy',
  '/portal/hnojiva-por/pripravky': 'Katalog přípravků',
  '/portal/hnojiva-por/hnojiva': 'Katalog hnojiv',
  '/portal/hnojiva-por/pozemky': 'Pozemky (DPB)',
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

/**
 * Provozní režim – stránky, které běží přes celou obrazovku bez navigace.
 *
 * Zápis z pole obsluhuje zemědělec na telefonu v kabině; sidebar, hlavička ani
 * košík vápnění tam nemají co dělat a jen by mu překážely v cestě.
 */
const fullscreenRoutes = ['/portal/hnojiva-por/zapis']

const toastOptions = {
  duration: 3000,
  style: {
    background: '#363636',
    color: '#fff',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#4ade80',
      secondary: '#fff',
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
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

    // Try progressively shorter parent routes (e.g. /portal/vapneni/poptavky/nova
    // → /portal/vapneni/poptavky → /portal/vapneni), take the most specific match.
    const segments = pathname.split('/').filter(Boolean)
    for (let i = segments.length - 1; i > 0; i--) {
      const parentPath = '/' + segments.slice(0, i).join('/')
      if (pageTitles[parentPath]) {
        return pageTitles[parentPath]
      }
    }
    
    // Default
    return 'Portál'
  }

  const pageTitle = getPageTitle()

  if (fullscreenRoutes.some((route) => pathname.startsWith(route))) {
    return (
      <>
        {children}
        <Toaster position="top-center" toastOptions={toastOptions} />
      </>
    )
  }

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
      
      {/* Toast notifications */}
      <Toaster position="top-right" toastOptions={toastOptions} />
    </div>
  )
}
