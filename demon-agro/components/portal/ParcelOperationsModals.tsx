'use client'

import { useState, useTransition } from 'react'
import { X, Scissors, GitMerge, Archive, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'
import {
  splitParcel,
  mergeParcels,
  archiveParcel,
  type SplitParcelPart,
} from '@/lib/actions/parcel-operations'

// ============================================================================
// SPLIT PARCEL MODAL
// ============================================================================

interface SplitParcelModalProps {
  parcel: Parcel
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function SplitParcelModal({
  parcel,
  isOpen,
  onClose,
  onSuccess,
}: SplitParcelModalProps) {
  const [isPending, startTransition] = useTransition()
  const [numberOfParts, setNumberOfParts] = useState(2)
  const [parts, setParts] = useState<SplitParcelPart[]>([
    { name: `${parcel.name} - část 1`, area: 0 },
    { name: `${parcel.name} - část 2`, area: 0 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleNumberChange = (num: number) => {
    setNumberOfParts(num)
    const newParts: SplitParcelPart[] = []
    for (let i = 0; i < num; i++) {
      newParts.push(
        parts[i] || { name: `${parcel.name} - část ${i + 1}`, area: 0 }
      )
    }
    setParts(newParts)
    setError(null)
  }

  const handlePartChange = (index: number, field: keyof SplitParcelPart, value: string | number) => {
    const newParts = [...parts]
    newParts[index] = { ...newParts[index], [field]: value }
    setParts(newParts)
    setError(null)
  }

  const totalArea = parts.reduce((sum, part) => sum + (part.area || 0), 0)
  const areaDiff = Math.abs(totalArea - parcel.area)
  const isValid = areaDiff < 0.01 && parts.every(p => p.name.trim() && p.area > 0)

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Zkontrolujte zadané hodnoty')
      return
    }

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await splitParcel({
        parcelId: parcel.id,
        parts,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.message || 'Pozemek byl úspěšně rozdělen')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Scissors className="w-6 h-6 text-[#4A7C59]" />
            <h2 className="text-2xl font-bold text-gray-900">Rozdělit pozemek</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Parcel Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Původní pozemek</h3>
            <p className="text-sm text-gray-700">
              <strong>{parcel.name}</strong> - {parcel.area.toFixed(2)} ha
            </p>
          </div>

          {/* Number of Parts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Počet nových částí
            </label>
            <select
              value={numberOfParts}
              onChange={(e) => handleNumberChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              disabled={isPending}
            >
              <option value={2}>2 části</option>
              <option value={3}>3 části</option>
              <option value={4}>4 části</option>
              <option value={5}>5 částí</option>
            </select>
          </div>

          {/* Parts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Nové části</h3>
            {parts.map((part, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Část {index + 1}</h4>
                  <span className="text-sm text-gray-600">
                    {part.area ? `${part.area.toFixed(2)} ha` : '0.00 ha'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder={`${parcel.name} - část ${index + 1}`}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Výměra (ha) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={part.area || ''}
                    onChange={(e) =>
                      handlePartChange(index, 'area', Number(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="0.00"
                    disabled={isPending}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Area Validation */}
          <div className={`p-4 rounded-lg ${areaDiff > 0.01 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-start gap-3">
              {areaDiff > 0.01 ? (
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${areaDiff > 0.01 ? 'text-orange-800' : 'text-green-800'}`}>
                  Součet výměr: {totalArea.toFixed(2)} ha
                </p>
                <p className={`text-sm ${areaDiff > 0.01 ? 'text-orange-700' : 'text-green-700'}`}>
                  {areaDiff > 0.01
                    ? `Rozdíl: ${areaDiff.toFixed(2)} ha (musí být < 0.01 ha)`
                    : `Odpovídá původní výměře (${parcel.area.toFixed(2)} ha)`}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={isPending}
          >
            Zrušit
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="px-6 py-2 bg-[#4A7C59] hover:bg-[#5C4033] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Rozdělování...' : 'Rozdělit pozemek'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MERGE PARCELS MODAL
// ============================================================================

interface MergeParcelsModalProps {
  parcels: Parcel[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function MergeParcelsModal({
  parcels,
  isOpen,
  onClose,
  onSuccess,
}: MergeParcelsModalProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleParcel = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setError(null)
  }

  const selectedParcels = parcels.filter((p) => selectedIds.includes(p.id))
  const totalArea = selectedParcels.reduce((sum, p) => sum + p.area, 0)
  const isValid = selectedIds.length >= 2 && newName.trim().length > 0

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Vyberte alespoň 2 pozemky a zadejte název')
      return
    }

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await mergeParcels({
        parcelIds: selectedIds,
        newName,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.message || 'Pozemky byly úspěšně sloučeny')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <GitMerge className="w-6 h-6 text-[#4A7C59]" />
            <h2 className="text-2xl font-bold text-gray-900">Sloučit pozemky</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Parcels List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vyberte pozemky ke sloučení (min. 2)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {parcels.map((parcel) => (
                <label
                  key={parcel.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(parcel.id)}
                    onChange={() => toggleParcel(parcel.id)}
                    className="w-4 h-4 text-[#4A7C59] rounded"
                    disabled={isPending}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{parcel.name}</p>
                    <p className="text-sm text-gray-600">{parcel.area.toFixed(2)} ha</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Summary */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Vybráno: {selectedIds.length} pozemků
              </p>
              <p className="text-sm text-blue-700">
                Celková výměra: {totalArea.toFixed(2)} ha
              </p>
            </div>
          )}

          {/* New Parcel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Název nového pozemku <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                setError(null)
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Zadejte název sloučeného pozemku"
              disabled={isPending}
            />
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Co se stane:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Původní pozemky budou archivovány</li>
              <li>• Vytvoří se nový pozemek s celkovou výměrou</li>
              <li>• Rozbor půdy bude vážený průměr podle výměry</li>
              <li>• Historie hnojení všech pozemků se spojí</li>
            </ul>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={isPending}
          >
            Zrušit
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="px-6 py-2 bg-[#4A7C59] hover:bg-[#5C4033] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Slučování...' : 'Sloučit pozemky'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ARCHIVE PARCEL MODAL
// ============================================================================

interface ArchiveParcelModalProps {
  parcel: Parcel
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ArchiveParcelModal({
  parcel,
  isOpen,
  onClose,
  onSuccess,
}: ArchiveParcelModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleArchive = async () => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await archiveParcel(parcel.id)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.message || 'Pozemek byl archivován')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Archive className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Archivovat pozemek</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 mb-1">
                  Opravdu chcete archivovat tento pozemek?
                </p>
                <p className="text-sm text-orange-700">
                  Pozemek <strong>{parcel.name}</strong> nebude zobrazen v aktivních
                  pozemcích. Později ho můžete obnovit z archivu.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Co se stane:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Pozemek nebude v seznamu aktivních</li>
              <li>• Rozbory a historie zůstanou zachovány</li>
              <li>• Později lze pozemek obnovit</li>
            </ul>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={isPending}
          >
            Zrušit
          </button>
          <button
            onClick={handleArchive}
            disabled={isPending}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Archivuji...' : 'Archivovat'}
          </button>
        </div>
      </div>
    </div>
  )
}
