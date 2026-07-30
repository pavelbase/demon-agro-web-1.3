import Link from 'next/link'
import {
  AlertTriangle,
  ClipboardList,
  Layers,
  Map,
  Plus,
  Ruler,
  ShieldCheck,
  Sprout,
  XCircle,
} from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import {
  getApplications,
  getCropParcels,
  getEvidenceSeasons,
  summarizeApplications,
} from '@/lib/database/application-queries'
import { ApplicationsTable } from '@/components/portal/ApplicationsTable'

/**
 * Evidence použití hnojiv a přípravků na ochranu rostlin
 *
 * Evidenční kniha vedená na parcelách uvnitř dílů půdních bloků. Ke každé
 * aplikaci se ukládá výsledek kontrol (registrace přípravku, registrovaná
 * plodina, dávka, ochranná lhůta, termíny, výměra a atributy DPB) – kontroly
 * uložení nebrání, jen označí, co je potřeba dohledat.
 */
export default async function EvidencePage({
  searchParams,
}: {
  searchParams: { parcela?: string }
}) {
  await requireAuth()

  const [applications, parcels, seasons] = await Promise.all([
    getApplications(),
    getCropParcels(),
    getEvidenceSeasons(),
  ])

  const summary = summarizeApplications(applications)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <ClipboardList className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evidence aplikací</h1>
            <p className="mt-1 text-gray-600">
              Evidenční kniha použití hnojiv a přípravků na ochranu rostlin s kontrolou podle
              registru a atributů dílu půdního bloku
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal/hnojiva-por/parcely"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Map className="h-4 w-4" />
            Parcely a osevy
          </Link>
          <Link
            href="/portal/hnojiva-por/evidence/hromadne"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Layers className="h-4 w-4" />
            Souhrnné zadání
          </Link>
          <Link
            href="/portal/hnojiva-por/evidence/nova"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Nová aplikace
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Evidence je prázdná</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-gray-600">
            Evidence se vede na parcelách, které leží v dílech půdních bloků z LPIS. Nejdřív si
            založte parcely a osevy, pak k nim můžete zapisovat aplikace hnojiv a přípravků.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/portal/hnojiva-por/parcely"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              <Map className="h-4 w-4" />
              Založit parcely
            </Link>
            <Link
              href="/portal/hnojiva-por/pozemky"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Sprout className="h-4 w-4" />
              Naimportovat DPB z LPIS
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<ClipboardList className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Aplikací v evidenci"
              value={summary.count.toLocaleString('cs-CZ')}
              note={`${summary.fertilizerItemCount} položek hnojiv · ${summary.porItemCount} položek POR`}
            />
            <SummaryCard
              icon={<Ruler className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-100"
              label="Ošetřená výměra"
              value={`${summary.treatedArea.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ha`}
              note={`${summary.seasonCount} ${summary.seasonCount === 1 ? 'sezóna' : 'sezóny'}`}
            />
            <SummaryCard
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Aplikací s chybou"
              value={summary.errorCount.toLocaleString('cs-CZ')}
              note="neregistrované použití, překročená dávka, ochranná lhůta"
            />
            <SummaryCard
              icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Aplikací s varováním"
              value={summary.warningCount.toLocaleString('cs-CZ')}
              note={
                summary.uncheckedCount > 0
                  ? `${summary.uncheckedCount} nezkontrolovaných – spusťte kontrolu`
                  : 'ochranné pásy, výměra, chybějící údaje'
              }
            />
          </div>

          <ApplicationsTable
            applications={applications}
            parcels={parcels.map((parcel) => ({ id: parcel.id, name: parcel.name }))}
            seasons={seasons}
            initialParcelId={searchParams.parcela}
          />

          <p className="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            Kontroly vycházejí z registru ÚKZÚZ a z atributů DPB v LPIS. Nenahrazují etiketu
            přípravku – u zjištění vždy ověřte konkrétní podmínky použití. Evidence se ukládá
            i se zjištěnými problémy, aby odpovídala skutečnosti.
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
