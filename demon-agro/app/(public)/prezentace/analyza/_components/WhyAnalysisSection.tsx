"use client";

import { TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";

export default function WhyAnalysisSection() {
  const facts = [
    {
      icon: TrendingDown,
      stat: "Průměrný farmář přehnojuje dusíkem o 15–25 %",
      label: "Plýtvání bez dat",
      description:
        "Bez analýzy půdy nevíte, kolik živin je v půdě k dispozici z předchozích let a ze zásoby. Výsledek: dáváte víc, než rostliny potřebují — a zbytek se vyplaví nebo unikne do atmosféry.",
      color: "red",
    },
    {
      icon: AlertTriangle,
      stat: "Na 60 % českých půd je nevyvážený poměr K : Mg : Ca",
      label: "Nevyvážená výživa",
      description:
        "Přebytek jedné živiny blokuje příjem druhé. Příliš mnoho draslíku omezuje příjem hořčíku. Přebytek vápníku blokuje fosfor. Bez analýzy nevíte, jestli živiny ve vašem rezervoáru navzájem nekonkurují.",
      color: "orange",
    },
    {
      icon: BarChart3,
      stat: "Optimalizace hnojení šetří průměrně 1 500–3 000 Kč/ha ročně",
      label: "Prokazatelná úspora",
      description:
        "Zemědělci, kteří přizpůsobí hnojení výsledkům rozboru, ušetří v průměru 1 500–3 000 Kč/ha. Na 100 ha je to 150 000–300 000 Kč ročně. Cena analýzy se vrátí mnohonásobně — v první sezóně.",
      color: "blue",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; icon: string; stat: string }> = {
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600 bg-red-100",
      stat: "text-red-700",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600 bg-orange-100",
      stat: "text-orange-700",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600 bg-blue-100",
      stat: "text-blue-700",
    },
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Proč potřebujete analýzu půdy?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tři kritická fakta, která vás přesvědčí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {facts.map((fact, index) => {
            const Icon = fact.icon;
            const colors = colorMap[fact.color];
            return (
              <div
                key={index}
                className={`${colors.bg} rounded-2xl p-6 border-2 ${colors.border}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colors.icon}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`text-lg font-bold mb-1 ${colors.stat}`}>
                  {fact.stat}
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {fact.label}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {fact.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Liebigův zákon minima */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              🛢️ Liebigův zákon minima: Neznámá živina jako nejkratší plaňka
            </h3>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <pre className="font-mono text-sm text-sky-200 leading-relaxed bg-blue-800/60 rounded-xl p-4">
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
   │    [?]      │ ◄─ NEZNÁMÉ!
   ├─────────────┤
   │             │
   │   🌾 💧     │
   └─────────────┘`}
                </pre>
              </div>
              <div className="space-y-4">
                <p className="text-base text-white/90 leading-relaxed">
                  Liebigův zákon minima říká, že výnos limituje živina v
                  nejmenším množství — ne ta, které je nejvíc.
                </p>
                <p className="text-base text-white/90 leading-relaxed">
                  Můžete dát 200 kg dusíku a 80 kg fosforu. Ale pokud má vaše
                  půda extrémně nízký hořčík nebo nevhodné pH, rostlina
                  nevyužije ani ostatní živiny.
                </p>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/25">
                  <p className="text-sky-200 font-bold text-lg">
                    → Bez analýzy nevíte, která živina je vaší „nejkratší
                    plaňkou"
                  </p>
                  <p className="text-white/80 text-sm mt-2">
                    A vyhazujete tisíce korun za hnojiva, která rostlina nemůže
                    plně využít.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
