'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  Home, 
  Map, 
  Upload, 
  ShoppingCart, 
  Settings,
  Users,
  Package,
  FileText,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  LogOut,
  X,
  Shield,
  Sparkles,
  Calculator,
  TrendingDown,
  Tractor,
  Leaf,
  Layers,
  SprayCan,
  Sprout,
  Droplets
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import {
  serviceOwnsPath,
  useActiveService,
  type ServiceId,
} from '@/lib/contexts/ActiveServiceContext'

/**
 * Sidebar navigace pro uživatelský portál
 * 
 * Struktura navigace:
 * - Sdílené jádro (`sharedNavItems`) – vždy viditelné, nezávisle na zvolené službě
 *   (Dashboard, Nastavení)
 * - Přepínač služeb (`services`) – segmentované přepínání mezi moduly portálu.
 *   Položky vybrané služby (`services[activeService].items`) se zobrazují
 *   pod sdíleným jádrem.
 *
 * Pozemky jsou záměrně u služeb, ne ve sdíleném jádru: vápnění pracuje s pozemky
 * s rozbory půdy (tabulka `parcels`), evidence hnojiv a POR s díly půdních bloků
 * z LPIS (tabulka `land_blocks`) a jejich legislativními atributy.
 * 
 * Role-based přístup:
 * - Běžní uživatelé (role='user'): Vidí pouze hlavní navigaci
 * - Admin uživatelé (role='admin'): Vidí hlavní navigaci + Admin Zónu
 * 
 * Admin role se získává z:
 * - app/portal/layout.tsx: `const isAdmin = profile?.role === 'admin'`
 * - Kontroluje se pole `role` v tabulce `profiles`
 * 
 * @param {boolean} isAdmin - Určuje, zda je uživatel admin (z parent layoutu)
 * @param {function} onClose - Callback pro zavření sidebaru (mobilní verze)
 * @param {boolean} isMobile - Určuje, zda je sidebar v mobilním režimu
 */

interface SidebarProps {
  isAdmin: boolean
  onClose?: () => void
  isMobile?: boolean
}

interface NavItem {
  href: string
  label: string
  icon: typeof Home
}

// Sdílené jádro – dostupné vždy, nezávisle na zvolené službě
const sharedNavItems: NavItem[] = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: Home },
  { href: '/portal/nastaveni', label: 'Nastavení', icon: Settings },
]

// Registr služeb (modulů) portálu – jednotlivé položky se v Sidebaru
// zobrazují pouze pro aktuálně vybranou službu.
const services: {
  id: ServiceId
  label: string
  icon: typeof Home
  homeHref: string
  items: NavItem[]
}[] = [
  {
    id: 'vapneni',
    label: 'Vápnění',
    icon: Sparkles,
    homeHref: '/portal/pozemky',
    items: [
      // Pozemky a rozbory půdy patří vápnění – evidence hnojiv a POR má vlastní
      // pozemky (DPB z LPIS) s jinými atributy
      { href: '/portal/pozemky', label: 'Pozemky', icon: Map },
      { href: '/portal/upload', label: 'Upload rozborů', icon: Upload },
      { href: '/portal/vapneni/plany', label: 'Plány vápnění', icon: Sparkles },
      { href: '/portal/vapneni/kalkulacka-ztrat', label: 'Kalkulačka ztrát', icon: TrendingDown },
      { href: '/portal/vapneni/poptavky', label: 'Moje poptávky', icon: ShoppingCart },
    ],
  },
  {
    id: 'hnojiva-por',
    label: 'Hnojiva a POR',
    icon: Leaf,
    homeHref: '/portal/hnojiva-por/evidence',
    items: [
      { href: '/portal/hnojiva-por/evidence', label: 'Evidence aplikací', icon: ClipboardList },
      { href: '/portal/hnojiva-por/schvaleni', label: 'Zápisy ke schválení', icon: ClipboardCheck },
      { href: '/portal/hnojiva-por/nitratova-smernice', label: 'Nitrátová směrnice', icon: Droplets },
      { href: '/portal/hnojiva-por/parcely', label: 'Parcely a osevy', icon: Layers },
      { href: '/portal/hnojiva-por/pozemky', label: 'Pozemky (DPB)', icon: Map },
      { href: '/portal/hnojiva-por/hnojiva', label: 'Katalog hnojiv', icon: Sprout },
      { href: '/portal/hnojiva-por/pripravky', label: 'Katalog přípravků', icon: SprayCan },
    ],
  },
]

