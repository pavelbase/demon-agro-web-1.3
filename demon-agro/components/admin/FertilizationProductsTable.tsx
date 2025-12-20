'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { ProductModal } from './ProductModal'

interface FertilizationProduct {
  id: string
  name: string
  type: string
  manufacturer: string | null
  composition: any
  acidification_factor: number
  is_active: boolean
  display_order: number
}

interface FertilizationProductsTableProps {
  products: FertilizationProduct[]
}

const TYPE_LABELS: Record<string, string> = {
  mineral: 'Minerální',
  organic: 'Organické',
  organomineral: 'Organominerální',
}

export function FertilizationProductsTable({ products }: FertilizationProductsTableProps) {
  const [editingProduct, setEditingProduct] = useState<FertilizationProduct | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getNutrients = (composition: any) => {
    if (!composition) return '—'
    const parts = []
    if (composition.N) parts.push(`N: ${composition.N}%`)
    if (composition.P2O5) parts.push(`P: ${composition.P2O5}%`)
    if (composition.K2O) parts.push(`K: ${composition.K2O}%`)
    if (composition.MgO) parts.push(`Mg: ${composition.MgO}%`)
    if (composition.S) parts.push(`S: ${composition.S}%`)
    return parts.join(', ') || '—'
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return

    try {
      const response = await fetch('/api/admin/fertilization-products/delete', {
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

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">Zatím žádné produkty</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Přidat první produkt
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Přidat produkt
        </button>
      </div>

      {/* Table */}
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
                  Výrobce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Složení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acidifikace
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
                    {TYPE_LABELS[product.type] || product.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.manufacturer || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getNutrients(product.composition)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.acidification_factor > 0 && '+'}
                    {product.acidification_factor}
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

      {/* Modals */}
      {showCreateModal && (
        <ProductModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
