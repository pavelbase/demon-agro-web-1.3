import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Leaf,
  FlaskConical,
  ShieldAlert,
  Sprout,
  Bug,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getPorProductDetail } from '@/lib/database/por-queries'
import { POR_ATTRIBUTE_ORDER, POR_PROTECTION_PERIOD_NOTES } from '@/lib/constants/por'
import type { PorProductAttribute } from '@/lib/types/database'

interface PripravekDetailPageProps {
  params: { itemId: string }
}

function formatDate(value: string | null): string {
  if (!value) return '–'
  return new Date(value).toLocaleDateString('cs-CZ')
}

function formatBool(value: boolean | null): string {
  if (value === null) return '–'
  return value ? 'Ano' : 'Ne'
}

/**
 * Poznámky u hodnocených údajů obsahují v registru HTML (např. piktogramy GHS).
 * Vykreslujeme jen textový obsah, značky se zahazují.
 */
function stripHtml(value: string | null): string {
  if (!value) return ''
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function groupAttributes(attributes: PorProductAttribute[]) {
  const groups = new Map<string, PorProductAttribute[]>()
  for (const attr of attributes) {
    const existing = groups.get(attr.attribute)
    if (existing) existing.push(attr)
    else groups.set(attr.attribute, [attr])
  }

  return Array.from(groups.entries()).sort(([a], [b]) => {
    const indexA = POR_ATTRIBUTE_ORDER.indexOf(a as (typeof POR_ATTRIBUTE_ORDER)[number])
    const indexB = POR_ATTRIBUTE_ORDER.indexOf(b as (typeof POR_ATTRIBUTE_ORDER)[number])
    if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'cs')
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

/**
 * Detail přípravku na ochranu rostlin – kompletní údaje z registru ÚKZÚZ:
 * povolení, účinné látky, povolená použití s dávkami a ochrannými lhůtami,
 * klasifikace a rizika, historie rozhodnutí.
 */
export default async function PripravekDetailPage({ params }: PripravekDetailPageProps) {
  await requireAuth()

  const itemId = Number(params.itemId)
  if (!Number.isInteger(itemId)) {
    notFound()
  }

  const detail = await getPorProductDetail(itemId)
  if (!detail) {
    notFound()
  }

  const { product, substances, usages, dosages, attributes, decisions, pests, crops } = detail
  const attributeGroups = groupAttributes(attributes)

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/portal/hnojiva-por/pripravky"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Zpět na katalog přípravků
      </Link>

      {/* Hlavička */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">
              {product.biological_function || 'Biologická funkce neuvedena'}
              {product.registration_number && <> · reg. č. {product.registration_number}</>}
            </p>
            {product.authorization_holder && (
              <p className="text-sm text-gray-500 mt-1">
                Držitel povolení: {product.authorization_holder}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                product.is_authorized
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {product.is_authorized ? 'Platná registrace' : 'Neplatná registrace'}
            </span>
            {product.organic_farming && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <Leaf className="h-3 w-3" />
                Ekologické zemědělství
              </span>
            )}
            {product.seed_treatment && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Moření osiva
              </span>
            )}
            {product.parallel_import && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                Souběžný dovoz
              </span>
            )}
            {product.renewal_in_progress && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Probíhá obnova povolení
              </span>
            )}
          </div>
        </div>

        {/* Základní údaje */}
        <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Field label="Platnost povolení od" value={formatDate(product.valid_from)} />
          <Field label="Platnost povolení do" value={formatDate(product.valid_until)} />
          <Field label="Uvádění na trh do" value={formatDate(product.market_until)} />
          <Field label="Používání do" value={formatDate(product.use_until)} highlight />
          <Field label="Stav registrace" value={product.registration_status || '–'} />
          <Field label="Stav rozhodnutí" value={product.decision_status || '–'} />
          <Field label="Režim výrobku" value={product.product_regime || '–'} />
          <Field label="Druh balení" value={product.package_type || '–'} />
          {product.main_product_name && (
            <Field label="Hlavní přípravek" value={product.main_product_name} />
          )}
          {product.trade_name_until && (
            <Field
              label="Obchodní název do"
              value={formatDate(product.trade_name_until)}
            />
          )}
        </dl>
      </div>

      {/* Účinné látky */}
      <Section
        icon={<FlaskConical className="h-5 w-5 text-amber-600" />}
        title="Účinné látky"
        count={substances.length}
      >
        {substances.length === 0 ? (
          <EmptyNote text="Registr u tohoto přípravku neuvádí účinné látky." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {substances.map((substance) => (
              <li key={substance.id} className="py-3 flex flex-wrap items-baseline gap-x-3">
                <span className="font-medium text-gray-900">{substance.name_cs}</span>
                {substance.name_en && substance.name_en !== substance.name_cs && (
                  <span className="text-sm text-gray-500">{substance.name_en}</span>
                )}
                <span className="text-sm text-gray-700">
                  {substance.amount_text
                    ? `${substance.amount_text}${substance.unit ? ` ${substance.unit}` : ''}`
                    : ''}
                </span>
                {substance.substance_groups && (
                  <span className="text-xs text-gray-500 w-full">
                    {substance.substance_groups}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Povolená použití */}
      <Section
        icon={<Sprout className="h-5 w-5 text-amber-600" />}
        title="Povolená použití"
        count={usages.length}
      >
        {usages.length === 0 ? (
          <EmptyNote text="Registr u tohoto přípravku neuvádí povolená použití." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Plodina</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Škodlivý organismus / účel
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Dávka</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Ochranná lhůta
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Poznámka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usages.map((usage) => (
                  <tr key={usage.id} className="align-top">
                    <td className="px-3 py-2 text-gray-900">{usage.crop || '–'}</td>
                    <td className="px-3 py-2 text-gray-700">{usage.pest || '–'}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-pre-line">
                      {usage.dose_text || '–'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {usage.protection_period_days !== null
                        ? `${usage.protection_period_days} dní`
                        : usage.protection_period_text || '–'}
                      {usage.protection_period_text &&
                        POR_PROTECTION_PERIOD_NOTES[usage.protection_period_text] && (
                          <span
                            className="ml-1 text-gray-400 cursor-help"
                            title={POR_PROTECTION_PERIOD_NOTES[usage.protection_period_text]}
                          >
                            ⓘ
                          </span>
                        )}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {usage.application_notes || ''}
                      {usage.aerial_application && (
                        <span className="block text-xs text-blue-700">Letecká aplikace povolena</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Dávkování včetně dávky vody */}
      {dosages.length > 0 && (
        <Section
          icon={<FileText className="h-5 w-5 text-amber-600" />}
          title="Dávkování a dávka vody"
          count={dosages.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Plodina</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Škodlivý organismus
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Dávka</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Dávka vody</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Poznámka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dosages.map((dosage) => (
                  <tr key={dosage.id} className="align-top">
                    <td className="px-3 py-2 text-gray-900">{dosage.crop || '–'}</td>
                    <td className="px-3 py-2 text-gray-700">{dosage.pest || '–'}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {dosage.dose_text || dosage.dose_full_text || '–'}
                      {dosage.unit && !dosage.dose_text?.includes(dosage.unit) && (
                        <> {dosage.unit}</>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {dosage.water_min !== null || dosage.water_max !== null ? (
                        <>
                          {dosage.water_min !== null && dosage.water_max !== null &&
                          dosage.water_min !== dosage.water_max
                            ? `${dosage.water_min}–${dosage.water_max}`
                            : (dosage.water_min ?? dosage.water_max)}
                          {dosage.water_unit ? ` ${dosage.water_unit}` : ''}
                        </>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{dosage.dose_note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Klasifikace, rizika a další hodnocené údaje */}
      {attributeGroups.length > 0 && (
        <Section
          icon={<ShieldAlert className="h-5 w-5 text-amber-600" />}
          title="Klasifikace, rizika a bezpečnost"
          count={attributes.length}
        >
          <dl className="divide-y divide-gray-100">
            {attributeGroups.map(([attribute, rows]) => (
              <div key={attribute} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 flex items-start gap-1.5">
                  {attribute.startsWith('Riziko pro') && (
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  {attribute}
                </dt>
                <dd className="mt-1 sm:mt-0 sm:col-span-2 text-sm text-gray-900 space-y-1">
                  {rows.map((row) => {
                    const note = stripHtml(row.note)
                    return (
                      <div key={row.id}>
                        <span className="font-medium">{row.abbreviation || ''}</span>
                        {row.abbreviation && row.meaning ? ' – ' : ''}
                        <span>{row.meaning || ''}</span>
                        {note && <span className="block text-gray-500 text-xs">{note}</span>}
                      </div>
                    )
                  })}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* Škodlivé organismy s kódy PPP */}
      {pests.length > 0 && (
        <Section
          icon={<Bug className="h-5 w-5 text-amber-600" />}
          title="Kódované škodlivé organismy"
          count={pests.length}
          collapsible
        >
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {pests.map((pest) => (
              <li key={pest.id} className="text-gray-700">
                {pest.pest_name || '–'}
                {pest.ppp_code && (
                  <span className="text-gray-400 font-mono text-xs"> {pest.ppp_code}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Plodiny podle číselníku */}
      {crops.length > 0 && (
        <Section
          icon={<Sprout className="h-5 w-5 text-amber-600" />}
          title="Plodiny podle číselníku ÚKZÚZ"
          count={crops.length}
          collapsible
        >
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {crops.map((crop) => (
              <li key={crop.id} className="text-gray-700">
                {crop.crop_name || '–'}
                {crop.crop_code && (
                  <span className="text-gray-400 font-mono text-xs"> {crop.crop_code}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Historie rozhodnutí */}
      {decisions.length > 0 && (
        <Section
          icon={<FileText className="h-5 w-5 text-amber-600" />}
          title="Rozhodnutí o povolení"
          count={decisions.length}
          collapsible
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Reg. číslo</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Držitel</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Platnost od</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Platnost do</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Používání do</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Stav</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Moření</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {decisions.map((decision) => (
                  <tr key={decision.id}>
                    <td className="px-3 py-2 text-gray-900">{decision.registration_number || '–'}</td>
                    <td className="px-3 py-2 text-gray-700">{decision.authorization_holder || '–'}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {formatDate(decision.valid_from)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {formatDate(decision.valid_until)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {formatDate(decision.use_until)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{decision.decision_status || '–'}</td>
                    <td className="px-3 py-2 text-gray-700">{formatBool(decision.seed_treatment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <p className="text-xs text-gray-500 mt-6">
        Zdroj dat: Registr přípravků na ochranu rostlin ÚKZÚZ. Údaje jsou informativní –
        před aplikací se vždy řiďte platnou etiketou přípravku.
      </p>
    </div>
  )
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className={`mt-0.5 ${highlight ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
        {value}
      </dd>
    </div>
  )
}

function Section({
  icon,
  title,
  count,
  collapsible,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  collapsible?: boolean
  children: React.ReactNode
}) {
  const header = (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <span className="text-sm text-gray-500">({count})</span>
    </div>
  )

  if (collapsible) {
    return (
      <details className="bg-white rounded-lg shadow-md p-6 mb-6">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center justify-between">
            {header}
            <span className="text-sm text-gray-500">zobrazit</span>
          </div>
        </summary>
        <div className="mt-4">{children}</div>
      </details>
    )
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      {header}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-gray-500">{text}</p>
}
