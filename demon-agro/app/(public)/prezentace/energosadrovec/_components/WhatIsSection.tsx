"use client";

import { Droplet, Sparkles, Calendar, Package } from "lucide-react";

export default function WhatIsSection() {
  const features = [
    {
      icon: Package,
      title: "Složení",
      value: "min. 14% S + 25% CaO",
      description: "Síran vápenatý (CaSO₄)",
    },
    {
      icon: Droplet,
      title: "Forma síry",
      value: "SO₄²⁻",
      description: "Okamžitě dostupná pro rostliny",
    },
    {
      icon: Sparkles,
      title: "Aplikace",
      value: "500 kg/ha",
      description: "= 70 kg S + 125 kg CaO",
    },
    {
      icon: Calendar,
      title: "Termín",
      value: "Únor - Březen",
      description: "Do porostu, před vegetací",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Co je energosádrovec?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Síran vápenatý vznikající při odsíření spalin — certifikované hnojivo s okamžitým účinkem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200"
              >
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2 text-center">
                  {feature.title}
                </h3>
                <div className="text-2xl font-bold text-green-600 mb-2 text-center">
                  {feature.value}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 rounded-full p-2 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Přesně to, co vaše půda potřebuje
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Energosádrovec dodává síru v síranové formě (SO₄²⁻), která je okamžitě dostupná pro rostliny. 
                  Na rozdíl od elementární síry, která musí být v půdě nejprve mikrobiálně oxidována (což trvá měsíce), 
                  síranová síra působí hned po aplikaci. Plus: 125 kg CaO na hektar pro výživu rostlin, bez okyselení půdy.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bonus: Zlepšení struktury půdy
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  Kromě výživy funguje energosádrovec jako <strong>půdní kondicionér</strong>. Vápník pomáhá vločkovat 
                  (flokulovat) jílové částice, což vytváří drobtovitou strukturu. Výsledek:
                </p>
                <ul className="space-y-2 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Lepší vsakování vody a provzdušněnost půdy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Snazší zpracovatelnost těžších půd</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Vyšší infiltrace vody = méně eroze a utužení</span>
                  </li>
                </ul>
                <p className="text-base text-gray-700 leading-relaxed mt-3 font-semibold">
                  To SAM ani DASA neumí — ty půdu acidifikují a destabilizují sorpční komplex.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

