"use client";

import Image from "next/image";

export default function ShowcaseSection() {
  const processPhotos = [
    {
      src: "/images/analyza/odber-vzorku.png",
      alt: "Odběr půdního vzorku — vzorek ze sondovacího zařízení",
      label: "Vzorek ihned po odběru",
    },
    {
      src: "/images/analyza/vozidlo-sonda.png",
      alt: "Suzuki Jimny s automatickým sondovacím zařízením a RTK anténou",
      label: "RTK navigace + automatická sonda",
    },
    {
      src: "/images/analyza/dva-vozy-pole.png",
      alt: "Dva terénní vozy s odběrovým vybavením na sklizené ploše",
      label: "Dvě pracovní čety v terénu",
    },
    {
      src: "/images/analyza/vozidlo-zima.png",
      alt: "Odběrové vozidlo na zasněženém poli — práce celoročně",
      label: "Pracujeme i v zimě",
    },
    {
      src: "/images/analyza/souprava-zapad.png",
      alt: "Odběrová souprava při západu slunce — profesionální hydraulické zařízení",
      label: "Profesionální odběrová souprava",
    },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* === Výsledková mapa === */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Jak vypadají výsledky?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ukázka reálného výstupu — výsledková mapa pH půdy a odběr vzorků v praxi
          </p>
        </div>

        {/* Mapa + legenda */}
        <div className="grid lg:grid-cols-5 gap-8 items-start mb-14">

          {/* Mapa — zabírá 3/5 */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200">
              <Image
                src="/images/analyza/mapa-ph.png"
                alt="Výsledková mapa pH půdy po zónovém odběru vzorků — ukázka reálného výstupu analýzy"
                width={1050}
                height={720}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Badge přes mapu */}
              <div className="absolute top-3 left-3 bg-blue-900/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                📍 Reálný výstup — Borówno (PL)
              </div>
            </div>
          </div>

          {/* Vysvětlení — zabírá 2/5 */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Výsledková mapa pH půdy
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Po odběru vzorků (zóny 2–4 ha) a laboratorní analýze vznikne barevná mapa, 
                která ukazuje pH v každé zóně. Na první pohled vidíte, kde je půda kyselá, 
                kde je v optimu a kde jsou problémová místa.
              </p>
            </div>

            {/* Legenda barev */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Legenda barev
              </h4>
              <div className="space-y-2.5">
                {[
                  {
                    color: "bg-green-400",
                    label: "Zelená — pH 6,8–7,2",
                    desc: "Neutrální, optimální pro většinu plodin",
                  },
                  {
                    color: "bg-yellow-400",
                    label: "Žlutá — pH 6,0–6,7",
                    desc: "Slabě kyselá, přijatelné — udržovací vápnění",
                  },
                  {
                    color: "bg-orange-400",
                    label: "Oranžová — pH 5,7–6,0",
                    desc: "Kyselá — vápnění nutné pro optimální výnosy",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 ${item.color} shadow-sm`} />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Co mapa umožňuje */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-bold text-blue-800 mb-2">
                Co mapa umožňuje?
              </h4>
              <ul className="space-y-1.5 text-sm text-blue-900">
                {[
                  "Variabilní dávkování vápna, K, P a Mg přesně dle zóny",
                  "Přímý vstup do aplikátoru (SatAgro, Cropwise, .shp)",
                  "Srovnání s předchozí analýzou — sledujete trend zásobenosti",
                  "Datový základ pro optimalizaci osevního postupu",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-sky-700 rounded-xl p-4 text-white text-sm">
              <p className="font-semibold mb-1">Mapy pro všechny analyzované parametry</p>
              <p className="text-white/80 text-xs">
                Stejná mapa vznikne pro P, K, Mg, Ca a S — každý parametr zvlášť, 
                takže přesně víte, kde co chybí a kde je zásoby nadbytek.
              </p>
            </div>
          </div>
        </div>

        {/* === Fotogalerie odběru === */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Odběr vzorků v praxi
          </h3>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Plně automatizovaný odběr s RTK navigací — přesné pozicování každého vpich, 
            opakovatelné výsledky v dalších letech
          </p>
        </div>

        {/* Grid fotek — 2 velké + 3 menší */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {/* Dvě velké vlevo nahoře */}
          {processPhotos.slice(0, 2).map((photo) => (
            <div
              key={photo.src}
              className="relative rounded-2xl overflow-hidden shadow-lg group aspect-[4/3]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-white text-sm font-semibold">
                  {photo.label}
                </span>
              </div>
            </div>
          ))}

          {/* Tři menší vpravo / dolní řada */}
          {processPhotos.slice(2).map((photo) => (
            <div
              key={photo.src}
              className="relative rounded-2xl overflow-hidden shadow-lg group aspect-[4/3]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-white text-sm font-semibold">
                  {photo.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Spodní call-out */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900 text-lg mb-1">
              Od odběru k výsledkové mapě — do 3 týdnů
            </p>
            <p className="text-gray-600 text-sm">
              Plně automatizovaný odběr · RTK pozicování · Akreditovaná laboratoř · 
              Export map do vašeho systému
            </p>
          </div>
          <button
            onClick={() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            Nezávazná poptávka
          </button>
        </div>
      </div>
    </section>
  );
}
