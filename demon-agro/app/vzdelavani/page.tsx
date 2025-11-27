"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getPublishedArticles } from "@/lib/articles";
import { Article } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  ph: "pH půdy",
  vapneni: "Vápnění",
  ziviny: "Živiny",
  vyzkumy: "Výzkumy",
  tipy: "Tipy pro zemědělce",
};

const categoryColors: Record<string, string> = {
  ph: "bg-green-100 text-green-800",
  vapneni: "bg-blue-100 text-blue-800",
  ziviny: "bg-yellow-100 text-yellow-800",
  vyzkumy: "bg-purple-100 text-purple-800",
  tipy: "bg-orange-100 text-orange-800",
};

export default function VzdelavaniPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setArticles(getPublishedArticles());
  }, []);

  if (!mounted) {
    return null;
  }

  const filteredArticles = filter === "all" 
    ? articles 
    : articles.filter(a => a.kategorie === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-[#4A7C59] to-[#3d6449]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Rádce
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Odborné informace o pH půdy, vápnění a výživě rostlin
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                filter === "all"
                  ? "bg-[#4A7C59] text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
            >
              Všechny
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  filter === key
                    ? "bg-[#4A7C59] text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">
                Zatím zde nejsou žádné publikované články.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={article.obrazek_url}
                      alt={article.nadpis}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          categoryColors[article.kategorie]
                        }`}
                      >
                        {categoryLabels[article.kategorie]}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.nadpis}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.perex}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(article.datum_publikace)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.cas_cteni} min
                      </div>
                    </div>

                    {/* Read More Link */}
                    <Link
                      href={`/vzdelavani/${article.slug}`}
                      className="inline-flex items-center text-[#4A7C59] hover:text-[#3d6449] font-semibold transition-colors"
                    >
                      Číst více
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#4A7C59]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Máte dotaz k péči o půdu?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rádi vám poradíme s vaší konkrétní situací
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
