'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Calendar, MessageSquare, User, Loader2, CheckCircle2, ChevronDown, ChevronUp, Edit2, X } from 'lucide-react'
import { useLimingCart } from '@/lib/contexts/LimingCartContext'
import { createLimingRequest } from '@/lib/actions/liming-requests'
import { sendLimingRequestEmailClient } from '@/lib/utils/email-client'
import type { Profile } from '@/lib/types/database'

interface NewLimingRequestFormProps {
  profile: Profile
}

const TYPE_LABELS = {
  calcitic: 'Vápenatý',
  dolomite: 'Dolomitický',
  either: 'Libovolný',
}

// Funkce pro generování termínů dodání
function generateDeliveryOptions() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0 = leden

  const options = []

  // "Co nejdříve" vždy první
  options.push({ value: 'asap', label: 'Co nejdříve' })

  // Aktuální sezóna (pokud ještě není pozdě)
  if (currentMonth < 4) { // leden-duben = ještě lze jaro
    options.push({ value: `jaro-${currentYear}`, label: `Jaro ${currentYear} (únor-duben)` })
  }
  if (currentMonth >= 3 && currentMonth < 10) { // duben-říjen = lze podzim
    options.push({ value: `podzim-${currentYear}`, label: `Podzim ${currentYear} (září-říjen)` })
  }

  // Příští sezóny
  options.push({ value: `jaro-${currentYear + 1}`, label: `Jaro ${currentYear + 1} (únor-duben)` })
  options.push({ value: `podzim-${currentYear + 1}`, label: `Podzim ${currentYear + 1} (září-říjen)` })

  // Flexibilní vždy poslední
  options.push({ value: 'flexible', label: 'Termín je flexibilní' })

  return options
}

// Auto-resize textarea
function useAutoResizeTextarea(value: string) {
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (textareaRef) {
      textareaRef.style.height = 'auto'
      textareaRef.style.height = `${textareaRef.scrollHeight}px`
    }
  }, [value, textareaRef])

  return setTextareaRef
}

