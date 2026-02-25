"use client";

import { AlertTriangle } from "lucide-react";

export default function WarningsSection() {
  const warnings = [
    {
      title: "Neobsahuje dusík (N)",
      description: "Nutno doplnit zvlášť (LAD 8 150 Kč/t, DASA 9 100 Kč/t, DAM 8 500 Kč/t)",
    },
    {
      title: "35 % vlhkost",
      description: "Přepravuje se přibližně 1,5× více hmotnosti oproti suché sušině (650 kg sušiny z 1 t)",
    },
    {
      title: "Variabilita složení",
      description: "Nutná laboratorní analýza každé šarže (zajišťujeme)",
    },
    {
      title: "Vyšší dávky na ha",
      description: "3 t/ha vs. ~0,5 t u průmyslových hnojiv (kvůli vlhkosti)",
    },
    {
      title: "Legislativa",
      description: "Nutné dodržet limity těžkých kovů dle vyhlášky č. 474/2000 Sb.",
    },
    {
      title: "Prašnost",
      description: "Při aplikaci za sucha nutná opatření (vlhčení, ochranné prostředky)",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-orange-100 px-6 py-3 rounded-full border-2 border-orange-300 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <span className="text-lg font-bold text-gray-900">Férové upozornění</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Na co upozornit
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transparentní informace — žádná překvapení
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-200">
          <div className="grid md:grid-cols-2 gap-6">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {warning.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {warning.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              💡 Proč vám to říkáme předem?
            </h3>
            <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              Protože <strong>důvěra se buduje transparentností</strong>. Popel není univerzální zázrak — 
              má své výhody i limity. Chceme, abyste věděli přesně, co dostanete, 
              a mohli se rozhodnout na základě faktů, ne marketingových frází.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

