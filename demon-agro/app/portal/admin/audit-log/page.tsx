import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuditLogTable } from '@/components/admin/AuditLogTable'

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string; admin?: string; search?: string }
}) {
  const user = await requireAuth()
  const supabase = createClient()

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/portal/dashboard')
  }

  const page = parseInt(searchParams.page || '1')
  const pageSize = 50
  const offset = (page - 1) * pageSize

  // Build query - only [ADMIN] actions
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      admin:profiles!audit_logs_user_id_fkey(email, full_name, company_name)
    `, { count: 'exact' })
    .ilike('action', '[ADMIN]%')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  // Apply filters
  if (searchParams.admin) {
    query = query.eq('user_id', searchParams.admin)
  }

  if (searchParams.search) {
    query = query.ilike('action', `%${searchParams.search}%`)
  }

  const { data: logs, count } = await query

  // Fetch all admins for filter dropdown
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('role', 'admin')
    .order('email', { ascending: true })

  // For each log, fetch target user if record_id exists
  const logsWithTargetUser = await Promise.all(
    (logs || []).map(async (log) => {
      if (log.record_id && log.table_name === 'profiles') {
        const { data: targetUser } = await supabase
          .from('profiles')
          .select('company_name, full_name, email')
          .eq('id', log.record_id)
          .single()
        
        return {
          ...log,
          target_user: targetUser,
        }
      }
      return { ...log, target_user: null }
    })
  )

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-gray-600 mt-1">
          Přehled všech admin přístupů k datům uživatelů (GDPR transparentnost)
        </p>
      </div>

      {/* Audit Log Table */}
      <AuditLogTable
        logs={logsWithTargetUser}
        admins={admins || []}
        currentPage={page}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
