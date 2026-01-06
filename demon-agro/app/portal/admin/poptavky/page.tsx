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

  // Build query WITHOUT problematic joins
  let query = supabase
    .from('liming_requests')
    .select(`
      *,
      liming_request_items(
        id,
        parcel_id,
        product_name,
        quantity
      )
    `)
    .order('created_at', { ascending: false })

  // Apply status filter
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: rawRequests } = await query
  
  // Use contact information from liming_requests table
  // (These are filled when user creates a request)
  const requests = (rawRequests || []).map((request) => {
    return {
      ...request,
      profiles: {
        full_name: request.contact_person,
        company_name: null, // Not available in request table
        district: null, // Not available in request table
        email: request.contact_email,
        phone: request.contact_phone,
      }
    }
  })
  
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
