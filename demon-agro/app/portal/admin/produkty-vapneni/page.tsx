import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LimingProductsTable } from '@/components/admin/LimingProductsTable'

export default async function AdminLimingProductsPage() {
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

  // Fetch all liming products
  const { data: products } = await supabase
    .from('liming_products')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Správa produktů vápnění</h2>
        <p className="text-gray-600 mt-1">
          Přehled a správa vápencových produktů Démon Agro
        </p>
      </div>

      {/* Products Table */}
      <LimingProductsTable products={products || []} />
    </div>
  )
}
