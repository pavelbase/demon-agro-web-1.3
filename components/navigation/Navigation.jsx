'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavDropdown from './NavDropdown'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const reseniItems = [
    { label: 'Vápnění půd', href: '/reseni/vapneni' },
    { label: 'Hnojení', href: '/reseni/hnojeni' },
    { label: 'Rozbory půd', href: '/reseni/rozbory' },
  ]

  const kalkulackaItems = [
    { label: 'Kalkulačka vápnění', href: '/kalkulacka' },
  ]

  return (
    <nav className="bg-white shadow-warm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl md:text-3xl font-bold text-primary-brown tracking-tight group-hover:text-beige transition-colors duration-300">
              Démon agro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className="px-4 py-2 text-text-dark hover:text-primary-brown transition-colors duration-300 font-medium"
            >
              Domů
            </Link>

            <NavDropdown label="Řešení" items={reseniItems} />
            
            <Link
              href="/radce"
              className="px-4 py-2 text-text-dark hover:text-primary-brown transition-colors duration-300 font-medium"
            >
              Rádce
            </Link>

            <NavDropdown label="Kalkulačka" items={kalkulackaItems} />

            <Link
              href="/o-nas"
              className="px-4 py-2 text-text-dark hover:text-primary-brown transition-colors duration-300 font-medium"
            >
              O nás
            </Link>

            <Link
              href="/kontakt"
              className="px-4 py-2 text-text-dark hover:text-primary-brown transition-colors duration-300 font-medium"
            >
              Kontakt
            </Link>

            <Link
              href="/poptavka"
              className="ml-4 px-6 py-2.5 bg-green-cta text-white rounded-full hover:bg-opacity-90 transition-all duration-300 font-medium shadow-warm hover:shadow-warm-lg"
            >
              Nezávazná poptávka
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-dark hover:text-primary-brown transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-3 text-text-dark hover:bg-cream rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Domů
              </Link>

              <div className="px-4 py-2">
                <div className="text-sm font-bold text-text-light mb-2">Řešení</div>
                {reseniItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-text-dark hover:bg-cream rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/radce"
                className="px-4 py-3 text-text-dark hover:bg-cream rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rádce
              </Link>

              <div className="px-4 py-2">
                <div className="text-sm font-bold text-text-light mb-2">Kalkulačka</div>
                {kalkulackaItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-text-dark hover:bg-cream rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/o-nas"
                className="px-4 py-3 text-text-dark hover:bg-cream rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                O nás
              </Link>

              <Link
                href="/kontakt"
                className="px-4 py-3 text-text-dark hover:bg-cream rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kontakt
              </Link>

              <Link
                href="/poptavka"
                className="mx-4 mt-2 px-6 py-3 bg-green-cta text-white rounded-full text-center hover:bg-opacity-90 transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nezávazná poptávka
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
