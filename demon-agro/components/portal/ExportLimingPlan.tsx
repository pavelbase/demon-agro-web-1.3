'use client'

import { useState } from 'react'
import { FileDown, Loader2, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { formatLimingPlanForExport, type LimingPlan } from '@/lib/utils/liming-calculator'
import { 
  exportLimingPlanPDF, 
  downloadPDF, 
  generateLimingPlanFilename,
  type LimingPlan as PDFLimingPlan 
} from '@/lib/utils/liming-pdf-mustr'

interface ExportLimingPlanProps {
  plan: any // Plan z databáze
  parcel: {
    custom_name: string
    area_ha: number
  }
  className?: string
}

type ExportFormat = 'excel' | 'pdf'

export default function ExportLimingPlan({ 
  plan, 
  parcel,
  className 
}: ExportLimingPlanProps) {
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf')
  
  function handleExportExcel() {
    setExporting(true)
    
    try {
      // Převeď databázový formát na formát pro export
      const limingPlan: LimingPlan = {
        totalCaNeed: plan.total_ca_need || 0,
        totalCaoNeed: plan.total_cao_need || 0,
        totalCaNeedPerHa: plan.total_ca_need_per_ha || 0,
        totalCaoNeedPerHa: plan.total_cao_need_per_ha || 0,
        applications: plan.applications?.map((app: any) => ({
          year: app.year,
          season: app.season,
          sequenceOrder: app.sequence_order,
          product: {
            id: app.lime_product_id,
            name: app.product_name,
            type: '',
            caoContent: app.cao_content,
            mgoContent: app.mgo_content
          },
          dosePerHa: app.dose_per_ha,
          totalDose: app.total_dose,
          caoPerHa: app.cao_per_ha,
          mgoPerHa: app.mgo_per_ha,
          phBefore: app.ph_before,
          phAfter: app.ph_after,
          mgAfter: app.mg_after,
          recommendation: app.notes || ''
        })) || [],
        warnings: []
      }
      
      // Formátuj data pro Excel
      const data = formatLimingPlanForExport(
        limingPlan,
        parcel.custom_name,
        parcel.area_ha
      )
      
      // Vytvoř workbook
      const wb = XLSX.utils.book_new()
      
      // Sheet 1: Souhrn
      const maxDoseLabel = plan.soil_type === 'L' ? '1.0-1.5 t/ha' : 
                           plan.soil_type === 'S' ? '2.0-3.0 t/ha' : '3.0-3.5 t/ha'
      
      const summaryData = [
        { Položka: 'Pozemek', Hodnota: data.summary.pozemek },
        { Položka: 'Výměra', Hodnota: data.summary.vymera },
        { Položka: 'Celková potřeba CaO', Hodnota: data.summary.celkova_potreba_cao },
        { Položka: 'Potřeba CaO/ha', Hodnota: data.summary.potreba_cao_ha },
        { Položka: 'Celková potřeba Ca', Hodnota: data.summary.celkova_potreba_ca },
        { Položka: 'Potřeba Ca/ha', Hodnota: data.summary.potreba_ca_ha },
        { Položka: 'Max. dávka', Hodnota: maxDoseLabel },
        { Položka: 'Interval', Hodnota: '3 roky' },
        { Položka: 'Počet aplikací', Hodnota: data.summary.pocet_aplikaci },
        { Položka: 'Generováno', Hodnota: data.summary.generovano }
      ]
      
      const summaryWs = XLSX.utils.json_to_sheet(summaryData)
      
      // Nastavení šířek sloupců pro souhrn
      summaryWs['!cols'] = [
        { wch: 25 }, // Položka
        { wch: 30 }  // Hodnota
      ]
      
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Souhrn')
      
      // Sheet 2: Časový plán aplikací s acidifikací
      // Generate expanded applications with acidification rows
      const expandedApplications: any[] = []
      
      // Annual pH drop rates by soil type
      const ANNUAL_PH_DROP: Record<string, number> = {
        'L': 0.09,
        'S': 0.07,
        'T': 0.04
      }
      
      const phDropPerYear = ANNUAL_PH_DROP[plan.soil_type as string] || 0.07
      
      // Sort applications
      const sortedApps = [...(plan.applications || [])].sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year
        const seasonOrder = { jaro: 1, leto: 2, podzim: 3 }
        return (seasonOrder[a.season as keyof typeof seasonOrder] || 2) - (seasonOrder[b.season as keyof typeof seasonOrder] || 2)
      })
      
      for (let idx = 0; idx < sortedApps.length; idx++) {
        const app = sortedApps[idx]
        const previousApp = idx > 0 ? sortedApps[idx - 1] : null
        const yearsGap = previousApp ? app.year - previousApp.year : 0
        
        // Add acidification rows between applications
        if (idx > 0 && yearsGap > 1) {
          for (let i = 1; i < yearsGap; i++) {
            const yearNumber = previousApp!.year + i
            const phStart = previousApp!.ph_after - (phDropPerYear * (i - 1))
            const phEnd = previousApp!.ph_after - (phDropPerYear * i)
            
            expandedApplications.push({
              rok: yearNumber,
              obdobi: '—',
              produkt: `⬇️ Přirozená acidifikace půdy (${plan.soil_type === 'L' ? 'lehká' : plan.soil_type === 'S' ? 'střední' : 'těžká'})`,
              cao_obsah: '-',
              mgo_obsah: '-',
              davka_ha: '-',
              davka_celkem: '-',
              cao_ha: '-',
              mgo_ha: '-',
              ph_pred: phStart.toFixed(2),
              ph_po: phEnd.toFixed(2),
              mg_po: '-',
              doporuceni: '—'
            })
          }
        }
        
        // Add application row
        expandedApplications.push({
          rok: app.year,
          obdobi: app.season === 'jaro' ? '🌱 Jaro' : 
                  app.season === 'leto' ? '☀️ Léto' : '🍂 Podzim',
          produkt: app.product_name,
          cao_obsah: `${app.cao_content}%`,
          mgo_obsah: `${app.mgo_content}%`,
          davka_ha: `${app.dose_per_ha.toFixed(2)} t/ha`,
          davka_celkem: `${app.total_dose.toFixed(1)} t`,
          cao_ha: `${app.cao_per_ha.toFixed(2)} t/ha`,
          mgo_ha: app.mgo_per_ha ? `${app.mgo_per_ha.toFixed(2)} t/ha` : '-',
          ph_pred: app.ph_before.toFixed(1),
          ph_po: app.ph_after.toFixed(1),
          mg_po: app.mg_after ? `${Math.round(app.mg_after)} mg/kg` : '-',
          doporuceni: app.notes || ''
        })
      }
      
      // Add future projection rows (3 years after last application)
      if (sortedApps.length > 0) {
        const lastApp = sortedApps[sortedApps.length - 1]
        const projectionYears = 3
        
        for (let i = 1; i <= projectionYears; i++) {
          const yearNumber = lastApp.year + i
          const phStart = lastApp.ph_after - (phDropPerYear * (i - 1))
          const phEnd = lastApp.ph_after - (phDropPerYear * i)
          
          expandedApplications.push({
            rok: yearNumber,
            obdobi: '—',
            produkt: `⬇️ Přirozená acidifikace půdy (${plan.soil_type === 'L' ? 'lehká' : plan.soil_type === 'S' ? 'střední' : 'těžká'}) - projekce`,
            cao_obsah: '-',
            mgo_obsah: '-',
            davka_ha: '-',
            davka_celkem: '-',
            cao_ha: '-',
            mgo_ha: '-',
            ph_pred: phStart.toFixed(2),
            ph_po: phEnd.toFixed(2),
            mg_po: '-',
            doporuceni: '—'
          })
        }
      }
      
      const applicationsWs = XLSX.utils.json_to_sheet(expandedApplications)
      
      // Nastavení šířek sloupců pro aplikace
      applicationsWs['!cols'] = [
        { wch: 6 },  // rok
        { wch: 10 }, // obdobi
        { wch: 45 }, // produkt (wider for acidification text)
        { wch: 10 }, // cao_obsah
        { wch: 10 }, // mgo_obsah
        { wch: 12 }, // davka_ha
        { wch: 14 }, // davka_celkem
        { wch: 12 }, // cao_ha
        { wch: 12 }, // mgo_ha
        { wch: 8 },  // ph_pred
        { wch: 8 },  // ph_po
        { wch: 12 }, // mg_po
        { wch: 40 }  // doporuceni
      ]
      
      XLSX.utils.book_append_sheet(wb, applicationsWs, 'Časový plán')
      
      // Sheet 3: Upozornění (pokud existují)
      if (data.warnings && data.warnings.length > 0) {
        const warningsData = data.warnings.map((warning: string) => ({ Upozornění: warning }))
        const warningsWs = XLSX.utils.json_to_sheet(warningsData)
        warningsWs['!cols'] = [{ wch: 80 }]
        XLSX.utils.book_append_sheet(wb, warningsWs, 'Upozornění')
      }
      
      // Generuj název souboru
      const date = new Date().toISOString().split('T')[0]
      const filename = `Plan_vapneni_${parcel.custom_name.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.xlsx`
      
      // Export
      XLSX.writeFile(wb, filename)
      
      console.log('Excel exported successfully:', filename)
      
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Chyba při exportu do Excelu: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    } finally {
      setExporting(false)
    }
  }
  
  async function handleExportPDF() {
    setExporting(true)
    
    try {
      // Convert database format to PDF format
      const pdfPlan: PDFLimingPlan = {
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
          name: parcel.custom_name,
          code: '', // not available in this context
          area: parcel.area_ha,
          soil_type: plan.soil_type,
          culture: undefined,
        },
        applications: plan.applications?.map((app: any) => ({
          id: app.id || '',
          year: app.year,
          season: app.season === 'leto' ? 'podzim' : app.season,
          sequence_order: app.sequence_order || 0,
          product_name: app.product_name,
          cao_content: app.cao_content,
          mgo_content: app.mgo_content,
          dose_per_ha: app.dose_per_ha,
          total_dose: app.total_dose,
          cao_per_ha: app.cao_per_ha,
          mgo_per_ha: app.mgo_per_ha,
          ph_before: app.ph_before,
          ph_after: app.ph_after,
          mg_after: app.mg_after || null,
          notes: app.notes || null,
          status: app.status || 'planned',
          product_price_per_ton: app.product_price_per_ton || null,
        })) || [],
      }

      // Generate PDF
      const blob = await exportLimingPlanPDF(pdfPlan, { includePrice: true })
      
      // Generate filename
      const filename = generateLimingPlanFilename(parcel.custom_name)
      
      // Download
      downloadPDF(blob, filename)
      
      console.log('PDF exported successfully:', filename)
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Chyba při exportu do PDF: ' + (error instanceof Error ? error.message : 'Neznámá chyba'))
    } finally {
      setExporting(false)
    }
  }

  function handleExport() {
    if (exportFormat === 'excel') {
      handleExportExcel()
    } else {
      handleExportPDF()
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      {/* Format selector */}
      <div className="flex rounded-lg overflow-hidden border border-gray-300">
        <button
          onClick={() => setExportFormat('pdf')}
          disabled={exporting}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            exportFormat === 'pdf'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Export do PDF"
        >
          <FileDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => setExportFormat('excel')}
          disabled={exporting}
          className={`px-3 py-2 text-sm font-medium transition-colors border-l ${
            exportFormat === 'excel'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Export do Excelu"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className={className || `flex items-center gap-2 px-4 py-2 ${
          exportFormat === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        } text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
      >
        {exporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Exportuji...</span>
          </>
        ) : (
          <>
            {exportFormat === 'pdf' ? (
              <>
                <FileDown className="w-5 h-5" />
                <span>Export PDF</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export Excel</span>
              </>
            )}
          </>
        )}
      </button>
    </div>
  )
}

