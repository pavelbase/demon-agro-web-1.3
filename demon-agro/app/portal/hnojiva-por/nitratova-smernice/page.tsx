import Link from 'next/link'
import { AlertTriangle, Droplets, Info, Layers, Scale, Sprout } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { getNitrateBalance, type CropStandBalance } from '@/lib/database/nitrate-balance'
import { formatNitrogen } from '@/lib/utils/nitrate-directive'

/**
 * Nitrátová směrnice – bilance dusíku
 *
 * Kontroly u jednotlivé aplikace řeknou, co je špatně u zápisu; tahle stránka
 * ukazuje, jak na tom hospodářství je jako celek: přívod dusíku ke každému osevu
 * proti limitu z přílohy 3 NV 262/2012 a dusík ze statkových hnojiv proti limitu
 * 170 kg N/ha zemědělské půdy podniku.
 */
export default async function NitratovaSmernicePage({
  searchParams,
}: {
  searchParams: { sezona?: string }
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  const requested = Number(searchParams.sezona)
  const balance = await getNitrateBalance(
    supabase,
    user.id,
    Number.isFinite(requested) && requested > 0 ? requested : undefined
  )

  const livestockUsage =
    balance.farm.limitKgNHa > 0 ? balance.farm.livestockPerHectare / balance.farm.limitKgNHa : 0
  const nvzStands = balance.stands.filter((stand) => stand.nitrateVulnerableZone)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Droplets className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nitrátová směrnice</h1>
            <p className="mt-1 text-gray-600">
              Bilance přívodu dusíku podle akčního programu (NV 262/2012 Sb.)
              {balance.season && <> – sklizňový rok {balance.season}</>}
            </p>
          </div>
        </div>

        {balance.seasons.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {balance.seasons.map((season) => (
              <Link
                key={season}
                href={`/portal/hnojiva-por/nitratova-smernice?sezona=${season}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  season === balance.season
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {season}
              </Link>
            ))}
          </div>
        )}
      </div>

      {balance.stands.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <Droplets className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Za tuto sezónu není evidované hnojení
          </h2>
          <p className="mx-auto max-w-xl text-sm text-gray-600">
            Bilance se počítá z evidence aplikací. Jakmile zapíšete hnojení, uvidíte tu přívod
            dusíku ke každému osevu proti limitu z přílohy 3.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Scale className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Statková hnojiva na farmu"
              value={formatNitrogen(balance.farm.livestockPerHectare)}
              note={`limit ${balance.farm.limitKgNHa} kg N/ha · ${Math.round(livestockUsage * 100)} % z limitu`}
            />
            <SummaryCard
              icon={<Layers className="h-5 w-5 text-green-600" />}
              iconBg="bg-green-100"
              label="Zemědělská půda"
              value={`${balance.farm.farmArea.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ha`}
              note={`z toho ${balance.farm.nvzArea.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ha ve zranitelné oblasti`}
            />
            <SummaryCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              iconBg="bg-red-100"
              label="Osevů nad limitem"
              value={balance.overLimitCount.toLocaleString('cs-CZ')}
              note={`překročen i nejvyšší z limitů, které mohou platit (z ${balance.stands.length} osevů)`}
            />
            <SummaryCard
              icon={<Sprout className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Nelze ověřit"
              value={balance.unverifiableCount.toLocaleString('cs-CZ')}
              note={
                balance.withoutLimitCount > 0
                  ? `chybí BPEJ nebo upřesnění plodiny · dalších ${balance.withoutLimitCount} bez limitu v příloze 3`
                  : 'chybí BPEJ nebo upřesnění plodiny'
              }
            />
          </div>

          {balance.farm.livestockNitrogenKg > 0 && (
            <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
              <h2 className="mb-1 font-semibold text-gray-900">
                Limit 170 kg N/ha ze statkových hnojiv
              </h2>
              <p className="mb-3 text-sm text-gray-600">
                Průměr za kalendářní rok {balance.season} na zemědělskou půdu podniku:{' '}
                {balance.farm.livestockNitrogenKg.toLocaleString('cs-CZ', {
                  maximumFractionDigits: 0,
                })}{' '}
                kg N na {balance.farm.farmArea.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} ha.
              </p>
              <UsageBar percent={Math.round(livestockUsage * 100)} />
            </div>
          )}

          <MissingDataNotice stands={balance.stands} />

          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Stav</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Parcela</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Plodina</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Přívod N</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Limit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Čerpání</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {balance.stands.map((stand) => (
                  <StandRow key={stand.parcelCropId} stand={stand} />
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            Do limitu k plodině se dusík z minerálních hnojiv počítá celý, u statkových
            a organických jen jeho využitelný podíl – bilance proto uvádí celkový přívod a zvlášť
            minerální. Limity platí ve zranitelných oblastech dusíkem
            {nvzStands.length !== balance.stands.length && (
              <>
                {' '}
                (z uvedených osevů jich tam leží {nvzStands.length} z {balance.stands.length})
              </>
            )}
            . Právně závazné je znění vyhlášené ve Sbírce zákonů.
          </p>
        </>
      )}
    </div>
  )
}

const STATUS_BADGES: Record<
  CropStandBalance['limitStatus'],
  { label: string; className: string; rowClassName?: string }
> = {
  over: {
    label: 'Nad limitem',
    className: 'bg-red-100 text-red-800',
    rowClassName: 'bg-red-50/50',
  },
  unverifiable: {
    label: 'Nelze ověřit',
    className: 'bg-amber-100 text-amber-800',
    rowClassName: 'bg-amber-50/40',
  },
  ok: { label: 'V pořádku', className: 'bg-green-100 text-green-800' },
  none: { label: 'Bez limitu', className: 'bg-gray-100 text-gray-600' },
}

function StandRow({ stand }: { stand: CropStandBalance }) {
  const badge = STATUS_BADGES[stand.limitStatus]

  return (
    <tr className={badge.rowClassName}>
      <td className="whitespace-nowrap px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/portal/hnojiva-por/evidence?parcela=${stand.parcelId}`}
          className="font-medium text-gray-900 hover:text-amber-700"
        >
          {stand.parcelName}
        </Link>
        <span className="block text-xs text-gray-500">
          {stand.dpbCode ?? 'bez DPB'} ·{' '}
          {stand.area.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} ha
          {stand.nitrateVulnerableZone
            ? ` · ZOD ${stand.applicationZone ?? ''}`.trimEnd()
            : ' · mimo ZOD'}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700">
        {stand.cropName}
        <span className="block text-xs text-gray-500">{stand.applicationCount}× hnojeno</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <span className="font-medium text-gray-900">{formatNitrogen(stand.supply.totalKgHa)}</span>
        {stand.supply.mineralKgHa !== stand.supply.totalKgHa && (
          <span className="block text-xs text-gray-500">
            z toho minerální {formatNitrogen(stand.supply.mineralKgHa)}
          </span>
        )}
        {stand.hasMissingNitrogen && (
          <span className="block text-xs font-medium text-red-700">chybí přívod N u položky</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
        {stand.limit ? (
          <>
            {formatNitrogen(stand.limit.limitKgNHa)}
            <span className="block text-xs text-gray-500">
              {stand.limit.level !== null ? `hladina ${stand.limit.level}` : stand.limit.cropLabel}
            </span>
          </>
        ) : stand.limitRange ? (
          <>
            <span title={stand.limitRange.uncertainty.join('; ')}>
              {stand.limitRange.minKgNHa.toLocaleString('cs-CZ')}–
              {stand.limitRange.maxKgNHa.toLocaleString('cs-CZ')} kg N/ha
            </span>
            <span className="block text-xs text-amber-700">rozpětí – viz upozornění výše</span>
          </>
        ) : (
          <>
            <span className="text-gray-400">–</span>
            <span className="block text-xs text-gray-500">příloha 3 neuvádí</span>
          </>
        )}
      </td>
      <td className="px-4 py-3">
        <UsageCell stand={stand} />
      </td>
    </tr>
  )
}

/**
 * Čerpání limitu.
 *
 * U jednoznačného limitu se ukazuje přímé čerpání. Kde limit není jistý,
 * měří se čerpání proti nejvyššímu z možných limitů – nad ním je porušení
 * jisté – a rozpětí nejistoty se vyznačí ve pruhu.
 */
function UsageCell({ stand }: { stand: CropStandBalance }) {
  if (stand.usage !== null) {
    return <UsageBar percent={Math.round(stand.usage * 100)} />
  }

  if (!stand.limitRange) {
    return <span className="text-xs text-gray-500">bez limitu k porovnání</span>
  }

  const { minKgNHa, maxKgNHa } = stand.limitRange
  const percent = maxKgNHa > 0 ? Math.round((stand.supply.totalKgHa / maxKgNHa) * 100) : 0
  const uncertainFrom = maxKgNHa > 0 ? Math.round((minKgNHa / maxKgNHa) * 100) : 0

  return (
    <UsageBar
      percent={percent}
      uncertainFromPercent={uncertainFrom}
      caption={`z ${maxKgNHa.toLocaleString('cs-CZ')} kg N/ha`}
      overMin={stand.supply.totalKgHa > minKgNHa}
    />
  )
}

/**
 * Pruh čerpání limitu; nad 100 % se zbarví, aby překročení nešlo přehlédnout.
 *
 * uncertainFromPercent vyznačí šedou zónu mezi nejnižším a nejvyšším možným
 * limitem – v ní o překročení rozhodne až doplněné zařazení pozemku.
 */
function UsageBar({
  percent,
  caption,
  uncertainFromPercent,
  overMin = false,
}: {
  percent: number
  caption?: string
  uncertainFromPercent?: number
  overMin?: boolean
}) {
  const color =
    percent > 100 ? 'bg-red-500' : overMin || percent >= 90 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="min-w-[110px]">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        {uncertainFromPercent !== undefined && (
          <div
            className="absolute inset-y-0 bg-gray-300"
            style={{
              left: `${Math.min(uncertainFromPercent, 100)}%`,
              right: '0%',
            }}
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span
        className={`text-xs ${percent > 100 ? 'font-medium text-red-700' : 'text-gray-600'}`}
      >
        {percent} %{caption && <span className="text-gray-500"> {caption}</span>}
      </span>
    </div>
  )
}

/**
 * Souhrn chybějících údajů.
 *
 * Důvod, proč limit nejde určit jednoznačně, je u desítek osevů stejný. V řádcích
 * by se opakoval a rozbil tabulku, proto se sesbírá sem – s počtem osevů
 * a odkazem tam, kde se údaj doplňuje.
 */
function MissingDataNotice({ stands }: { stands: CropStandBalance[] }) {
  const affected = stands.filter((stand) => stand.limitRange !== null)
  if (affected.length === 0) return null

  const matches = (stand: CropStandBalance, needle: string) =>
    stand.limitRange!.uncertainty.some((reason) => reason.includes(needle))

  const gaps = [
    {
      needle: 'BPEJ',
      title: 'Chybí kód BPEJ u dílu půdního bloku',
      detail:
        'Z BPEJ se určuje výnosová hladina, na které limit přívodu dusíku závisí. Bez ní zná systém jen rozpětí limitů.',
      href: '/portal/hnojiva-por/pozemky',
      action: 'Doplnit u pozemků',
    },
    {
      needle: 'upřesněte plodinu',
      title: 'Plodina osevu není v předpisu jednoznačná',
      detail:
        'Příloha 3 rozlišuje víc variant, než vede číselník – například pšenici potravinářskou a nepotravinářskou nebo ječmen sladovnický a krmný.',
      href: '/portal/hnojiva-por/parcely',
      action: 'Upřesnit u osevů',
    },
  ]
    .map((gap) => {
      const matching = affected.filter((stand) => matches(stand, gap.needle))
      return {
        ...gap,
        count: matching.length,
        risky: matching.filter((stand) => stand.limitStatus !== 'ok').length,
      }
    })
    .filter((gap) => gap.count > 0)

  if (gaps.length === 0) return null

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h2 className="flex items-center gap-2 font-semibold text-amber-900">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Co doplnit, aby byl limit určený jednoznačně
      </h2>
      <ul className="mt-3 space-y-3">
        {gaps.map((gap) => (
          <li key={gap.needle} className="text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium text-amber-900">{gap.title}</span>
              <span className="text-amber-800">
                – {gap.count} {gap.count === 1 ? 'osev' : gap.count < 5 ? 'osevy' : 'osevů'}
                {gap.risky > 0 && `, u ${gap.risky} z nich přívod přesahuje nejnižší možný limit`}
              </span>
              <Link
                href={gap.href}
                className="font-medium text-amber-900 underline hover:text-amber-700"
              >
                {gap.action}
              </Link>
            </div>
            <p className="mt-0.5 text-xs text-amber-800">{gap.detail}</p>
          </li>
        ))}
      </ul>
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
