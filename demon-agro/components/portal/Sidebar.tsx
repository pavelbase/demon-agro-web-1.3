'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  Home, 
  Map, 
  Upload, 
  History, 
  Calendar, 
  ShoppingCart, 
  Settings,
  Users,
  Package,
  FileText,
  Image as ImageIcon,
  BarChart3,
  ClipboardList,
  LogOut,
  X
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'

interface SidebarProps {
  isAdmin: boolean
  onClose?: () => void
  isMobile?: boolean
}

const mainNavItems = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: Home },
  { href: '/portal/pozemky', label: 'Pozemky', icon: Map },
  { href: '/portal/upload', label: 'Upload rozborů', icon: Upload },
  { href: '/portal/historie-hnojeni', label: 'Historie hnojení', icon: History },
  { href: '/portal/osevni-postup', label: 'Osevní postup', icon: Calendar },
  { href: '/portal/poptavky', label: 'Moje poptávky', icon: ShoppingCart },
  { href: '/portal/nastaveni', label: 'Nastavení', icon: Settings },
]

const adminNavItems = [
  { href: '/portal/admin', label: 'Přehled', icon: BarChart3 },
  { href: '/portal/admin/uzivatele', label: 'Uživatelé', icon: Users },
  { href: '/portal/admin/produkty', label: 'Produkty hnojení', icon: Package },
  { href: '/portal/admin/produkty-vapneni', label: 'Produkty vápnění', icon: Package },
  { href: '/portal/admin/poptavky', label: 'Poptávky', icon: ClipboardList },
  { href: '/portal/admin/obrazky-portalu', label: 'Obrázky portálu', icon: ImageIcon },
  { href: '/portal/admin/audit-log', label: 'Audit log', icon: FileText },
  { href: '/portal/admin/statistiky', label: 'Statistiky', icon: BarChart3 },
]

export function Sidebar({ isAdmin, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (href: string) => {
    if (href === '/portal/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header with logo and close button (mobile) */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <Link href="/portal/dashboard" className="block" onClick={onClose}>
          <Image
            src="/logo/demon-agro-logo.svg"
            alt="Démon Agro"
            width={140}
            height={48}
            priority
          />
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Zavřít menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${active 
                    ? 'bg-primary-green text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <div className="mb-3 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administrace
              </h3>
            </div>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                      ${active 
                        ? 'bg-primary-brown text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Odhlásit se</span>
        </button>
      </div>
    </aside>
  )
}
