import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { NewLimingRequestForm } from '@/components/portal/NewLimingRequestForm'

export default async function NewLimingRequestPage() {
  const user = await requireAuth()
  const supabase = createClient()

  // Fetch user profile for pre-filling contact info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/portal/poptavky"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-green mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zpět na poptávky
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Nová poptávka vápnění
          </h1>
          <p className="text-gray-600 mt-1">
            Vyplňte detaily a my vás budeme kontaktovat s cenovou nabídkou
          </p>
        </div>

        {/* Form */}
        <NewLimingRequestForm profile={profile} />
      </div>
    </div>
  )
}
