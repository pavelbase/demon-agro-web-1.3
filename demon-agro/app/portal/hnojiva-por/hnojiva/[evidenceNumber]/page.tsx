import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FlaskConical, Leaf, Sprout, History, Factory, Package } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getFertProductDetail } from '@/lib/database/fert-queries'
import { fertKindLabel, FERT_REGIME_NOTES } from '@/lib/constants/fertilizers'

interface HnojivoDetailPageProps {
  params: { evidenceNumber: string }
}

function formatDate(value: string | null): string {
  if (!value) return '–'
  return new Date(value).toLocaleDateString('cs-CZ')
}

/**
 * Detail hnojiva – údaje z registru hnojiv ÚKZÚZ včetně historie obnov
 * registrace a dalších výrobků stejného žadatele.
 */
export default async function HnojivoDetailPage({ params }: HnojivoDetailPageProps) {
  await requireAuth()

  const evidenceNumber = decodeURIComponent(params.evidenceNumber)
  const detail = await getFertProductDetail(evidenceNumber)
  if (!detail) {
    notFound()
  }

  const { product, nutrients, history, relatedByApplicant } = detail

  // Živiny, které číselník u hnojiva deklaruje (v % hmotnosti)
  const declaredNutrients: [string, number][] = nutrients
    ? ([
        ['N', nutrients.n_percent],
        ['P₂O₅', nutrients.p2o5_percent],
        ['K₂O', nutrients.k2o_percent],
        ['CaO', nutrients.cao_percent],
        ['MgO', nutrients.mgo_percent],
        ['Na₂O', nutrients.na2o_percent],
        ['S', nutrients.s_percent],
        ['Cl', nutrients.cl_percent],
        ['Zn', nutrients.zn_percent],
        ['Cu', nutrients.cu_percent],
        ['Fe', nutrients.fe_percent],
        ['B', nutrients.b_percent],
        ['Mn', nutrients.mn_percent],
        ['Mo', nutrients.mo_percent],
        ['Se', nutrients.se_percent],
        ['Spalitelné látky', nutrients.combustible_matter_percent],
      ] as [string, number | null][])
        .filter((entry) => entry[1] !== null && Number(entry[1]) !== 0)
        .map(([label, percent]): [string, number] => [label, Number(percent)])
    : []

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/portal/hnojiva-por/hnojiva"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Zpět na katalog hnojiv
      </Link>

      {/* Hlavička */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">
              {fertKindLabel(product.product_kind)}
              {product.nitrogen_category && <> · {product.nitrogen_category}</>}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ev. č. {product.evidence_number}
              {product.registration_number && <> · reg. č. {product.registration_number}</>}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                product.is_valid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {product.is_valid ? 'Platný výrobek' : 'Platnost ukončena'}
            </span>
            {!product.is_latest && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                Starší obnova registrace
              </span>
            )}
            {product.organic_farming && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <Leaf className="h-3 w-3" />
                Ekologické zemědělství
              </span>
            )}
            {product.regime && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                title={FERT_REGIME_NOTES[product.regime] ?? undefined}
              >
                {product.regime}
              </span>
            )}
          </div>
        </div>

        {/* Základní údaje */}
        <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Field label="Platnost výrobku od" value={formatDate(product.valid_from)} />
          <Field
            label="Platnost výrobku do"
            value={product.valid_until ? formatDate(product.valid_until) : 'bez omezení'}
            highlight
          />
          <Field label="Druh" value={fertKindLabel(product.product_kind)} />
          <Field
            label="Typ podle vyhlášky"
            value={product.product_type || '–'}
          />
          <Field label="Kategorie N" value={product.nitrogen_category || '–'} />
          <Field label="Režim" value={product.regime || '–'} />
          <Field label="Žadatel" value={product.applicant || '–'} />
          <Field label="Výrobce" value={product.manufacturer || '–'} />
        </dl>

        {product.regime && FERT_REGIME_NOTES[product.regime] && (
          <p className="mt-4 text-xs text-gray-500">{FERT_REGIME_NOTES[product.regime]}</p>
        )}
      </div>

      {/* Obsah živin z číselníku hnojiv */}
      {nutrients && (
        <Section
          icon={<FlaskConical className="h-5 w-5 text-amber-600" />}
          title="Obsah živin"
          count={declaredNutrients.length}
        >
          {declaredNutrients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {declaredNutrients.map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  {label}{' '}
                  <strong className="font-semibold text-gray-900">
                    {Number(value).toLocaleString('cs-CZ', { maximumFractionDigits: 3 })} %
                  </strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Číselník u tohoto výrobku obsah živin neuvádí – přívod živin v evidenci proto
              zadávejte ručně podle etikety.
            </p>
          )}

          <dl className="mt-5 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Obvyklá měrná jednotka"
              value={
                nutrients.unit_type === 'O'
                  ? 'objemová (l, m³)'
                  : nutrients.unit_type === 'H'
                    ? 'hmotnostní (kg, t)'
                    : '–'
              }
            />
            <Field
              label="Měrná hmotnost"
              value={
                nutrients.density_kg_l !== null ? `${nutrients.density_kg_l} kg/l` : '–'
              }
            />
            {nutrients.trace_elements && (
              <Field label="Stopové prvky" value={nutrients.trace_elements} />
            )}
          </dl>

          <p className="mt-4 text-xs text-gray-500">
            Obsahy jsou v procentech hmotnosti. Z nich a z dávky se v evidenci počítá přívod N,
            P₂O₅ a K₂O na hektar; u objemových dávek se hmotnost dopočítá měrnou hmotností.
            Rozhodující zůstává etiketa výrobku – vlastní hodnotu lze u položky přepsat.
          </p>
        </Section>
      )}

      {/* Historie registrace */}
      {history.length > 0 && (
        <Section
          icon={<History className="h-5 w-5 text-amber-600" />}
          title="Historie registrace"
          count={history.length}
        >
          <p className="text-sm text-gray-500 mb-3">
            Další záznamy se stejným registračním číslem {product.registration_number} – obnovy
            registrace téhož hnojiva.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Ev. číslo</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Název</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Žadatel</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Platnost od
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                    Platnost do
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((record) => (
                  <tr key={record.evidence_number}>
                    <td className="px-3 py-2">
                      <Link
                        href={`/portal/hnojiva-por/hnojiva/${encodeURIComponent(record.evidence_number)}`}
                        className="text-gray-900 font-medium hover:text-amber-700"
                      >
                        {record.evidence_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{record.name}</td>
                    <td className="px-3 py-2 text-gray-600">{record.applicant || '–'}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {formatDate(record.valid_from)}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {record.valid_until ? formatDate(record.valid_until) : 'bez omezení'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Další výrobky žadatele */}
      {relatedByApplicant.length > 0 && (
        <Section
          icon={<Factory className="h-5 w-5 text-amber-600" />}
          title={`Další platné výrobky žadatele ${product.applicant}`}
          count={relatedByApplicant.length}
          collapsible
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {relatedByApplicant.map((related) => (
              <li key={related.evidence_number} className="text-sm">
                <Link
                  href={`/portal/hnojiva-por/hnojiva/${encodeURIComponent(related.evidence_number)}`}
                  className="text-gray-900 hover:text-amber-700 font-medium"
                >
                  {related.name}
                </Link>
                <span className="block text-xs text-gray-500">
                  {fertKindLabel(related.product_kind)}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Odkaz na katalog přípravků */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4 text-gray-400" />
          Hledáte přípravek na ochranu rostlin?
        </span>
        <Link
          href="/portal/hnojiva-por/pripravky"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          <Sprout className="h-4 w-4" />
          Katalog přípravků
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        Zdroj dat: Registr hnojiv ÚKZÚZ, obsahy živin z číselníku hnojiv (eAGRI). Údaje jsou
        informativní – dávkování a přesné složení konkrétní šarže najdete v etiketě a rozhodnutí
        o registraci výrobku.
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
