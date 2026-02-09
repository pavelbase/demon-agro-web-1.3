"use client";

import { X, AlertCircle } from "lucide-react";

export default function UreaMythSection() {
  const problems = [
    {
      title: "Ztráty těkáním",
      description: "Při povrchové aplikaci uniká 5-30% N jako amoniak",
      detail: "Závisí na počasí: v suchu až 30%, před deštěm 5-10%. Inhibitor ureázy (500 Kč/ha) sníží na ~5-10%",
      impact: "= platíte za dusík, který se vypařil (nejvíc v suchu)",
    },
    {
      title: "Pomalý účinek",
      description: "Močovina musí být nejprve přeměněna ureázou na amoniak",
      detail: "Trvá 7-14 dní než začne působit",
      impact: "Na jaře, kdy rostliny potřebují N rychle, to je problém",
    },
    {
      title: "Neobsahuje síru",
      description: "0% síry = musíte ji dodat zvlášť",
      detail: "Bez síry rostlina nevyužije ani ten dusík, co se k ní dostane",
      impact: "= dvojí ztráta",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            POZOR: ČASTÁ CHYBA
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Močovina (UREA) — skrytá past
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Vypadá levně, ale reálné náklady a rizika jsou mnohem vyšší
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-xl border-2 border-red-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {problem.title}
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold text-center">{problem.description}</p>
                <p className="text-center text-gray-600">{problem.detail}</p>
                <div className="bg-red-50 rounded-lg p-4 mt-4 border border-red-200">
                  <p className="font-bold text-red-700 text-center">{problem.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Závěr box */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 shadow-2xl text-white">
          <div className="flex items-start gap-6">
            <div className="bg-white rounded-full p-4 flex-shrink-0">
              <AlertCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Závěr: LAD je lepší volba
              </h3>
              <div className="space-y-4 text-lg">
                <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                  <p className="font-semibold mb-2">✅ LAD má 50/50 nitrátový a amonný dusík</p>
                  <p className="text-green-100">
                    Část působí okamžitě, část postupně. Rostlina dostane dusík přesně když ho potřebuje.
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                  <p className="font-semibold mb-2">✅ Žádné ztráty těkáním</p>
                  <p className="text-green-100">
                    Nitrátový dusík se okamžitě rozpouští a pohybuje k kořenům. Amonný se váže na půdní koloid.
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                  <p className="font-semibold mb-2">✅ Přidejte energosádrovec = kompletní výživa</p>
                  <p className="text-green-100">
                    Síra z energosádrovce zajistí, že rostlina využije každý kilogram dusíku z LAD. Za rozumnou cenu.
                  </p>
                </div>
              </div>
              <div className="mt-8 bg-white rounded-lg p-6 text-gray-900">
                <p className="text-2xl font-bold text-center">
                  LAD + Energosádrovec = Optimální kombinace výživy pro jaře
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

