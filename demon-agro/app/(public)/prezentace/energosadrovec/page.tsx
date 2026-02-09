import { Metadata } from "next";
import HeroSection from "./_components/HeroSection";
import WhatIsSection from "./_components/WhatIsSection";
import WhySulfurSection from "./_components/WhySulfurSection";
import ComparisonTables from "./_components/ComparisonTables";
import WhyNotDasaSam from "./_components/WhyNotDasaSam";
import UreaMythSection from "./_components/UreaMythSection";
import CropCards from "./_components/CropCards";
import SavingsCalculation from "./_components/SavingsCalculation";
import USPSection from "./_components/USPSection";
import FAQ from "./_components/FAQ";
import ContactCTA from "./_components/ContactCTA";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: 'Energosádrovec - Síra a vápník pro vaše plodiny | Démon Agro',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EnergosadrovecPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <WhatIsSection />
      <WhySulfurSection />
      <ComparisonTables />
      <WhyNotDasaSam />
      <UreaMythSection />
      <CropCards />
      <SavingsCalculation />
      <USPSection />
      <FAQ />
      <ContactCTA />
      <Footer />
    </div>
  );
}

