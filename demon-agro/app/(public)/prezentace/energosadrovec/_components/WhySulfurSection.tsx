"use client";

import { TrendingDown, AlertTriangle, DollarSign } from "lucide-react";

export default function WhySulfurSection() {
  const reasons = [
    {
      icon: TrendingDown,
      title: "Pokles atmosférické depozice",
      before: "30-70 kg S/ha",
      beforeLabel: "Dříve (80. léta, dle lokality)",
      after: "5 kg S/ha ročně",
      afterLabel: "Dnes",
      highlight: "Až 14× méně síry zdarma",
      color: "red",
    },
    {
      icon: AlertTriangle,
      title: "85% českých půd má nízký obsah síry",
      before: null,
      after: null,
      highlight: "Zdroj: ÚKZÚZ, Kulhanek et al. 2018",
      description: "Většina zemědělské půdy v ČR trpí deficitem síry, což se projevuje na výnosech a kvalitě produkce.",
      color: "orange",
    },
    {
      icon: DollarSign,
      title: "Síra = využití dusíku",
      before: "60-70% N",
      beforeLabel: "Bez síry využijete jen",
      after: "2 500+ Kč/ha",
      afterLabel: "Ztráta na hnojivu",
      highlight: "Bez síry nevyužijete dusík!",
      color: "red",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Proč potřebujete síru?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tři kritická fakta podložená čísly
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

                {reason.before && reason.after && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">{reason.beforeLabel}</div>
                      <div className="text-2xl font-bold text-gray-900">{reason.before}</div>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-gray-400 w-1 h-8 rounded-full"></div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">{reason.afterLabel}</div>
                      <div className="text-2xl font-bold text-gray-900">{reason.after}</div>
                    </div>
                  </div>
                )}

                {reason.description && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {reason.description}
                  </p>
                )}

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
            🛢️ Liebigův zákon minima: Síra jako nejkratší plaňka
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
   │     K       │ │
   │             │ ▼
   ├─────────────┤
   │    [S]      │ ◄─ LIMITUJÍCÍ!
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
                Můžete dát 200 kg dusíku, 80 kg fosforu a 120 kg draslíku. Ale pokud chybí 
                <strong className="text-red-600"> 20 kg síry</strong>, rostlina nevyužije ani tu zásobu dusíku. 
                Síra je dnes na 85% českých půd tou <strong>"nejkratší plaňkou"</strong>.
              </p>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-red-800 font-bold text-center">
                  → Bez síry vyhazujete tisíce korun za dusík, který rostlina nemůže využít!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            💡 Proč je síra tak důležitá?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Syntéza bílkovin</h4>
              <p>Síra je součástí aminokyselin cysteinu a methioninu. Bez síry rostlina nemůže tvořit bílkoviny.</p>
            </div>
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Využití dusíku</h4>
              <p>Optimální poměr N:S je 10-15:1. Při nedostatku síry rostlina nevyužije dusík → ztráta tisíců korun.</p>
            </div>
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Kvalita produkce</h4>
              <p>U pšenice zlepšuje kvalitu lepku (Zelenyho test), u řepky zvyšuje olejnatost.</p>
            </div>
            <div className="bg-white/70 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-2">Odolnost rostlin</h4>
              <p>Síra posiluje buněčné stěny a zvyšuje odolnost vůči stresu a chorobám.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

