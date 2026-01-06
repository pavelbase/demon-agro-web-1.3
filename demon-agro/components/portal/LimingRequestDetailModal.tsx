'use client'

import { X, Calendar, User, Phone, Mail, MapPin, Package, MessageSquare, FileText, DollarSign } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type LimingRequest = Database['public']['Tables']['liming_requests']['Row'] & {
  liming_request_items: Array<{
    id: string
    parcel_id: string
    product_name: string
    quantity: number
    unit: string
    parcels: {
      cadastral_number: string | null
      name: string
    } | null
  }>
}

interface LimingRequestDetailModalProps {
  request: LimingRequest
  onClose: () => void
}

const STATUS_CONFIG = {
  new: {
    label: 'Nová',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'Zpracovává se',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  quoted: {
    label: 'Nacenéno',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  completed: {
    label: 'Dokončeno',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  cancelled: {
    label: 'Zrušeno',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
}

const DELIVERY_PERIOD_LABELS: Record<string, string> = {
  spring_2025: 'Jaro 2025 (únor-duben)',
  autumn_2025: 'Podzim 2025 (září-říjen)',
  spring_2026: 'Jaro 2026 (únor-duben)',
  asap: 'Co nejdříve',
  flexible: 'Termín je flexibilní',
}

export function LimingRequestDetailModal({
  request,
  onClose,
}: LimingRequestDetailModalProps) {
  const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
  const itemsCount = request.liming_request_items?.length || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detail poptávky
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ID: <span className="font-mono">{request.id.substring(0, 8)}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}
                >
                  {status.label}
                </span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Datum vytvoření</p>
                  <div className="flex items-center text-gray-900 font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(request.created_at)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Celková výměra</p>
                  <p className="text-2xl font-bold text-primary-green">
                    {request.total_area.toFixed(2)} ha
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Celkové množství</p>
                  <p className="text-2xl font-bold text-primary-brown">
                    {request.total_quantity?.toFixed(2) || '—'} t
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary-green" />
                  Pozemky a produkty ({itemsCount})
                </h3>
                <div className="space-y-3">
                  {request.liming_request_items?.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {index + 1}. {item.parcels?.name || 'Pozemek'}
                            {item.parcels?.cadastral_number && (
                              <span className="text-gray-600 font-normal ml-2">
                                ({item.parcels.cadastral_number})
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Produkt: {item.product_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-green">
                            {item.quantity.toFixed(2)} {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-green" />
                  Kontaktní údaje
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.contact_person && (
                    <div className="flex items-center text-gray-700">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{request.contact_person}</span>
                    </div>
                  )}
                  {request.contact_phone && (
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={`tel:${request.contact_phone}`}
                        className="text-sm hover:text-primary-green"
                      >
                        {request.contact_phone}
                      </a>
                    </div>
                  )}
                  {request.contact_email && (
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${request.contact_email}`}
                        className="text-sm hover:text-primary-green"
                      >
                        {request.contact_email}
                      </a>
                    </div>
                  )}
                  {request.delivery_address && (
                    <div className="flex items-start text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <span className="text-sm">{request.delivery_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Date */}
              {request.delivery_date && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-green" />
                    Preferovaný termín dodání
                  </h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                    {DELIVERY_PERIOD_LABELS[request.delivery_date] || request.delivery_date}
                  </p>
                </div>
              )}

              {/* User Notes */}
              {request.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary-green" />
                    Poznámka k poptávce
                  </h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                    {request.notes}
                  </p>
                </div>
              )}

              {/* Quote Information (if status = quoted) */}
              {request.status === 'quoted' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Cenová nabídka
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    {request.quote_amount ? (
                      <div>
                        <p className="text-sm text-green-700 mb-2">Celková cena:</p>
                        <p className="text-3xl font-bold text-green-900">
                          {request.quote_amount.toLocaleString('cs-CZ')} Kč
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                          Cena je orientační a nezahrnuje DPH
                        </p>
                      </div>
                    ) : (
                      <p className="text-green-700">
                        Cenová nabídka je připravována
                      </p>
                    )}
                    {request.quote_pdf_url && (
                      <a
                        href={request.quote_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Stáhnout nabídku (PDF)
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes (if exists) */}
              {request.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Poznámka od administrátora
                  </h3>
                  <p className="text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4 whitespace-pre-wrap">
                    {request.admin_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
