"use client";

import { Beaker } from "lucide-react";

export default function NutrientContentSection() {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Obsah živin v 1 tuně popela
          </h2>
          <p className="text-lg text-gray-600">
            Přepočet na standardní vlhkost 45 %
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-full border-2 border-orange-200 mb-6">
              <Beaker className="w-6 h-6 text-orange-600" />
              <span className="text-xl font-bold text-gray-900">
                1 t mokrého popela (45 % vlhkost)
              </span>
            </div>
            <p className="text-lg text-gray-600">
              = 550 kg sušiny + 450 kg vody
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Oxidů draslíku</div>
                  <div className="text-3xl font-bold text-orange-600">K₂O: 68,8 kg</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">V sušině</div>
                  <div className="text-lg font-semibold text-gray-700">12,5 %</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Okamžitě dostupný draslík v rozpustné formě
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Oxidů fosforu</div>
                  <div className="text-3xl font-bold text-blue-600">P₂O₅: 7,5 kg</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">V sušině (0,6 % P)</div>
                  <div className="text-lg font-semibold text-gray-700">~1,4 %</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Fosfor pro energetický metabolismus a růst kořenů
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Oxidů vápníku</div>
                  <div className="text-3xl font-bold text-green-600">CaO: 33,0 kg</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">V sušině</div>
                  <div className="text-lg font-semibold text-gray-700">6 %</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Vápník pro strukturu půdy a stavbu buněčných stěn
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-gray-900">+ Mikroprvky:</span>
                <span className="text-lg text-gray-700">Mg, Fe, Mn, Zn, B</span>
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                Doplňkové mikroprvky přirozeně obsažené v popelu
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white text-center">
            <p className="text-2xl font-bold mb-2">
              Celková hodnota živin: 1 460 Kč/t
            </p>
            <p className="text-lg opacity-90">
              (při cenách průmyslových hnojiv)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

