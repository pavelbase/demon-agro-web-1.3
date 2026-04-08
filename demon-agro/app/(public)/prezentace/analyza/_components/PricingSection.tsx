"use client";

import { CheckCircle2, FlaskConical, Tractor, Users } from "lucide-react";

export default function PricingSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Ceník
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transparentní struktura: cena odběru vzorků a laboratorní analýzy jsou dvě samostatné složky.
            U kompletní služby je vše spojeno do jedné ceny za hektar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* Karta 1 — Kompletní služba */}
          <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-4 right-4 bg-sky-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              DOPORUČENO
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white/20 rounded-full p-3">
                <Tractor className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Kompletní služba</h3>
                <p className="text-blue-200 text-sm">Zónový RTK odběr + laboratorní analýza</p>
              </div>
            </div>

            <p className="text-white/85 text-sm mb-6 leading-relaxed">
              Zónový odběr (2–4 ha / zóna) plně automatizovaný s RTK navigací + analýza pH, P, K, Mg, Ca, S.
              Výsledkem jsou mapy živin a datový podklad pro variabilní hnojení. Cena závisí na výměře.
            </p>

            {/* Ceny dle výměry */}
            <div className="space-y-3 mb-6">
              {[
                { range: "do 500 ha", price: "~370 Kč/ha", badge: "základní", highlight: false },
                { range: "500 – 1 000 ha", price: "~335 Kč/ha", badge: "sleva", highlight: false },
                { range: "nad 1 000 ha", price: "~305 Kč/ha", badge: "nejvýhodněji", highlight: true },
              ].map((tier) => (
                <div
                  key={tier.range}
                  className={`flex items-center justify-between rounded-xl px-5 py-3 ${
                    tier.highlight
                      ? "bg-sky-400/30 border border-sky-300/50"
                      : "bg-white/10 border border-white/15"
                  }`}
                >
                  <span className="text-white font-medium text-sm">{tier.range}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      tier.highlight ? "bg-sky-300 text-blue-900" : "bg-white/20 text-white/80"
                    }`}>
                      {tier.badge}
                    </span>
                    <span className="text-xl font-black text-white">{tier.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-white/80 mb-5">
              {[
                "Zónový odběr s RTK navigací (2–4 ha/zóna)",
                "Analýza: pH (CaCl₂), P, K, Mg, Ca, S (Mehlich 3)",
                "Výsledkové mapy + export dat (SatAgro, Cropwise, .shp)",
                "Konzultace a doporučení variabilního hnojení v ceně",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-300 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Sloučení zakázek */}
            <div className="bg-sky-400/20 border border-sky-300/40 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-sky-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Dostupné pro jakoukoli výměru
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Nabízíme sloučení vaší zakázky se sousedními farmami v lokalitě. 
                    Jeden výjezd, sdílená logistika — i menší farma dosáhne na cenu ~305 Kč/ha.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-blue-200/70 italic">
              Ceny jsou orientační, bez DPH.
            </p>
          </div>

          {/* Karta 2 — Pouze laboratoř */}
          <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 rounded-full p-3">
                <FlaskConical className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pouze laboratoř</h3>
                <p className="text-gray-500 text-sm">Pro zákazníky s vlastním odběrem vzorků</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Pokud si vzorky odeberete sami (metodika 2–4 ha/zóna, 20 vpichů/vzorek),
              zajistíme laboratorní analýzu v certifikované laboratoři.
              Cena za vzorek závisí na zvoleném rozsahu.
            </p>

            {/* Balíčky */}
            <div className="space-y-4 mb-6">
              {[
                {
                  name: "Standard",
                  params: "pH (CaCl₂), P, K, Mg, Ca",
                  method: "Mehlich 3",
                  price: "~190 Kč",
                  unit: "/ vzorek netto",
                  color: "blue",
                  note: null,
                },
                {
                  name: "Optimum",
                  params: "pH, P, K, Mg, Ca + humus (Cox), N-NO₃, N-NH₄, N celkový",
                  method: "Mehlich 3 + oxidace",
                  price: "~510 Kč",
                  unit: "/ vzorek netto",
                  color: "indigo",
                  note: "Pro detailní výživový audit",
                },
                {
                  name: "Premium",
                  params: "pH, P, K, Mg, Ca + humus + S, B, Cu, Fe, Mn, Zn",
                  method: "Mehlich 3 — plný rozsah",
                  price: "~895 Kč",
                  unit: "/ vzorek netto",
                  color: "purple",
                  note: "Řepka, zelenina, intenzivní plodiny",
                },
              ].map((pkg) => {
                const colorMap: Record<string, { badge: string; border: string; price: string }> = {
                  blue:   { badge: "bg-blue-100 text-blue-700",    border: "border-blue-200",   price: "text-blue-700" },
                  indigo: { badge: "bg-indigo-100 text-indigo-700", border: "border-indigo-200", price: "text-indigo-700" },
                  purple: { badge: "bg-purple-100 text-purple-700", border: "border-purple-200", price: "text-purple-700" },
                };
                const c = colorMap[pkg.color];
                return (
                  <div key={pkg.name} className={`bg-white rounded-xl p-4 border-2 ${c.border}`}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                          {pkg.name}
                        </span>
                        {pkg.note && (
                          <span className="text-xs text-gray-400 italic">{pkg.note}</span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xl font-black ${c.price}`}>{pkg.price}</span>
                        <span className="text-xs text-gray-500 block">{pkg.unit}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">{pkg.params}</p>
                    <p className="text-xs text-gray-400">{pkg.method}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-sm text-amber-800">
              <strong>Cena za hektar (orientačně):</strong> Při hustotě 2–4 ha/vzorek
              vychází laboratoř Standard na ~48–95 Kč/ha — výrazně nižší náklad,
              ale bez RTK mapování, automatizovaného odběru a výsledkových map.
            </div>

            <p className="mt-4 text-xs text-gray-400 italic">
              Ceny jsou orientační, bez DPH. Certifikovaná laboratoř — akreditace dle ISO.
            </p>
          </div>
        </div>

        {/* Srovnávací tabulka parametrů */}
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Co je zahrnuto v každém balíčku?
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-3 text-gray-600 font-semibold">Parametr</th>
                  <th className="text-center py-3 px-3 text-blue-700 font-semibold">Standard</th>
                  <th className="text-center py-3 px-3 text-indigo-700 font-semibold">Optimum</th>
                  <th className="text-center py-3 px-3 text-purple-700 font-semibold">Premium</th>
                  <th className="text-center py-3 px-3 text-blue-900 font-semibold">Kompletní služba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["pH (CaCl₂)", true, true, true, true],
                  ["P — fosfor", true, true, true, true],
                  ["K — draslík", true, true, true, true],
                  ["Mg — hořčík", true, true, true, true],
                  ["Ca — vápník", true, true, true, true],
                  ["S — síra", false, false, true, true],
                  ["Humus (Cox / Corg)", false, true, true, false],
                  ["N — dusík (NO₃, NH₄, celk.)", false, true, false, false],
                  ["Mikroprvky (B, Cu, Fe, Mn, Zn)", false, false, true, false],
                  ["RTK odběr + mapy živin", false, false, false, true],
                ].map(([param, std, opt, prem, full]) => (
                  <tr key={param as string} className="hover:bg-white transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-800">{param}</td>
                    {[std, opt, prem, full].map((val, i) => (
                      <td key={i} className="py-2 px-3 text-center text-lg">
                        {val ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                  <td className="py-3 px-3 font-bold text-gray-900">Cena</td>
                  <td className="py-3 px-3 text-center font-black text-blue-700">~190 Kč/vz.</td>
                  <td className="py-3 px-3 text-center font-black text-indigo-700">~510 Kč/vz.</td>
                  <td className="py-3 px-3 text-center font-black text-purple-700">~895 Kč/vz.</td>
                  <td className="py-3 px-3 text-center font-black text-blue-900">305–370 Kč/ha</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Přesnou kalkulaci připravíme na základě vaší výměry a lokality. Ceny jsou bez DPH.
          </p>
        </div>
      </div>
    </section>
  );
}
