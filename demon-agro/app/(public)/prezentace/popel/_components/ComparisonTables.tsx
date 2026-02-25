"use client";

import { Check, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function ComparisonTables() {
  const [methodOpen, setMethodOpen] = useState(false);

  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            Srovnání: Popel vs. průmyslová hnojiva
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Klíčová prodejní sekce — kolik skutečně ušetříte?
          </p>
        </div>

        {/* Tabulka 1: Cena jednotlivých živin */}
        <div className="mb-8 md:mb-10">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
            Kolik stojí 1 kg živiny z průmyslového hnojiva?
          </h3>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left font-bold text-sm md:text-base">Živina</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left font-bold text-sm md:text-base">Nejlevnější zdroj</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">Cena/t</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">Obsah živiny</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">Kč/kg živiny</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">K₂O</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-sm">Draselná sůl 60 % (big-bag)</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">10 200 Kč</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">600 kg/t</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-red-700 text-base md:text-lg">17,00 Kč</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">P₂O₅</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-sm">MAP 12-52 (big-bag)</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">18 400 Kč</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">520 kg/t</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-red-700 text-base md:text-lg">35,38 Kč</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">CaO</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-sm">Mletý vápenec</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">~400 Kč</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">~500 kg/t</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-red-700 text-base md:text-lg">0,80 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600">
              * Zdroj: Ceník Agro 2000, platný od 4. 2. 2026, splatnost 30 dní, parita FCA sklad
            </div>
          </div>
        </div>

        {/* Tabulka 2: Hodnota živin v popelu */}
        <div className="mb-8 md:mb-10">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
            Hodnota živin v 1 tuně mokrého popela
          </h3>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-300">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left font-bold text-sm md:text-base">Živina</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">Množství / 1 t</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">× Kč/kg</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">= Hodnota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-orange-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900">K₂O</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">81,3 kg</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">17,00 Kč</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-orange-700 text-base md:text-lg">1 382 Kč</td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900">P₂O₅</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">8,9 kg</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">35,38 Kč</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-orange-700 text-base md:text-lg">315 Kč</td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900">CaO</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">39,0 kg</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">0,80 Kč</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-orange-700 text-base md:text-lg">31 Kč</td>
                  </tr>
                  <tr className="bg-orange-100 hover:bg-orange-200">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-gray-900 text-base md:text-lg" colSpan={3}>CELKEM</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-orange-700 text-xl md:text-2xl">1 728 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Metodika výpočtu — accordion */}
        <div className="mb-8 md:mb-10">
          <button
            onClick={() => setMethodOpen(!methodOpen)}
            className="w-full flex items-center justify-between gap-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl px-4 md:px-8 py-4 md:py-5 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl md:text-2xl flex-shrink-0">📐</span>
              <div className="text-left min-w-0">
                <div className="text-base md:text-lg font-bold text-gray-900">Jak jsme to spočítali?</div>
                <div className="text-xs md:text-sm text-gray-600 hidden sm:block">Postup výpočtu krok za krokem — transparentně</div>
              </div>
            </div>
            {methodOpen
              ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 flex-shrink-0" />
              : <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 flex-shrink-0" />
            }
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${methodOpen ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 md:p-8 space-y-6 md:space-y-8">

              {/* Krok 1 */}
              <div className="flex gap-3 md:gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base md:text-lg">1</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2">Vlhkost popela 35 % → obsah sušiny</h4>
                  <p className="text-sm md:text-base text-gray-700 mb-3">
                    Popel dodáváme a vážíme v mokrém stavu. Při vlhkosti 35 % obsahuje 1 tuna mokrého popela:
                  </p>
                  <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 font-mono text-sm overflow-x-auto">
                    <div className="flex flex-col gap-1 text-gray-800 whitespace-nowrap">
                      <span>1 t mokrého popela = <strong>650 kg sušiny</strong> + 350 kg vody</span>
                      <span className="text-gray-500 text-xs">(sušina = 1 000 kg × (1 − 0,35) = 650 kg)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Krok 2 */}
              <div className="flex gap-3 md:gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base md:text-lg">2</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2">Obsah živin v sušině → množství na 1 t mokrého</h4>
                  <p className="text-sm md:text-base text-gray-700 mb-3">
                    Laboratorní analýzy: K₂O 10–15 % (střed 12,5 %), P 0,6 %, CaO 6 % — vše v sušině.
                    P → P₂O₅: konverzní faktor 2,29 (mol. hmotnosti: P₂O₅ = 142, 2× P = 62).
                  </p>
                  <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-xs text-gray-500 mb-1 font-semibold">K₂O</div>
                        <div className="font-mono text-gray-800 text-xs md:text-sm">
                          650 kg × 12,5 % =<br /><strong className="text-orange-700">81,3 kg/t</strong>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-500 mb-1 font-semibold">P₂O₅</div>
                        <div className="font-mono text-gray-800 text-xs md:text-sm">
                          0,6 % × 2,29 = 1,37 %<br />
                          650 × 1,37 % = <strong className="text-blue-700">8,9 kg/t</strong>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-500 mb-1 font-semibold">CaO</div>
                        <div className="font-mono text-gray-800 text-xs md:text-sm">
                          650 kg × 6,0 % =<br /><strong className="text-green-700">39,0 kg/t</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Krok 3 */}
              <div className="flex gap-3 md:gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base md:text-lg">3</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2">Ceny průmyslových hnojiv → cena za 1 kg živiny</h4>
                  <p className="text-sm md:text-base text-gray-700 mb-3">
                    Ceník Agro 2000, platný od 4. 2. 2026. Cena tuny hnojiva ÷ obsah živiny v 1 tuně:
                  </p>
                  {/* Na mobilu: karty, na desktopu: tabulka */}
                  <div className="block md:hidden space-y-3">
                    {[
                      { name: "Draselná sůl 60 %", price: "10 200 Kč/t", content: "600 kg K₂O", calc: "10 200 ÷ 600", result: "17,00 Kč/kg K₂O" },
                      { name: "MAP 12-52", price: "18 400 Kč/t", content: "520 kg P₂O₅", calc: "18 400 ÷ 520", result: "35,38 Kč/kg P₂O₅" },
                      { name: "Mletý vápenec", price: "~400 Kč/t", content: "~500 kg CaO", calc: "400 ÷ 500", result: "0,80 Kč/kg CaO" },
                    ].map((row, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border-2 border-indigo-200">
                        <div className="font-semibold text-gray-900 mb-2">{row.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div><span className="text-gray-500">Cena:</span> {row.price}</div>
                          <div><span className="text-gray-500">Obsah:</span> {row.content}</div>
                          <div className="col-span-2 font-mono text-gray-600">{row.calc} =</div>
                          <div className="col-span-2 font-bold text-red-700 text-base">{row.result}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block bg-white rounded-xl border-2 border-indigo-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[520px]">
                        <thead className="bg-indigo-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-900">Hnojivo</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-900">Cena/t</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-900">Obsah živiny/t</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-900">Výpočet</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-900">→ Kč/kg živiny</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">Draselná sůl 60 % (big-bag)</td>
                            <td className="px-4 py-3 text-center">10 200 Kč</td>
                            <td className="px-4 py-3 text-center">600 kg K₂O</td>
                            <td className="px-4 py-3 text-center font-mono text-gray-700">10 200 ÷ 600</td>
                            <td className="px-4 py-3 text-center font-bold text-red-700">17,00 Kč/kg K₂O</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">MAP 12-52 (big-bag)</td>
                            <td className="px-4 py-3 text-center">18 400 Kč</td>
                            <td className="px-4 py-3 text-center">520 kg P₂O₅</td>
                            <td className="px-4 py-3 text-center font-mono text-gray-700">18 400 ÷ 520</td>
                            <td className="px-4 py-3 text-center font-bold text-red-700">35,38 Kč/kg P₂O₅</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800">Mletý vápenec</td>
                            <td className="px-4 py-3 text-center">~400 Kč</td>
                            <td className="px-4 py-3 text-center">~500 kg CaO</td>
                            <td className="px-4 py-3 text-center font-mono text-gray-700">400 ÷ 500</td>
                            <td className="px-4 py-3 text-center font-bold text-red-700">0,80 Kč/kg CaO</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Krok 4 */}
              <div className="flex gap-3 md:gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base md:text-lg">4</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2">Hodnota živin v 1 t popela</h4>
                  <p className="text-sm md:text-base text-gray-700 mb-3">
                    Množství živiny × cena za 1 kg z průmyslového hnojiva:
                  </p>
                  <div className="bg-white rounded-xl p-4 border-2 border-orange-200 font-mono text-xs md:text-sm space-y-2">
                    <div className="text-gray-800">K₂O: 81,3 kg × 17,00 Kč = <strong>1 382 Kč</strong></div>
                    <div className="text-gray-800">P₂O₅: 8,9 kg × 35,38 Kč = <strong>315 Kč</strong></div>
                    <div className="text-gray-800">CaO: 39,0 kg × 0,80 Kč = <strong>31 Kč</strong></div>
                    <div className="border-t-2 border-gray-200 pt-2 text-base md:text-lg font-bold text-orange-700">
                      Celkem = 1 728 Kč / t
                    </div>
                    <div className="text-gray-600 font-sans text-xs md:text-sm">
                      → Za 1 000 Kč/t (cena popela) získáte živiny za 1 728 Kč — úspora <strong className="text-green-700">728 Kč/t (42 %)</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Výsledné srovnání */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-6 md:p-10 shadow-2xl text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
            Výsledné srovnání
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border-2 border-white/30">
              <div className="text-center">
                <div className="text-xs md:text-sm text-white/80 mb-2">Cena 1 t popela</div>
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">1 000 Kč</div>
                <div className="text-xs md:text-sm text-white/90">komplet služba</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border-2 border-white/30">
              <div className="text-center">
                <div className="text-xs md:text-sm text-white/80 mb-2">Hodnota živin</div>
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">1 728 Kč</div>
                <div className="text-xs md:text-sm text-white/90">v průmyslových hnojivech</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-6 border-4 border-yellow-400 shadow-xl">
              <div className="text-center">
                <div className="text-xs md:text-sm text-gray-600 mb-2 font-semibold">Úspora</div>
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 text-green-600">42 %</div>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <span className="text-xs md:text-sm text-gray-700 font-semibold">728 Kč/t</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/30">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-1" />
              <p className="text-base md:text-lg leading-relaxed">
                <strong>Za 1 000 Kč/t získáte živiny, které by vás při nákupu
                průmyslových hnojiv stály 1 728 Kč.</strong> A navíc máte vše vyřešené —
                materiál, dopravu i aplikaci. Žádné starosti, jen výsledky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
