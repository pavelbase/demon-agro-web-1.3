import Link from 'next/link'
import { CheckCircle2, ClipboardCheck, Plus } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getPendingFieldLogs, readFindings } from '@/lib/database/application-queries'
import {
  FieldLogApprovalList,
  type PendingFieldLog,
} from '@/components/portal/FieldLogApprovalList'

/**
 * Schválení zápisů z pole
 *
 * Brána mezi provozem a evidenční knihou: co se zapsalo v poli, se do evidence
 * hnojiv a POR propíše až tady. Kontroly už proběhly při uložení, takže je
 * u každého zápisu vidět, co je potřeba dohledat, než se schválí.
 */
export default async function FieldLogApprovalPage() {
  await requireAuth()

  const pending = await getPendingFieldLogs()

  const logs: PendingFieldLog[] = pending.map((application) => ({
    id: application.id,
    parcelName: application.parcel?.name ?? 'Neznámá parcela',
    cropName: application.parcel_crop?.crop_name ?? null,
    applicationDate: application.application_date,
    appliedArea: Number(application.applied_area),
    parcelArea: application.parcel ? Number(application.parcel.area) : null,
    notes: application.notes,
    hasCrop: application.parcel_crop !== null,
    findings: readFindings(application),
    items: application.items.map((item) => ({
      kind: item.kind,
      productName: item.product_name,
      dose: Number(item.dose),
      unit: item.unit,
      targetPest: item.target_pest,
    })),
  }))

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Zápisy ke schválení</h1>
            <p className="mt-1 text-gray-600">
              Aplikace zapsané přímo z provozu. Do evidence hnojiv a POR se propíšou až po
              schválení.
            </p>
          </div>
        </div>

        <Link
          href="/portal/hnojiva-por/zapis"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          Zápis z pole
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Nic nečeká</h2>
          <p className="mx-auto max-w-xl text-sm text-gray-600">
            Všechny zápisy z pole jsou schválené a najdete je v evidenci aplikací.
          </p>
          <Link
            href="/portal/hnojiva-por/evidence"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Evidence aplikací
          </Link>
        </div>
      ) : (
        <FieldLogApprovalList logs={logs} />
      )}
    </div>
  )
}
