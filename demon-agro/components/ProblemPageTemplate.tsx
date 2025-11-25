"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProblemIcon from "./ProblemIcon";
import ProductCard from "./ProductCard";
import { PageContent, PageKey } from "@/lib/types";
import { getPageContent } from "@/lib/content";
import { getProductsByCategory } from "@/lib/products";
import { getImageUrl } from "@/lib/images";
import { Product } from "@/lib/types";

interface ProblemPageTemplateProps {
  iconType: "ph" | "s" | "k" | "mg" | "lab";
  pageKey: PageKey;
  productCategory: string;
  imagePrefix: string;
}

export default function ProblemPageTemplate({
  iconType,
  pageKey,
  productCategory,
  imagePrefix,
}: ProblemPageTemplateProps) {
  const [content, setContent] = useState<PageContent>(getPageContent(pageKey));
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImage, setHeroImage] = useState("");
  const [problemImage, setProblemImage] = useState("");
  const [dopadBgImage, setDopadBgImage] = useState("");

  useEffect(() => {
    setContent(getPageContent(pageKey));
    setProducts(getProductsByCategory(productCategory));
    setHeroImage(getImageUrl(`${imagePrefix}_hero` as any));
    setProblemImage(getImageUrl(`${imagePrefix}_problem_img` as any));
    setDopadBgImage(getImageUrl(`${imagePrefix}_dopad_bg` as any));
  }, [pageKey, productCategory, imagePrefix]);

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-block">
              <ProblemIcon type={iconType} size="xl" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {content.hero_nadpis}
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            {content.hero_podnadpis}
          </p>
        </div>
      </section>

      {/* Problém Sekce */}
      <section className="py-16 md:py-24 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.problem_nadpis}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {content.problem_obsah}
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src={problemImage}
                alt={content.problem_nadpis || "Problem"}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ekonomický dopad */}
      <section
        className="relative py-16 md:py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${dopadBgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {content.dopad_nadpis}
          </h2>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            {content.dopad_obsah}
          </p>
        </div>
      </section>

      {/* Naše řešení */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {content.reseni_nadpis}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {content.reseni_obsah}
          </p>
        </div>
      </section>

      {/* Produkty */}
      {products.length > 0 && (
        <section className="py-16 md:py-24 bg-[#F5F1E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Produkty a služby
              </h2>
              <p className="text-xl text-gray-600">
                Nabízíme komplexní řešení pro vaše pole
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-[#4A7C59]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Potřebujete poradit?
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
