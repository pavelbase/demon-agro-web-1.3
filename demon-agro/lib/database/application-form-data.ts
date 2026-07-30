/**
 * Podklady pro formulář aplikace – parcely s osevy a poznámkou o DPB
 */

import { getCropParcels } from '@/lib/database/application-queries'
import type { FormParcel } from '@/components/portal/ApplicationForm'
import type { LandBlock } from '@/lib/types/database'

/** Krátká poznámka o omezeních DPB, aby je uživatel viděl při zápisu. */
function landBlockNote(block: LandBlock | null): string | null {
  if (!block) return null

  const notes: string[] = [`DPB ${block.dpb_code}`]

  if (block.nitrate_vulnerable_zone) {
    notes.push(
      block.application_zone ? `zranitelná oblast, pásmo ${block.application_zone}` : 'zranitelná oblast'
    )
  }
  if (block.erosion_class && block.erosion_class !== 'NEO') {
    notes.push(`erozně ohrožený ${block.erosion_class}`)
  }
  if (block.water_distance_m !== null) {
    notes.push(`${Number(block.water_distance_m).toFixed(0)} m od vody`)
  }

  return notes.join(' · ')
}

export async function getFormParcels(): Promise<FormParcel[]> {
  const parcels = await getCropParcels()

  return parcels.map((parcel) => ({
    id: parcel.id,
    name: parcel.name,
    area: Number(parcel.area),
    blockCode: parcel.block_code,
    landBlockNote: landBlockNote(parcel.land_block),
    crops: (parcel.crops ?? []).map((crop) => ({
      id: crop.id,
      cropName: crop.crop_name,
      season: crop.season,
      sowingDate: crop.sowing_date,
      harvestDate: crop.harvest_date,
      area: crop.area !== null ? Number(crop.area) : null,
    })),
  }))
}
