import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { SoilAnalysisUpload } from '@/components/portal/SoilAnalysisUpload'
import type { Parcel } from '@/lib/types/database'

export default async function UploadPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch user's active parcels for dropdown
  const { data: parcels } = await supabase
    .from('parcels')
    .select('id, name, cadastral_number, area')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nahrání rozborů půdy
        </h1>
        <p className="text-gray-600">
          Nahrajte PDF soubor s rozborem půdy. AI automaticky rozpozná hodnoty a přiřadí je k vybranému pozemku.
        </p>
      </div>

      {/* Upload Component */}
      <SoilAnalysisUpload parcels={(parcels as Parcel[]) || []} />

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Podporované formáty rozborů
        </h2>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span><strong>PDF soubory</strong> - Rozbory od všech laboratoří (UL, ZEPOS, atd.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span><strong>Automatické rozpoznání</strong> - AI extrahuje pH, P, K, Mg, Ca automaticky</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span><strong>Kontrola dat</strong> - Po načtení můžete data zkontrolovat a upravit před uložením</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span><strong>Manuální zadání</strong> - Pokud AI nerozpozná data, můžete je zadat ručně</span>
          </li>
        </ul>
      </div>

      {/* Technical Info */}
      <div className="mt-6 text-sm text-gray-600 space-y-2">
        <p>
          <strong>Tip:</strong> Pro nejlepší výsledky nahrajte čitelné PDF s kvalitním skenem nebo digitálním exportem.
        </p>
        <p>
          <strong>Maximální velikost:</strong> 10 MB
        </p>
        <p>
          <strong>Podpora:</strong> Pokud máte problémy s nahráváním, kontaktujte nás na{' '}
          <a href="mailto:base@demonagro.cz" className="text-primary-green hover:underline">
            base@demonagro.cz
          </a>
        </p>
      </div>
    </div>
  )
}
