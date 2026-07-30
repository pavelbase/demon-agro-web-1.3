import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { ExtractionValidatorLoader } from '@/components/portal/ExtractionValidatorLoader'

export default async function ValidatePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Extrahovaná data se čtou z sessionStorage na klientovi (viz
  // ExtractionValidatorLoader.tsx), ne z URL query param - u dokumentů
  // s desítkami pozemků by URL přesáhla limity prohlížeče/serveru.

  // Fetch user's active parcels for selection/matching
  const { data: parcels } = await supabase
    .from('parcels')
    .select('id, name, cadastral_number, area, soil_type, culture')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      <ExtractionValidatorLoader
        parcels={(parcels as any[]) || []}
        userId={user.id}
      />
    </div>
  )
}
