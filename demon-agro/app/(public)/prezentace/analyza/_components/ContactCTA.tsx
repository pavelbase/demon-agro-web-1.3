"use client";

import { Phone, Mail } from "lucide-react";

export default function ContactCTA() {
  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Máte zájem? Ozvěte se nám.
          </h2>
          <p className="text-lg text-white/90">
            Nezávazná konzultace zdarma. Připravíme vám nabídku na míru.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Kontaktní údaje
          </h3>

          <div className="space-y-6">
            <a
              href="tel:+420731734907"
              className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 group border-2 border-blue-200 hover:border-blue-400"
            >
              <div className="bg-blue-600 p-4 rounded-full group-hover:scale-110 transition-all flex-shrink-0">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 font-semibold">Telefon</div>
                <div className="text-2xl font-bold text-gray-900">731 734 907</div>
              </div>
            </a>

            <a
              href="mailto:base@demonagro.cz"
              className="flex items-center gap-4 p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-all duration-300 group border-2 border-sky-200 hover:border-sky-400"
            >
              <div className="bg-sky-600 p-4 rounded-full group-hover:scale-110 transition-all flex-shrink-0">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 font-semibold">Email</div>
                <div className="text-2xl font-bold text-gray-900">base@demonagro.cz</div>
              </div>
            </a>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-lg mb-4 text-gray-900 text-center">
              Co vám nabízíme?
            </h4>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              {[
                "Individuální cenovou nabídku",
                "Odběr vzorků na místě",
                "Výsledky z akreditované laboratoře",
                "Přehlednou výsledkovou zprávu",
                "Konzultaci a plán hnojení",
                "Doporučení produktů dle výsledků",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
