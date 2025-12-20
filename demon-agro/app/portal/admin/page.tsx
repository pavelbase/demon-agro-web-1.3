import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  MapPin, 
  Ruler, 
  FlaskConical, 
  ShoppingCart, 
  Brain,
  TrendingUp,
  Clock
} from 'lucide-react'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { RegistrationsChart } from '@/components/admin/RegistrationsChart'
import { RecentRequests } from '@/components/admin/RecentRequests'
import { RecentRegistrations } from '@/components/admin/RecentRegistrations'

export default async function AdminDashboardPage() {
  const user = await requireAuth()
  const supabase = createClient()

  // Fetch statistics
  const [
    usersResult,
    parcelsResult,
    analysesResult,
    requestsResult,
    aiUsageResult,
  ] = await Promise.all([
    // Total users (active vs inactive based on last_sign_in_at)
    supabase.from('profiles').select('id, created_at', { count: 'exact' }),
    
    // Total parcels and area
    supabase.from('parcels').select('area', { count: 'exact' }).eq('status', 'active'),
    
    // Total soil analyses
    supabase.from('soil_analyses').select('id', { count: 'exact' }),
    
    // New/unread liming requests (status = 'new')
    supabase.from('liming_requests').select('id', { count: 'exact' }).eq('status', 'new'),
    
    // AI usage today (from audit_logs)
    supabase
      .from('audit_logs')
      .select('id', { count: 'exact' })
      .eq('action', 'AI extrakce dat z PDF')
      .gte('created_at', new Date().toISOString().split('T')[0]),
  ])

  // Calculate total area
  const totalArea = parcelsResult.data?.reduce((sum, p) => sum + (p.area || 0), 0) || 0

  // Prepare stats
  const stats = {
    totalUsers: usersResult.count || 0,
    totalParcels: parcelsResult.count || 0,
    totalArea: totalArea,
    totalAnalyses: analysesResult.count || 0,
    newRequests: requestsResult.count || 0,
    aiUsageToday: aiUsageResult.count || 0,
  }

  // Fetch registrations for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: registrations } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Fetch recent liming requests (5 newest)
  const { data: recentRequests } = await supabase
    .from('liming_requests')
    .select(`
      id,
      status,
      total_area,
      total_quantity,
      created_at,
      profiles!inner(full_name, company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent registrations (5 newest)
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Přehled administrace
        </h2>
        <p className="text-gray-600 mt-1">
          Souhrn klíčových metrik a aktivit v portálu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem uživatelů</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Parcels */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem pozemků</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalParcels}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Area */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celková výměra</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalArea.toFixed(1)} <span className="text-xl text-gray-600">ha</span>
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Ruler className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Analyses */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem rozborů</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalAnalyses}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FlaskConical className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* New Requests */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nové poptávky</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.newRequests}
              </p>
              <p className="text-xs text-gray-500 mt-1">Čekají na zpracování</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <ShoppingCart className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* AI Usage Today */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI využití dnes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.aiUsageToday}
              </p>
              <p className="text-xs text-gray-500 mt-1">Extrakce z PDF</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Registrations Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-primary-green mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Nové registrace (posledních 30 dní)
          </h3>
        </div>
        <RegistrationsChart data={registrations || []} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <ShoppingCart className="h-6 w-6 text-primary-green mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Poslední poptávky
            </h3>
          </div>
          <RecentRequests requests={recentRequests || []} />
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-primary-green mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Poslední registrace
            </h3>
          </div>
          <RecentRegistrations users={recentUsers || []} />
        </div>
      </div>
    </div>
  )
}
