import { Droplets, Map, Mountain, Ruler } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import {
  getLandBlocks,
  getLastLandBlockImport,
  summarizeLandBlocks,
} from '@/lib/database/land-block-queries'
import { LandBlocksTable } from '@/components/portal/LandBlocksTable'
import { LandBlocksImportDialog } from '@/components/portal/LandBlocksImportDialog'
import { lpisCultureLabel } from '@/lib/constants/land-blocks'

/**
 * Pozemky (DPB) – evidence pro službu Hnojiva a POR
 *
 * Pracuje s díly půdních bloků z LPIS, ne s pozemky ze služby Vápnění.
 * Důvod: o tom, co a kdy je možné na pozemku aplikovat, rozhodují právní
 * atributy DPB (zranitelná oblast dusíkem, aplikační pásmo, erozní ohroženost,
 * sklonitost, vzdálenost od vody), které se v pozemcích pro vápnění nevedou a
 * mění se s aktualizací LPIS.
 */
export default async function HnojivaPorPozemkyPage() {
  await requireAuth()

  const [blocks, lastImport] = await Promise.all([getLandBlocks(), getLastLandBlockImport()])
  const summary = summarizeLandBlocks(blocks, lastImport)

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <Map className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pozemky (DPB)</h1>
            <p className="mt-1 text-gray-600">
              Díly půdních bloků z LPIS pro evidenci hnojiv a přípravků na ochranu rostlin
              {summary.lastImportedAt && (
                <>
                  {' – '}
                  data z {new Date(summary.lastImportedAt).toLocaleDateString('cs-CZ')}
                </>
              )}
            </p>
          </div>
        </div>

        <LandBlocksImportDialog existingCount={summary.count} />
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <Map className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Evidence dílů půdních bloků je prázdná
          </h2>
          <p className="mx-auto max-w-xl text-sm text-gray-600">
            Evidence hnojiv a přípravků se vede na dílech půdních bloků podle LPIS – potřebuje
            znát zranitelnou oblast dusíkem, aplikační pásmo, erozní ohroženost, sklonitost a
            vzdálenost od vody. Tyto údaje pozemky ve službě Vápnění nemají, proto se sem nahrávají
            samostatně ze sestavy „Informativní údaje o DPB“ z Portálu farmáře.
          </p>
        </div>
      ) : (
        <>
          {/* Souhrn */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Map className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Dílů půdních bloků"
              value={summary.count.toLocaleString('cs-CZ')}
              note={
                summary.culturesByArea.length > 0
                  ? summary.culturesByArea
                      .slice(0, 3)
                      .map((item) => `${lpisCultureLabel(item.culture)}: ${item.count}`)
                      .join(' · ')
                  : undefined
              }
            />
            <SummaryCard
              icon={<Ruler className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-100"
              label="Celková výměra"
              value={`${summary.totalArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha`}
            />
            <SummaryCard
              icon={<Droplets className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Ve zranitelné oblasti dusíkem"
              value={`${summary.nvzCount} DPB`}
              note={`${summary.nvzArea.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha – limity a termíny hnojení`}
            />
            <SummaryCard
              icon={<Mountain className="h-5 w-5 text-orange-600" />}
              iconBg="bg-orange-100"
              label="Erozně ohrožené"
              value={`${summary.erosionCount} DPB`}
              note="omezení plodin a aplikací"
            />
          </div>

          <LandBlocksTable blocks={blocks} />

          <p className="mt-4 text-xs text-gray-500">
            Evidence DPB je vedená samostatně a nijak nezasahuje do pozemků ve službě Vápnění.
            Opakovaným importem se záznamy podle kódu DPB aktualizují.
            {summary.lastSourceFile && <> Poslední soubor: {summary.lastSourceFile}.</>}
          </p>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  note,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </div>
  )
}
