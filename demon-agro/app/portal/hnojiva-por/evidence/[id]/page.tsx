import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getApplication } from '@/lib/database/application-queries'
import { getFormParcels } from '@/lib/database/application-form-data'
import { ApplicationForm, type FormApplication } from '@/components/portal/ApplicationForm'

/**
 * Úprava evidované aplikace
 *
 * Po uložení se kontroly spustí znovu, takže stav záznamu vždy odpovídá
 * aktuálním údajům.
 */
export default async function UpravitAplikaciPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()

  const { id } = await params
  const [application, parcels] = await Promise.all([getApplication(id), getFormParcels()])

  if (!application) notFound()

  const formApplication: FormApplication = {
    id: application.id,
    cropParcelId: application.crop_parcel_id,
    parcelCropId: application.parcel_crop_id,
    applicationDate: application.application_date,
    appliedArea: Number(application.applied_area),
    mode: application.mode,
    method: application.method,
    notes: application.notes,
    items: application.items.map((item) => ({
      kind: item.kind,
      productName: item.product_name,
      porItemId: item.por_item_id,
      fertEvidenceNumber: item.fert_evidence_number,
      dose: Number(item.dose),
      unit: item.unit,
      targetPest: item.target_pest,
      nKgHa: item.n_kg_ha !== null ? Number(item.n_kg_ha) : null,
      batch: item.batch,
    })),
  }

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
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <Pencil className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Úprava aplikace</h1>
            <p className="mt-1 text-gray-600">
              {application.parcel?.name} ·{' '}
              {new Date(application.application_date).toLocaleDateString('cs-CZ')}
              {application.parcel_crop?.crop_name ? ` · ${application.parcel_crop.crop_name}` : ''}
            </p>
          </div>
        </div>
      </div>

      <ApplicationForm parcels={parcels} application={formApplication} />
    </div>
  )
}
