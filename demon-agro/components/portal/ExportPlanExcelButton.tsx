'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import type { Parcel, SoilAnalysis } from '@/lib/types/database'
import type { FertilizationPlan } from '@/lib/utils/fertilization-plan'
import { 
  exportFertilizationPlanExcel,
  downloadExcel,
  generatePlanExcelFilename,
} from '@/lib/utils/excel-export'

interface ExportPlanExcelButtonProps {
  plan: FertilizationPlan
  parcel: Parcel
  analysis: SoilAnalysis
  className?: string
}

export function ExportPlanExcelButton({
  plan,
  parcel,
  analysis,
  className = 'w-full flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed',
}: ExportPlanExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      // Generate Excel
      const buffer = exportFertilizationPlanExcel(plan, parcel, analysis)
      
      // Generate filename
      const filename = generatePlanExcelFilename(parcel, plan.target_year)
      
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
        disabled={isExporting}
        className={className}
        type="button"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Exportuji Excel...
          </>
        ) : (
          <>
            <FileDown className="w-5 h-5" />
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
