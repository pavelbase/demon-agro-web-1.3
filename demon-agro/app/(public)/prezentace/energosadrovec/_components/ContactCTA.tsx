"use client";

import { Phone, Mail } from "lucide-react";

export default function ContactCTA() {
  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-green-600 to-emerald-700">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Máte zájem? Ozvěte se nám.
          </h2>
          <p className="text-lg text-white/90">
            Nezávazná konzultace zdarma. Připravíme vám kalkulaci na míru.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Kontaktní údaje
          </h3>
          
          <div className="space-y-6">
            <a
              href="tel:+420731734907"
              className="flex items-center gap-4 p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-300 group border-2 border-green-200 hover:border-green-400"
            >
              <div className="bg-green-600 p-4 rounded-full group-hover:scale-110 transition-all flex-shrink-0">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 font-semibold">Telefon</div>
                <div className="text-2xl font-bold text-gray-900">731 734 907</div>
              </div>
            </a>

            <a
              href="mailto:base@demonagro.cz"
              className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 group border-2 border-blue-200 hover:border-blue-400"
            >
              <div className="bg-blue-600 p-4 rounded-full group-hover:scale-110 transition-all flex-shrink-0">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 font-semibold">Email</div>
                <div className="text-2xl font-bold text-gray-900">base@demonagro.cz</div>
              </div>
            </a>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <h4 className="font-bold text-lg mb-4 text-gray-900 text-center">Co vám nabízíme?</h4>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Individuální cenovou nabídku</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Kalkulaci úspor pro vaši farmu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Doporučení dávek pro plodiny</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Termín aplikace podle počasí</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
