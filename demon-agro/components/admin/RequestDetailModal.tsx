'use client'

import { useState } from 'react'
import { X, Loader2, User, Phone, Mail, MapPin, Calendar, MessageSquare, DollarSign } from 'lucide-react'

interface Request {
  id: string
  status: string
  total_area: number
  total_quantity: number | null
  delivery_date: string | null
  notes: string | null
  admin_notes: string | null
  quote_amount: number | null
  created_at: string
  profiles: {
    company_name: string | null
    district: string | null
    full_name: string | null
    email: string
    phone: string | null
  }
  liming_request_items: Array<{
    id: string
    parcel_id: string
    product_name: string
    quantity: number
    notes: string | null
  }>
}

interface RequestDetailModalProps {
  request: Request
  onClose: () => void
  onUpdate: () => void
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nová' },
  { value: 'in_progress', label: 'Zpracovává se' },
  { value: 'quoted', label: 'Nacenéno' },
  { value: 'completed', label: 'Dokončeno' },
  { value: 'cancelled', label: 'Zrušeno' },
]

export function RequestDetailModal({ request, onClose, onUpdate }: RequestDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    status: request.status,
    admin_notes: request.admin_notes || '',
    quote_amount: request.quote_amount || '',
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/requests/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          status: formData.status,
          admin_notes: formData.admin_notes || null,
          quote_amount: formData.quote_amount ? parseFloat(formData.quote_amount as any) : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se uložit změny')
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo k chybě')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail poptávky
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ID: {request.id.substring(0, 8)}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Zákazník</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Firma / Jméno</p>
                      <p className="font-medium text-gray-900">
                        {request.profiles.company_name || request.profiles.full_name}
                      </p>
                    </div>
                  </div>
                  
                  {request.profiles.district && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Okres</p>
                        <p className="font-medium text-gray-900">{request.profiles.district}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${request.profiles.email}`} className="font-medium text-primary-green hover:text-primary-brown">
                        {request.profiles.email}
                      </a>
                    </div>
                  </div>
                  
                  {request.profiles.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <a href={`tel:${request.profiles.phone}`} className="font-medium text-primary-green hover:text-primary-brown">
                          {request.profiles.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Datum poptávky</p>
                      <p className="font-medium text-gray-900">{formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  {request.delivery_date && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Preferovaný termín</p>
                        <p className="font-medium text-gray-900">{request.delivery_date}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Items */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Pozemky ({request.liming_request_items.length})
                </h4>
                <div className="space-y-3">
                  {request.liming_request_items.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {index + 1}. Pozemek (ID: {item.parcel_id.substring(0, 8)})
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Produkt: {item.product_name}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-green">
                            {item.quantity.toFixed(2)} t
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-primary-green/10 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Celková výměra</p>
                      <p className="text-xl font-bold text-gray-900">{request.total_area.toFixed(2)} ha</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Celkové množství</p>
                      <p className="text-xl font-bold text-gray-900">
                        {request.total_quantity?.toFixed(2) || '—'} t
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {request.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary-green" />
                    Poznámka zákazníka
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{request.notes}</p>
                  </div>
                </div>
              )}

              {/* Admin Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Admin akce</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.status === 'quoted' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Nabídnutá cena (Kč)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.quote_amount}
                        onChange={(e) => setFormData({ ...formData, quote_amount: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="např. 45000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin poznámka
                    </label>
                    <textarea
                      rows={4}
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      placeholder="Interní poznámka pro administrátory..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ukládám...
                    </>
                  ) : (
                    'Uložit změny'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
