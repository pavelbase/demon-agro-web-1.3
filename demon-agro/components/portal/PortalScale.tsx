'use client'

import { useEffect } from 'react'

/**
 * Přepíná třídu na kořenovém <html> elementu, dokud je uživatel v sekci
 * /portal/*. Díky tomu se zmenšení (viz globals.css) netýká veřejné
 * prezentace webu, jen samotného portálu.
 */
export function PortalScale() {
  useEffect(() => {
    document.documentElement.classList.add('portal-scale-90')
    return () => {
      document.documentElement.classList.remove('portal-scale-90')
    }
  }, [])

  return null
}
