'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Flask } from 'lucide-react'
import { LimingProductModal } from './LimingProductModal'

interface LimingProduct {
  id: string
  name: string
  type: string
  cao_content: number
  mgo_content: number
  reactivity: string | null
  is_active: boolean
}

interface LimingProductsTableProps {
  products: LimingProduct[]
}

const REACTIVITY_LABELS: Record<string, string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
  very_high: 'Velmi vysoká',
}

export function LimingProductsTable({ products }: LimingProductsTableProps) {
  const [editingProduct, setEditingProduct] = useState<LimingProduct | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleDelete = async (productId: string) => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return

    try {
      const response = await fetch('/api/admin/liming-products/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Nepodařilo se smazat produkt')
      }
    } catch (error) {
      alert('Došlo k chybě')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Přidat produkt
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Název
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  % CaO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  % MgO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reaktivita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.type === 'calcitic' && 'Kalcitický'}
                    {product.type === 'dolomite' && 'Dolomitický'}
                    {product.type === 'both' && 'Univerzální'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.cao_content}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.mgo_content}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.reactivity ? REACTIVITY_LABELS[product.reactivity] : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {product.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Aktivní
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Neaktivní
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <LimingProductModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {editingProduct && (
        <LimingProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
