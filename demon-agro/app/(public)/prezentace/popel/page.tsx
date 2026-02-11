import { Metadata } from "next";
import HeroSection from "./_components/HeroSection";
import WhatIsSection from "./_components/WhatIsSection";
import WhyPotassiumSection from "./_components/WhyPotassiumSection";
import NutrientContentSection from "./_components/NutrientContentSection";
import ComparisonTables from "./_components/ComparisonTables";
import ModelExample from "./_components/ModelExample";
import PerHectareSection from "./_components/PerHectareSection";
import AdditionalBenefits from "./_components/AdditionalBenefits";
import WarningsSection from "./_components/WarningsSection";
import ArgumentSection from "./_components/ArgumentSection";
import FAQ from "./_components/FAQ";
import ContactCTA from "./_components/ContactCTA";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: 'Popel — draslík, fosfor a vápník za 1 000 Kč/t | Démon Agro',
  description: 'Popel ze slámy jako přírodní vícesložkové hnojivo. 3 t/ha = 206 kg K₂O + 23 kg P₂O₅ + 99 kg CaO. Úspora 2 430 Kč/ha oproti průmyslovým hnojivům. Kompletní služba včetně dopravy a aplikace.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PopelPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <WhatIsSection />
      <WhyPotassiumSection />
      <NutrientContentSection />
      <ComparisonTables />
      <ModelExample />
      <PerHectareSection />
      <AdditionalBenefits />
      <WarningsSection />
      <ArgumentSection />
      <FAQ />
      <ContactCTA />
      <Footer />
    </div>
  );
}

