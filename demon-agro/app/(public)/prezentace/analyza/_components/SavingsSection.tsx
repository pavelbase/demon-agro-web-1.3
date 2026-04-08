"use client";

export default function SavingsSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Kolik analýza vydělá?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Modelový příklad pro 100 ha orné půdy — reálné náklady vs. reálné úspory
          </p>
        </div>

        {/* Cena analýzy */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-4">
              💰 Cena kompletní analýzy — 100 ha
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Hustota odběru", value: "1 vzorek / 2–4 ha (zónový RTK)" },
                { label: "Počet zón / vzorků", value: "~33 kompozitních vzorků" },
                { label: "Vpichů na vzorek", value: "min. 25 vpichů / zóna" },
                { label: "Cena za ha (do 500 ha)", value: "~370 Kč/ha" },
                { label: "Cena celkem za analýzu", value: "~37 000 Kč", highlight: true },
                { label: "Doporučený cyklus opakování", value: "každé 3–5 let" },
                { label: "Amortizováno za 5 let", value: "~74 Kč/ha/rok", highlight: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-2 ${
                    row.highlight
                      ? "border-t border-blue-300 font-bold text-blue-800 text-base"
                      : "text-gray-700"
                  }`}
                >
                  <span>{row.label}</span>
                  <span className={row.highlight ? "text-blue-700" : "text-gray-900 font-medium"}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Metodika odběru */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-800 leading-relaxed">
                <strong>🔬 Metodika odběru:</strong> Každý kompozitní vzorek se skládá
                z min. 25 vpichů rovnoměrně rozmístěných po celé zóně. Výsledek tak
                reprezentuje skutečný stav půdy — ne jednorázový bodový měření.
              </p>
            </div>

            {/* Sloučení zakázek — tip */}
            <div className="mt-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>💡 Tip:</strong> Díky logistickému sloučení s okolními farmami
                můžete i při menší výměře dosáhnout na cenu velkofarmy (~305 Kč/ha).
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-4">
              🔥 Typické plýtvání bez dat — 100 ha
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Zbytečná aplikace K (již zásobená půda)", value: "450 Kč/ha" },
                { label: "Přebytek P (špatná kategorie zóny)", value: "250 Kč/ha" },
                { label: "Chybné pH → výnos −5 % (řepka)", value: "~400 Kč/ha" },
                { label: "Nesprávná aplikace S (přebytek/deficit)", value: "150 Kč/ha" },
                { label: "Celkový odhad plýtvání", value: "~1 250 Kč/ha/rok", highlight: true },
                { label: "Na 100 ha ročně", value: "~125 000 Kč/rok", highlight: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-2 ${
                    row.highlight
                      ? "border-t border-red-300 font-bold text-red-800 text-base"
                      : "text-gray-700"
                  }`}
                >
                  <span>{row.label}</span>
                  <span className={row.highlight ? "text-red-700" : "text-gray-900 font-medium"}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROI výsledek */}
        <div className="bg-gradient-to-r from-blue-900 to-sky-700 rounded-3xl p-8 text-white text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            🎯 Za 5 let: 37 000 Kč analýzy ušetří 600 000+ Kč
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/25">
              <div className="text-4xl font-black text-sky-200 mb-2">74 Kč</div>
              <div className="text-sm text-white/80">Roční náklad na hektar<br />(370 Kč ÷ 5 let)</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/25">
              <div className="text-4xl font-black text-green-300 mb-2">~1 250 Kč</div>
              <div className="text-sm text-white/80">Průměrná úspora ročně na hektar po optimalizaci hnojení</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/25">
              <div className="text-4xl font-black text-yellow-300 mb-2">~17×</div>
              <div className="text-sm text-white/80">Návratnost investice za 5 let (ROI)</div>
            </div>
          </div>
          <p className="text-white/90 text-base max-w-2xl mx-auto">
            Za 74 Kč/ha/rok dostanete přesná data, která vám ušetří 1 000–1 500 Kč/ha
            na zbytečných hnojivech a chybném hnojení — každý rok.
          </p>
        </div>

        {/* Srovnávací tabulka */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Srovnání: S analýzou vs. bez analýzy (100 ha, řepka ozimá, 5 let)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Položka</th>
                  <th className="text-center py-3 px-4 text-blue-700 font-semibold">✓ S analýzou</th>
                  <th className="text-center py-3 px-4 text-red-600 font-semibold">✗ Bez analýzy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  [
                    "Draslík (K) — přebytek zásoby",
                    "Neaplikujete zbytečně → úspora ~450 Kč/ha/rok",
                    "Aplikujete plošně → ~450 Kč/ha plýtvání/rok",
                  ],
                  [
                    "Fosfor (P) — správná kategorie zóny",
                    "Variabilní dávka dle zásoby → úspora ~250 Kč/ha",
                    "Plošná aplikace → přebytek v zásobených zónách",
                  ],
                  [
                    "pH korekce — variabilní vápnění",
                    "Vápníte jen tam, kde pH skutečně kleslo",
                    "Vápníte plošně nebo vůbec — obojí špatně",
                  ],
                  [
                    "Síra (S) — deficit nebo přebytek",
                    "Přesná dávka energosádrovce dle analýzy",
                    "Odhadem → přebytek nebo nedostatek",
                  ],
                  [
                    "Náklad analýzy (amortizováno/rok)",
                    "37 000 Kč ÷ 5 let = 7 400 Kč/rok (74 Kč/ha)",
                    "0 Kč — ale platíte jinak (hnojiva navíc)",
                  ],
                  [
                    "Odhad ročního plýtvání na 100 ha",
                    "~20 000 Kč/rok (reziduální nejistota)",
                    "~125 000 Kč/rok",
                  ],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{row[0]}</td>
                    <td className="py-3 px-4 text-center text-green-700 font-medium">{row[1]}</td>
                    <td className="py-3 px-4 text-center text-red-600">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">Úspora na 100 ha / rok</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-700 font-black text-lg">✓ ~100 000 Kč/rok</span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400 font-semibold">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * Hodnoty jsou orientační. Závisí na stávajícím hnojebním plánu, zásobě živin v půdě, plodině a cenách hnojiv.
            Ceny referenčních hnojiv: draselná sůl 60 % = 10 200 Kč/t, MAP 12-52 = 18 400 Kč/t (ceník Agro 2000, od 4. 2. 2026).
          </p>
        </div>
      </div>
    </section>
  );
}
