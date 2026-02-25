"use client";

import { CheckCircle } from "lucide-react";

export default function ArgumentSection() {
  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-6 md:p-12 shadow-2xl text-white relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border-2 border-white/30">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 text-center">
              <p className="text-lg md:text-3xl leading-relaxed font-medium">
                „Při aplikaci <strong className="text-yellow-300">3 t popela na hektar</strong> získáte 
                draslík, fosfor a vápník za <strong className="text-yellow-300">3 000 Kč/ha</strong>.
              </p>
              
              <p className="text-lg md:text-3xl leading-relaxed font-medium">
                Stejné živiny z průmyslových hnojiv by vás stály 
                přes <strong className="text-yellow-300">6 250 Kč/ha</strong> — 
                a navíc byste potřebovali <strong className="text-yellow-300">3 přejezdy</strong> místo jednoho.
              </p>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 md:p-8 border-2 border-white/40 mt-4 md:mt-8">
                <p className="text-2xl md:text-4xl font-bold text-yellow-300 mb-2 md:mb-3">
                  Ušetříte 3 250 Kč na každém hektaru
                </p>
                <p className="text-base md:text-2xl opacity-95">
                  Na 100 ha je to přes 320 tisíc korun.
                </p>
              </div>

              <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t-2 border-white/30">
                <p className="text-base md:text-2xl font-semibold opacity-95">
                  A co víc — máte vše vyřešené na klíč: materiál, dopravu i aplikaci.
                </p>
                <p className="text-sm md:text-xl opacity-90 mt-2 md:mt-3">
                  Žádné sklady, žádná logistika, žádné přejezdy navíc. Jen výsledky.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

