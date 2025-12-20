'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'
import type { FertilizationPlan } from '@/lib/utils/fertilization-plan'
import { 
  exportFertilizationPlanPDF, 
  downloadPDF, 
  generatePlanFilename 
} from '@/lib/utils/pdf-export'

interface ExportPlanPDFButtonProps {
  plan: FertilizationPlan
  parcel: Parcel
  analysis: SoilAnalysis
  className?: string
}

export function ExportPlanPDFButton({
  plan,
  parcel,
  analysis,
  className = 'w-full flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed',
}: ExportPlanPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      // Generate PDF
      const blob = await exportFertilizationPlanPDF(plan, parcel, analysis)
      
      // Generate filename
      const filename = generatePlanFilename(parcel, plan.target_year)
      
      // Download
      downloadPDF(blob, filename)
      
      console.log('PDF exported successfully:', filename)
    } catch (err) {
      console.error('Error exporting PDF:', err)
      setError(err instanceof Error ? err.message : 'Chyba při exportu PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={className}
        type="button"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generuji PDF...
          </>
        ) : (
          <>
            <FileDown className="w-5 h-5" />
            Exportovat do PDF
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
