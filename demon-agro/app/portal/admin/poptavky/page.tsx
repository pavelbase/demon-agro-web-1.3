import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminRequestsTable } from '@/components/admin/AdminRequestsTable'

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/portal/dashboard')
  }

  // Build query
  let query = supabase
    .from('liming_requests')
    .select(`
      *,
      profiles!inner(
        full_name,
        company_name,
        district,
        email,
        phone
      ),
      liming_request_items(
        id,
        parcel_id,
        product_name,
        quantity
      )
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.ilike('profiles.company_name', `%${searchParams.search}%`)
  }

  const { data: requests } = await query

  // Count new requests for badge
  const { count: newCount } = await supabase
    .from('liming_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Správa poptávek</h2>
        <p className="text-gray-600 mt-1">
          Přehled a zpracování poptávek vápnění
        </p>
      </div>

      {/* Requests Table */}
      <AdminRequestsTable 
        requests={requests || []} 
        newCount={newCount || 0}
      />
    </div>
  )
}
