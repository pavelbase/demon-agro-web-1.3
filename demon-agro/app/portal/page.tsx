import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  Download,
  ArrowRight,
  Mail,
  CheckCircle2
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ScreenshotGallery } from '@/components/portal/ScreenshotGallery'

export default async function PortalLandingPage() {
  // Kontrola přihlášení - rozcestník
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Přihlášený uživatel jde rovnou na dashboard
  if (user) {
    redirect('/portal/dashboard')
  }
  
  // Nepřihlášený uživatel vidí landing page

  const features = [
    {
      icon: Upload,
      title: 'Upload rozborů',
      description: 'AI automaticky rozpozná data z PDF rozborů půdy a vytvoří přehledné záznamy.',
    },
    {
      icon: FileText,
      title: 'Zdravotní karty',
      description: 'Přehledná vizualizace stavu půdy s barevným hodnocením podle kategorií živin.',
    },
    {
      icon: TrendingUp,
      title: 'Plány hnojení',
      description: 'Doporučení hnojení a vápnění na míru vašim pozemkům na základě rozborů.',
    },
    {
      icon: Download,
      title: 'Export dat',
      description: 'Stáhněte si kompletní reporty, plány a analýzy v PDF nebo Excel formátu.',
    },
  ]

  const benefits = [
    {
      title: 'Flexibilita',
      description: 'Systém sám vybere nejvhodnější produkt podle aktuální zásoby živin'
    },
    {
      title: 'Respektuje limity',
      description: 'Automatické rozdělení velkých dávek do více let'
    },
    {
      title: 'Ekonomická optimalizace',
      description: 'Díky přesnému výpočtu neutralizační účinnosti šetříme materiál'
    },
    {
      title: 'Okamžitá kalkulace',
      description: 'Kompletní plán nápravy pH i udržovacího vápnění během vteřiny'
    },
    {
      title: 'Vidíme do budoucnosti',
      description: 'Neřešíme jen aktuální problém. Systém modeluje přirozenou degradaci pH v čase a automaticky naplánuje udržovací dávky na roky dopředu. Díky přesným predikcím a včasné prevenci váš pozemek už nikdy nespadne zpět do rizikové kyselé zóny.'
    },
    {
      title: 'Digitální agronom v kapse',
      description: 'Zapomeňte na ruční přepisování rozborů. Stačí nahrát PDF z laboratoře a AI okamžitě analyzuje data, přiřadí je k pozemkům a spočítá ideální strategii. To, co dříve trvalo hodiny v tabulkách, teď zvládnete na jedno kliknutí s nulovou chybovostí.'
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-primary-green via-primary-green to-primary-brown text-white pt-32 pb-20 md:pt-40 md:pb-32">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Strategické řízení půdní úrodnosti
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90">
                  Nahrajte PDF rozbory, nechte AI vytáhnout data a generujte plány hnojení na míru vašim pozemkům. 
                  Vše na jednom místě, profesionálně a přehledně.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/portal/prihlaseni"
                    className="inline-flex items-center justify-center gap-2 bg-white text-primary-green px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg shadow-lg"
                  >
                    Přihlásit se
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center justify-center gap-2 bg-primary-brown text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-brown/90 transition-colors text-lg border-2 border-white/20"
                  >
                    Kontaktovat nás
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 bg-primary-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Proč používat portál?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary-green flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900 text-lg font-semibold">{benefit.title}:</p>
                        <p className="text-gray-700">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Hlavní funkce portálu
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Moderní nástroje pro efektivní správu vašich pozemků a půdních analýz
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center shadow-lg mb-4">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Screenshots Gallery Section */}
          <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Podívejte se na portál v akci
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Ukázky reálného rozhraní portálu a jeho funkcí
                </p>
              </div>

              <ScreenshotGallery />
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary-green to-primary-brown text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Máte zájem o přístup do portálu?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Portál je určen pro klienty Démon Agro. Pokud máte zájem o využívání našich služeb 
                a přístup do portálu, kontaktujte nás a rádi vám vše zařídíme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-green px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg shadow-lg"
                >
                  <Mail className="h-5 w-5" />
                  Kontaktovat nás
                </Link>
                <a
                  href="mailto:base@demonagro.cz"
                  className="inline-flex items-center justify-center gap-2 bg-primary-brown text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-brown/90 transition-colors text-lg border-2 border-white/20"
                >
                  base@demonagro.cz
                </a>
              </div>
            </div>
          </section>

          {/* Footer Info */}
          <section className="py-8 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-gray-600 text-sm">
                <p>
                  Pro přihlášení do portálu potřebujete účet, který vám zřídí administrátor Démon Agro.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
