"use client";

import { Phone, MapPin, FlaskConical, FileText, MessageSquare } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      number: 1,
      icon: Phone,
      title: "Poptávka",
      duration: "5 minut",
      description:
        "Zavolejte nebo napište. Sdělte výměru a lokality, které chcete analyzovat. Připravíme nezávaznou nabídku — včetně možnosti sloučení se sousedními farmami.",
      detail: "Potřebujeme: přibližnou výměru (ha), lokality (katastr / GPS / .shp soubor z LPIS) a preferovaný termín výjezdu.",
    },
    {
      number: 2,
      icon: MapPin,
      title: "Zónový odběr vzorků",
      duration: "1–2 dny dle výměry",
      description:
        "Přijedeme k vám na pozemek s plně automatizovanou soupravou. Jeden vzorek reprezentuje zónu 2–4 ha — přesné pozicování pomocí RTK navigace.",
      detail:
        "Odběr probíhá celoročně, ideálně po sklizni nebo brzy na jaře. Každý vzorek tvoří 20 dílčích vpichů do hloubky 20–25 cm. RTK pozicování zajišťuje opakovatelnost — příštím cyklem přijedeme na stejná místa.",
    },
    {
      number: 3,
      icon: FlaskConical,
      title: "Laboratorní analýza",
      duration: "5–10 pracovních dní",
      description:
        "Vzorky putují do certifikované laboratoře. Standardně stanovujeme pH, P, K, Mg, Ca a S — na vyžádání rozšíříme o humus, N formy nebo mikroprvky.",
      detail:
        "Metoda Mehlich 3 (P, K, Mg, Ca, S) + pH v CaCl₂. Standardizovaná metodika zajišťuje srovnatelnost výsledků v čase i mezi parcelami.",
    },
    {
      number: 4,
      icon: FileText,
      title: "Výsledkové mapy a zpráva",
      duration: "Do 3 týdnů od odběru",
      description:
        "Obdržíte barevné mapy živin pro každý parametr, tabulku hodnot zón a doporučení variabilních dávek pro aplikátory.",
      detail:
        "Výstupy jsou kompatibilní s běžnými systémy precizního zemědělství: SatAgro, Cropwise, John Deere Operations Center. Export ve formátech .shp, .pdf, .xlsx.",
    },
    {
      number: 5,
      icon: MessageSquare,
      title: "Konzultace a hnojební plán",
      duration: "30–60 minut",
      description:
        "Výsledky projdeme společně. Navrhneme konkrétní hnojiva, variabilní dávky a termíny — s cílem maximalizovat výnos a minimalizovat zbytečné náklady.",
      detail:
        "Konzultace zahrnuje návrh hnojebního plánu: co aplikovat, v jakém množství a kde. Zohledňujeme plodinu, cílový výnos, zásobu v půdě a aktuální ceny hnojiv.",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Jak to probíhá?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Pět kroků od poptávky k hotovému hnojebnímu plánu
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              return (
                <div key={step.number} className="relative flex gap-6">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-4 border-white">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-sky-400 flex items-center justify-center text-white text-xs font-black shadow-md">
                      {step.number}
                    </div>
                  </div>

                  <div
                    className={`flex-1 bg-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 ${
                      !isLast ? "mb-2" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-sm text-blue-800">{step.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            Od poptávky k výsledkům: do 3 týdnů od odběru
          </h3>
          <p className="text-white/90 mb-4">
            Zónový odběr → laboratoř → výsledkové mapy → konzultace. Vše zařídíme za vás.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {["RTK odběr na místě", "Kompletní služba", "Výsledky do 3 týdnů", "Konzultace v ceně"].map(
              (item) => (
                <span
                  key={item}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-semibold border border-white/25"
                >
                  ✓ {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
