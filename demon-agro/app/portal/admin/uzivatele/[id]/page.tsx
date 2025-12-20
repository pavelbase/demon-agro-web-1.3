import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { logAdminAccess } from '@/lib/actions/admin-audit'
import { UserDetailHeader } from '@/components/admin/UserDetailHeader'
import { UserDetailTabs } from '@/components/admin/UserDetailTabs'

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { tab?: string }
}) {
  const admin = await requireAuth()
  const supabase = createClient()

  // Check admin role
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', admin.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    redirect('/portal/dashboard')
  }

  // Fetch user
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!user) {
    notFound()
  }

  // Fetch user's parcels
  const { data: parcels } = await supabase
    .from('parcels')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch latest soil analyses for each parcel
  const parcelsWithAnalyses = await Promise.all(
    (parcels || []).map(async (parcel) => {
      const { data: analyses } = await supabase
        .from('soil_analyses')
        .select('*')
        .eq('parcel_id', parcel.id)
        .order('analysis_date', { ascending: false })
        .limit(1)

      return {
        ...parcel,
        latest_analysis: analyses?.[0] || null,
      }
    })
  )

  // Fetch all soil analyses
  const { data: allAnalyses } = await supabase
    .from('soil_analyses')
    .select(`
      *,
      parcels!inner(name, code)
    `)
    .eq('parcels.user_id', user.id)
    .order('analysis_date', { ascending: false })

  // Fetch liming requests
  const { data: limingRequests } = await supabase
    .from('liming_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch activity logs
  const { data: activityLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Log admin access
  const currentTab = searchParams.tab || 'pozemky'
  await logAdminAccess(user.id, 'view_user_detail', { tab: currentTab })

  return (
    <div className="space-y-6">
      {/* Header */}
      <UserDetailHeader user={user} />

      {/* Tabs */}
      <UserDetailTabs
        currentTab={currentTab}
        parcels={parcelsWithAnalyses}
        analyses={allAnalyses || []}
        limingRequests={limingRequests || []}
        activityLogs={activityLogs || []}
      />
    </div>
  )
}
