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
            Kalkulačka vápnění
          </h1>
          <p className="text-lg md:text-xl text-text-light leading-relaxed max-w-2xl mx-auto">
            Výpočet potřeby vápnění podle VDLUFA metodiky
          </p>
        </div>

        {/* Kalkulačka */}
        <div className="max-w-3xl mx-auto">
          
          {/* Karta kalkulačky */}
          <a
            href="/kalkulacka/vapneni"
            className="group bg-white rounded-3xl shadow-warm-lg p-8 hover:shadow-warm-lg hover:scale-105 transition-all duration-300"
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-green-cta rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-12 h-12 text-white" 
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
              <h2 className="text-3xl font-bold text-primary-brown mb-4">
                Spustit kalkulačku
              </h2>
              <p className="text-text-light leading-relaxed text-lg mb-6">
                Výpočet potřeby vápnění podle VDLUFA metodiky. Zahrnuje optimální pH rozmezí pro různé typy půd a doporučení dávek živin.
              </p>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="space-y-3 text-base text-text-light mb-8">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-cta flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Výpočet pH a potřeby vápnění</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-cta flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Doporučení živin (P, K, Mg, Ca, S)</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-cta flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>VDLUFA metodika pro střední Evropu</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-cta flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Optimální pH rozmezí pro každý typ půdy</span>
                </div>
              </div>

              <div className="flex items-center justify-center text-green-cta font-bold text-lg group-hover:translate-x-2 transition-transform duration-300">
                <span>Začít výpočet</span>
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              📋 Jak kalkulačka funguje
            </h3>
            <div className="space-y-4 text-text-dark leading-relaxed">
              <p>
                Kalkulačka vám pomůže vypočítat optimální dávky vápna a živin na základě rozboru půdy. Pracuje podle uznávané <strong>VDLUFA metodiky</strong>, která je používána ve střední Evropě.
              </p>
              <p>
                <strong>Co budete potřebovat:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Typ půdy (písčitá, hlinitá, jílovitá...)</li>
                <li>Výsledky rozboru půdy (pH, P, K, Mg, Ca, S)</li>
                <li>Kontaktní údaje pro zaslání výsledků</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
