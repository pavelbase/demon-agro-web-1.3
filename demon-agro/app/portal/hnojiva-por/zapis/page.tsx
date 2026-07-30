import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getCropParcels, getRecentProducts } from '@/lib/database/application-queries'
import { FieldLogForm, type FieldParcel } from '@/components/portal/FieldLogForm'

/**
 * Zápis aplikace z pole
 *
 * Provozní režim portálu – běží přes celou obrazovku bez navigace, aby obsluze
 * v kabině nepřekážely ostatní funkce. Do evidence se zápis dostane až po
 * schválení na /portal/hnojiva-por/schvaleni.
 */
export const metadata = {
  title: 'Zápis z pole',
}

export default async function FieldLogPage() {
  await requireAuth()

  const [parcels, recentProducts] = await Promise.all([getCropParcels(), getRecentProducts()])

  const fieldParcels: FieldParcel[] = parcels.map((parcel) => ({
    id: parcel.id,
    name: parcel.name,
    area: Number(parcel.area),
    blockCode: parcel.block_code,
    // Osevy jsou seřazené od nejnovější sezóny – na poli se plodina jen zobrazuje
    cropName: parcel.crops?.[0]?.crop_name ?? null,
  }))

  return <FieldLogForm parcels={fieldParcels} recentProducts={recentProducts} />
}
