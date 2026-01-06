'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { 
  exportMultipleLimingPlansPDF, 
  downloadPDF, 
  generateMultipleLimingPlansFilename,
  type LimingPlan as PDFLimingPlan 
} from '@/lib/utils/liming-pdf-mustr'

interface Application {
  id: string
  year: number
  season: 'jaro' | 'leto' | 'podzim'
  product_name: string
  cao_content: number
  mgo_content: number
  dose_per_ha: number
  total_dose: number
  cao_per_ha: number
  mgo_per_ha: number
  ph_before: number
  ph_after: number
  status: string
  product_price_per_ton?: number | null
  notes?: string | null
}

interface Parcel {
  id: string
  name: string
  code: string
  area: number
  soil_type: string
  user_id: string
  culture?: string
}

interface Plan {
  id: string
  parcel_id: string
  total_cao_need: number
  total_cao_need_per_ha: number
  total_ca_need?: number
  total_ca_need_per_ha?: number
  current_ph: number
  target_ph: number
  soil_type: string
  land_use: string
  status: string
  created_at: string
  parcels: Parcel
  applications: Application[]
}

interface ExportAllLimingPlansPDFProps {
  plans: Plan[]
  userProfile?: {
    full_name: string | null
    company_name: string | null
  } | null
  className?: string
}

export default function ExportAllLimingPlansPDF({ 
  plans, 
  userProfile,
  className 
}: ExportAllLimingPlansPDFProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!plans || plans.length === 0) {
      setError('Žádné plány k exportu')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      // Convert plans to PDF format
      const pdfPlans: PDFLimingPlan[] = plans.map((plan) => ({
        id: plan.id,
        parcel_id: plan.parcel_id,
        current_ph: plan.current_ph,
        target_ph: plan.target_ph,
        soil_type: plan.soil_type as 'L' | 'S' | 'T',
        land_use: plan.land_use as 'orna' | 'ttp',
        total_ca_need: plan.total_ca_need || 0,
        total_cao_need: plan.total_cao_need,
        total_ca_need_per_ha: plan.total_ca_need_per_ha || 0,
        total_cao_need_per_ha: plan.total_cao_need_per_ha,
        status: plan.status,
        created_at: plan.created_at,
        parcel: {
          name: plan.parcels.name,
          code: plan.parcels.code,
          area: plan.parcels.area,
          soil_type: plan.parcels.soil_type,
          culture: plan.parcels.culture,
        },
        applications: plan.applications.map((app) => ({
          id: app.id,
          year: app.year,
          season: app.season === 'leto' ? 'podzim' : app.season, // leto → podzim
          sequence_order: 0, // will be calculated by PDF generator
          product_name: app.product_name,
          cao_content: app.cao_content,
          mgo_content: app.mgo_content,
          dose_per_ha: app.dose_per_ha,
          total_dose: app.total_dose,
          cao_per_ha: app.cao_per_ha,
          mgo_per_ha: app.mgo_per_ha,
          ph_before: app.ph_before,
          ph_after: app.ph_after,
          mg_after: null,
          notes: app.notes || null,
          status: app.status as 'planned' | 'ordered' | 'applied' | 'cancelled',
          product_price_per_ton: app.product_price_per_ton || null,
        })),
      }))

      // Generate PDF
      const blob = await exportMultipleLimingPlansPDF(
        pdfPlans,
        {
          name: userProfile?.full_name || undefined,
          company: userProfile?.company_name || undefined,
        },
        {
          includePrice: true,
        }
      )

      // Generate filename
      const filename = generateMultipleLimingPlansFilename()

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
        disabled={isExporting || !plans || plans.length === 0}
        className={
          className ||
          'flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'
        }
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

