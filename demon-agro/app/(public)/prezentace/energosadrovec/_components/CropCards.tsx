"use client";

import { Leaf, Wheat, Flower2, Candy, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function CropCards() {
  const [selectedCrop, setSelectedCrop] = useState(0);

  const crops = [
    {
      icon: Leaf,
      name: "Řepka ozimá",
      color: "yellow",
      need: "60-70 kg S/ha",
      dosage: "500 kg/ha",
      price: "750-850 Kč/ha",
      benefits: [
        "Při nedostatku S: +0,3-0,5 t/ha",
        "Při prevenci: plný výnosový potenciál",
        "Vyšší olejnatost",
        "Lepší přezimování",
      ],
      tip: "Nedávejte DASA - poměr N:S 2:1 nesedí. Řepka potřebuje 3-7:1.",
      warning: true,
    },
    {
      icon: Wheat,
      name: "Pšenice ozimá",
      color: "amber",
      need: "20-30 kg S/ha",
      dosage: "300 kg/ha",
      price: "650 Kč/ha",
      benefits: [
        "Lepší kvalita lepku",
        "Vyšší Zelenyho test",
        "Posun z krmné do potravinářské",
        "Vyšší obsah bílkovin",
      ],
      tip: "Síra zlepšuje kvalitu lepku = vyšší Zelenyho test = lepší cena.",
      warning: false,
    },
    {
      icon: Flower2,
      name: "Mák setý",
      color: "purple",
      need: "18 kg S/ha",
      dosage: "300-400 kg/ha",
      price: "650-750 Kč/ha",
      benefits: [
        "Neutrální pH",
        "Snížení příjmu kadmia",
        "Zdravější porost",
        "Vyšší kvalita semene",
      ],
      tip: "SAM okyseluje půdu a zvyšuje příjem kadmia! Energosádrovec je neutrální.",
      warning: true,
    },
    {
      icon: Candy,
      name: "Cukrová řepa",
      color: "green",
      need: "30 kg S/ha",
      dosage: "400-500 kg/ha",
      price: "600-850 Kč/ha",
      benefits: [
        "Vyšší cukernatost",
        "+10-15% výnosu",
        "Lepší zdravotní stav",
        "Vyšší výtěžnost cukru",
      ],
      tip: "Jediná plodina s garantovanou cenou. Tady se investice vyplatí nejvíc.",
      warning: false,
    },
  ];

  const colorClasses: { [key: string]: any } = {
    yellow: {
      bg: "from-yellow-400 to-amber-500",
      icon: "bg-yellow-100 text-yellow-600",
      badge: "bg-yellow-600",
      border: "border-yellow-300",
    },
    amber: {
      bg: "from-amber-500 to-orange-500",
      icon: "bg-amber-100 text-amber-600",
      badge: "bg-amber-600",
      border: "border-amber-300",
    },
    purple: {
      bg: "from-purple-500 to-pink-500",
      icon: "bg-purple-100 text-purple-600",
      badge: "bg-purple-600",
      border: "border-purple-300",
    },
    green: {
      bg: "from-green-500 to-emerald-600",
      icon: "bg-green-100 text-green-600",
      badge: "bg-green-600",
      border: "border-green-300",
    },
  };

  const selected = crops[selectedCrop];
  const colors = colorClasses[selected.color];
  const Icon = selected.icon;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Doporučení podle plodin
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Přesné dávky a ceny pro hlavní polní plodiny
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {crops.map((crop, index) => {
            const CropIcon = crop.icon;
            const isActive = selectedCrop === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedCrop(index)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${colorClasses[crop.color].bg} text-white shadow-xl scale-105`
                    : "bg-white text-gray-700 hover:shadow-lg hover:scale-102"
                }`}
              >
                <CropIcon className={`w-6 h-6 ${isActive ? "" : "text-gray-600"}`} />
                {crop.name}
              </button>
            );
          })}
        </div>

        {/* Detail karty */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${colors.border}">
          {/* Header */}
          <div className={`bg-gradient-to-r ${colors.bg} text-white p-10`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Icon className="w-12 h-12" />
              </div>
              <h3 className="text-4xl font-bold">{selected.name}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-10">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Levý sloupec */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-1">Potřeba síry</div>
                  <div className="text-3xl font-bold text-gray-900">{selected.need}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-1">Doporučená dávka</div>
                  <div className="text-3xl font-bold text-gray-900">{selected.dosage}</div>
                </div>
                <div className={`bg-gradient-to-r ${colors.bg} text-white rounded-xl p-6`}>
                  <div className="text-sm mb-1 text-white/90">Cena za aplikaci</div>
                  <div className="text-3xl font-bold">{selected.price}</div>
                  <div className="text-sm mt-2 text-white/90">včetně dopravy a aplikace</div>
                </div>
              </div>

              {/* Pravý sloupec */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Přínosy:</h4>
                  <ul className="space-y-3">
                    {selected.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className={`${selected.warning ? "bg-orange-50 border-orange-300" : "bg-blue-50 border-blue-300"} border-2 rounded-2xl p-6`}>
              <div className="flex items-start gap-4">
                <div className={`${selected.warning ? "bg-orange-600" : "bg-blue-600"} rounded-full p-3 flex-shrink-0`}>
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    {selected.warning ? "⚠️ Důležité upozornění" : "💡 Tip"}
                  </h4>
                  <p className="text-gray-700 text-lg leading-relaxed">{selected.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

