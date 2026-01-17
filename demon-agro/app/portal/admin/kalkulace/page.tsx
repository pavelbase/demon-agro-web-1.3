import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { Calculator } from 'lucide-react'
import { CalculatorSubmissionsTable } from '@/components/admin/CalculatorSubmissionsTable'

export default async function AdminCalculatorPage({
  searchParams,
}: {
  searchParams: { page?: string; viewed?: string; marketing?: string }
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return <div>Unauthorized</div>
  }

  // Fetch calculator submissions
  let query = supabase
    .from('calculator_usage')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.viewed === 'false') {
    query = query.eq('viewed_by_admin', false)
  } else if (searchParams.viewed === 'true') {
    query = query.eq('viewed_by_admin', true)
  }

  if (searchParams.marketing === 'true') {
    query = query.eq('calculation_data->>marketing_consent', 'true')
  }

  const { data: submissions, error } = await query

  if (error) {
    console.error('Error fetching calculator submissions:', error)
    return <div>Chyba při načítání dat</div>
  }

  // Stats
  const totalSubmissions = submissions?.length || 0
  const unviewedCount = submissions?.filter(s => !s.viewed_by_admin).length || 0
  const marketingConsentCount = submissions?.filter(s => 
    s.calculation_data?.marketing_consent === true
  ).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-8 w-8 text-primary-green" />
          <h1 className="text-3xl font-bold text-gray-900">
            Kalkulace vápnění
          </h1>
        </div>
        <p className="text-gray-600">
          Výsledky z veřejné kalkulačky na webu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Celkem kalkulací</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubmissions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-600">Neprohlédnuté</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{unviewedCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Souhlas s marketingem</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{marketingConsentCount}</p>
        </div>
      </div>

      {/* Table */}
      <CalculatorSubmissionsTable 
        submissions={submissions || []} 
        initialFilters={{
          viewed: searchParams.viewed,
          marketing: searchParams.marketing
        }}
      />
    </div>
  )
}



