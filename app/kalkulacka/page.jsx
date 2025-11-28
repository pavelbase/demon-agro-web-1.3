export default function KalkulackaPage() {
  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hlavička */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-beige/20 rounded-full text-sm font-medium text-primary-brown mb-4">
            Nástroje pro agronomy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-4">
            Kalkulačky
          </h1>
          <p className="text-lg md:text-xl text-text-light leading-relaxed max-w-2xl mx-auto">
            Profesionální nástroje pro výpočty v zemědělství
          </p>
        </div>

        {/* Grid kalkulaček */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Kalkulačka vápnění */}
          <a
            href="/kalkulacka/vapneni"
            className="group bg-white rounded-3xl shadow-warm p-8 hover:shadow-warm-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-cta rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-brown mb-3">
                Kalkulačka vápnění
              </h2>
              <p className="text-text-light leading-relaxed mb-4">
                Výpočet potřeby vápnění podle VDLUFA metodiky. Zahrnuje optimální pH rozmezí pro různé typy půd a doporučení dávek živin.
              </p>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="space-y-2 text-sm text-text-light mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-cta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Výpočet pH a vápnění</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-cta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Doporučení živin (P, K, Mg, S)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-cta" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>VDLUFA metodika</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-green-cta font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span>Spustit kalkulačku</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          {/* Převodní kalkulačka */}
          <a
            href="/kalkulacka/prevodni"
            className="group bg-white rounded-3xl shadow-warm p-8 hover:shadow-warm-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-brown rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-brown mb-3">
                Převodní kalkulačka
              </h2>
              <p className="text-text-light leading-relaxed mb-4">
                Rychlý převod mezi prvkovou a oxidovou formou živin. Ideální pro práci s laboratorními rozbory a etiketami hnojiv.
              </p>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="space-y-2 text-sm text-text-light mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-brown" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>6 živin (Ca, Mg, K, S, P, N)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-brown" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Speciální zpracování Ca (Ca ↔ CaO ↔ CaCO₃)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-brown" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>5 typů jednotek (%, kg/ha, g/kg...)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-primary-brown font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span>Spustit kalkulačku</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

        </div>

        {/* Info sekce */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-primary-brown/5 to-beige/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-primary-brown mb-4">
              💡 Tipy pro použití
            </h3>
            <div className="space-y-3 text-text-dark">
              <p className="leading-relaxed">
                <strong>Kalkulačka vápnění:</strong> Použijte pokud máte rozbor půdy a potřebujete zjistit, kolik vápna a živin aplikovat na vaše pole. Kalkulačka pracuje podle uznávané VDLUFA metodiky používané ve střední Evropě.
              </p>
              <p className="leading-relaxed">
                <strong>Převodní kalkulačka:</strong> Použijte když potřebujete převést hodnoty z rozboru půdy (prvková forma) na hodnoty na etiketách hnojiv (oxidová forma) nebo naopak. Ideální pro porovnání nabídek různých dodavatelů.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
