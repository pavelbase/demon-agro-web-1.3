import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
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

  // Fetch all users with their stats
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      company_name,
      ico,
      district,
      phone,
      address,
      ai_extractions_limit,
      ai_extractions_used_today,
      created_at,
      last_sign_in_at
    `)
    .order('created_at', { ascending: false })

  // Fetch parcel counts and areas for each user
  const usersWithStats = await Promise.all(
    (users || []).map(async (user) => {
      const { data: parcels } = await supabase
        .from('parcels')
        .select('area')
        .eq('user_id', user.id)
        .eq('status', 'active')

      const parcelCount = parcels?.length || 0
      const totalArea = parcels?.reduce((sum, p) => sum + (p.area || 0), 0) || 0

      return {
        ...user,
        parcel_count: parcelCount,
        total_area: totalArea,
      }
    })
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Správa uživatelů</h2>
        <p className="text-gray-600 mt-1">
          Přehled všech uživatelů a jejich aktivit v portálu
        </p>
      </div>

      {/* Users Table */}
      <UsersTable users={usersWithStats} />
    </div>
  )
}
