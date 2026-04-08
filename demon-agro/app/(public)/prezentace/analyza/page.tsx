import { Metadata } from "next";
import HeroSection from "./_components/HeroSection";
import WhatIsSection from "./_components/WhatIsSection";
import WhyAnalysisSection from "./_components/WhyAnalysisSection";
import WhatWeAnalyzeSection from "./_components/WhatWeAnalyzeSection";
import ProcessSection from "./_components/ProcessSection";
import ShowcaseSection from "./_components/ShowcaseSection";
import PricingSection from "./_components/PricingSection";
import SavingsSection from "./_components/SavingsSection";
import USPSection from "./_components/USPSection";
import FAQ from "./_components/FAQ";
import ContactCTA from "./_components/ContactCTA";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: "Analýza půdy — základ pro efektivní hnojení | Démon Agro",
  description:
    "Zónový odběr vzorků (RTK) + analýza půdy (pH, P, K, Mg, Ca, S) od 270 Kč/ha. Bez analýzy hnojíte naslepo — průměrná úspora 1 000–1 500 Kč/ha po optimalizaci hnojení. Kompletní služba včetně map a doporučení.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyzaPudyPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <WhatIsSection />
      <WhyAnalysisSection />
      <WhatWeAnalyzeSection />
      <ProcessSection />
      <ShowcaseSection />
      <PricingSection />
      <SavingsSection />
      <USPSection />
      <FAQ />
      <ContactCTA />
      <Footer />
    </div>
  );
}
