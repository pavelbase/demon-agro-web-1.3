'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import type { Parcel } from '@/lib/types/database'
import { 
  exportParcelsExcel,
  downloadExcel,
  generateParcelsFilename,
} from '@/lib/utils/excel-export'

interface ExportParcelsExcelButtonProps {
  parcels: any[] // ParcelWithAnalysis[]
  className?: string
}

export function ExportParcelsExcelButton({
  parcels,
  className = 'inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed',
}: ExportParcelsExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      // Generate Excel
      const buffer = exportParcelsExcel(parcels)
      
      // Generate filename
      const filename = generateParcelsFilename()
      
      // Download
      downloadExcel(buffer, filename)
      
      console.log('Excel exported successfully:', filename)
    } catch (err) {
      console.error('Error exporting Excel:', err)
      setError(err instanceof Error ? err.message : 'Chyba při exportu Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleExport}
        disabled={isExporting || parcels.length === 0}
        className={className}
        type="button"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exportuji...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            Export do Excel
          </>
        )}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
