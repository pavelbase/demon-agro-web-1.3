import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require authentication
  const user = await requireAuth()
  
  // Fetch user profile to check role
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Debug logging
  console.log('[Admin Layout] User ID:', user.id)
  console.log('[Admin Layout] Profile data:', profile)
  console.log('[Admin Layout] Profile error:', error)
  console.log('[Admin Layout] User metadata role:', user.user_metadata?.role)
  console.log('[Admin Layout] App metadata role:', user.app_metadata?.role)

  // If not admin, redirect to dashboard
  if (!profile || profile.role !== 'admin') {
    console.log('[Admin Layout] Access denied - redirecting to dashboard')
    redirect('/portal/dashboard')
  }

  console.log('[Admin Layout] Access granted - user is admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Administrace
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Správa portálu Démon Agro
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
