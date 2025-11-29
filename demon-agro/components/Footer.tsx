"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  useEffect(() => {
    const savedLogo = localStorage.getItem('logo_url');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  return (
    <footer className="bg-[#2C2C2C] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* O nás */}
          <div>
            <img
              src={logoUrl}
              alt="Démon agro"
              className="max-h-10 w-auto max-w-[150px] object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-4">O nás</h3>
            <p className="text-gray-300 mb-4">
              Komplexní pH management a výživa půdy pro zemědělce v severních a
              západních Čechách.
            </p>
            <Link
              href="/o-nas"
              className="text-primary-beige hover:text-white transition-colors"
            >
              Více o nás →
            </Link>
          </div>

          {/* Řešení */}
          <div>
            <h3 className="text-xl font-bold mb-4">Navigace</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ph-pudy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  pH půdy a vápnění
                </Link>
              </li>
              <li>
                <Link
                  href="/sira"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Nedostatek síry
                </Link>
              </li>
              <li>
                <Link
                  href="/k"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Nedostatek draslíku
                </Link>
              </li>
              <li>
                <Link
                  href="/mg"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Nedostatek hořčíku
                </Link>
              </li>
              <li>
                <Link
                  href="/analyza"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Analýza půdy
                </Link>
              </li>
              <li>
                <Link
                  href="/vzdelavani"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Rádce
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-beige" />
                <a
                  href="mailto:base@demonagro.cz"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  base@demonagro.cz
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-beige" />
                <a
                  href="tel:+420731734907"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +420 731 734 907
                </a>
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm">
                  <strong>Oblast působnosti:</strong>
                  <br />
                  Severní a západní Čechy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>© 2025 Démon agro. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
  );
}
