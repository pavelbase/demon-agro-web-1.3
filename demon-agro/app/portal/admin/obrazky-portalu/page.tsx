import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalImagesManager } from '@/components/admin/PortalImagesManager'

export default async function AdminPortalImagesPage() {
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

  // Fetch all portal images
  const { data: images } = await supabase
    .from('portal_images')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Správa obrázků portálu</h2>
        <p className="text-gray-600 mt-1">
          Galerie na landing page portálu
        </p>
      </div>

      {/* Images Manager */}
      <PortalImagesManager images={images || []} />
    </div>
  )
}