const adminNavItems = [
  { href: '/portal/admin', label: 'Přehled', icon: BarChart3 },
  { href: '/portal/admin/uzivatele', label: 'Uživatelé', icon: Users },
  { href: '/portal/admin/produkty', label: 'Produkty hnojení', icon: Package },
  { href: '/portal/admin/produkty-vapneni', label: 'Produkty vápnění', icon: Package },
  { href: '/portal/admin/poptavky', label: 'Poptávky', icon: ClipboardList },
  { href: '/portal/admin/kalkulace', label: 'Kalkulace', icon: Calculator },
  { href: '/portal/admin/agromanager', label: 'AgroManažer', icon: Tractor },
  { href: '/portal/admin/audit-log', label: 'Audit log', icon: FileText },
  { href: '/portal/admin/statistiky', label: 'Statistiky', icon: BarChart3 },
]

export function Sidebar({ isAdmin, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { activeService, setActiveService } = useActiveService()
  // Badge pro košík je nyní pouze na floating buttonu
  // Badge u "Moje poptávky" by měl ukazovat počet ODESLANÝCH poptávek (TODO: implementovat)

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (href: string) => {
    if (href === '/portal/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleServiceSwitch = (service: typeof services[number]) => {
    setActiveService(service.id)
    if (!serviceOwnsPath(service.id, pathname)) {
      router.push(service.homeHref)
    }
    onClose?.()
  }

  const currentServiceItems = services.find((s) => s.id === activeService)?.items ?? []

  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header with logo and close button (mobile) */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <Link href="/portal/dashboard" className="block" onClick={onClose}>
          <Image
            src="/logo.png"
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

      {/* Přepínač služeb */}
      <div className="p-4 pb-2 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-lg p-1">
          {services.map((service) => {
            const ServiceIcon = service.icon
            const isSelected = activeService === service.id

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceSwitch(service)}
                aria-pressed={isSelected}
                title={service.label}
                className={`
                  flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-semibold transition-colors
                  ${isSelected
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <ServiceIcon
                  className={`h-3.5 w-3.5 flex-shrink-0 ${
                    isSelected
                      ? service.id === 'vapneni' ? 'text-primary-green' : 'text-amber-600'
                      : ''
                  }`}
                />
                <span className="truncate">{service.label}</span>
              </button>
            )
          })}
        </div>

        {/* Zkratka do provozního režimu – z pole se zapisuje na jedno klepnutí */}
        {activeService === 'hnojiva-por' && (
          <Link
            href="/portal/hnojiva-por/zapis"
            onClick={onClose}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            <Tractor className="h-5 w-5 flex-shrink-0" />
            <span>Zápis z pole</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Sdílené jádro */}
        <div className="space-y-1">
          {sharedNavItems.map((item) => {
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

        {/* Položky aktuálně vybrané služby */}
        {currentServiceItems.length > 0 && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <div className="space-y-1">
              {currentServiceItems.map((item) => {
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
          </>
        )}

        {/* Admin section - POUZE pro uživatele s role="admin" */}
        {isAdmin && (
          <>
            {/* Vizuální oddělení admin sekce */}
            <div className="my-4 border-t-2 border-gray-300" />
            
            {/* Hlavička admin sekce s ikonou Shield */}
            <div className="mb-3 px-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Admin Zóna
                </h3>
              </div>
            </div>
            
            {/* Admin navigační odkazy */}
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
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
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
