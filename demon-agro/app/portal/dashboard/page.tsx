import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vítejte zpět! 👋
        </h2>
        <p className="text-gray-600">
          Přehled vašeho hospodářství a rychlý přístup k důležitým funkcím.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pozemky</h3>
          <p className="text-3xl font-bold text-primary-green">0</p>
          <p className="text-xs text-gray-500 mt-1">celkem</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Rozbory půdy</h3>
          <p className="text-3xl font-bold text-primary-green">0</p>
          <p className="text-xs text-gray-500 mt-1">aktivní</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Poptávky</h3>
          <p className="text-3xl font-bold text-primary-green">0</p>
          <p className="text-xs text-gray-500 mt-1">otevřené</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Celková plocha</h3>
          <p className="text-3xl font-bold text-primary-green">0</p>
          <p className="text-xs text-gray-500 mt-1">hektarů</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rychlé akce
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/portal/upload"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-green hover:bg-primary-cream transition-colors"
          >
            <div className="p-2 bg-primary-green bg-opacity-10 rounded-lg">
              <svg className="h-5 w-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Nahrát rozbor půdy</p>
              <p className="text-sm text-gray-500">PDF soubor</p>
            </div>
          </a>
          
          <a
            href="/portal/pozemky"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-green hover:bg-primary-cream transition-colors"
          >
            <div className="p-2 bg-primary-green bg-opacity-10 rounded-lg">
              <svg className="h-5 w-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Spravovat pozemky</p>
              <p className="text-sm text-gray-500">Přehled a detaily</p>
            </div>
          </a>
          
          <a
            href="/portal/poptavky/nova"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-green hover:bg-primary-cream transition-colors"
          >
            <div className="p-2 bg-primary-green bg-opacity-10 rounded-lg">
              <svg className="h-5 w-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Nová poptávka</p>
              <p className="text-sm text-gray-500">Vápnění</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
