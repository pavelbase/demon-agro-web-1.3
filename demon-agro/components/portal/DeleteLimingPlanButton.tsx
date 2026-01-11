'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DeleteLimingPlanButtonProps {
  planId: string
  parcelId: string
  parcelName: string
}

export default function DeleteLimingPlanButton({
  planId,
  parcelId,
  parcelName,
}: DeleteLimingPlanButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/portal/liming-plans/${planId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Chyba při mazání plánu')
      }

      toast.success('✅ Plán vápnění byl smazán')
      setShowConfirm(false)
      
      // Přesměrování zpět na detail pozemku
      router.push(`/portal/pozemky/${parcelId}`)
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
        className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        title="Smazat plán"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Smazat plán</span>
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
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              {/* Nadpis */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Smazat plán vápnění?
              </h3>

              {/* Text */}
              <p className="text-sm text-gray-600 text-center mb-6">
                Opravdu chcete smazat plán vápnění pro pozemek <strong>{parcelName}</strong>? 
                Tato akce je nevratná a budou smazány všechny související aplikace.
              </p>

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
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Mažu...' : 'Smazat'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}



