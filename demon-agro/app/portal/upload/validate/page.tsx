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

  // Fetch parcel details
  const { data: parcel } = await supabase
    .from('parcels')
    .select('id, name, cadastral_number, area, soil_type, culture')
    .eq('id', extractedData.parcelId)
    .eq('user_id', user.id)
    .single()

  if (!parcel) {
    redirect('/portal/upload')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ExtractionValidator
        extractedData={extractedData}
        parcel={parcel as any}
        userId={user.id}
      />
    </div>
  )
}
