import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgroManagerCalculator } from '@/components/admin/AgroManagerCalculator'
import { Calculator } from 'lucide-react'

export const metadata = {
  title: 'AgroManažer | Admin',
  description: 'Kalkulačka ziskovosti aplikace hnojiv pro zemědělské zakázky',
}

export default async function AgroManagerPage() {
  // Require authentication
  const user = await requireAuth()
  
  // Verify admin role
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.role !== 'admin') {
    redirect('/portal/dashboard')
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Kompaktní Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary-green" />
        <h1 className="text-lg font-bold text-gray-900">AgroManažer</h1>
        <span className="text-xs text-gray-500">Kalkulačka ziskovosti</span>
      </div>

      {/* Calculator Component - Full Height */}
      <div className="flex-1 overflow-hidden">
        <AgroManagerCalculator />
      </div>
    </div>
  )
}

