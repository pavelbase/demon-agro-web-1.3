import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { PDFUploadZone } from '@/components/portal/PDFUploadZone'
import type { Parcel } from '@/lib/types/database'
import { FileText, Upload, Zap } from 'lucide-react'

interface UploadPageProps {
  searchParams: { parcel?: string }
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch user's active parcels for dropdown
  const { data: parcels } = await supabase
    .from('parcels')
    .select('id, name, cadastral_number, area')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  // Get today's extraction count for this user
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count: extractionsToday } = await supabase
    .from('soil_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  const remainingExtractions = Math.max(0, 10 - (extractionsToday || 0))
  const isLimitReached = remainingExtractions === 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nahrání rozborů půdy
        </h1>
        <p className="text-gray-600">
          Nahrajte PDF dokument s rozborem půdy. AI automaticky rozpozná hodnoty a přiřadí je k pozemku.
        </p>
      </div>

      {/* Extraction Limit Banner */}
      <div className={`mb-6 rounded-lg p-4 border ${
        isLimitReached 
          ? 'bg-red-50 border-red-200' 
          : remainingExtractions <= 3
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center gap-3">
          <Zap className={`h-5 w-5 ${
            isLimitReached 
              ? 'text-red-600' 
              : remainingExtractions <= 3
                ? 'text-orange-600'
                : 'text-blue-600'
          }`} />
          <div className="flex-1">
            <p className={`font-medium ${
              isLimitReached 
                ? 'text-red-900' 
                : remainingExtractions <= 3
                  ? 'text-orange-900'
                  : 'text-blue-900'
            }`}>
              {isLimitReached
                ? 'Denní limit extrakcí vyčerpán'
                : `Zbývající extrakce: ${remainingExtractions} z 10`
              }
            </p>
            <p className={`text-sm mt-0.5 ${
              isLimitReached 
                ? 'text-red-700' 
                : remainingExtractions <= 3
                  ? 'text-orange-700'
                  : 'text-blue-700'
            }`}>
              {isLimitReached
                ? 'Denní limit byl vyčerpán. Zkuste to prosím zítra nebo kontaktujte podporu.'
                : 'Denní limit se obnoví o půlnoci.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Upload Component */}
      {!isLimitReached ? (
        <PDFUploadZone
          parcels={(parcels as Parcel[]) || []}
          preselectedParcelId={searchParams.parcel}
          userId={user.id}
          remainingExtractions={remainingExtractions}
        />
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Denní limit extrakcí byl vyčerpán
          </p>
          <p className="text-gray-600">
            Můžete nahrát nový rozbor zítra nebo{' '}
            <a href="mailto:base@demonagro.cz" className="text-primary-green hover:underline">
              kontaktovat podporu
            </a>
            {' '}pro zvýšení limitu.
          </p>
        </div>
      )}

      {/* Info Sections */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        {/* Supported Formats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Podporované formáty
          </h2>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>AZZP zpráva (ÚKZÚZ)</strong> - Agregovaný zemědělský zásobovací podnik</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Laboratorní protokoly</strong> - Standardní rozbory od akreditovaných laboratoří</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Automatická detekce</strong> - AI rozpozná typ dokumentu a extrahuje data</span>
            </li>
          </ul>
        </div>

        {/* How It Works */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Jak to funguje
          </h2>
          <ol className="space-y-2 text-green-800 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-green-600">1.</span>
              <span>Nahrajte PDF dokument (max 10 MB)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600">2.</span>
              <span>AI automaticky extrahuje pH, P, K, Mg, Ca hodnoty</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600">3.</span>
              <span>Zkontrolujte a upravte data před uložením</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-green-600">4.</span>
              <span>Přiřaďte rozbor k pozemku a uložte</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Technical Info */}
      <div className="mt-6 text-sm text-gray-600 space-y-2 bg-gray-50 rounded-lg p-4">
        <p>
          <strong>Maximální velikost:</strong> 10 MB
        </p>
        <p>
          <strong>Denní limit:</strong> 10 extrakcí na uživatele
        </p>
        <p>
          <strong>Podpora:</strong> Pokud máte problémy s nahráváním nebo extrakcí, kontaktujte nás na{' '}
          <a href="mailto:base@demonagro.cz" className="text-primary-green hover:underline">
            base@demonagro.cz
          </a>
        </p>
      </div>
    </div>
  )
}
