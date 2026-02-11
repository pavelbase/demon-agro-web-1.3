"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Není popel nebezpečný odpad?",
      answer: "Ne. Popel ze slámy je certifikovaný jako hnojivo/pomocná půdní látka. Každá šarže prochází laboratorní analýzou na obsah živin i těžkých kovů. Dodržujeme limity vyhlášky č. 474/2000 Sb. Poskytujeme kompletní dokumentaci.",
    },
    {
      question: "Proč neobsahuje dusík?",
      answer: "Dusík se při spalování uvolňuje do atmosféry. Popel proto musíte kombinovat s dusíkatým hnojivem (LAD, DASA, DAM). Výhodou je, že můžete dusík aplikovat v optimálním termínu a dávce zvlášť — stejně jako doporučujeme u energosádrovce.",
    },
    {
      question: "Jaká je variabilita složení?",
      answer: "Složení se liší podle zdroje biomasy. Proto analyzujeme každou šarži v laboratoři a dodáváme atest s přesným obsahem živin. Hodnoty v kalkulaci (K₂O 10–15 %, P 0,6 %, CaO 6 %) jsou typický průměr.",
    },
    {
      question: "Nepoškodí popel půdu?",
      answer: "Při správném dávkování (do 3 t/ha) popel půdu naopak zlepšuje — dodává živiny, zvyšuje pH kyselých půd a zlepšuje strukturu. Důležité je dodržet limity těžkých kovů a nepřekračovat doporučené dávky.",
    },
    {
      question: "Mohu popel kombinovat s energosádrovcem?",
      answer: "Ano, je to výborná kombinace! Popel dodá K + P + Ca, energosádrovec S + Ca. Doplníte LAD pro dusík a máte kompletní výživu. Rádi vám sestavíme individuální plán.",
    },
    {
      question: "Jaká je minimální objednávka?",
      answer: "Kontaktujte nás pro individuální nabídku. Obsluhujeme farmy od 50 ha. U větších výměr nabízíme individuální cenové podmínky.",
    },
    {
      question: "Jak dlouho trvá dodání a aplikace?",
      answer: "Termín domlouváme individuálně podle lokality a počasí. Aplikace je možná na podzim (na strniště) i na jaře (před setím). Kapacita je omezená — doporučujeme objednávat včas.",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-orange-300 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-base text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-orange-600 flex-shrink-0 transition-transform duration-300 ${
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

        <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 text-center">
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
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Kontaktujte nás
          </button>
        </div>
      </div>
    </section>
  );
}

