"use client";

import { Scale, Droplet, Clock, AlertTriangle, Check, X } from "lucide-react";

export default function WhyNotDasaSam() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Proč DASA a SAM nejsou ideální
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tři kritické problémy kombinovaných hnojiv se sírou a dusíkem
          </p>
        </div>

        {/* Problém 1: Špatný poměr N:S */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-red-100 p-4 rounded-full">
              <Scale className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              1. Špatný poměr N:S
            </h3>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200 shadow-lg">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Příklad: 100 ha řepky (potřeba 200 kg N + 70 kg S)</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Varianta</th>
                    <th className="px-6 py-4 text-center font-bold">DASA dodá</th>
                    <th className="px-6 py-4 text-center font-bold">SAM dodá</th>
                    <th className="px-6 py-4 text-left font-bold">Problém</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-semibold">Pro 70 kg S/ha</td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-gray-900">538 kg DASA</div>
                      <div className="text-sm text-gray-600">= 140 kg N + 70 kg S</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-gray-900">292 kg SAM</div>
                      <div className="text-sm text-gray-600">= 61 kg N + 70 kg S</div>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-bold">
                      NEDOSTATEK dusíku!
                    </td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-6 py-4 font-semibold">Musíte dokoupit</td>
                    <td className="px-6 py-4 text-center font-bold text-red-700">
                      +60 kg N z LAD<br/>
                      <span className="text-sm">(222 kg LAD)</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-red-700">
                      +139 kg N z LAD<br/>
                      <span className="text-sm">(515 kg LAD)</span>
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      Platíte dvakrát dopravu a aplikaci!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-white rounded-lg p-6 border-2 border-red-300">
              <p className="text-lg text-gray-900 font-semibold mb-3">
                💡 Reálný problém DASA/SAM:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Nedodají dostatek dusíku při správné dávce síry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Musíte dusík doplňovat z jiného zdroje = 2× doprava a aplikace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Komplikované plánování a logistika</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Problém 2: Okyselování půdy */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-orange-100 p-4 rounded-full">
              <Droplet className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              2. Okyselování půdy
            </h3>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200 shadow-lg">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 border-2 border-green-300">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Energosádrovec</h4>
                <div className="text-4xl font-bold text-green-600 mb-2">0 kg</div>
                <div className="text-sm text-gray-600">CaO/t potřeba na neutralizaci</div>
                <div className="mt-4 flex items-center gap-2 text-green-600 font-semibold">
                  <Check className="w-5 h-5" /> NEUTRÁLNÍ, dodává vápník
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-300">
                <h4 className="text-lg font-bold text-gray-900 mb-3">DASA</h4>
                <div className="text-4xl font-bold text-orange-600 mb-2">470 kg</div>
                <div className="text-sm text-gray-600">CaO/t potřeba na neutralizaci</div>
                <div className="mt-4 flex items-center gap-2 text-orange-600 font-semibold">
                  <X className="w-5 h-5" /> Okyseluje půdu
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-red-300">
                <h4 className="text-lg font-bold text-gray-900 mb-3">SAM</h4>
                <div className="text-4xl font-bold text-red-600 mb-2">628 kg</div>
                <div className="text-sm text-gray-600">CaO/t potřeba na neutralizaci</div>
                <div className="mt-4 flex items-center gap-2 text-red-600 font-semibold">
                  <X className="w-5 h-5" /> Silně okyseluje půdu
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-orange-300">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg text-gray-900 font-semibold mb-2">
                    Každá tuna SAM vyžaduje 628 kg vápna na neutralizaci.
                  </p>
                  <p className="text-gray-700">
                    Za 3-5 let to poznáte na pH a budete muset vápnit. To jsou další náklady, které se na první pohled nevidí.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problém 3: Timing */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-blue-100 p-4 rounded-full">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              3. Timing — kompromis při volbě termínu
            </h3>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
            <div className="bg-white rounded-xl p-6 border-2 border-blue-300 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                Při použití kombinovaných hnojiv (DASA/SAM) musíte <strong>kompromisně volit termín pro obě živiny najednou</strong>. 
                Síra by se měla dodat časně (únor-březen), ale dusík často potřebujete aplikovat ve více dávkách 
                podle stadia růstu plodiny. S kombinovaným hnojivem jste omezeni v flexibilitě.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-300">
                <h4 className="text-xl font-bold text-gray-900 mb-4">SAM/DASA kombinovaně</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Obě živiny musíte dát najednou</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Omezená flexibilita dávkování N</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Kompromis v optimálním termínu</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-green-300">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Oddělené živiny</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Síra časně (únor-březen)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dusík dle potřeby (1.–3. dávka)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Každá živina v optimu</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-8">
              <h4 className="text-2xl font-bold mb-4">✅ Naše řešení</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
                  <div className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">Únor-Březen: Energosádrovec (S + Ca)</div>
                    <div className="text-green-100">→ Optimální čas pro síru</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/10 rounded-lg p-4">
                  <div className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">Duben: LAD/močovinu podle potřeby</div>
                    <div className="text-green-100">→ Optimální čas pro dusík</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/30">
                <p className="text-xl font-bold text-center">
                  Každou živinu v její optimální termín. Maximální flexibilita.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

