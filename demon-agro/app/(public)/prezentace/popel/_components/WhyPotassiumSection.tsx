"use client";

import { TrendingDown, AlertTriangle, DollarSign } from "lucide-react";

export default function WhyPotassiumSection() {
  const reasons = [
    {
      icon: TrendingDown,
      title: "Zásoby draslíku v českých půdách klesají",
      description: "Mnoho zemědělců od 90. let draslíkem nehnojí. Zásoby v půdě se vyčerpávají, hlavně na lehčích půdách. Bilance draslíku je v ČR dlouhodobě záporná.",
      highlight: "Půdy chudnou na draslík",
      color: "red",
    },
    {
      icon: AlertTriangle,
      title: "Draslík = odolnost rostlin",
      description: "Draslík reguluje vodní režim (transpiraci), zvyšuje odolnost vůči suchu, mrazu a chorobám. Ovlivňuje kvalitu produkce: cukrnatost řepy, olejnatost řepky, škrobnatost brambor.",
      highlight: "Klíčový pro stres a kvalitu",
      color: "orange",
    },
    {
      icon: DollarSign,
      title: "Liebigův zákon minima",
      description: "Stejná logika jako u síry nebo jiných živin. Bez dostatku draslíku nevyužijete ani dusík a fosfor. Draslík se stává limitujícím faktorem výnosu.",
      highlight: "Draslík jako limitující faktor",
      color: "red",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Proč potřebujete draslík?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tři kritická fakta o draslíku v zemědělství
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            const colorClasses = {
              red: {
                bg: "bg-red-50",
                border: "border-red-200",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
                highlight: "bg-red-600",
              },
              orange: {
                bg: "bg-orange-50",
                border: "border-orange-200",
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
                highlight: "bg-orange-600",
              },
            }[reason.color];

            return (
              <div
                key={index}
                className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className={`${colorClasses.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                  <Icon className={`w-8 h-8 ${colorClasses.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center min-h-[56px] flex items-center justify-center">
                  {reason.title}
                </h3>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {reason.description}
                </p>

                <div className={`${colorClasses.highlight} text-white text-center py-3 px-4 rounded-lg font-bold`}>
                  {reason.highlight}
                </div>
              </div>
            );
          })}
        </div>

        {/* Liebigův zákon minima */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🛢️ Liebigův zákon minima: Draslík jako nejkratší plaňka
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* ASCII vizuál sudu */}
            <div className="flex-shrink-0 bg-gradient-to-b from-amber-100 to-amber-200 rounded-xl p-6 border-2 border-amber-400">
              <pre className="text-gray-700 text-sm font-mono leading-tight">
{`   ┌─────────────┐
   │     N       │ ▲
   │             │ │ 
   ├─────────────┤ │ Vysoké
   │     P       │ │
   │             │ │
   ├─────────────┤ │
   │     S       │ │
   │             │ ▼
   ├─────────────┤
   │    [K]      │ ◄─ LIMITUJÍCÍ!
   ├─────────────┤
   │             │
   │   🌾 💧     │
   └─────────────┘`}
              </pre>
            </div>
            
            <div className="flex-1">
              <p className="text-gray-700 text-base leading-relaxed mb-4">
                <strong>Liebigův zákon minima</strong> říká, že výnos limituje živina, která je 
                v nejmenším množství — ne ta, které je nejvíc.
              </p>
              <p className="text-gray-700 text-base leading-relaxed mb-4">
                Můžete dát 200 kg dusíku, 80 kg fosforu a 70 kg síry. Ale pokud chybí 
                <strong className="text-red-600"> draslík</strong>, rostlina nevyužije ani ostatní živiny. 
                Draslík je dnes na mnoha půdách tou <strong>"nejkratší plaňkou"</strong>.
              </p>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-red-800 font-bold text-center">
                  → Bez draslíku vyhazujete tisíce korun za ostatní hnojiva, která rostlina nemůže plně využít!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            💡 Proč je draslík tak důležitý?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Vodní režim</h4>
              <p>Draslík reguluje otevírání průduchů (transpiraci) a tím efektivitu využití vody rostlinou.</p>
            </div>
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Odolnost vůči stresu</h4>
              <p>Zvyšuje odolnost vůči suchu, mrazu a chorobám. Klíčový pro přežití rostlin v extrémních podmínkách.</p>
            </div>
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Kvalita produkce</h4>
              <p>Ovlivňuje cukrnatost cukrovky, olejnatost řepky, škrobnatost brambor a další kvalitativní parametry.</p>
            </div>
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Transport živin</h4>
              <p>Nezbytný pro transport cukrů a dalších látek v rostlině. Bez draslíku je metabolismus pomalý.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

