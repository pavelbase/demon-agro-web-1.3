"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ArrowRight, Home } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";
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

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentArticle = getArticleBySlug(slug);
    setArticle(currentArticle);

    if (currentArticle) {
      const allArticles = getPublishedArticles();
      const currentIndex = allArticles.findIndex(a => a.id === currentArticle.id);
      
      if (currentIndex > 0) {
        setNextArticle(allArticles[currentIndex - 1]);
      }
      if (currentIndex < allArticles.length - 1) {
        setPrevArticle(allArticles[currentIndex + 1]);
      }
    }
  }, [slug]);

  if (!mounted) {
    return null;
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#F5F1E8]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Článek nenalezen
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tento článek neexistuje nebo byl odstraněn.
          </p>
          <Link
            href="/vzdelavani"
            className="inline-block bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md"
          >
            Zpět na články
          </Link>
        </div>
      </div>
    );
  }

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
      {/* Hero */}
      <section
        className="relative pt-32 pb-16 bg-cover bg-center"
        style={{ backgroundImage: `url(${article.obrazek_url})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-white/80 mb-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Domů
            </Link>
            <span>›</span>
            <Link href="/vzdelavani" className="hover:text-white transition-colors">
              Vzdělávání
            </Link>
            <span>›</span>
            <span className="text-white">{article.nadpis}</span>
          </nav>

          {/* Category */}
          <div className="mb-4">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                categoryColors[article.kategorie]
              }`}
            >
              {categoryLabels[article.kategorie]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {article.nadpis}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center text-white/90 space-x-6">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {formatDate(article.datum_publikace)}
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {article.cas_cteni} min čtení
            </div>
            <div>
              Autor: {article.autor}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Perex */}
          <div className="text-xl text-gray-700 leading-relaxed mb-8 pb-8 border-b-2 border-gray-200">
            {article.perex}
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none article-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.obsah}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Article Navigation */}
      {(prevArticle || nextArticle) && (
        <section className="py-12 bg-[#F5F1E8]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Article */}
              <div>
                {prevArticle && (
                  <Link
                    href={`/vzdelavani/${prevArticle.slug}`}
                    className="block bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Předchozí článek
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#4A7C59] transition-colors">
                      {prevArticle.nadpis}
                    </h3>
                  </Link>
                )}
              </div>

              {/* Next Article */}
              <div>
                {nextArticle && (
                  <Link
                    href={`/vzdelavani/${nextArticle.slug}`}
                    className="block bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-all group text-right"
                  >
                    <div className="flex items-center justify-end text-gray-500 text-sm mb-2">
                      Další článek
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#4A7C59] transition-colors">
                      {nextArticle.nadpis}
                    </h3>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-[#4A7C59]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Máte dotaz? Kontaktujte nás
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
