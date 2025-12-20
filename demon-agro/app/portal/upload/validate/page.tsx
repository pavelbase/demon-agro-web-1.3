import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { ExtractionValidator } from '@/components/portal/ExtractionValidator'
import { redirect } from 'next/navigation'

interface ValidatePageProps {
  searchParams: { data?: string }
}

export default async function ValidatePage({ searchParams }: ValidatePageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Parse extracted data from query param
  if (!searchParams.data) {
    redirect('/portal/upload')
  }

  let extractedData
  try {
    extractedData = JSON.parse(decodeURIComponent(searchParams.data))
  } catch (error) {
    redirect('/portal/upload')
  }

  // Fetch user's active parcels for selection/matching
  const { data: parcels } = await supabase
    .from('parcels')
    .select('id, name, cadastral_number, area, soil_type, culture')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <ExtractionValidator
        extractedData={extractedData}
        parcels={(parcels as any[]) || []}
        userId={user.id}
      />
    </div>
  )
}
