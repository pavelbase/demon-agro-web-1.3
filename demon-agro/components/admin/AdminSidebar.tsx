'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Beaker,
  ShoppingCart,
  Calculator,
  BarChart3,
  Shield,
  ArrowLeft,
  Tractor,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/portal/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Uživatelé',
    href: '/portal/admin/uzivatele',
    icon: Users,
  },
  {
    name: 'Produkty (hnojiva)',
    href: '/portal/admin/produkty',
    icon: Package,
  },
  {
    name: 'Produkty vápnění',
    href: '/portal/admin/produkty-vapneni',
    icon: Beaker,
  },
  {
    name: 'Poptávky',
    href: '/portal/admin/poptavky',
    icon: ShoppingCart,
  },
  {
    name: 'Kalkulace',
    href: '/portal/admin/kalkulace',
    icon: Calculator,
  },
  {
    name: 'AgroManažer',
    href: '/portal/admin/agromanager',
    icon: Tractor,
  },
  {
    name: 'Audit log',
    href: '/portal/admin/audit-log',
    icon: Shield,
  },
  {
    name: 'Statistiky',
    href: '/portal/admin/statistiky',
    icon: BarChart3,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [newRequestsCount, setNewRequestsCount] = useState(0)

  useEffect(() => {
    // Fetch new requests count
    fetch('/api/admin/requests/count')
      .then(res => res.json())
      .then(data => setNewRequestsCount(data.count || 0))
      .catch(() => setNewRequestsCount(0))
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/portal/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="px-6 py-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">Démon Agro</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.name}
                {item.href === '/portal/admin/poptavky' && newRequestsCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {newRequestsCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Back to Portal */}
        <div className="px-3 py-4 border-t border-gray-800">
          <Link
            href="/portal/dashboard"
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-3" />
            Zpět na portál
          </Link>
        </div>
      </div>
    </aside>
  )
}
