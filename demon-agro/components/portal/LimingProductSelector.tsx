'use client'

import { useState } from 'react'
import { ShoppingCart, Package, Info, CheckCircle2 } from 'lucide-react'
import type { Database } from '@/lib/types/database'
import { useLimingCart } from '@/lib/contexts/LimingCartContext'
import { useRouter } from 'next/navigation'

type LimingProduct = Database['public']['Tables']['liming_products']['Row']

interface LimingProductSelectorProps {
  products: LimingProduct[]
  limeNeedKgHa: number
  parcelArea: number
  parcelId: string
  parcelName: string
}

const REACTIVITY_LABELS = {
  very_high: 'Velmi vysoká',
  high: 'Vysoká',
  medium: 'Střední',
  low: 'Nízká',
}

const TYPE_LABELS = {
  calcitic: 'Vápenatý (Ca)',
  dolomite: 'Dolomitický (Ca+Mg)',
  both: 'Univerzální',
}

export function LimingProductSelector({
  products,
  limeNeedKgHa,
  parcelArea,
  parcelId,
  parcelName,
}: LimingProductSelectorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { addItem } = useLimingCart()
  const router = useRouter()

  // Calculate required quantity for each product
  const calculateProductQuantity = (product: LimingProduct): number => {
    // Convert lime need (CaO kg/ha) to product quantity
    // product quantity (kg/ha) = lime_need_kg_ha / (cao_content / 100)
    const quantityKgHa = limeNeedKgHa / (product.cao_content / 100)
    const totalQuantityKg = quantityKgHa * parcelArea
    return totalQuantityKg / 1000 // Convert to tons
  }

  const handleAddToRequest = () => {
    if (!selectedProductId) {
      alert('Prosím vyberte produkt')
      return
    }

    const selectedProduct = products.find(p => p.id === selectedProductId)
    if (!selectedProduct) return

    const quantityProduct = calculateProductQuantity(selectedProduct)
    const quantityCao = (limeNeedKgHa * parcelArea) / 1000

    // Determine recommended type from product
    let recommendedType: 'calcitic' | 'dolomite' | 'either' = 'either'
    if (selectedProduct.type === 'calcitic') {
      recommendedType = 'calcitic'
    } else if (selectedProduct.type === 'dolomite') {
      recommendedType = 'dolomite'
    }

    addItem({
      parcel_id: parcelId,
      parcel_name: parcelName,
      area_ha: parcelArea,
      recommended_type: recommendedType,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      cao_content: selectedProduct.cao_content,
      quantity_cao_t: quantityCao,
      quantity_product_t: quantityProduct,
      reason: `Doporučeno: ${selectedProduct.name} (${selectedProduct.cao_content}% CaO)`,
    })

    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  const handleSubmitRequest = () => {
    if (!selectedProductId) {
      alert('Prosím vyberte produkt')
      return
    }

    handleAddToRequest()
    
    // Redirect to new request page after a short delay
    setTimeout(() => {
      router.push('/portal/poptavky/nova')
    }, 500)
  }

  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null

  return (
    <div className="space-y-6">
      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary-green" />
          Produkty Démon Agro
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Momentálně nemáme dostupné produkty tohoto typu.</p>
            <p className="text-sm mt-2">Kontaktujte nás pro individuální nabídku.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const quantityTons = calculateProductQuantity(product)
              const quantityPerHa = quantityTons / parcelArea
              const isSelected = selectedProductId === product.id

              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`
                    relative border-2 rounded-lg p-4 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary-green bg-primary-green/5' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start">
                    {/* Radio Button */}
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSelected ? 'border-primary-green' : 'border-gray-300'}
                      `}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-primary-green" />
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {product.description}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 ml-2">
                          {TYPE_LABELS[product.type]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {/* Composition */}
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Složení</p>
                          <p className="font-semibold text-sm">
                            {product.cao_content}% CaO
                            {product.mgo_content > 0 && (
                              <>, {product.mgo_content}% MgO</>
                            )}
                          </p>
                        </div>

                        {/* Reactivity */}
                        {product.reactivity && (
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-600">Reaktivita</p>
                            <p className="font-semibold text-sm">
                              {REACTIVITY_LABELS[product.reactivity]}
                            </p>
                          </div>
                        )}

                        {/* Granulation */}
                        {product.granulation && (
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-600">Granulace</p>
                            <p className="font-semibold text-sm">{product.granulation}</p>
                          </div>
                        )}

                        {/* Form */}
                        {product.form && (
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-600">Forma</p>
                            <p className="font-semibold text-sm capitalize">{product.form}</p>
                          </div>
                        )}
                      </div>

                      {/* Required Quantity */}
                      <div className="mt-4 p-3 bg-primary-green/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700">Potřebné množství pro váš pozemek:</p>
                            <p className="text-lg font-bold text-primary-green">
                              {quantityTons.toFixed(2)} t
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              ({quantityPerHa.toFixed(2)} t/ha × {parcelArea} ha)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Application Notes */}
                      {product.application_notes && (
                        <div className="mt-3 text-xs text-gray-600 flex items-start">
                          <Info className="h-4 w-4 mr-1 flex-shrink-0 text-blue-500 mt-0.5" />
                          <span>{product.application_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Kalkulace a Akce */}
      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Kalkulace
          </h2>

          {!selectedProduct ? (
            <p className="text-gray-600 mb-4">
              Vyberte produkt pro zobrazení kalkulace
            </p>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vybraný produkt</p>
                    <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Množství</p>
                    <p className="font-semibold text-gray-900">
                      {calculateProductQuantity(selectedProduct).toFixed(2)} t celkem
                    </p>
                    <p className="text-xs text-gray-600">
                      {(calculateProductQuantity(selectedProduct) / parcelArea).toFixed(2)} t/ha
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Cena</p>
                  <p className="text-lg font-bold text-gray-900">
                    Bude stanovena individuálně
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Po odeslání poptávky vás budeme kontaktovat s cenovou nabídkou
                  </p>
                </div>
              </div>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    Produkt byl přidán do poptávky
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToRequest}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-white border-2 border-primary-green text-primary-green rounded-lg hover:bg-primary-green hover:text-white transition-colors font-medium"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Přidat do poptávky
                </button>
                
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors font-medium"
                >
                  Odeslat poptávku
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Poptávka nezavazuje k objednávce. Po odeslání vás budeme kontaktovat.
              </p>
              
              {/* ÚKZÚZ Disclaimer */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ℹ️ Výpočty množství jsou orientační podle metodiky ÚKZÚZ. Doporučujeme kontrolní rozbor půdy 1 rok po aplikaci.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
