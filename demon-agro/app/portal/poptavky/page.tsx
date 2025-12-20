import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, Package, Calendar, CheckCircle } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { LimingRequestsTable } from '@/components/portal/LimingRequestsTable'

export default async function LimingRequestsPage({
  searchParams,
}: {
  searchParams: { success?: string; id?: string }
}) {
  const user = await requireAuth()
  const supabase = createClient()

  // Fetch user's liming requests with items count
  const { data: requests } = await supabase
    .from('liming_requests')
    .select(`
      *,
      liming_request_items (
        id,
        parcel_id,
        product_name,
        quantity,
        unit
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const limingRequests = requests || []

  // Show success message if redirected after creating request
  const showSuccess = searchParams.success === 'true'
  const newRequestId = searchParams.id

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Poptávky vápnění
              </h1>
              <p className="text-gray-600 mt-1">
                Přehled všech vašich poptávek a jejich stav
              </p>
            </div>
            <Link
              href="/portal/poptavky/nova"
              className="flex items-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nová poptávka
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">
                Poptávka byla úspěšně odeslána!
              </p>
              <p className="text-sm text-green-800 mt-1">
                Budeme vás kontaktovat s cenovou nabídkou do 48 hodin.
                {newRequestId && (
                  <> Číslo poptávky: <span className="font-mono">{newRequestId.substring(0, 8)}</span></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Requests List or Empty State */}
        {limingRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Zatím nemáte žádné poptávky
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Vytvořte poptávku vápnění pro své pozemky. Vypočítáme potřebu,
              doporučíme produkt a připravíme cenovou nabídku.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/portal/pozemky"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-green text-primary-green rounded-lg hover:bg-primary-green hover:text-white transition-colors"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Přejít na pozemky
              </Link>
              <Link
                href="/portal/poptavky/nova"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-green text-white rounded-lg hover:bg-primary-brown transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nová poptávka
              </Link>
            </div>
          </div>
        ) : (
          <LimingRequestsTable requests={limingRequests} />
        )}
      </div>
    </div>
  )
}
