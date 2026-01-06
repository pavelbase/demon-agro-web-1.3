'use client'

import Link from 'next/link'
import { Package, ShoppingCart, Plus } from 'lucide-react'
import { useLimingCart } from '@/lib/contexts/LimingCartContext'

export function EmptyRequestsState() {
  const { getTotalItems, items } = useLimingCart()
  const cartItemsCount = getTotalItems()

  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      {cartItemsCount > 0 ? (
        // Košík má položky - zobrazit upozornění
        <>
          <ShoppingCart className="h-20 w-20 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Máte {cartItemsCount} {cartItemsCount === 1 ? 'položku' : cartItemsCount > 1 && cartItemsCount < 5 ? 'položky' : 'položek'} v košíku
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Váš košík čeká na odeslání. Dokončete poptávku, abychom vám mohli připravit cenovou nabídku.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/portal/poptavky/nova"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors font-medium"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Dokončit poptávku
            </Link>
            <Link
              href="/portal/plany-vapneni"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Přidat další pozemky
            </Link>
          </div>
          
          {/* Náhled položek v košíku */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">V košíku:</h3>
            <div className="max-w-md mx-auto text-left space-y-2">
              {items.slice(0, 3).map((item) => (
                <div key={item.parcel_id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.parcel_name}</span>
                  <span className="text-gray-900 font-medium">{item.quantity_product_t.toFixed(1)} t</span>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  ... a dalších {items.length - 3}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        // Košík je prázdný
        <>
          <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Zatím nemáte žádné poptávky
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Vytvořte poptávku vápnění pro své pozemky. Vypočítáme potřebu,
            doporučíme produkt a připravíme cenovou nabídku.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/portal/plany-vapneni"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-green text-primary-green rounded-lg hover:bg-primary-green hover:text-white transition-colors"
            >
              Přejít na plány vápnění
            </Link>
            <Link
              href="/portal/poptavky/nova"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nová poptávka
            </Link>
          </div>
        </>
      )}
    </div>
  )
}


