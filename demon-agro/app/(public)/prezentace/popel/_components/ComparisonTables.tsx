"use client";

import { Check, TrendingUp } from "lucide-react";

export default function ComparisonTables() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Srovnání: Popel vs. průmyslová hnojiva
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Klíčová prodejní sekce — kolik skutečně ušetříte?
          </p>
        </div>

        {/* Tabulka 1: Cena jednotlivých živin */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Kolik stojí 1 kg živiny z průmyslového hnojiva?
          </h3>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Živina</th>
                    <th className="px-6 py-4 text-left font-bold">Nejlevnější zdroj</th>
                    <th className="px-6 py-4 text-center font-bold">Cena/t hnojiva</th>
                    <th className="px-6 py-4 text-center font-bold">Obsah živiny</th>
                    <th className="px-6 py-4 text-center font-bold">Cena za 1 kg živiny</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">K₂O</td>
                    <td className="px-6 py-4 text-gray-700">Draselná sůl 60 % (big-bag)</td>
                    <td className="px-6 py-4 text-center">10 200 Kč</td>
                    <td className="px-6 py-4 text-center">600 kg/t</td>
                    <td className="px-6 py-4 text-center font-bold text-red-700 text-lg">17,00 Kč/kg</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">P₂O₅</td>
                    <td className="px-6 py-4 text-gray-700">Amofos MAP 12-52 (big-bag)</td>
                    <td className="px-6 py-4 text-center">18 400 Kč</td>
                    <td className="px-6 py-4 text-center">520 kg/t</td>
                    <td className="px-6 py-4 text-center font-bold text-red-700 text-lg">35,38 Kč/kg</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">CaO</td>
                    <td className="px-6 py-4 text-gray-700">Mletý vápenec</td>
                    <td className="px-6 py-4 text-center">~400 Kč</td>
                    <td className="px-6 py-4 text-center">~500 kg/t</td>
                    <td className="px-6 py-4 text-center font-bold text-red-700 text-lg">0,80 Kč/kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
              * Zdroj: Ceník Agro 2000, platný od 4. 2. 2026, splatnost 30 dní, parita FCA sklad
            </div>
          </div>
        </div>

        {/* Tabulka 2: Hodnota živin v popelu */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Hodnota živin v 1 tuně mokrého popela
          </h3>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Živina</th>
                    <th className="px-6 py-4 text-center font-bold">Množství v 1 t</th>
                    <th className="px-6 py-4 text-center font-bold">× Cena/kg</th>
                    <th className="px-6 py-4 text-center font-bold">= Hodnota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">K₂O</td>
                    <td className="px-6 py-4 text-center">68,8 kg</td>
                    <td className="px-6 py-4 text-center">17,00 Kč</td>
                    <td className="px-6 py-4 text-center font-bold text-orange-700 text-lg">1 169 Kč</td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">P₂O₅</td>
                    <td className="px-6 py-4 text-center">7,5 kg</td>
                    <td className="px-6 py-4 text-center">35,38 Kč</td>
                    <td className="px-6 py-4 text-center font-bold text-orange-700 text-lg">265 Kč</td>
                  </tr>
                  <tr className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">CaO</td>
                    <td className="px-6 py-4 text-center">33,0 kg</td>
                    <td className="px-6 py-4 text-center">0,80 Kč</td>
                    <td className="px-6 py-4 text-center font-bold text-orange-700 text-lg">26 Kč</td>
                  </tr>
                  <tr className="bg-orange-100 hover:bg-orange-200">
                    <td className="px-6 py-4 font-bold text-gray-900 text-lg" colspan="3">CELKEM</td>
                    <td className="px-6 py-4 text-center font-bold text-orange-700 text-2xl">1 460 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Výsledné srovnání */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-10 shadow-2xl text-white">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Výsledné srovnání
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
              <div className="text-center">
                <div className="text-sm text-white/80 mb-2">Cena 1 t popela</div>
                <div className="text-5xl font-bold mb-2">1 000 Kč</div>
                <div className="text-sm text-white/90">komplet služba</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
              <div className="text-center">
                <div className="text-sm text-white/80 mb-2">Hodnota živin</div>
                <div className="text-5xl font-bold mb-2">1 460 Kč</div>
                <div className="text-sm text-white/90">v průmyslových hnojivech</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border-4 border-yellow-400 shadow-xl">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2 font-semibold">Úspora</div>
                <div className="text-5xl font-bold mb-2 text-green-600">32 %</div>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700 font-semibold">460 Kč/t</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 flex-shrink-0 mt-1" />
              <p className="text-lg leading-relaxed">
                <strong>Zákazník za 1 000 Kč získá živiny, které by ho při nákupu 
                průmyslových hnojiv stály 1 460 Kč.</strong> A navíc má vše vyřešené — 
                materiál, dopravu i aplikaci. Žádné starosti, jen výsledky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

