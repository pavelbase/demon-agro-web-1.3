'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Calendar, MessageSquare, User, Phone, Mail, MapPin, Loader2, CheckCircle2 } from 'lucide-react'
import { useLimingCart } from '@/lib/contexts/LimingCartContext'
import { createLimingRequest } from '@/lib/actions/liming-requests'
import type { Profile } from '@/lib/types/database'

interface NewLimingRequestFormProps {
  profile: Profile
}

const TYPE_LABELS = {
  calcitic: 'Vápenatý',
  dolomite: 'Dolomitický',
  either: 'Libovolný',
}

const DELIVERY_PERIODS = [
  { value: 'spring_2025', label: 'Jaro 2025 (únor-duben)' },
  { value: 'autumn_2025', label: 'Podzim 2025 (září-říjen)' },
  { value: 'spring_2026', label: 'Jaro 2026 (únor-duben)' },
  { value: 'asap', label: 'Co nejdříve' },
  { value: 'flexible', label: 'Termín je flexibilní' },
]

export function NewLimingRequestForm({ profile }: NewLimingRequestFormProps) {
  const router = useRouter()
  const { items, getTotalArea, getTotalQuantity, clearCart } = useLimingCart()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [deliveryPeriod, setDeliveryPeriod] = useState('flexible')
  const [notes, setNotes] = useState('')
  const [contactPerson, setContactPerson] = useState(profile.full_name || profile.company_name || '')
  const [contactPhone, setContactPhone] = useState(profile.phone || '')
  const [contactEmail, setContactEmail] = useState(profile.email || '')
  const [deliveryAddress, setDeliveryAddress] = useState(profile.address || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      setError('Košík je prázdný. Přidejte alespoň jeden pozemek.')
      return
    }

    if (!contactPerson || !contactPhone || !contactEmail) {
      setError('Vyplňte prosím všechny kontaktní údaje.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createLimingRequest({
        items,
        deliveryPeriod,
        notes,
        contactPerson,
        contactPhone,
        contactEmail,
        deliveryAddress,
      })

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success!
      clearCart()
      router.push(`/portal/poptavky?success=true&id=${result.requestId}`)
    } catch (err) {
      console.error('Error creating request:', err)
      setError('Nepodařilo se odeslat poptávku. Zkuste to prosím znovu.')
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Košík je prázdný
        </h2>
        <p className="text-gray-600 mb-6">
          Přidejte pozemky z plánu vápnění do košíku, abyste mohli odeslat poptávku.
        </p>
        <button
          onClick={() => router.push('/portal/pozemky')}
          className="px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
        >
          Přejít na pozemky
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <div className="text-red-800">
            <p className="font-medium">Chyba při odesílání</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary-green" />
          Souhrn poptávky
        </h2>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.parcel_id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.parcel_name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.area_ha} ha • {TYPE_LABELS[item.recommended_type]}
                  </p>
                </div>
              </div>
              
              {item.product_name && (
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {item.product_name}
                  {item.cao_content && ` (${item.cao_content}% CaO)`}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Potřeba CaO:</p>
                  <p className="font-semibold">{item.quantity_cao_t.toFixed(2)} t</p>
                </div>
                <div>
                  <p className="text-gray-600">Množství produktu:</p>
                  <p className="font-semibold">{item.quantity_product_t.toFixed(2)} t</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-primary-green/10 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Počet pozemků</p>
              <p className="text-lg font-bold text-primary-green">{items.length}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Celková výměra</p>
              <p className="text-lg font-bold text-primary-green">
                {getTotalArea().toFixed(2)} ha
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Celkové množství</p>
              <p className="text-lg font-bold text-primary-green">
                {getTotalQuantity().toFixed(2)} t
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Period */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-green" />
          Preferovaný termín dodání
        </h2>

        <select
          value={deliveryPeriod}
          onChange={(e) => setDeliveryPeriod(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          required
        >
          {DELIVERY_PERIODS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>

        <p className="text-sm text-gray-500 mt-2">
          Doporučujeme aplikaci na podzim po sklizni nebo na jaře před setím
        </p>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary-green" />
          Poznámka k poptávce
        </h2>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Zde můžete uvést další požadavky, dotazy nebo poznámky..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
        />
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary-green" />
          Kontaktní údaje
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontaktní osoba *
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              placeholder="Jméno a příjmení"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="+420 123 456 789"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa dodání (volitelné)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="Ulice, Město, PSČ"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full flex items-center justify-center px-6 py-4 bg-primary-green text-white text-lg font-medium rounded-lg hover:bg-primary-brown transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Odesílám poptávku...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Odeslat poptávku
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 text-center mt-3">
          Po odeslání vás budeme kontaktovat s cenovou nabídkou do 48 hodin
        </p>
      </div>
    </form>
  )
}
