"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPageContent, defaultContent } from "@/lib/content";
import { getImageUrl, defaultImages } from "@/lib/images";

export default function ONasPage() {
  const [content, setContent] = useState(defaultContent.onas);
  const [heroImage, setHeroImage] = useState(defaultImages.onas_hero);
  const [kdoJsmeImage, setKdoJsmeImage] = useState(defaultImages.onas_kdo_jsme_img);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setContent(getPageContent("onas"));
    setHeroImage(getImageUrl("onas_hero"));
    setKdoJsmeImage(getImageUrl("onas_kdo_jsme_img"));
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {content.hero_nadpis}
          </h1>
          <p className="text-lg md:text-xl text-white">
            {content.hero_podnadpis}
          </p>
        </div>
      </section>

      {/* Kdo jsme */}
      <section className="py-16 md:py-24 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.kdo_jsme_nadpis}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {content.kdo_jsme_text}
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src={kdoJsmeImage}
                alt="Kdo jsme"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Naše mise */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {content.nase_mise_nadpis}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {content.nase_mise_text}
          </p>
        </div>
      </section>

      {/* CTA Sekce */}
      <section className="py-16 bg-[#4A7C59]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {content.cta_nadpis}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {content.cta_text}
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
