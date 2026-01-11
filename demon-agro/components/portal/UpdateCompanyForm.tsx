'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Save, Loader2 } from 'lucide-react'

interface UpdateCompanyFormProps {
  currentCompanyName?: string | null
}

export default function UpdateCompanyForm({ currentCompanyName }: UpdateCompanyFormProps) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState(currentCompanyName || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/portal/profile/update-company', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při aktualizaci názvu společnosti')
      }

      setSuccess(true)
      router.refresh()

      // Skrýt success zprávu po 3 sekundách
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Building2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Název společnosti</h2>
          <p className="text-sm text-gray-600">Změňte název vaší společnosti</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chybová hláška */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success hláška */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Název společnosti byl úspěšně aktualizován
          </div>
        )}

        {/* Input pole */}
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
            Název společnosti
          </label>
          <input
            type="text"
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Např. Farma s.r.o."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Tlačítko uložit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || companyName === currentCompanyName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Uložit změny
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


