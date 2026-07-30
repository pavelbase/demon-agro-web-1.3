'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Služby (moduly) portálu.
 *
 * Sdílené jádro (Dashboard, Nastavení) je vždy viditelné bez ohledu na
 * vybranou službu. Položky specifické pro danou službu se v Sidebaru zobrazují
 * jen když je daná služba aktivní.
 */
export type ServiceId = 'vapneni' | 'hnojiva-por'

export const SERVICE_ROUTE_PREFIXES: Record<ServiceId, string> = {
  vapneni: '/portal/vapneni',
  'hnojiva-por': '/portal/hnojiva-por',
}

/**
 * Stránky, které patří službě, ale mají historickou URL mimo její prefix.
 * Pozemky a Upload rozborů slouží vápnění (pozemky s rozbory půdy) – evidence
 * hnojiv a POR má vlastní pozemky (DPB) pod /portal/hnojiva-por/pozemky.
 */
export const SERVICE_EXTRA_ROUTES: Record<ServiceId, string[]> = {
  vapneni: ['/portal/pozemky', '/portal/upload'],
  'hnojiva-por': [],
}

/** Patří daná cesta zadané službě? */
export function serviceOwnsPath(service: ServiceId, pathname: string): boolean {
  if (pathname.startsWith(SERVICE_ROUTE_PREFIXES[service])) return true
  return SERVICE_EXTRA_ROUTES[service].some((route) => pathname.startsWith(route))
}

const STORAGE_KEY = 'demon-agro:active-service'
const DEFAULT_SERVICE: ServiceId = 'vapneni'

interface ActiveServiceContextValue {
  activeService: ServiceId
  setActiveService: (service: ServiceId) => void
}

const ActiveServiceContext = createContext<ActiveServiceContextValue | null>(null)

function detectServiceFromPath(pathname: string): ServiceId | null {
  // Prefix služby má přednost před historickými URL – /portal/hnojiva-por/pozemky
  // nesmí být zaměněno za pozemky vápnění
  const byPrefix = (Object.entries(SERVICE_ROUTE_PREFIXES) as [ServiceId, string][]).find(
    ([, prefix]) => pathname.startsWith(prefix)
  )
  if (byPrefix) return byPrefix[0]

  const byExtraRoute = (Object.entries(SERVICE_EXTRA_ROUTES) as [ServiceId, string[]][]).find(
    ([, routes]) => routes.some((route) => pathname.startsWith(route))
  )
  return byExtraRoute ? byExtraRoute[0] : null
}

export function ActiveServiceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [activeService, setActiveServiceState] = useState<ServiceId>(DEFAULT_SERVICE)

  // Po prvním načtení obnovit naposledy zvolenou službu (např. při vstupu
  // přes sdílenou stránku jako Dashboard, kde z URL nejde službu poznat).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ServiceId | null
    if (stored && SERVICE_ROUTE_PREFIXES[stored]) {
      setActiveServiceState(stored)
    }
  }, [])

  // Deep-link/refresh na konkrétní URL služby má vždy přednost.
  useEffect(() => {
    const detected = detectServiceFromPath(pathname)
    if (detected && detected !== activeService) {
      setActiveServiceState(detected)
      window.localStorage.setItem(STORAGE_KEY, detected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const setActiveService = (service: ServiceId) => {
    setActiveServiceState(service)
    window.localStorage.setItem(STORAGE_KEY, service)
  }

  return (
    <ActiveServiceContext.Provider value={{ activeService, setActiveService }}>
      {children}
    </ActiveServiceContext.Provider>
  )
}

export function useActiveService() {
  const ctx = useContext(ActiveServiceContext)
  if (!ctx) {
    throw new Error('useActiveService musí být použit uvnitř ActiveServiceProvider')
  }
  return ctx
}
