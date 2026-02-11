"use client";

import { ArrowRight } from "lucide-react";

export default function PerHectareSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Přepočet na 1 hektar
          </h2>
          <p className="text-lg text-gray-600">
            Dávka 3 t/ha — porovnání nákladů
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Popel */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 shadow-xl border-2 border-orange-300">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Popel</h3>
              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-orange-200">
                <div className="text-6xl font-bold text-orange-600 mb-2">3 000</div>
                <div className="text-lg text-gray-700 font-semibold">Kč/ha</div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">Včetně:</p>
                <p>✓ Materiál</p>
                <p>✓ Doprava</p>
                <p>✓ Aplikace</p>
                <p>✓ Žádné starosti</p>
              </div>
            </div>
          </div>

          {/* Průmyslová hnojiva */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 shadow-xl border-2 border-red-300">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Průmyslová hnojiva</h3>
              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-red-200">
                <div className="text-6xl font-bold text-red-600 mb-2">5 430</div>
                <div className="text-lg text-gray-700 font-semibold">Kč/ha</div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">Plus:</p>
                <p>✗ Několik dodavatelů</p>
                <p>✗ 2-3 přejezdy</p>
                <p>✗ Vlastní logistika</p>
                <p>✗ Více starostí</p>
              </div>
            </div>
          </div>

          {/* Úspora */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 shadow-2xl border-4 border-green-400 flex flex-col justify-center">
            <div className="text-center text-white">
              <div className="mb-4">
                <ArrowRight className="w-12 h-12 mx-auto transform rotate-90 md:rotate-0" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Úspora</h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 border-2 border-white/30">
                <div className="text-7xl font-bold mb-2">2 430</div>
                <div className="text-xl font-semibold">Kč/ha</div>
              </div>
              <p className="text-lg opacity-95 font-semibold">
                Na každém hektaru!
              </p>
            </div>
          </div>
        </div>

        {/* Detail dodaných živin */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Co dostanete při aplikaci 3 t popela na hektar?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">206 kg</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">K₂O</div>
              <div className="text-sm text-gray-600">Oxidů draslíku na hektar</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">23 kg</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">P₂O₅</div>
              <div className="text-sm text-gray-600">Oxidů fosforu na hektar</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-green-600 mb-2">99 kg</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">CaO</div>
              <div className="text-sm text-gray-600">Oxidů vápníku na hektar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

