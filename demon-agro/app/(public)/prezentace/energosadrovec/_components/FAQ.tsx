"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Není energosádrovec odpad z elektráren?",
      answer: "Energosádrovec je vedlejší produkt odsíření spalin (FGD sádrovec), nikoliv odpad. Má CE certifikát a splňuje všechny normy EU pro hnojiva (Nařízení 2019/1009). Chemicky je totožný s přírodním sádrovcem (CaSO₄), ale často je čistší - neobsahuje příměsi hlíny nebo kamene. Obsah rizikových prvků (kadmium, olovo, arsen) je pod legislativními limity a je nižší než u mnoha fosforečných hnojiv. Každá dodávka má protokol o jakosti.",
    },
    {
      question: "Proč nedávat DASA, která má i dusík?",
      answer: "DASA má poměr N:S = 2:1. Řepka potřebuje 3-7:1, pšenice 10-15:1. Nikdy vám to nesedne. Navíc DASA okyseluje půdu (470 kg CaO na neutralizaci 1 tuny). S energosádrovcem dáte síru a vápník v únoru, dusík pak přesně podle potřeby v dubnu - každou živinu v optimálním čase a množství.",
    },
    {
      question: "Proč ne močovinu? Je přece nejlevnější.",
      answer: "Močovina může být dobrá volba S INHIBITOREM ureázy (UREA Stabil), který snižuje ztráty těkáním z 5-30% (podle počasí) na ~5-10%. Ale: 1) Inhibitor stojí navíc (~500 Kč/ha), 2) Pomalý účinek (7-14 dní na přeměnu), 3) 0% síry - musíte ji stejně dodat zvlášť. LAD působí okamžitě (50% nitrátového N) a bez rizika ztrát. I s inhibitorem musíte řešit síru, takže komplexní náklad je srovnatelný.",
    },
    {
      question: "Můžu aplikovat na podzim?",
      answer: "Nedoporučujeme. Síra v síranové formě je mobilní podobně jako dusík - přes zimu se může vyplavit srážkami. Doporučujeme jarní aplikaci (únor-březen), kdy ji rostliny okamžitě využijí při obnově vegetace.",
    },
    {
      question: "Co když mám SAM/DASA už nakoupené?",
      answer: "Použijte je na část výměry a porovnejte s parcelou s energosádrovcem. Na vlastní oči uvidíte rozdíl v růstu, zdraví porostu a později ve výnosu. Příští rok se rozhodnete na základě reálných výsledků z vaší farmy.",
    },
    {
      question: "Máte nízký hořčík nebo draslík v půdě?",
      answer: "Energosádrovec dodává velké množství vápníku (125 kg CaO/ha). Pokud má vaše půda nízký obsah hořčíku (Mg) nebo draslíku (K), doporučujeme doplnit tyto živiny před nebo společně s aplikací (např. kieserit pro Mg). Výhodou je, že energosádrovec neobsahuje chlor a nemění pH, takže neblokuje příjem mikroprvků jako klasické vápnění. Vždy vycházejte z aktuálního rozboru půdy a dbejte na vyvážený poměr K/Mg/Ca.",
    },
    {
      question: "Jaká je minimální objednávka?",
      answer: "Kontaktujte nás pro individuální nabídku. Obsluhujeme farmy od 50 ha. U větších výměr nabízíme individuální cenové podmínky.",
    },
    {
      question: "Jak dlouho trvá dodání a aplikace?",
      answer: "Objednávky přijímáme do konce ledna 2026. Aplikace probíhá v únoru a března podle počasí a stavu půdy. Termín domlouváme individuálně, aby to sedělo s vaším harmonogramem.",
    },
    {
      question: "Máte certifikáty a atesty?",
      answer: "Ano, energosádrovec má CE certifikaci a splňuje všechny požadavky nařízení EU 2019/1009 o uvádění hnojivých výrobků na trh. Poskytujeme kompletní dokumentaci včetně: 1) protokolu o jakosti s obsahem S, Ca a pH, 2) analýzy rizikových prvků (Cd, Pb, As, Hg), 3) certifikátu o původu materiálu. Vše v souladu s vyhláškou č. 377/2013 Sb. o hnojivech.",
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
            Odpovědi na nejčastější dotazy a námitky
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-green-300 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-base text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-green-600 flex-shrink-0 transition-transform duration-300 ${
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

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Máte další otázky?
          </h3>
          <p className="text-gray-700 text-base mb-4">
            Rádi vám poradíme a připravíme individuální nabídku na míru.
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              contactSection?.scrollIntoView({ behavior: 'smooth' });
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

