"use client";

import { Zap, Sparkles, TrendingUp, Layers, Leaf, Package } from "lucide-react";

export default function AdditionalBenefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Jeden přejezd",
      description: "Všechny živiny najednou (K, P, Ca) vs. 2–3 přejezdy u průmyslových hnojiv",
      color: "orange",
    },
    {
      icon: Sparkles,
      title: "Mikroprvky v ceně",
      description: "Popel přirozeně obsahuje Mg, Fe, Mn, Zn, B — bez příplatku",
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "pH korekce",
      description: "33 kg CaO/t pomáhá zvyšovat pH kyselých půd",
      color: "green",
    },
    {
      icon: Layers,
      title: "Zlepšení struktury půdy",
      description: "Organická hmota a vápník zlepšují drobtovitost",
      color: "blue",
    },
    {
      icon: Leaf,
      title: "Cirkulární ekonomika",
      description: "Recyklace odpadního materiálu, nižší uhlíková stopa",
      color: "emerald",
    },
    {
      icon: Package,
      title: "Kompletní služba",
      description: "Materiál + doprava + aplikace = žádné starosti",
      color: "amber",
    },
  ];

  const colorClasses: { [key: string]: any } = {
    orange: {
      bg: "bg-orange-100",
      icon: "text-orange-600",
      border: "border-orange-200",
      hover: "hover:border-orange-400",
    },
    purple: {
      bg: "bg-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
      hover: "hover:border-purple-400",
    },
    green: {
      bg: "bg-green-100",
      icon: "text-green-600",
      border: "border-green-200",
      hover: "hover:border-green-400",
    },
    blue: {
      bg: "bg-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
      hover: "hover:border-blue-400",
    },
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-200",
      hover: "hover:border-emerald-400",
    },
    amber: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-200",
      hover: "hover:border-amber-400",
    },
  };

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Další výhody popela
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Šest důvodů, proč zvolit popel místo průmyslových hnojiv
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${colors.border} ${colors.hover} transition-all duration-300 hover:shadow-xl hover:scale-105`}
              >
                <div className={`${colors.bg} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

