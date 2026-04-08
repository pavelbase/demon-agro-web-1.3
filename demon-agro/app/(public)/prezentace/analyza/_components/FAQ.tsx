"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Jak často doporučujete analýzu opakovat?",
      answer:
        "Agronomicky doporučujeme cyklus 3–5 let. Zásoby živin v půdě se mění — draslík se vyčerpává sklizní, pH postupně klesá. Bez opakované analýzy nevidíte trend a nemůžete na změny reagovat dříve, než se projeví na výnosu. V intenzivně obhospodařovaných blocích (řepka, cukrovka, zelenina) doporučujeme kratší cyklus — každé 3 roky.",
    },
    {
      question: "Kolik stojí analýza a co přesně dostanu?",
      answer:
        "Kompletní služba (zónový RTK odběr + analýza pH, P, K, Mg, Ca, S + výsledkové mapy + konzultace) vychází od ~370 Kč/ha při výměře do 500 ha. Při větší výměře nebo sloučení se sousedními farmami klesá cena na ~305–335 Kč/ha. V ceně je vše: odběr, laboratoř, mapy v digitálním formátu i konzultace výsledků.",
    },
    {
      question: "Přijdete na odběr k nám, nebo vzorky beru já?",
      answer:
        "Odběr zajišťujeme my — plně automatizovaně s RTK navigací. Pro naplánování výjezdu potřebujeme data o vašich parcelách: nejlépe ve formátu .shp nebo KML (export z LPISu nebo jiného GIS), případně GPS souřadnice hranic bloků. Přizpůsobíme se formátu, se kterým pracujete.",
    },
    {
      question: "Za jak dlouho dostanu výsledky?",
      answer:
        "Výsledky máte do 3 týdnů od odběru. To zahrnuje: odběr vzorků (1–2 dny), laboratorní analýzu (5–10 pracovních dní) a zpracování výsledkových map a zprávy. Ve špičkových obdobích (jaro, podzim) doporučujeme objednávat s předstihem — kapacita výjezdů je omezená.",
    },
    {
      question: "Jsou výsledky kompatibilní s mým systémem precizního zemědělství?",
      answer:
        "Ano. Výsledkové mapy dodáváme ve formátech kompatibilních s nejrozšířenějšími systémy: SatAgro, Cropwise, John Deere Operations Center a dalšími. Export je k dispozici jako .shp, .pdf a .xlsx. Pokud pracujete s jiným systémem, kontaktujte nás — přizpůsobíme výstupní formát.",
    },
    {
      question: "Jak funguje sloučení zakázek pro menší farmy?",
      answer:
        "Sloučení zakázek je náš způsob, jak zpřístupnit nejlepší ceny i menším podnikům. Pokud máte například 80 ha, ale v okolí jsou farmy, které chceme obsloužit ve stejném termínu, sdílíme náklady na výjezd. Výsledkem je, že i 80ha podnik dosáhne na cenu srovnatelnou s velkovelkofarmou (~305 Kč/ha). Stačí nám říct lokalitu — zbytek zorganizujeme.",
    },
    {
      question: "Co dostanu jako výstup a jak s tím mohu pracovat?",
      answer:
        "Výsledkový balíček obsahuje: barevné mapy živin pro každý analyzovaný parametr (pH, P, K, Mg, Ca, S) v digitálním formátu, tabulku hodnot pro každou zónu, doporučení variabilních dávek pro aplikátory a konzultaci k výsledkům. Mapy jsou přímo využitelné jako vstup pro variabilní aplikaci — zadáte je do svého terminálu a hnojíte přesně dle dat.",
    },
    {
      question: "Mohu kombinovat analýzu s objednávkou hnojiv (popel, energosádrovec)?",
      answer:
        "Samozřejmě — a je to nejlepší způsob jak postupovat! Analýza ukáže přesně, co vaše půda potřebuje. Pokud se prokáže deficit draslíku a fosforu, nabídneme popel ze slámy. Pokud chybí síra, energosádrovec. Hnojiva dodáme ve správný čas a přesné množství. Jeden dodavatel, jeden plán, žádné dohady.",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Často kladené otázky
          </h2>
          <p className="text-lg text-gray-600">
            Odpovědi na nejčastější dotazy o analýze půdy
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-base text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-4 text-gray-700 leading-relaxed text-base border-t border-gray-100 pt-3">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Máte další otázky?
          </h3>
          <p className="text-gray-700 text-base mb-4">
            Rádi vám poradíme a připravíme kalkulaci na míru.
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById("contact");
              contactSection?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Kontaktujte nás
          </button>
        </div>
      </div>
    </section>
  );
}
