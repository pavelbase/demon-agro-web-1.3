'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'
import { ExtractionValidator } from './ExtractionValidator'
import { EXTRACTION_STORAGE_KEY } from './PDFUploadZone'

interface ExtractionValidatorLoaderProps {
  parcels: Parcel[]
  userId: string
}

/**
 * Načte extrahovaná data z PDF ze sessionStorage (viz PDFUploadZone.tsx) a
 * vykreslí ExtractionValidator. Data se nepředávají přes URL query param,
 * protože u dokumentů s desítkami pozemků by URL přesáhla limity
 * prohlížeče/serveru a stránka by spadla při načtení.
 */
export function ExtractionValidatorLoader({ parcels, userId }: ExtractionValidatorLoaderProps) {
  const router = useRouter()
  const [extractedData, setExtractedData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    // Guard proti dvojímu spuštění efektu (React StrictMode ve vývoji) a proti
    // remountu - jinak by druhý průchod přepsal již načtená data chybou.
    if (loadedRef.current) return
    loadedRef.current = true

    try {
      const raw = sessionStorage.getItem(EXTRACTION_STORAGE_KEY)
      if (!raw) {
        setError('Extrahovaná data nebyla nalezena. Nahrajte prosím PDF znovu.')
        return
      }
      // Data ze sessionStorage záměrně nemažeme, aby uživatel nepřišel o
      // rozpracovanou kontrolu při náhodném obnovení stránky. Přepíše je až
      // další nahrání PDF, případně zmizí se zavřením záložky.
      setExtractedData(JSON.parse(raw))
    } catch (e) {
      console.error('Chyba při načítání extrahovaných dat:', e)
      setError('Extrahovaná data se nepodařilo načíst. Nahrajte prosím PDF znovu.')
    }
  }, [])

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => router.push('/portal/upload')}
          className="px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Zpět na nahrání PDF
        </button>
      </div>
    )
  }

  if (!extractedData) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p>Načítám extrahovaná data...</p>
      </div>
    )
  }

  return (
    <ExtractionValidator
      extractedData={extractedData}
      parcels={parcels}
      userId={userId}
    />
  )
}
