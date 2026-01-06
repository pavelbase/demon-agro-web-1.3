'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Download, Filter, X, Check, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface CalculatorSubmission {
  id: string
  email: string
  ip_address: string | null
  calculation_data: any
  calculation_results: any
  viewed_by_admin: boolean
  admin_notes: string | null
  created_at: string
}

interface CalculatorSubmissionsTableProps {
  submissions: CalculatorSubmission[]
  initialFilters?: {
    viewed?: string
    marketing?: string
  }
}

export function CalculatorSubmissionsTable({
  submissions,
  initialFilters = {}
}: CalculatorSubmissionsTableProps) {
  const router = useRouter()
  const [selectedSubmission, setSelectedSubmission] = useState<CalculatorSubmission | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewedFilter, setViewedFilter] = useState(initialFilters.viewed || 'all')
  const [marketingFilter, setMarketingFilter] = useState(initialFilters.marketing || 'all')

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const email = submission.email?.toLowerCase() || ''
      const jmeno = submission.calculation_data?.jmeno?.toLowerCase() || ''
      const firma = submission.calculation_data?.firma?.toLowerCase() || ''
      if (!email.includes(query) && !jmeno.includes(query) && !firma.includes(query)) {
        return false
      }
    }

    return true
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Format number
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '-'
    return num.toFixed(2).replace('.', ',')
  }

  // Export to Excel
  const handleExport = () => {
    const data = filteredSubmissions.map(sub => ({
      'Datum': formatDate(sub.created_at),
      'Email': sub.email,
      'Jméno': sub.calculation_data?.jmeno || '',
      'Firma': sub.calculation_data?.firma || '',
      'Telefon': sub.calculation_data?.telefon || '',
      'Typ půdy': sub.calculation_data?.typPudy || '',
      'pH': sub.calculation_results?.vstup?.pH || '',
      'P (mg/kg)': sub.calculation_results?.vstup?.P || '',
      'K (mg/kg)': sub.calculation_results?.vstup?.K || '',
      'Mg (mg/kg)': sub.calculation_results?.vstup?.Mg || '',
      'Potřeba CaO (t/ha)': sub.calculation_results?.vapneni?.celkovaPotrebaCaO_t || '',
      'Marketing souhlas': sub.calculation_data?.marketing_consent ? 'Ano' : 'Ne',
      'Prohlédnuto': sub.viewed_by_admin ? 'Ano' : 'Ne',
      'Poznámka admina': sub.admin_notes || ''
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Kalkulace')
    XLSX.writeFile(wb, `kalkulace_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Mark as viewed
  const handleMarkAsViewed = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/calculator/${id}/mark-viewed`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error marking as viewed:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Hledat (email, jméno, firma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
          </div>

          {/* Viewed Filter */}
          <select
            value={viewedFilter}
            onChange={(e) => {
              setViewedFilter(e.target.value)
              const params = new URLSearchParams()
              if (e.target.value !== 'all') params.set('viewed', e.target.value)
              if (marketingFilter !== 'all') params.set('marketing', marketingFilter)
              router.push(`?${params.toString()}`)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Vše</option>
            <option value="false">Neprohlédnuté</option>
            <option value="true">Prohlédnuté</option>
          </select>

          {/* Marketing Filter */}
          <select
            value={marketingFilter}
            onChange={(e) => {
              setMarketingFilter(e.target.value)
              const params = new URLSearchParams()
              if (viewedFilter !== 'all') params.set('viewed', viewedFilter)
              if (e.target.value !== 'all') params.set('marketing', e.target.value)
              router.push(`?${params.toString()}`)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Všechny</option>
            <option value="true">Souhlas s marketingem</option>
          </select>
        </div>

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Půda & pH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Potřeba CaO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marketing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Žádné kalkulace nenalezeny
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr 
                    key={submission.id} 
                    className={`hover:bg-gray-50 ${!submission.viewed_by_admin ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{submission.calculation_data?.jmeno || 'N/A'}</div>
                      <div className="text-gray-500">{submission.email}</div>
                      {submission.calculation_data?.firma && (
                        <div className="text-gray-500 text-xs">{submission.calculation_data.firma}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{submission.calculation_data?.typPudy || 'N/A'}</div>
                      <div className="text-gray-500">pH: {formatNumber(submission.calculation_results?.vstup?.pH)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(submission.calculation_results?.vapneni?.celkovaPotrebaCaO_t)} t/ha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.calculation_data?.marketing_consent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ano
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Ne
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.viewed_by_admin ? (
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <Check className="h-4 w-4" />
                          Prohlédnuto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                          <Eye className="h-4 w-4" />
                          Nové
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-primary-green hover:text-primary-green/80"
                          title="Zobrazit detail"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {!submission.viewed_by_admin && (
                          <button
                            onClick={() => handleMarkAsViewed(submission.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Označit jako prohlédnuté"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <CalculatorDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  )
}

// Detail Modal Component
function CalculatorDetailModal({
  submission,
  onClose,
  onRefresh
}: {
  submission: CalculatorSubmission
  onClose: () => void
  onRefresh: () => void
}) {
  const [adminNotes, setAdminNotes] = useState(submission.admin_notes || '')
  const [isSaving, setIsSaving] = useState(false)

  const results = submission.calculation_results
  const data = submission.calculation_data

  // Debug: Log data availability
  console.log('Calculator submission:', {
    id: submission.id,
    hasResults: !!results,
    hasData: !!data,
    results: results,
    data: data
  })

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '-'
    return num.toFixed(2).replace('.', ',')
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/calculator/${submission.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: adminNotes })
      })

      if (response.ok) {
        onRefresh()
        onClose()
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Detail kalkulace</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Kontaktní údaje</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Jméno:</span> {data?.jmeno || 'N/A'}</p>
                <p><span className="text-gray-600">Email:</span> {submission.email}</p>
                <p><span className="text-gray-600">Telefon:</span> {data?.telefon || 'N/A'}</p>
                <p><span className="text-gray-600">Firma:</span> {data?.firma || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Metadata</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Datum:</span> {new Date(submission.created_at).toLocaleString('cs-CZ')}</p>
                <p><span className="text-gray-600">IP:</span> {submission.ip_address || 'N/A'}</p>
                <p><span className="text-gray-600">Marketing souhlas:</span> {data?.marketing_consent ? 'Ano' : 'Ne'}</p>
              </div>
            </div>
          </div>

          {/* Soil Data */}
          {!results && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Výsledky kalkulace nejsou k dispozici</h4>
                  <p className="text-sm text-yellow-800">
                    Tato kalkulace byla vytvořena před implementací ukládání kompletních výsledků. 
                    Pro zobrazení výsledků je potřeba vytvořit novou kalkulaci na <code className="bg-yellow-100 px-1 py-0.5 rounded">/kalkulacka</code>.
                  </p>
                  <p className="text-sm text-yellow-800 mt-2">
                    <strong>Máte k dispozici:</strong> Kontaktní údaje ({data?.jmeno}, {submission.email})
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {results && (
            <>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Vstupní údaje</h4>
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Typ půdy</p>
                    <p className="font-medium">{data?.typPudy || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">pH</p>
                    <p className="font-medium">{formatNumber(results.vstup?.pH)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">P (mg/kg)</p>
                    <p className="font-medium">{formatNumber(results.vstup?.P)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">K (mg/kg)</p>
                    <p className="font-medium">{formatNumber(results.vstup?.K)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Mg (mg/kg)</p>
                    <p className="font-medium">{formatNumber(results.vstup?.Mg)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ca (mg/kg)</p>
                    <p className="font-medium">{formatNumber(results.vstup?.Ca)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">S (mg/kg)</p>
                    <p className="font-medium">{formatNumber(results.vstup?.S)}</p>
                  </div>
                </div>
              </div>

              {/* Liming Results */}
              {results.vapneni && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Výsledky vápnění</h4>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><span className="text-gray-600">Potřeba CaO:</span> <span className="font-bold text-lg">{formatNumber(results.vapneni.celkovaPotrebaCaO_t)} t/ha</span></p>
                    <p><span className="text-gray-600">Optimální pH rozmezí:</span> {results.vapneni.optimalniPhRozmezi}</p>
                    {results.vapneni.prepocetyHnojiva && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <p className="font-medium mb-1">Doporučené množství hnojiv:</p>
                        <p>• Mletý vápenec: {formatNumber(results.vapneni.prepocetyHnojiva.mletyVapenec_t)} t/ha</p>
                        <p>• Dolomitický vápenec: {formatNumber(results.vapneni.prepocetyHnojiva.dolomitVapenec_t)} t/ha</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nutrients Results */}
              {results.ziviny && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Výsledky živin</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Živina</th>
                          <th className="px-3 py-2 text-left">Třída</th>
                          <th className="px-3 py-2 text-left">Stav</th>
                          <th className="px-3 py-2 text-right">Aktuální</th>
                          <th className="px-3 py-2 text-right">Deficit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(results.ziviny).map(([key, nutrient]: [string, any]) => (
                          <tr key={key}>
                            <td className="px-3 py-2 font-medium">{key}</td>
                            <td className="px-3 py-2">{nutrient.trida}</td>
                            <td className="px-3 py-2" style={{ color: nutrient.tridaBarva }}>
                              {nutrient.tridaNazev}
                            </td>
                            <td className="px-3 py-2 text-right">{nutrient.aktualni} mg/kg</td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {nutrient.deficit_kg_ha ? `${nutrient.deficit_kg_ha} kg/ha` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Admin Notes */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Poznámka admina</h4>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              placeholder="Interní poznámka k této kalkulaci..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Zavřít
          </button>
          <button
            onClick={handleSaveNotes}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90 disabled:opacity-50"
          >
            {isSaving ? 'Ukládám...' : 'Uložit poznámku'}
          </button>
        </div>
      </div>
    </div>
  )
}

