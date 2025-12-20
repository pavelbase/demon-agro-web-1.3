'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, Trash2, Package } from 'lucide-react'
import { useLimingCart } from '@/lib/contexts/LimingCartContext'

const TYPE_LABELS = {
  calcitic: 'Vápenatý',
  dolomite: 'Dolomitický',
  either: 'Libovolný',
}

export function LimingCartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, removeItem, getTotalItems, getTotalArea, getTotalQuantity } = useLimingCart()

  const totalItems = getTotalItems()

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-green text-white rounded-full p-4 shadow-lg hover:bg-primary-brown transition-colors"
        aria-label="Košík poptávky vápnění"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Modal/Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-primary-green mr-2" />
                <h2 className="text-lg font-bold text-gray-900">
                  Poptávka vápnění
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Košík je prázdný</p>
                  <p className="text-sm text-gray-500">
                    Přidejte pozemky z plánu vápnění
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.parcel_id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.parcel_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.area_ha} ha • {TYPE_LABELS[item.recommended_type]}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.parcel_id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          aria-label="Odebrat z košíku"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {item.product_name && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            {item.product_name}
                          </p>
                          {item.cao_content && (
                            <p className="text-xs text-gray-500">
                              {item.cao_content}% CaO
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Potřeba CaO:</p>
                          <p className="font-semibold">
                            {item.quantity_cao_t.toFixed(2)} t
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Množství:</p>
                          <p className="font-semibold">
                            {item.quantity_product_t.toFixed(2)} t
                          </p>
                        </div>
                      </div>

                      {item.reason && (
                        <p className="text-xs text-gray-500 mt-2">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Summary */}
            {items.length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Počet pozemků:</span>
                    <span className="font-semibold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Celková výměra:</span>
                    <span className="font-semibold">
                      {getTotalArea().toFixed(2)} ha
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Celkové množství:</span>
                    <span className="font-semibold">
                      {getTotalQuantity().toFixed(2)} t
                    </span>
                  </div>
                </div>

                <Link
                  href="/portal/poptavky/nova"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-primary-green text-white text-center py-3 rounded-lg hover:bg-primary-brown transition-colors font-medium"
                >
                  Odeslat poptávku
                </Link>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Cena bude stanovena individuálně
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
