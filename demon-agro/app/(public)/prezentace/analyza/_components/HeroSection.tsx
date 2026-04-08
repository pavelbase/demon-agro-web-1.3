"use client";

import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    contactSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-20">
        <div className="mb-8 animate-fade-in">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 border border-white/30">
            Jaro 2026
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in-up">
          Analýza půdy:<br />
          <span className="text-sky-200">základ pro efektivní hnojení</span>
        </h1>

        <p className="text-lg md:text-xl text-white/95 mb-3 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 font-medium">
          Víte, co skutečně vaše půda potřebuje? Bez analýzy hnojíte naslepo.
        </p>

        <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
          Zónový odběr vzorků (RTK navigace) + analýza (pH, P, K, Mg, Ca, S) — vše v ceně. Od 305 Kč/ha.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 animate-fade-in-up animation-delay-400">
          <button
            onClick={scrollToContact}
            className="inline-block bg-white text-blue-800 px-10 py-4 rounded-full font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl text-lg hover:scale-105"
          >
            Nezávazná poptávka
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6 animate-fade-in-up animation-delay-400">
          {["pH půdy", "Fosfor (P)", "Draslík (K)", "Hořčík (Mg)", "Vápník (Ca)", "Humus"].map(
            (item) => (
              <span
                key={item}
                className="bg-white/15 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium border border-white/25"
              >
                {item}
              </span>
            )
          )}
        </div>

        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/70 mx-auto" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </section>
  );
}
