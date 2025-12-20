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
  
  // Create Supabase client and fetch user profile to check role
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // If there's an error fetching the profile or user is not admin, redirect to dashboard
  // REDIRECT DISABLED FOR DEBUGGING
  // if (error || !profile || profile.role !== 'admin') {
  //   redirect('/portal/dashboard')
  // }

  // DEBUG MODE: Show debug info instead of redirecting
  if (error || !profile || profile.role !== 'admin') {
    return (
      <div className="p-10 bg-red-100 text-red-800 m-10 border-2 border-red-500">
        <h1 className="text-2xl font-bold">Přístup zamítnut (DEBUG MODE)</h1>
        <p>Tato obrazovka se zobrazuje místo redirectu.</p>
        <pre className="mt-4 p-4 bg-black text-white rounded">
          {`User ID: ${user?.id}
Profile Role: ${profile?.role}
Profile Error: ${JSON.stringify(error, null, 2)}
Profile Data: ${JSON.stringify(profile, null, 2)}`}
        </pre>
      </div>
    )
  }

  // User is confirmed admin - render admin interface

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
