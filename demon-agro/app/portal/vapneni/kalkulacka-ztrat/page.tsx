import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KalkulackaZtrat } from '@/components/portal/KalkulackaZtrat'
import { getPozemkyProKalkulacku } from '@/lib/database/kalkulacka-queries'
import { TrendingDown } from 'lucide-react'

/**
 * Stránka kalkulačky ekonomických ztrát z kyselé půdy (služba: Vápnění)
 * 
 * Server Component - načítá data na serveru a předává je klientské komponentě
 */

export const metadata = {
  title: 'Kalkulačka ekonomických ztrát | Démon Agro',
  description: 'Spočítejte ekonomické ztráty způsobené kyselou půdou a návratnost vápnění',
}

export default async function KalkulackaZtratPage() {
  // ============================================================================
  // AUTENTIZACE
  // ============================================================================
  
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/portal/prihlaseni')
  }

  // ============================================================================
  // NAČTENÍ DAT
  // ============================================================================
  
  const pozemky = await getPozemkyProKalkulacku(user.id)

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Kalkulačka ekonomických ztrát
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Zjistěte, kolik vás stojí kyselá půda a jak rychle se vrátí investice do vápnění
          </p>
        </div>

        {/* Kalkulačka */}
        <KalkulackaZtrat pozemky={pozemky} />

        {/* Info o metodice */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📚 O metodice výpočtu
          </h3>
          
          <div className="space-y-6">
            {/* Vědecké zdroje */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">
                🔬 Vědecké zdroje a studie
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>AHDB (UK, 2024):</strong> Agriculture and Horticulture Development Board 
                  dokumentuje, že <em>"při pH 5.5 se promarní 32% hnojiv"</em> (efektivita pouze 68%).
                </p>
                <p>
                  <strong>University of Idaho (1987):</strong> Mahler & McDole publikovali výsledky 
                  39 polních pokusů (1980-1987), které prokázaly <em>35-50% snížení výnosu při pH 5.0</em>.
                </p>
                <p>
                  <strong>Michigan State University:</strong> Výzkum toxicity hliníku (Al³⁺) ukázal, 
                  že při pH &lt; 4.5 dochází k <em>zastavení růstu kořenů během 1 hodiny</em>. 
                  Při pH 4.0 klesá efektivita živin až na 20%.
                </p>
                <p>
                  <strong>USDA NRCS:</strong> Dokumentace management fosforu v půdě potvrzuje, 
                  že <em>"pH &lt; 5.5 výrazně omezuje dostupnost fosforu"</em> kvůli fixaci na Al/Fe.
                </p>
                <p>
                  <strong>ÚKZÚZ:</strong> Oficiální <em>Metodický pokyn č. 01/AZZP</em> pro výpočet 
                  potřeby vápnění v podmínkách ČR.
                </p>
              </div>
            </div>

            {/* Detailní metodika */}
            <div className="text-sm text-gray-700 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1️⃣ Efektivita hnojiv</h4>
                <p className="text-gray-600 leading-relaxed">
                  Výpočet vychází z vědecky ověřených dat o využití živin při různém pH:
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                  <li><strong>• pH 4.0-4.5:</strong> Pouze 20-29% efektivita (Al³⁺ toxicita ničí kořeny)</li>
                  <li><strong>• pH 5.0:</strong> 46% efektivita (fosfor fixován na Al/Fe sloučeniny)</li>
                  <li><strong>• pH 5.5:</strong> 67% efektivita (AHDB: "32% hnojiv propadá")</li>
                  <li><strong>• pH 6.0:</strong> 80% efektivita (téměř optimální)</li>
                  <li><strong>• pH 6.5-7.0:</strong> 100% efektivita (optimum pro většinu plodin)</li>
                </ul>
                <p className="mt-2 text-gray-600">
                  <em>Příklad:</em> Při pH 5.5 a nákladech 8 000 Kč/ha na hnojiva ztrácíte <strong>2 640 Kč/ha ročně</strong> 
                  (33% z 8 000 Kč) kvůli špatné dostupnosti živin.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2️⃣ Ztráta výnosu</h4>
                <p className="text-gray-600 leading-relaxed">
                  Kyselá půda přímo poškozuje rostliny třemi mechanismy:
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                  <li><strong>• Toxicita hliníku (Al³⁺):</strong> Ničí kořenové vlášení, omezuje příjem vody</li>
                  <li><strong>• Deficit živin:</strong> Fosfor, molybden a vápník jsou nedostupné</li>
                  <li><strong>• Narušení mikrobiální aktivity:</strong> Nižší mineralizace organické hmoty</li>
                </ul>
                <p className="mt-2 text-gray-600">
                  Studie z University of Idaho prokázaly <strong>15% ztrátu výnosu při pH 5.0</strong> a 
                  až <strong>35% ztrátu při pH 4.0</strong>. U pozemku s tržbami 35 000 Kč/ha to znamená 
                  ztrátu <strong>5 250-12 250 Kč/ha ročně</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3️⃣ Potřeba vápna</h4>
                <p className="text-gray-600 leading-relaxed">
                  Výpočet podle <strong>oficiální metodiky ÚKZÚZ</strong> (Metodický pokyn č. 01/AZZP) 
                  s respektováním pufrovací kapacity půdy za <strong>4leté období</strong>. Systém automaticky 
                  používá stejnou funkci jako modul "Plány vápnění" pro zajištění konzistence výpočtů.
                </p>
                <p className="mt-2 text-gray-600">
                  Tabulkové hodnoty zohledňují detailní typ půdy (lehká/střední/těžká) a druh kultury 
                  (orná/TTP). Výpočet zahrnuje i přirozenou acidifikaci půdy během plánovaného období.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4️⃣ Ekonomická návratnost</h4>
                <p className="text-gray-600 leading-relaxed">
                  Návratnost = (Jednorázové náklady na vápnění ÷ Roční úspora) × 12 měsíců
                </p>
                <p className="mt-2 text-gray-600">
                  <strong>Interpretace:</strong> Pokud je návratnost 18 měsíců, znamená to, že za 
                  1,5 roku se vám investice do vápnění vrátí úsporami na hnojivech a vyššími výnosy. 
                  Efekt vápnění přitom trvá <strong>4-6 let</strong>, takže zbytek období máte čistý zisk.
                </p>
              </div>
            </div>

            {/* Důležité upozornění */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">
                ⚠️ Důležité poznámky
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Výpočty vychází z <strong>vědecky ověřených studií</strong> - skutečné ztráty mohou být vyšší při kombinaci stresorů (sucho, mrazy, choroby)</li>
                <li>• Cena vápnění zahrnuje pouze materiál - nepočítá se s náklady na aplikaci a dopravu</li>
                <li>• Předpokládají průměrné povětrnostní podmínky bez extrémních výkyvů</li>
                <li>• Doporučujeme ověření kontrolním rozborem půdy 1 rok po vápnění</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
