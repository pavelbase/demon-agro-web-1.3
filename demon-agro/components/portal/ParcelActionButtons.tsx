'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Scissors, Archive } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'
import {
  SplitParcelModal,
  ArchiveParcelModal,
} from './ParcelOperationsModals'

interface ParcelActionButtonsProps {
  parcel: Parcel
}

export function ParcelActionButtons({ parcel }: ParcelActionButtonsProps) {
  const router = useRouter()
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)

  const handleSuccess = () => {
    router.refresh()
    router.push('/portal/pozemky')
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Funkce úpravy bude implementována v další fázi')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="Upravit pozemek"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Upravit</span>
        </button>

        <button
          onClick={() => setSplitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="Rozdělit pozemek"
        >
          <Scissors className="w-4 h-4" />
          <span className="hidden sm:inline">Rozdělit</span>
        </button>

        <button
          onClick={() => setArchiveModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="Archivovat pozemek"
        >
          <Archive className="w-4 h-4" />
          <span className="hidden sm:inline">Archivovat</span>
        </button>
      </div>

      {/* Modals */}
      <SplitParcelModal
        parcel={parcel}
        isOpen={splitModalOpen}
        onClose={() => setSplitModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <ArchiveParcelModal
        parcel={parcel}
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
