"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Satellite, Target, MapPin, HeartHandshake, GraduationCap } from "lucide-react";
import ProblemCard from "@/components/ProblemCard";
import FeatureCard from "@/components/FeatureCard";
import StepNumber from "@/components/StepNumber";
import { getPageContent, defaultContent } from "@/lib/content";
import { getImageUrl, defaultImages } from "@/lib/images";

export default function HomePage() {
  const [content, setContent] = useState(defaultContent.home);
  const [heroImage, setHeroImage] = useState(defaultImages.home_hero);
  const [krokyBgImage, setKrokyBgImage] = useState(defaultImages.home_kroky_bg);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setContent(getPageContent("home"));
    setHeroImage(getImageUrl("home_hero"));
    setKrokyBgImage(getImageUrl("home_kroky_bg"));
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <img
              src="/logo.jpg"
              alt="Démon agro"
              className="mx-auto h-24 w-auto mb-8"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {content.hero_nadpis}
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-3xl mx-auto">
            {content.hero_podnadpis}
          </p>
          <Link
            href="/kontakt"
            className="inline-block bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Nezávazná konzultace
          </Link>
          <div className="mt-12">
            <ChevronDown className="w-8 h-8 text-white mx-auto animate-bounce" />
          </div>
        </div>
      </section>

      {/* 5 Hlavních Problémů */}
      <section className="py-16 md:py-24 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Co řešíme?
            </h2>
            <p className="text-xl text-gray-600">5 hlavních problémů zemědělců</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProblemCard
              icon="ph"
              title="pH půdy a vápnění"
              description="Optimalizace pH půdy pro maximální výnosy a dostupnost živin"
              link="/ph-pudy"
            />
            <ProblemCard
              icon="s"
              title="Nedostatek síry"
              description="Síra pro kvalitní bílkoviny a zdravý růst rostlin"
              link="/sira"
            />
            <ProblemCard
              icon="k"
              title="Nedostatek draslíku"
              description="Draslík pro odolnost proti suchu a chorobám"
              link="/k"
            />
            <ProblemCard
              icon="mg"
              title="Nedostatek hořčíku"
              description="Hořčík jako základ fotosyntézy a tvorby chlorofylu"
              link="/mg"
            />
            <ProblemCard
              icon="lab"
              title="Analýza půdy"
              description="Komplexní rozbor a GPS mapování variability půdy"
              link="/analyza"
            />
          </div>
        </div>
      </section>

      {/* Jak to funguje */}
      <section
        className="relative py-16 md:py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${krokyBgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Jak to funguje?
            </h2>
            <p className="text-xl text-white/90">
              6 kroků k lepší půdě a vyšším výnosům
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: 1, title: "Konzultace zdarma", desc: "Posouzení stavu pole a vašich potřeb" },
              { num: 2, title: "GPS mapování a vzorkování půdy", desc: "Precizní odběr vzorků s GPS souřadnicemi" },
              { num: 3, title: "Laboratorní analýza", desc: "Komplexní rozbor pH a živin v půdě" },
              { num: 4, title: "Doporučení řešení", desc: "Návrh optimálního hnojení a vápnění" },
              { num: 5, title: "Dodání produktů", desc: "Kvalitní hnojiva a vápno podle potřeby" },
              { num: 6, title: "Precizní aplikace", desc: "Variabilní aplikace s GPS řízením" },
            ].map((step) => (
              <div key={step.num} className="bg-white/95 shadow-lg rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <StepNumber number={step.num} />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proč Démon agro */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proč Démon agro?
            </h2>
            <p className="text-xl text-gray-600">
              5 důvodů, proč si vybrat právě nás
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Satellite}
              title="Moderní technologie"
              description="GPS systémy pro precizní mapování a variabilní aplikaci"
            />
            <FeatureCard
              icon={Target}
              title="Komplexní řešení"
              description="Od konzultace přes analýzu až po aplikaci - vše z jedné ruky"
            />
            <FeatureCard
              icon={MapPin}
              title="Regionální pokrytí"
              description="Působíme v severních a západních Čechách"
            />
            <FeatureCard
              icon={HeartHandshake}
              title="Osobní přístup"
              description="Každé hospodářství je jedinečné - přizpůsobíme se vašim potřebám"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Odborné poradenství"
              description="Nezávazná konzultace zdarma - rádi poradíme"
            />
          </div>
        </div>
      </section>

      {/* CTA Sekce */}
      <section className="py-16 bg-[#4A7C59]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Začněte zlepšovat svou půdu ještě dnes
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Kontaktujte nás pro nezávaznou konzultaci
          </p>
          <Link
            href="/kontakt"
            className="inline-block bg-white hover:bg-gray-100 text-[#4A7C59] px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-lg"
          >
            Kontaktovat nás
          </Link>
        </div>
      </section>
    </>
  );
}
