"use client";

import { Calculator, TrendingDown, AlertCircle } from "lucide-react";

export default function SavingsCalculation() {
  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Kalkulace — kolik ušetříte?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Reálné náklady na 100 ha řepky ozimé
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-6">
            <h3 className="text-2xl font-bold text-center">
              Srovnání na 100 ha řepky (200 kg N + 70 kg S)
            </h3>
            <p className="text-center text-white/80 mt-2">Kde se skrývají skutečné náklady?</p>
          </div>

          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Varianta</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Nákup hnojiv</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900">Vápnění</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-900 bg-blue-50">CELKEM reálně</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">DASA 26-13</div>
                      <div className="text-xs text-gray-600">Nejdražší varianta</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-xl font-bold text-gray-900">737 000 Kč</div>
                      <div className="text-xs text-gray-600">7 370 Kč/ha</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-lg font-bold text-red-600">+76 000 Kč</div>
                      <div className="text-xs text-gray-600">~51 t vápence nutno</div>
                    </td>
                    <td className="px-6 py-5 text-center bg-red-50">
                      <div className="text-2xl font-bold text-red-700">813 000 Kč</div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">SAM 21% + LAD</div>
                      <div className="text-xs text-gray-600">Dražší než energosádrovec</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-xl font-bold text-gray-900">707 000 Kč</div>
                      <div className="text-xs text-gray-600">7 070 Kč/ha</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-lg font-bold text-red-600">+57 000 Kč</div>
                      <div className="text-xs text-gray-600">~38 t vápence nutno</div>
                    </td>
                    <td className="px-6 py-5 text-center bg-orange-50">
                      <div className="text-2xl font-bold text-orange-700">764 000 Kč</div>
                    </td>
                  </tr>
                  <tr className="bg-green-50 hover:bg-green-100 border-2 border-green-400">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900 text-lg">✅ Energosádrovec + LAD</div>
                      <div className="text-xs text-green-700 font-semibold">Nejlevnější reálně</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-xl font-bold text-gray-900">702 000 Kč</div>
                      <div className="text-xs text-gray-600">7 020 Kč/ha (vč. hnojiv, dopravy a aplikace)</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-lg font-bold text-green-600">0 Kč</div>
                      <div className="text-xs text-green-700">Neutrální pH</div>
                    </td>
                    <td className="px-6 py-5 text-center bg-green-100">
                      <div className="text-3xl font-bold text-green-700">702 000 Kč</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Detailní výpočty všech variant */}
            <div className="mt-8 space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span> Proč počítáme s budoucími náklady na vápnění?
                </h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Konkurence často uvádí jen <strong>cenu za hnojivo</strong>, ale zamlčuje <strong>skryté náklady na vápnění</strong>, 
                  které vznikají zákonitě při opakovaném použití acidifikačních hnojiv (DASA, SAM). 
                </p>
                <p className="text-gray-700 leading-relaxed">
                  My počítáme <strong>celkové náklady vlastnictví (TCO)</strong> — náklady na vápnění se projeví za 3–5 let, 
                  ale vznikají pravidelně při každoročním hnojení. Rozpočítáno na toto období to znamená dodatečný náklad 
                  uvedený v tabulce. Energosádrovec je neutrální, takže tyto náklady nevznikají vůbec.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span> LAD a doprava
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  LAD je ve všech variantách uveden v paritě <strong>FCA sklad</strong> (8 400 Kč/t). Dopravu a aplikaci si farmář 
                  zajišťuje sám — náklady závisí na vzdálenosti a množství. Energosádrovec vyžaduje 740 kg LAD/ha, DASA jen 222 kg/ha, 
                  SAM 504 kg/ha. Při rozhodování doporučujeme zohlednit i tyto rozdíly v logistice.
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              
              {/* DASA */}
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Výpočet varianty DASA (26-13):
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-semibold text-red-700 mb-2">DASA 26-13 pro 70 kg S + 200 kg N:</div>
                    <div className="space-y-1">
                      <div>• DASA má 13% S → potřeba 538 kg DASA/ha (70 kg S)</div>
                      <div>• To dodá jen 140 kg N/ha (26% × 538 kg)</div>
                      <div>• Zbývá dodat: 200 - 140 = <strong>60 kg N z LAD</strong></div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div>DASA: 538 kg/ha × 9 400 Kč/t = 5 057 Kč/ha (FCA sklad)</div>
                        <div>Doprava + aplikace DASA: +450 Kč/ha</div>
                        <div>Doplnění N (222 kg LAD × 8,4 Kč/kg): +1 865 Kč/ha (FCA sklad)</div>
                        <div className="font-bold mt-1">= 7 370 Kč/ha</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
                      Nákup hnojiv: 7 370 Kč/ha × 100 ha = <span className="text-xl">737 000 Kč</span>
                    </div>
                    <div className="bg-red-100 rounded p-3 mt-3">
                      <div className="font-bold text-red-800 mb-1">Skrytý náklad - vápnění:</div>
                      <div className="text-xs space-y-1">
                        <div>• DASA silně okyseluje: 53,8 t × 470 kg CaO/t = <strong>25,3 t CaO nutno neutralizovat</strong></div>
                        <div>• Vápenec (50% CaO): potřeba 50,6 t vápence</div>
                        <div>• Vápnění: 50,6 t × 1 500 Kč/t = <strong>+76 000 Kč</strong></div>
                      </div>
                    </div>
                    <div className="font-bold text-red-700 text-xl mt-3 text-center py-2 bg-red-200 rounded">
                      CELKEM REÁLNĚ: 813 000 Kč
                    </div>
                  </div>
                </div>
              </div>

              {/* SAM + LAD */}
              <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Výpočet varianty SAM 21% + LAD:
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-semibold text-orange-700 mb-2">SAM 21% pro 70 kg S + LAD pro 200 kg N:</div>
                    <div className="space-y-1">
                      <div>• SAM má 23% S → potřeba 304 kg SAM/ha (70 kg S)</div>
                      <div>• To dodá jen 64 kg N/ha (21% × 304 kg)</div>
                      <div>• Zbývá dodat: 200 - 64 = <strong>136 kg N z LAD</strong></div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div>SAM: 304 kg/ha × 7 850 Kč/t = 2 386 Kč/ha (FCA sklad)</div>
                        <div>Doprava + aplikace SAM: +450 Kč/ha</div>
                        <div>LAD pro 136 kg N (504 kg × 8,4 Kč/kg): +4 234 Kč/ha (FCA sklad)</div>
                        <div className="font-bold mt-1">= 7 070 Kč/ha</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
                      Nákup hnojiv: 7 070 Kč/ha × 100 ha = <span className="text-xl">707 000 Kč</span>
                    </div>
                    <div className="bg-orange-100 rounded p-3 mt-3">
                      <div className="font-bold text-orange-800 mb-1">Skrytý náklad - vápnění:</div>
                      <div className="text-xs space-y-1">
                        <div>• SAM je "zabiják pH": 30,4 t × 628 kg CaO/t = <strong>19,1 t CaO nutno neutralizovat</strong></div>
                        <div>• Vápenec (50% CaO): potřeba 38,2 t vápence</div>
                        <div>• Vápnění: 38,2 t × 1 500 Kč/t = <strong>+57 300 Kč</strong></div>
                      </div>
                    </div>
                    <div className="font-bold text-orange-700 text-xl mt-3 text-center py-2 bg-orange-200 rounded">
                      CELKEM REÁLNĚ: 764 000 Kč
                    </div>
                  </div>
                </div>
              </div>

              {/* Energosádrovec + LAD */}
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-400 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">✅</span> Výpočet varianty Energosádrovec + LAD:
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-semibold text-green-700 mb-2">Energosádrovec 500 kg/ha + LAD pro 200 kg N:</div>
                    <div className="space-y-1">
                      <div>• Energosádrovec 500 kg/ha (14% S) = <strong>70 kg S ✓</strong></div>
                      <div>• Plus: <strong>125 kg CaO/ha</strong> pro výživu rostlin (z CaSO₄)</div>
                      <div>• LAD samostatně pro přesných 200 kg N (farmář si rozhází sám)</div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div>Energosádrovec: 800 Kč/ha (služba vč. materiálu, dopravy a aplikace)</div>
                        <div>LAD pro 200 kg N (740 kg × 8,4 Kč/kg): 6 216 Kč/ha (FCA sklad)</div>
                        <div className="font-bold mt-1">= 7 020 Kč/ha</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
                      Nákup hnojiv: 7 020 Kč/ha × 100 ha = <span className="text-xl">702 000 Kč</span>
                    </div>
                    <div className="bg-green-100 rounded p-3 mt-3">
                      <div className="font-bold text-green-800 mb-1">Neutralizace pH:</div>
                      <div className="text-xs space-y-1">
                        <div>• Energosádrovec je neutrální (pH 6,5-7,5) — <strong>neokyseluje půdu</strong></div>
                        <div>• Dodává vápník pro výživu rostlin (12,5 t CaO z CaSO₄)</div>
                        <div>• Pozor: CaSO₄ není náhrada za vápnění (nezvyšuje pH)</div>
                        <div className="font-bold text-green-700">• Náklad na vápnění acidifikace: <strong>0 Kč</strong></div>
                      </div>
                    </div>
                    <div className="font-bold text-green-700 text-2xl mt-3 text-center py-3 bg-green-200 rounded border-2 border-green-500">
                      CELKEM REÁLNĚ: 702 000 Kč
                    </div>
                  </div>
                </div>
              </div>

              {/* Shrnutí */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-300">
                <h4 className="font-bold text-gray-900 mb-6 text-center text-2xl">🎯 Klíčové závěry</h4>
                <div className="grid md:grid-cols-3 gap-6 text-sm mb-6">
                  <div className="bg-white rounded-lg p-5 text-center shadow-md border border-red-200">
                    <div className="text-red-600 font-bold mb-2 text-lg">DASA</div>
                    <div className="text-3xl font-bold text-red-700 mb-2">813 000 Kč</div>
                    <div className="text-gray-700 text-xs">Zamlčené náklady na vápnění +76 000 Kč</div>
                  </div>
                  <div className="bg-white rounded-lg p-5 text-center shadow-md border border-orange-200">
                    <div className="text-orange-600 font-bold mb-2 text-lg">SAM + LAD</div>
                    <div className="text-3xl font-bold text-orange-700 mb-2">764 000 Kč</div>
                    <div className="text-gray-700 text-xs">Acidifikace = skryté náklady +57 000 Kč</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-5 text-center shadow-lg border-2 border-green-500">
                    <div className="text-green-700 font-bold mb-2 text-lg">✅ Energosádrovec</div>
                    <div className="text-4xl font-bold text-green-700 mb-2">702 000 Kč</div>
                    <div className="text-green-700 font-semibold text-xs">Neutrální pH + vápník pro výživu</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-gray-900 font-bold text-lg mb-2">💡 Proč konkurence vypadá levněji?</div>
                  <p className="text-gray-700 leading-relaxed">
                    Protože <strong>zamlčují náklady na vápnění</strong>, které budete muset zaplatit za 3-5 let. 
                    My počítáme s reálnou ekonomikou — ne s tím, co si dnes koupíte, ale s tím, <strong>co vás to bude celkově stát</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Úspora */}
            <div className="mt-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 text-white shadow-2xl">
              <div className="flex flex-col items-center gap-6">
                <TrendingDown className="w-16 h-16" />
                <div className="text-center">
                  <div className="text-6xl font-bold mb-3">62 - 111 tis. Kč</div>
                  <div className="text-2xl mb-4">úspora na 100 ha oproti konkurenci</div>
                  <div className="text-lg text-white/90">
                    SAM+LAD: +62 000 Kč dražší · DASA: +111 000 Kč dražší
                  </div>
                </div>
                <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="text-center text-xl font-semibold mb-3">
                    ➕ Navíc dostáváte:
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-base">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="font-bold text-yellow-300 mb-1">12,5 tuny CaO</div>
                      <div className="text-sm text-white/90">pro výživu rostlin (z CaSO₄)</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="font-bold text-yellow-300 mb-1">Žádné okyselení</div>
                      <div className="text-sm text-white/90">bez budoucích nákladů na vápnění</div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-lg text-white/95 max-w-2xl">
                  <strong>Celková úspora: 62 - 111 tis. Kč</strong>
                  <div className="text-sm text-white/80 mt-2">(oproti SAM 62 tis. · oproti DASA 111 tis.)</div>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-10 h-10 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-2xl text-gray-900 mb-4">
                    Ekonomika i agronomie hovoří jasně
                  </h4>
                  <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                      <strong className="text-green-700">Energosádrovec + LAD</strong> je <strong>výrazně levnější</strong> 
                      než konkurence (o 62 tis. levnější než SAM, o 111 tis. levnější než DASA) a zároveň <strong>agronomicky nejsprávnější</strong>:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Aplikujete síru v <strong>optimálním termínu</strong> (únor-březen)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Dusík pak <strong>přesně podle potřeby</strong> plodiny (duben)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Dodáváte <strong>125 kg CaO/ha pro výživu bez okyselení</strong> — to konkurence nedokáže</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Žádné budoucí náklady</strong> na opravu pH půdy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