export function NewLimingRequestForm({ profile }: NewLimingRequestFormProps) {
  const router = useRouter()
  const { items, getTotalArea, getTotalQuantity, clearCart, removeItem, removeApplication } = useLimingCart()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Rozbalit kontakty, pokud nejsou všechny údaje vyplněné
  const [contactExpanded, setContactExpanded] = useState(
    !profile.full_name || !profile.phone || !profile.email
  )
  
  // Generovat termíny dodání
  const deliveryOptions = generateDeliveryOptions()
  
  // Zjistit preferovaný termín z košíku
  const getPreferredDelivery = () => {
    // Najít první položku s aplikacemi
    const itemWithApps = items.find(item => item.applications && item.applications.length > 0)
    
    if (itemWithApps && itemWithApps.applications) {
      const firstApp = itemWithApps.applications[0]
      const season = firstApp.season === 'jaro' ? 'jaro' : 'podzim'
      const optionValue = `${season}-${firstApp.year}`
      
      // Zkontrolovat, jestli tato možnost existuje
      if (deliveryOptions.some(opt => opt.value === optionValue)) {
        return optionValue
      }
    }
    return 'flexible'
  }
  
  // Form state
  const [deliveryPeriod, setDeliveryPeriod] = useState(getPreferredDelivery())
  const [notes, setNotes] = useState('')
  const [contactPerson, setContactPerson] = useState(profile.full_name || profile.company_name || '')
  const [contactPhone, setContactPhone] = useState(profile.phone || '')
  const [contactEmail, setContactEmail] = useState(profile.email || '')
  const [deliveryAddress, setDeliveryAddress] = useState(profile.address || '')
  
  const textareaRef = useAutoResizeTextarea(notes)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      setError('Košík je prázdný. Přidejte alespoň jeden pozemek.')
      return
    }

    if (!contactPerson || !contactPhone || !contactEmail) {
      setError('Vyplňte prosím všechny kontaktní údaje.')
      setContactExpanded(true)
      return
    }

    // Validace formátu telefonního čísla
    const phoneRegex = /^(\+420)?[0-9]{9,13}$/
    const cleanedPhone = contactPhone.replace(/\s/g, '')
    if (!phoneRegex.test(cleanedPhone)) {
      setError('Zadejte prosím platné telefonní číslo (minimálně 9 číslic).')
      setContactExpanded(true)
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

      // Send email notification from client-side (EmailJS requires browser)
      if (result.emailData) {
        try {
          const emailResult = await sendLimingRequestEmailClient(
            result.emailData.requestId,
            result.emailData.companyName,
            result.emailData.contactName,
            result.emailData.contactEmail,
            result.emailData.contactPhone,
            result.emailData.district,
            result.emailData.parcelCount,
            result.emailData.totalArea,
            result.emailData.totalQuantity,
            result.emailData.deliveryPeriod,
            result.emailData.notes
          )

          if (!emailResult.success) {
            console.warn('⚠️ Email notification failed:', emailResult.error)
            // Email failure is not critical - request was created successfully
          }
        } catch (emailError) {
          console.error('❌ Error in email sending:', emailError)
        }
      } else {
        console.warn('⚠️ No emailData in result - email not sent')
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
          onClick={() => router.push('/portal/plany-vapneni')}
          className="px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
        >
          Přejít na plány vápnění
        </button>
      </div>
    )
  }

  // Zkontrolovat, jestli jsou kontakty SPRÁVNĚ předvyplněné (telefon musí mít alespoň 9 znaků)
  const contactsPreFilled = contactPerson && contactPhone && contactPhone.replace(/\s/g, '').length >= 9 && contactEmail

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-red-900">Chyba při odesílání</p>
          <p className="text-red-800 mt-1">{error}</p>
        </div>
      )}

      {/* Kompaktní souhrn poptávky */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary-green" />
          Souhrn poptávky
        </h2>

        {/* Kompaktní řádky místo karet */}
        <div className="space-y-3 mb-3 text-sm">
          {items.map((item) => (
            <div key={item.parcel_id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              {/* Hlavička pozemku */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">{item.parcel_name}</span>
                  {item.parcel_code && <span className="text-gray-600"> • {item.parcel_code}</span>}
                  <span className="text-gray-600"> • {item.area_ha.toFixed(2)} ha</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.parcel_id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Odebrat celý pozemek"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Pokud má aplikace, zobraz každou zvlášť */}
              {item.applications && item.applications.length > 0 ? (
                <div className="space-y-1.5 pl-2 border-l-2 border-primary-green">
                  {item.applications.map((app) => (
                    <div
                      key={app.application_id || `${app.year}-${app.season}`}
                      className="flex justify-between items-center bg-white rounded px-2 py-1.5"
                    >
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">
                          {app.year} {app.season}
                        </span>
                        <span className="text-gray-600 text-xs ml-2">
                          {app.product_name} • {app.dose_per_ha.toFixed(2)} t/ha
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {app.total_tons.toFixed(2)} t
                        </span>
                        {app.application_id && (
                          <button
                            type="button"
                            onClick={() => removeApplication(item.parcel_id, app.application_id!)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                            title="Odebrat tento rok"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Starý formát bez aplikací */
                <div className="flex justify-between items-center pl-2">
                  <div className="text-xs text-gray-600">
                    {item.product_name && (
                      <>
                        {item.product_name}
                        {item.cao_content ? ` (${item.cao_content}% CaO)` : ''}
                      </>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {item.quantity_product_t.toFixed(2)} t
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Kompaktní součty */}
        <div className="bg-green-50 rounded px-3 py-2 flex justify-between items-center text-sm">
          <div className="text-gray-700">
            <span className="font-semibold">{items.length}</span> pozemek{items.length > 1 ? (items.length < 5 ? 'y' : 'ů') : ''} • <span className="font-semibold">{getTotalArea().toFixed(2)}</span> ha • <span className="font-semibold">{getTotalQuantity().toFixed(2)}</span> t
          </div>
          <div className="text-xs text-gray-600">
            Potřeba CaO: {items.reduce((sum, item) => sum + item.quantity_cao_t, 0).toFixed(2)} t
          </div>
        </div>
      </div>

      {/* Kompaktní termín + poznámka */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        {/* Termín dodání */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-primary-green" />
            Preferovaný termín dodání *
          </label>
          <select
            value={deliveryPeriod}
            onChange={(e) => setDeliveryPeriod(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            required
          >
            {deliveryOptions.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Poznámka */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5 text-primary-green" />
            Poznámka k poptávce (volitelné)
          </label>
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Zde můžete uvést další požadavky, dotazy nebo poznámky..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Kontaktní údaje - collapsible pokud předvyplněné */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setContactExpanded(!contactExpanded)}
        >
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary-green" />
            Kontaktní údaje
          </h2>
          {contactsPreFilled && !contactExpanded && (
            <button type="button" className="text-sm text-primary-green hover:text-primary-brown flex items-center">
              <Edit2 className="h-4 w-4 mr-1" />
              Upravit
            </button>
          )}
          {contactsPreFilled && (
            contactExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {contactsPreFilled && !contactExpanded ? (
          // Kompaktní zobrazení předvyplněných údajů
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">{contactPerson}</span></p>
            <p>{contactPhone} • {contactEmail}</p>
            {deliveryAddress && <p className="text-gray-600">{deliveryAddress}</p>}
          </div>
        ) : (
          // Plný formulář
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kontaktní osoba *
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
                required
                autoComplete="off"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="Jméno a příjmení"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                onKeyDown={(e) => {
                  // Zabránit automatickému odeslání formuláře při stisku Enter
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                required
                autoComplete="off"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="+420 123 456 789"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
                required
                autoComplete="off"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Adresa dodání (volitelné)
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
                autoComplete="off"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="Ulice, Město, PSČ"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full flex items-center justify-center px-6 py-3 bg-primary-green text-white font-medium rounded-lg hover:bg-primary-brown transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

        <p className="text-xs text-gray-500 text-center mt-2">
          Po odeslání vás budeme kontaktovat s cenovou nabídkou do 48 hodin
        </p>
      </div>
    </form>
  )
}
