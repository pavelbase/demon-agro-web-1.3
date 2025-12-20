'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { parcelSchema, type ParcelFormData } from '@/lib/utils/validations'
import { createParcel, updateParcel, deleteParcel } from '@/lib/actions/parcels'
import type { ParcelWithAnalysis } from '@/app/portal/pozemky/page'
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { SOIL_TYPE_LABELS } from '@/lib/constants/database'
import * as XLSX from 'xlsx'
import { ExportParcelsExcelButton } from './ExportParcelsExcelButton'

interface ParcelsTableProps {
  parcels: ParcelWithAnalysis[]
}

const ITEMS_PER_PAGE = 20

export function ParcelsTable({ parcels: initialParcels }: ParcelsTableProps) {
  // State
  const [parcels, setParcels] = useState(initialParcels)
  const [searchQuery, setSearchQuery] = useState('')
  const [cultureFilter, setCultureFilter] = useState<'all' | 'orna' | 'ttp'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('active')
  const [problemsOnly, setProblemsOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedParcel, setSelectedParcel] = useState<ParcelWithAnalysis | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Forms
  const addForm = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      name: '',
      area: 0,
      cadastralNumber: '',
      soilType: 'S',
      culture: 'orna',
      notes: '',
    },
  })

  const editForm = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
  })

  // Filtered and paginated parcels
  const filteredParcels = useMemo(() => {
    let filtered = parcels

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cadastral_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Culture filter
    if (cultureFilter !== 'all') {
      filtered = filtered.filter(p => p.culture === cultureFilter)
    }

    // Status filter (currently all active, can be extended)
    // if (statusFilter === 'active') { ... }

    // Problems only filter
    if (problemsOnly) {
      filtered = filtered.filter(p => p.status === 'warning' || p.status === 'critical')
    }

    return filtered
  }, [parcels, searchQuery, cultureFilter, statusFilter, problemsOnly])

  const totalPages = Math.ceil(filteredParcels.length / ITEMS_PER_PAGE)
  const paginatedParcels = filteredParcels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Handlers
  const handleAddParcel = async (data: ParcelFormData) => {
    setIsSubmitting(true)
    setError(null)

    const result = await createParcel({
      name: data.name,
      area: data.area,
      cadastral_number: data.cadastralNumber || null,
      soil_type: data.soilType,
      culture: data.culture,
      notes: data.notes || null,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Nepodařilo se přidat pozemek')
      return
    }

    // Add to local state
    setParcels([
      {
        ...result.data,
        latest_analysis: null,
        status: 'warning' as const,
        status_reason: 'Chybí rozbor',
      },
      ...parcels,
    ])

    setShowAddModal(false)
    addForm.reset()
  }

  const handleEditParcel = async (data: ParcelFormData) => {
    if (!selectedParcel) return

    setIsSubmitting(true)
    setError(null)

    const result = await updateParcel(selectedParcel.id, {
      name: data.name,
      area: data.area,
      cadastral_number: data.cadastralNumber || null,
      soil_type: data.soilType,
      culture: data.culture,
      notes: data.notes || null,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Nepodařilo se aktualizovat pozemek')
      return
    }

    // Update local state
    setParcels(parcels.map(p =>
      p.id === selectedParcel.id
        ? { ...p, ...result.data }
        : p
    ))

    setShowEditModal(false)
    setSelectedParcel(null)
    editForm.reset()
  }

  const handleDeleteParcel = async () => {
    if (!selectedParcel) return

    setIsSubmitting(true)
    setError(null)

    const result = await deleteParcel(selectedParcel.id)

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Nepodařilo se smazat pozemek')
      return
    }

    // Remove from local state
    setParcels(parcels.filter(p => p.id !== selectedParcel.id))

    setShowDeleteModal(false)
    setSelectedParcel(null)
  }

  // Export handler removed - now using ExportParcelsExcelButton component

  const openEditModal = (parcel: ParcelWithAnalysis) => {
    setSelectedParcel(parcel)
    editForm.reset({
      name: parcel.name,
      area: parcel.area,
      cadastralNumber: parcel.cadastral_number || '',
      soilType: parcel.soil_type,
      culture: parcel.culture,
      notes: parcel.notes || '',
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (parcel: ParcelWithAnalysis) => {
    setSelectedParcel(parcel)
    setShowDeleteModal(true)
  }

  // Empty state
  if (parcels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Zatím nemáte žádné pozemky
        </h3>
        <p className="text-gray-600 mb-6">
          Přidejte první pozemek nebo nahrajte rozbory půdy.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-brown transition-colors"
          >
            <Plus className="h-5 w-5" />
            Přidat pozemek
          </button>
          <Link
            href="/portal/upload"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Nahrát rozbory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pozemky</h1>
          <p className="text-gray-600 mt-1">
            Celkem {filteredParcels.length} pozemků, {filteredParcels.reduce((sum, p) => sum + p.area, 0).toFixed(2)} ha
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-primary-green text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-brown transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Přidat pozemek
          </button>
          <ExportParcelsExcelButton 
            parcels={filteredParcels}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat podle kódu nebo názvu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
          </div>

          {/* Culture filter */}
          <select
            value={cultureFilter}
            onChange={(e) => setCultureFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Všechny kultury</option>
            <option value="orna">Orná půda</option>
            <option value="ttp">TTP</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Všechny stavy</option>
            <option value="active">Aktivní</option>
          </select>

          {/* Problems only */}
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={problemsOnly}
              onChange={(e) => setProblemsOnly(e.target.checked)}
              className="w-4 h-4 text-primary-green rounded focus:ring-primary-green"
            />
            <span className="text-sm text-gray-700">Pouze problémové</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kód
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Výměra (ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Půdní druh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kultura
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  pH
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedParcels.map((parcel) => (
                <tr key={parcel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {parcel.cadastral_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/portal/pozemky/${parcel.id}`}
                      className="text-sm font-medium text-primary-green hover:text-primary-brown"
                    >
                      {parcel.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {parcel.area.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {SOIL_TYPE_LABELS[parcel.soil_type]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {parcel.culture === 'orna' ? 'Orná půda' : 'TTP'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {parcel.latest_analysis?.ph?.toFixed(1) || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parcel.status === 'ok'
                          ? 'bg-green-100 text-green-800'
                          : parcel.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      title={parcel.status_reason}
                    >
                      {parcel.status === 'ok' && '●'}
                      {parcel.status === 'warning' && '⚠'}
                      {parcel.status === 'critical' && '⚠'}
                      <span className="ml-1">{parcel.status_reason || 'OK'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/portal/pozemky/${parcel.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(parcel)}
                        className="text-primary-green hover:text-primary-brown"
                        title="Upravit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(parcel)}
                        className="text-red-600 hover:text-red-900"
                        title="Smazat"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Zobrazeno {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredParcels.length)} z {filteredParcels.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-4 py-1 text-sm text-gray-700">
                Strana {currentPage} z {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Parcel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={addForm.handleSubmit(handleAddParcel)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Přidat pozemek
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název pozemku <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...addForm.register('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="Např. Dolní pole"
                      />
                      {addForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {addForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Výměra (ha) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        {...addForm.register('area', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="15.50"
                      />
                      {addForm.formState.errors.area && (
                        <p className="mt-1 text-sm text-red-600">
                          {addForm.formState.errors.area.message}
                        </p>
                      )}
                    </div>

                    {/* Cadastral Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kód / KÚ
                      </label>
                      <input
                        type="text"
                        {...addForm.register('cadastralNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="123-456/1"
                      />
                    </div>

                    {/* Soil Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Půdní druh <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...addForm.register('soilType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      >
                        <option value="L">Lehká</option>
                        <option value="S">Střední</option>
                        <option value="T">Těžká</option>
                      </select>
                      {addForm.formState.errors.soilType && (
                        <p className="mt-1 text-sm text-red-600">
                          {addForm.formState.errors.soilType.message}
                        </p>
                      )}
                    </div>

                    {/* Culture */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kultura <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...addForm.register('culture')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      >
                        <option value="orna">Orná půda</option>
                        <option value="ttp">TTP</option>
                      </select>
                      {addForm.formState.errors.culture && (
                        <p className="mt-1 text-sm text-red-600">
                          {addForm.formState.errors.culture.message}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poznámky
                      </label>
                      <textarea
                        {...addForm.register('notes')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        placeholder="Volitelné poznámky k pozemku..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-green text-base font-medium text-white hover:bg-primary-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Ukládání...' : 'Přidat pozemek'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
                  >
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parcel Modal */}
      {showEditModal && selectedParcel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={editForm.handleSubmit(handleEditParcel)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Upravit pozemek
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Same fields as Add Modal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název pozemku <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...editForm.register('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      />
                      {editForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {editForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Výměra (ha) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        {...editForm.register('area', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      />
                      {editForm.formState.errors.area && (
                        <p className="mt-1 text-sm text-red-600">
                          {editForm.formState.errors.area.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kód / KÚ
                      </label>
                      <input
                        type="text"
                        {...editForm.register('cadastralNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Půdní druh <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...editForm.register('soilType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      >
                        <option value="L">Lehká</option>
                        <option value="S">Střední</option>
                        <option value="T">Těžká</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kultura <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...editForm.register('culture')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      >
                        <option value="orna">Orná půda</option>
                        <option value="ttp">TTP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poznámky
                      </label>
                      <textarea
                        {...editForm.register('notes')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-green text-base font-medium text-white hover:bg-primary-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Ukládání...' : 'Uložit změny'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
                  >
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedParcel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Smazat pozemek
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Opravdu chcete smazat pozemek <strong>{selectedParcel.name}</strong>? 
                        Tato akce je nevratná a smaže také všechny související rozbory a data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleDeleteParcel}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mazání...' : 'Smazat'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
