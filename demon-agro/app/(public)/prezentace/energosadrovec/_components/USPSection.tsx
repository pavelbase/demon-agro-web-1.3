"use client";

import { DollarSign, Heart, Clock, Gift, Leaf, Zap } from "lucide-react";

export default function USPSection() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Cena na klíč",
      description: "Od 650 Kč/ha včetně dopravy a aplikace podle dávky",
      color: "green",
    },
    {
      icon: Heart,
      title: "Bez starostí",
      description: "Neřešíte sklady, logistiku, techniku",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Správný timing",
      description: "Aplikujeme v únoru-březnu, kdy to rostliny potřebují",
      color: "orange",
    },
    {
      icon: Gift,
      title: "Vápník v ceně",
      description: "125 kg CaO/ha pro výživu rostlin a strukturu půdy",
      color: "purple",
    },
    {
      icon: Leaf,
      title: "Žádná kyselost",
      description: "Na rozdíl od SAM/DASA neokyselujeme půdu",
      color: "emerald",
    },
    {
      icon: Zap,
      title: "Flexibilita",
      description: "Oddělíte síru od dusíku, každou živinu v optimální čas",
      color: "yellow",
    },
  ];

  const colorClasses: { [key: string]: any } = {
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
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-200",
      hover: "hover:border-emerald-400",
    },
    yellow: {
      bg: "bg-yellow-100",
      icon: "text-yellow-600",
      border: "border-yellow-200",
      hover: "hover:border-yellow-400",
    },
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Proč my?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Šest důvodů, proč zvolit naše řešení
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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

        {/* Závěrečný box */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-10 shadow-2xl text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Komplexní služba, ne jen prodej hnojiva
            </h3>
            <p className="text-xl md:text-2xl leading-relaxed mb-8 text-white/95">
              Staráme se o všechno: od skladování, přes dopravu, až po aplikaci. 
              Vy jen čekáte na lepší výnosy a kvalitnější produkci.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-semibold border border-white/30">
                ✅ Žádné sklady
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-semibold border border-white/30">
                ✅ Žádná logistika
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-semibold border border-white/30">
                ✅ Žádná technika
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-semibold border border-white/30">
                ✅ Jen výsledky
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

