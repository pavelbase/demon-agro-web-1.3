import Link from 'next/link'
import { ClipboardList, Layers, Map, Sprout } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getCropParcelsOverview, getCrops } from '@/lib/database/application-queries'
import { getLandBlocks } from '@/lib/database/land-block-queries'
import { CropParcelsTable } from '@/components/portal/CropParcelsTable'

/**
 * Parcely a osevy pro evidenci hnojiv a POR
 *
 * Parcela je evidenční jednotka uvnitř dílu půdního bloku – v jednom DPB jich
 * může být víc a každá může mít jinou plodinu. Osev drží plodinu v sezóně
 * a termíny setí a sklizně, ze kterých vychází kontrola ochranných lhůt.
 */
export default async function ParcelyPage() {
  await requireAuth()

  const [parcels, landBlocks, crops] = await Promise.all([
    getCropParcelsOverview(),
    getLandBlocks(),
    getCrops(),
  ])

  const withoutBlock = parcels.filter((parcel) => !parcel.landBlockId).length
  const missingHarvest = parcels.reduce(
    (sum, parcel) =>
      sum + parcel.crops.filter((crop) => !crop.harvestDate && crop.applicationCount > 0).length,
    0
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <Layers className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parcely a osevy</h1>
            <p className="mt-1 text-gray-600">
              Evidenční parcely uvnitř dílů půdních bloků a plodiny v jednotlivých sezónách
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal/hnojiva-por/pozemky"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Map className="h-4 w-4" />
            Pozemky (DPB)
          </Link>
          <Link
            href="/portal/hnojiva-por/evidence"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ClipboardList className="h-4 w-4" />
            Evidence aplikací
          </Link>
        </div>
      </div>

      {landBlocks.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Zatím nemáte naimportované díly půdních bloků z LPIS.</p>
          <p className="mt-1">
            Bez vazby na DPB nelze kontrolovat zranitelnou oblast, erozní ohroženost ani vzdálenost
            od vody.{' '}
            <Link href="/portal/hnojiva-por/pozemky" className="font-medium underline">
              Naimportovat DPB
            </Link>
          </p>
        </div>
      )}

      {(withoutBlock > 0 || missingHarvest > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {withoutBlock > 0 && (
            <div className="rounded-lg bg-white p-4 shadow-md">
              <p className="text-xs text-gray-500">Parcel bez vazby na DPB</p>
              <p className="text-xl font-bold text-gray-900">{withoutBlock}</p>
              <p className="mt-1 text-xs text-gray-500">
                U těchto parcel kontrola nezná legislativní atributy pozemku.
              </p>
            </div>
          )}
          {missingHarvest > 0 && (
            <div className="rounded-lg bg-white p-4 shadow-md">
              <p className="text-xs text-gray-500">Osevů s aplikacemi bez termínu sklizně</p>
              <p className="text-xl font-bold text-gray-900">{missingHarvest}</p>
              <p className="mt-1 text-xs text-gray-500">
                Doplněním termínu se ověří dodržení ochranných lhůt.
              </p>
            </div>
          )}
        </div>
      )}

      {parcels.length === 0 && (
        <div className="mb-4 rounded-lg bg-white p-8 text-center shadow-md">
          <Sprout className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Zatím nemáte žádnou parcelu</h2>
          <p className="mx-auto max-w-xl text-sm text-gray-600">
            Založte parcely podle toho, jak vedete evidenci – obvykle jedna parcela na díl půdního
            bloku, u rozdělených bloků víc parcel s vlastní plodinou.
          </p>
        </div>
      )}

      <CropParcelsTable
        parcels={parcels}
        landBlocks={landBlocks.map((block) => ({
          id: block.id,
          dpbCode: block.dpb_code,
          area: Number(block.area),
          cadastralArea: block.cadastral_area,
        }))}
        crops={crops.map((crop) => ({ id: crop.id, name: crop.name }))}
      />
    </div>
  )
}
