"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReseniaOpen, setIsReseniaOpen] = useState(false);
  const [isKalkulackaOpen, setIsKalkulackaOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Load logo from localStorage
    const savedLogo = localStorage.getItem('logo_url');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact-form");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/kontakt#contact-form";
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center py-2">
            <Image
              src={logoUrl}
              alt="Démon agro"
              width={280}
              height={80}
              className="max-h-16 sm:max-h-20 w-auto max-w-[200px] sm:max-w-[280px] object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-green transition-colors font-medium"
            >
              Domů
            </Link>

            {/* Řešení Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsReseniaOpen(true)}
              onMouseLeave={() => setIsReseniaOpen(false)}
            >
              <button className="flex items-center text-gray-700 hover:text-primary-green transition-colors font-medium py-2">
                Řešení
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isReseniaOpen && (
                <div className="absolute left-0 top-full pt-2 w-56">
                  <div className="bg-white shadow-lg rounded-lg py-2">
                    <Link
                      href="/ph-pudy"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      pH půdy a vápnění
                    </Link>
                    <Link
                      href="/sira"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      Nedostatek síry
                    </Link>
                    <Link
                      href="/k"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      Nedostatek draslíku
                    </Link>
                    <Link
                      href="/mg"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      Nedostatek hořčíku
                    </Link>
                    <Link
                      href="/analyza"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      Analýza půdy
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/vzdelavani"
              className="text-gray-700 hover:text-primary-green transition-colors font-medium"
            >
              Rádce
            </Link>

            {/* Kalkulačka Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsKalkulackaOpen(true)}
              onMouseLeave={() => setIsKalkulackaOpen(false)}
            >
              <button className="flex items-center text-gray-700 hover:text-primary-green transition-colors font-medium py-2">
                Kalkulačka
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isKalkulackaOpen && (
                <div className="absolute left-0 top-full pt-2 w-56">
                  <div className="bg-white shadow-lg rounded-lg py-2">
                    <Link
                      href="/kalkulacka"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      Kalkulačka vápnění
                    </Link>
                    <Link
                      href="/kalkulacka/prevodni"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-cream hover:text-primary-green transition-colors"
                    >
                      Převodní kalkulačka
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/o-nas"
              className="text-gray-700 hover:text-primary-green transition-colors font-medium"
            >
              O nás
            </Link>
            <Link
              href="/kontakt"
              className="text-gray-700 hover:text-primary-green transition-colors font-medium"
            >
              Kontakt
            </Link>

            {/* CTA Button */}
            <button
              onClick={scrollToContact}
              className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Nezávazná poptávka
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-green transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Domů
              </Link>

              {/* Mobile Řešení */}
              <div className="space-y-2">
                <div className="text-gray-700 font-medium">Řešení</div>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/ph-pudy"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    pH půdy a vápnění
                  </Link>
                  <Link
                    href="/sira"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Nedostatek síry
                  </Link>
                  <Link
                    href="/k"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Nedostatek draslíku
                  </Link>
                  <Link
                    href="/mg"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Nedostatek hořčíku
                  </Link>
                  <Link
                    href="/analyza"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Analýza půdy
                  </Link>
                </div>
              </div>

              <Link
                href="/vzdelavani"
                className="text-gray-700 hover:text-primary-green transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rádce
              </Link>

              {/* Mobile Kalkulačka */}
              <div className="space-y-2">
                <div className="text-gray-700 font-medium">Kalkulačka</div>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/kalkulacka"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kalkulačka vápnění
                  </Link>
                  <Link
                    href="/kalkulacka/prevodni"
                    className="block text-gray-600 hover:text-primary-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Převodní kalkulačka
                  </Link>
                </div>
              </div>

              <Link
                href="/o-nas"
                className="text-gray-700 hover:text-primary-green transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                O nás
              </Link>
              <Link
                href="/kontakt"
                className="text-gray-700 hover:text-primary-green transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kontakt
              </Link>

              <button
                onClick={scrollToContact}
                className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-md w-full"
              >
                Nezávazná poptávka
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
