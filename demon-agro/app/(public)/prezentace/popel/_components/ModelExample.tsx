"use client";

import { Calculator } from "lucide-react";

export default function ModelExample() {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-blue-100 px-6 py-3 rounded-full border-2 border-blue-300 mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">Modelový příklad</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            100 ha, dávka 3 t/ha
          </h2>
          <p className="text-lg text-gray-600">
            Reálné čísla pro vaši farmu
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Položka</th>
                  <th className="px-6 py-4 text-center font-bold bg-orange-600">Popel</th>
                  <th className="px-6 py-4 text-center font-bold">Průmyslová hnojiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">Spotřeba</td>
                  <td className="px-6 py-4 text-center bg-orange-50">
                    300 t popela
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    34,4 t Draselná sůl + 4,3 t MAP 12-52 + 19,8 t vápenec
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">K₂O dodáno</td>
                  <td className="px-6 py-4 text-center bg-orange-50">20 640 kg</td>
                  <td className="px-6 py-4 text-center">20 640 kg</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">P₂O₅ dodáno</td>
                  <td className="px-6 py-4 text-center bg-orange-50">2 250 kg</td>
                  <td className="px-6 py-4 text-center">2 250 kg</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">CaO dodáno</td>
                  <td className="px-6 py-4 text-center bg-orange-50">9 900 kg</td>
                  <td className="px-6 py-4 text-center">9 900 kg</td>
                </tr>
                <tr className="bg-blue-50 hover:bg-blue-100">
                  <td className="px-6 py-4 font-bold text-gray-900 text-lg">Náklady materiál</td>
                  <td className="px-6 py-4 text-center bg-orange-50 font-bold text-orange-700 text-xl">
                    300 000 Kč
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-red-700 text-xl">
                    438 200 Kč
                  </td>
                </tr>
                <tr className="bg-blue-50 hover:bg-blue-100">
                  <td className="px-6 py-4 font-bold text-gray-900 text-lg">Náklady aplikace</td>
                  <td className="px-6 py-4 text-center bg-orange-50 font-bold text-green-700 text-lg">
                    zahrnuto v ceně
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-red-700 text-lg">
                    ~3 přejezdy × 350 Kč/ha = <strong className="text-xl">105 000 Kč</strong>
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <td className="px-6 py-4 font-bold text-gray-900 text-xl">CELKEM</td>
                  <td className="px-6 py-4 text-center bg-orange-50 font-bold text-green-700 text-3xl">
                    300 000 Kč
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-red-700 text-3xl">
                    ~543 000 Kč
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-yellow-100 to-amber-100">
                  <td className="px-6 py-4 font-bold text-gray-900 text-xl">Úspora</td>
                  <td className="px-6 py-4 text-center bg-orange-50" colspan="2">
                    <div className="text-4xl font-bold text-green-700 mb-2">~243 000 Kč</div>
                    <div className="text-lg text-gray-700">Na celých 100 ha</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              🎯 To je čtvrt milionu korun úspory!
            </h3>
            <p className="text-lg opacity-95 max-w-3xl mx-auto">
              A navíc máte všechno vyřešené na klíč — žádné sklady, žádnou logistiku, 
              žádné přejezdy navíc. Jen jeden dodavatel, jedna faktura, žádné starosti.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

