'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Product {
  id?: string
  name: string
  type: string
  manufacturer: string | null
  composition: any
  acidification_factor: number
  is_active: boolean
}

interface ProductModalProps {
  product?: Product
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || 'mineral',
    manufacturer: product?.manufacturer || '',
    N: product?.composition?.N || '',
    P2O5: product?.composition?.P2O5 || '',
    K2O: product?.composition?.K2O || '',
    MgO: product?.composition?.MgO || '',
    S: product?.composition?.S || '',
    CaO: product?.composition?.CaO || '',
    acidification_factor: product?.acidification_factor || 0,
    is_active: product?.is_active !== false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      setError('Název je povinný')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const composition: any = {}
      if (formData.N) composition.N = parseFloat(formData.N as any)
      if (formData.P2O5) composition.P2O5 = parseFloat(formData.P2O5 as any)
      if (formData.K2O) composition.K2O = parseFloat(formData.K2O as any)
      if (formData.MgO) composition.MgO = parseFloat(formData.MgO as any)
      if (formData.S) composition.S = parseFloat(formData.S as any)
      if (formData.CaO) composition.CaO = parseFloat(formData.CaO as any)

      const payload = {
        productId: product?.id,
        name: formData.name,
        type: formData.type,
        manufacturer: formData.manufacturer || null,
        composition,
        acidification_factor: parseFloat(formData.acidification_factor as any) || 0,
        is_active: formData.is_active,
      }

      const endpoint = product 
        ? '/api/admin/fertilization-products/update'
        : '/api/admin/fertilization-products/create'

      const method = product ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nepodařilo se uložit produkt')
      }

      window.location.reload()
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
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {product ? 'Upravit produkt' : 'Nový produkt'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  >
                    <option value="mineral">Minerální</option>
                    <option value="organic">Organické</option>
                    <option value="organomineral">Organominerální</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Výrobce
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Složení (%)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">N</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.N}
                      onChange={(e) => setFormData({ ...formData, N: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">P₂O₅</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.P2O5}
                      onChange={(e) => setFormData({ ...formData, P2O5: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">K₂O</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.K2O}
                      onChange={(e) => setFormData({ ...formData, K2O: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">MgO</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.MgO}
                      onChange={(e) => setFormData({ ...formData, MgO: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">S</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.S}
                      onChange={(e) => setFormData({ ...formData, S: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CaO</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.CaO}
                      onChange={(e) => setFormData({ ...formData, CaO: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acidifikační faktor (kg CaCO₃ / 100 kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.acidification_factor}
                  onChange={(e) => setFormData({ ...formData, acidification_factor: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kladné = okyseluje, záporné = alkalizuje, 0 = neutrální
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Aktivní produkt
                </label>
              </div>

              <div className="flex gap-3 pt-4">
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
                    product ? 'Uložit změny' : 'Vytvořit produkt'
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
