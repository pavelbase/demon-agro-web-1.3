'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NavDropdown({ label, items }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="px-4 py-2 text-text-dark hover:text-primary-brown transition-colors duration-300 font-medium flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-warm-lg py-2 animate-scale-in">
          {items.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-3 text-text-dark hover:bg-cream hover:text-primary-brown transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
