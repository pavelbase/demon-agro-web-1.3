"use client";

import { MapPin, Award, FileText, Clock, HeartHandshake, Leaf } from "lucide-react";

export default function USPSection() {
  const benefits = [
    {
      icon: MapPin,
      title: "Odběr vzorků u vás",
      description: "Přijedeme na vaše pozemky a vzorky odebereme my. Vy nemusíte nic organizovat.",
      color: "blue",
    },
    {
      icon: Award,
      title: "Certifikovaná laboratoř",
      description: "Analýzy z akreditované laboratoře metodou Mehlich 3 — standardizované, opakovatelné, srovnatelné v čase.",
      color: "sky",
    },
    {
      icon: FileText,
      title: "Přehledný digitální report",
      description: "Výsledky dostanete v přehledné digitální formě — kategorizace, mapy, tabulky, export.",
      color: "indigo",
    },
    {
      icon: Clock,
      title: "Výsledky do 3 týdnů",
      description: "Od odběru k hotovým mapám a doporučení — do 3 týdnů. Plánujte hnojení s předstihem.",
      color: "purple",
    },
    {
      icon: HeartHandshake,
      title: "Konzultace v ceně",
      description: "Výsledky projdeme společně. Dostanete konkrétní plán: co aplikovat, kdy a kolik.",
      color: "green",
    },
    {
      icon: Leaf,
      title: "Propojení s hnojením",
      description: "Analýza není konec — je to začátek. Nabídneme vám optimalizaci hnojení přesně dle výsledků.",
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
    blue:    { bg: "bg-blue-100",    icon: "text-blue-600",    border: "border-blue-200",    hover: "hover:border-blue-400" },
    sky:     { bg: "bg-sky-100",     icon: "text-sky-600",     border: "border-sky-200",     hover: "hover:border-sky-400" },
    indigo:  { bg: "bg-indigo-100",  icon: "text-indigo-600",  border: "border-indigo-200",  hover: "hover:border-indigo-400" },
    purple:  { bg: "bg-purple-100",  icon: "text-purple-600",  border: "border-purple-200",  hover: "hover:border-purple-400" },
    green:   { bg: "bg-green-100",   icon: "text-green-600",   border: "border-green-200",   hover: "hover:border-green-400" },
    emerald: { bg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-400" },
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Proč analýza půdy u nás?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Šest důvodů, proč precizní zemědělci volí datově podložené hnojení
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
                <div
                  className={`${colors.bg} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}
                >
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

        {/* Závěrečný call-out */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 rounded-3xl p-10 shadow-2xl text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Analýza půdy je investice, ne náklad
            </h3>
            <p className="text-xl md:text-2xl leading-relaxed mb-8 text-white/95">
              Za 74 Kč/ha/rok dostanete data, která vám ušetří 1 000–1 500 Kč/ha
              na zbytečných hnojivech — každý rok, na každém hektaru.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              {["Odběr na místě", "Akreditovaná laboratoř", "Výsledky do 3 týdnů", "Konzultace zdarma"].map(
                (item) => (
                  <div
                    key={item}
                    className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-semibold border border-white/30"
                  >
                    ✅ {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
