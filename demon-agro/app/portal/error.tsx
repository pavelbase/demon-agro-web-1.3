'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Portal error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Něco se pokazilo
        </h2>
        
        <p className="text-gray-600 mb-8">
          Omlouváme se, došlo k chybě při načítání stránky. Zkuste to prosím znovu.
        </p>
        
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Zkusit znovu
        </button>
        
        {error.digest && (
          <p className="text-xs text-gray-500 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
