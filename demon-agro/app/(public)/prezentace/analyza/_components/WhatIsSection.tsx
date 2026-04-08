"use client";

import { FlaskConical, MapPin, FileText, Lightbulb } from "lucide-react";

export default function WhatIsSection() {
  const features = [
    {
      icon: MapPin,
      title: "Odběr vzorků",
      value: "1 vzorek / 2–4 ha",
      description: "Plně automatizovaný RTK odběr — přijedeme k vám",
    },
    {
      icon: FlaskConical,
      title: "Laboratoř",
      value: "Certifikovaná analýza",
      description: "Akreditovaná laboratoř, výsledky do 3 týdnů",
    },
    {
      icon: FileText,
      title: "Výsledkové mapy",
      value: "Digitální výstup",
      description: "Mapy živin + export do SatAgro, Cropwise, .shp",
    },
    {
      icon: Lightbulb,
      title: "Doporučení",
      value: "Variabilní hnojení",
      description: "Konkrétní dávky pro každou zónu — základ VRA",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Co je analýza půdy?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Precizní zónový odběr vzorků s RTK navigací a laboratorní analýza —
            datový základ pro variabilní hnojení a skutečné precizní zemědělství
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2 text-center">
                  {feature.title}
                </h3>
                <div className="text-xl font-bold text-blue-700 mb-2 text-center">
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
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bez dat hnojíte odhadem — a přicházíte o zisk
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Každá zóna na vašem poli je jiná. Stejná plošná dávka hnojiva může být
                  na části parcel zbytečná a na jiné části stále nedostatečná. Analýza
                  půdy odhalí přesný stav každé zóny: co chybí, kde je zásoby nadbytek
                  a kde je pH mimo optimum. Teprve pak hnojíte přesně — a přesně tam,
                  kde se to vyplatí.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
            <div className="flex items-start gap-3">
              <div className="bg-sky-600 rounded-full p-2 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Základ precizního zemědělství
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  Data z analýzy jsou přímým vstupem pro systémy variabilní aplikace (VRA).
                  Místo plošného hnojení aplikujete přesně tam, kde to půda potřebuje —
                  v přesném množství pro každou zónu. Výsledkové mapy jsou kompatibilní
                  se standardními řídícími systémy.
                </p>
                <ul className="space-y-2 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">✓</span>
                    <span>Mapy živin jako vstup pro aplikátory hnojiv (SatAgro, Cropwise, .shp)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">✓</span>
                    <span>Variabilní dávkování K, P, Mg, Ca a vápna podle zóny</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">✓</span>
                    <span>Sledování trendu vývoje zásobenosti půdy v čase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-600 font-bold">✓</span>
                    <span>Datový základ pro optimalizaci osevních postupů i dávek hnojiv</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
