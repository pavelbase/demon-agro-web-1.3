"use client";

import { Check, X, AlertTriangle } from "lucide-react";

export default function ComparisonTables() {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Srovnání: Energosádrovec vs. konkurence
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Porovnání reálných nákladů a vlastností různých hnojiv se sírou
          </p>
        </div>

        {/* Tabulka 1: Hnojiva se sírou */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Hnojiva se sírou — srovnání na 70 kg S/ha
          </h3>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Parametr</th>
                    <th className="px-6 py-4 text-center font-bold bg-green-600">Energosádrovec</th>
                    <th className="px-6 py-4 text-center font-bold">SAM 21%</th>
                    <th className="px-6 py-4 text-center font-bold">DASA 26-13</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Cena za 70 kg S/ha</td>
                    <td className="px-6 py-4 text-center bg-green-50 font-bold text-green-700 text-lg">
                      od 650 Kč<br />
                      <span className="text-sm font-normal">(podle dávky, vše v ceně)</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      ~2 840 Kč*
                    </td>
                    <td className="px-6 py-4 text-center">
                      ~5 500 Kč*
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Obsah síry</td>
                    <td className="px-6 py-4 text-center bg-green-50">14%</td>
                    <td className="px-6 py-4 text-center">23%</td>
                    <td className="px-6 py-4 text-center">13%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Obsah dusíku</td>
                    <td className="px-6 py-4 text-center bg-green-50">0%</td>
                    <td className="px-6 py-4 text-center">21%</td>
                    <td className="px-6 py-4 text-center">26%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Obsah vápníku</td>
                    <td className="px-6 py-4 text-center bg-green-50 font-bold text-green-700">
                      25% CaO
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">0%</td>
                    <td className="px-6 py-4 text-center text-gray-400">0%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Fyziologická kyselost</td>
                    <td className="px-6 py-4 text-center bg-green-50 font-bold text-green-700">
                      ŽÁDNÁ<br />
                      <span className="text-sm font-normal">(neutrální)</span>
                    </td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">
                      628 kg CaO/t
                    </td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">
                      470 kg CaO/t
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Doprava + aplikace</td>
                    <td className="px-6 py-4 text-center bg-green-50 font-bold text-green-700">
                      <Check className="w-6 h-6 inline" /> VČETNĚ
                    </td>
                    <td className="px-6 py-4 text-center">
                      +400-500 Kč/ha
                    </td>
                    <td className="px-6 py-4 text-center">
                      +400-500 Kč/ha
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Ztráty těkáním</td>
                    <td className="px-6 py-4 text-center bg-green-50 font-bold text-green-700">
                      0%
                    </td>
                    <td className="px-6 py-4 text-center text-red-600">
                      2-10%<br />
                      <span className="text-xs font-normal">(2-5% zapravené, 5-10% povrch)</span>
                    </td>
                    <td className="px-6 py-4 text-center text-red-600">
                      2-10%<br />
                      <span className="text-xs font-normal">(2-5% zapravené, 5-10% povrch)</span>
                    </td>
                  </tr>
                  <tr className="bg-blue-50 hover:bg-blue-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">Vliv na sorpční komplex</td>
                    <td className="px-6 py-4 text-center bg-green-50 font-bold text-green-700">
                      Dodává Ca²⁺<br />
                      <span className="text-sm font-normal">Stabilizuje strukturu</span>
                    </td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">
                      Odvápňuje<br />
                      <span className="text-sm font-normal">Vyplavuje Ca²⁺ a Mg²⁺</span>
                    </td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">
                      Odvápňuje<br />
                      <span className="text-sm font-normal">Vyplavuje Ca²⁺ a Mg²⁺</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
              * včetně dopravy a aplikace
            </div>
          </div>
        </div>

        {/* Tabulka 2: Cena dusíku */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Cena dusíku v různých hnojivech (2026)
          </h3>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Hnojivo</th>
                    <th className="px-6 py-4 text-center font-bold">Cena/t</th>
                    <th className="px-6 py-4 text-center font-bold">Obsah N</th>
                    <th className="px-6 py-4 text-center font-bold">Cena za 1 kg N</th>
                    <th className="px-6 py-4 text-center font-bold">Ztráty</th>
                    <th className="px-6 py-4 text-center font-bold">Reálná cena N</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">LAD 27%</td>
                    <td className="px-6 py-4 text-center">8 400 Kč</td>
                    <td className="px-6 py-4 text-center">27%</td>
                    <td className="px-6 py-4 text-center">31,11 Kč</td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold">5%</td>
                    <td className="px-6 py-4 text-center font-bold text-green-700 bg-green-50">~33 Kč/kg N</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Močovina (UREA) 46%</td>
                    <td className="px-6 py-4 text-center">13 350 Kč</td>
                    <td className="px-6 py-4 text-center">46%</td>
                    <td className="px-6 py-4 text-center">29 Kč</td>
                    <td className="px-6 py-4 text-center text-red-600 font-bold">15-30%</td>
                    <td className="px-6 py-4 text-center font-bold text-red-700">38-41 Kč/kg N</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">SAM 21%</td>
                    <td className="px-6 py-4 text-center">7 850 Kč</td>
                    <td className="px-6 py-4 text-center">21%</td>
                    <td className="px-6 py-4 text-center">37,38 Kč</td>
                    <td className="px-6 py-4 text-center text-orange-600">2-10%</td>
                    <td className="px-6 py-4 text-center font-bold">~39 Kč/kg N</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">DASA 26-13</td>
                    <td className="px-6 py-4 text-center">9 400 Kč</td>
                    <td className="px-6 py-4 text-center">26%</td>
                    <td className="px-6 py-4 text-center">36,15 Kč</td>
                    <td className="px-6 py-4 text-center text-orange-600">2-10%</td>
                    <td className="px-6 py-4 text-center font-bold">~38 Kč/kg N</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Warning box o močovině */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-300 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 rounded-full p-3 flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ⚠️ MOČOVINA NENÍ LEVNĚJŠÍ NEŽ LAD!
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Na papíře vypadá močovina výhodně (29 Kč/kg N vs. 31 Kč/kg N u LAD), ale:
              </p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ztráty těkáním 5-30%</strong> při povrchové aplikaci (v suchu až 30%). S inhibitorem ~5-10%, ale stojí +500 Kč/ha</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Pomalý účinek</strong> - vyžaduje přeměnu ureázou v půdě (7-14 dní)</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Riziko poškození</strong> - toxicita NH₃ v blízkosti kořenů při suchu</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Neobsahuje síru</strong> - i s inhibitorem musíte síru dodat zvlášť</span>
                </li>
              </ul>
              <div className="bg-white rounded-lg p-6 border-2 border-orange-300">
                <p className="text-xl font-bold text-gray-900 mb-2">
                  → Reálná cena dusíku z močoviny: 38-41 Kč/kg N
                </p>
                <p className="text-lg text-gray-700">
                  LAD je spolehlivější a ve výsledku levnější!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

