import Link from 'next/link'
import { ArrowLeft, Layers, Map, Plus } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getFormParcels } from '@/lib/database/application-form-data'
import { ApplicationForm } from '@/components/portal/ApplicationForm'

/**
 * Nová aplikace hnojiv nebo přípravků
 *
 * Produkty se vybírají z registru ÚKZÚZ, takže záznam má vazbu na registraci
 * a kontroly mohou porovnat plodinu, dávku i ochrannou lhůtu.
 */
export default async function NovaAplikacePage() {
  await requireAuth()

  const parcels = await getFormParcels()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link
          href="/portal/hnojiva-por/evidence"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Evidence aplikací
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Plus className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nová aplikace</h1>
              <p className="mt-1 text-gray-600">
                Zápis do evidenční knihy včetně kontroly registrovaného použití
              </p>
            </div>
          </div>
          <Link
            href="/portal/hnojiva-por/evidence/hromadne"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Layers className="h-4 w-4" />
            Souhrnné zadání na více parcel
          </Link>
        </div>
      </div>

      {parcels.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <Map className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Nejdřív založte parcely</h2>
          <p className="mx-auto mb-6 max-w-lg text-sm text-gray-600">
            Aplikace se eviduje na parcele uvnitř dílu půdního bloku. Bez parcely a osevu nelze
            zkontrolovat registrované použití ani ochrannou lhůtu.
          </p>
          <Link
            href="/portal/hnojiva-por/parcely"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            <Map className="h-4 w-4" />
            Parcely a osevy
          </Link>
        </div>
      ) : (
        <ApplicationForm parcels={parcels} />
      )}
    </div>
  )
}
