"use client";

import { Calculator } from "lucide-react";

export default function ModelExample() {
  return (
    <section className="py-10 md:py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 md:gap-3 bg-blue-100 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-blue-300 mb-4">
            <Calculator className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <span className="text-base md:text-lg font-bold text-gray-900">Modelový příklad</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            100 ha, dávka 3 t/ha
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Reálné čísla pro vaši farmu
          </p>
        </div>

        {/* Tabulka — na mobilu scrollovatelná */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left font-bold text-sm md:text-base">Položka</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold bg-orange-600 text-sm md:text-base">Popel</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-sm md:text-base">Průmyslová hnojiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">Spotřeba</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 text-sm md:text-base">
                    300 t popela
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
                    40,6 t Draselná sůl<br className="md:hidden" /> + 5,1 t MAP 12-52<br className="md:hidden" /> + 23,4 t vápenec
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">K₂O dodáno</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 text-sm md:text-base">24 390 kg</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">24 390 kg</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">P₂O₅ dodáno</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 text-sm md:text-base">2 670 kg</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">2 670 kg</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 text-sm md:text-base">CaO dodáno</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 text-sm md:text-base">11 700 kg</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base">11 700 kg</td>
                </tr>
                <tr className="bg-blue-50 hover:bg-blue-100">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-gray-900 text-sm md:text-lg">Náklady materiál</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 font-bold text-orange-700 text-base md:text-xl">
                    300 000 Kč
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-red-700 text-base md:text-xl">
                    518 500 Kč
                  </td>
                </tr>
                <tr className="bg-blue-50 hover:bg-blue-100">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-gray-900 text-sm md:text-lg">Náklady aplikace</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 font-bold text-green-700 text-sm md:text-lg">
                    zahrnuto v ceně
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-red-700 text-xs md:text-lg">
                    3 přejezdy × 80 Kč/ha × 100 ha<br />= <strong className="text-sm md:text-xl">24 000 Kč</strong>
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-gray-900 text-base md:text-xl">CELKEM</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50 font-bold text-green-700 text-xl md:text-3xl">
                    300 000 Kč
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center font-bold text-red-700 text-xl md:text-3xl">
                    ~543 000 Kč
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-yellow-100 to-amber-100">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-gray-900 text-base md:text-xl">Úspora</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-center bg-orange-50" colSpan={2}>
                    <div className="text-3xl md:text-4xl font-bold text-green-700 mb-1 md:mb-2">~243 000 Kč</div>
                    <div className="text-sm md:text-lg text-gray-700">Na celých 100 ha</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              🎯 To je přes 240 tisíc korun úspory!
            </h3>
            <p className="text-base md:text-lg opacity-95 max-w-3xl mx-auto">
              A navíc máte všechno vyřešené na klíč — žádné sklady, žádnou logistiku,
              žádné přejezdy navíc. Jen jeden dodavatel, jedna faktura, žádné starosti.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
