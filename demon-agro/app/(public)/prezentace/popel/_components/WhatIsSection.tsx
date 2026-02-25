"use client";

import { Droplet, Sparkles, Calendar, Package } from "lucide-react";

export default function WhatIsSection() {
  const features = [
    {
      icon: Package,
      title: "Složení",
      value: "K₂O + P₂O₅ + CaO",
      description: "10–15 % K₂O, 0,6 % P, 6 % CaO",
      subtitle: "Při vlhkosti 35 % v sušině",
    },
    {
      icon: Droplet,
      title: "Forma draslíku",
      value: "K₂O",
      description: "Okamžitě dostupný",
      subtitle: "Rozpustná forma pro rychlý příjem",
    },
    {
      icon: Sparkles,
      title: "Aplikace",
      value: "3 t/ha",
      description: "= 244 kg K₂O + 27 kg P₂O₅ + 117 kg CaO",
      subtitle: "Jeden přejezd, všechny živiny",
    },
    {
      icon: Calendar,
      title: "Termín",
      value: "Podzim / Jaro",
      description: "Před setím nebo na strniště",
      subtitle: "Flexibilní termín aplikace",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Co je popel?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Popel ze slámy je přírodní vícesložkové hnojivo bohaté na draslík, fosfor a vápník. 
            Recyklace živin z obnovitelných zdrojů — cirkulární ekonomika v praxi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
              >
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2 text-center">
                  {feature.title}
                </h3>
                <div className="text-2xl font-bold text-orange-600 mb-2 text-center">
                  {feature.value}
                </div>
                <p className="text-sm text-gray-600 text-center mb-1">
                  {feature.description}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  {feature.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 rounded-full p-2 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Přesně to, co vaše půda potřebuje
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Popel ze slámy dodává živiny v okamžitě dostupné formě. 
                  Draslík v oxidové formě (K₂O) je rozpustný a rostliny ho přijímají hned po aplikaci. 
                  Navíc získáte fosfor pro energetický metabolismus a vápník pro strukturu půdy i buněčných stěn — 
                  vše v jedné aplikaci.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

