'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface RegenerateLimingPlanButtonProps {
  planId: string
  parcelId: string
  parcelName: string
}

/**
 * Tlačítko pro regeneraci plánu vápnění
 * - Smaže starý plán a umožní uživateli vytvořit nový
 * - Vhodné když uživatel chce kompletně přegenerovat plán s novými parametry
 */
export default function RegenerateLimingPlanButton({
  planId,
  parcelId,
  parcelName,
}: RegenerateLimingPlanButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRegenerate = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/portal/liming-plans/${planId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Chyba při mazání plánu')
      }

      toast.success('✅ Plán byl smazán. Nyní můžete vytvořit nový.')
      setShowConfirm(false)
      
      // Refresh stránky - zobrazí se generátor
      router.refresh()
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při mazání plánu')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
        title="Vygenerovat nový plán"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Vygenerovat nový plán</span>
      </button>

      {/* Potvrzovací dialog */}
      {showConfirm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => !isDeleting && setShowConfirm(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>

              {/* Nadpis */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Vygenerovat nový plán?
              </h3>

              {/* Text */}
              <p className="text-sm text-gray-600 text-center mb-6">
                Aktuální plán vápnění pro pozemek <strong>{parcelName}</strong> bude smazán 
                a zobrazí se formulář pro vytvoření nového plánu.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-900">
                  <strong>💡 Tip:</strong> Pokud chcete pouze přidat další roky aplikace, 
                  použijte tlačítko "Přidat další rok aplikace" v tabulce plánu.
                </p>
              </div>

              {/* Tlačítka */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Mažu...' : 'Vygenerovat nový'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}


