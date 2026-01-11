'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Screenshot {
  id: string
  title: string
  description: string
  image: string
  fallback: string
}

const screenshots: Screenshot[] = [
  {
    id: 'health-card',
    title: 'Zdravotní karta půdy',
    description: 'Přehledná vizualizace všech parametrů půdy s barevným hodnocením podle kategorií živin',
    image: '/images/portal-screenshots/health-card.png',
    fallback: '/images/portal-screenshots/health-card.svg'
  },
  {
    id: 'parcels-list',
    title: 'Správa pozemků',
    description: 'Kompletní přehled všech pozemků s možností filtrování a zobrazení problémových parcel',
    image: '/images/portal-screenshots/parcels-list.png',
    fallback: '/images/portal-screenshots/parcels-list.svg'
  },
  {
    id: 'liming-plan',
    title: 'Časový plán vápnění',
    description: 'Dlouhodobý plán s automatickým modelováním změn pH a doporučenými produkty',
    image: '/images/portal-screenshots/liming-plan.png',
    fallback: '/images/portal-screenshots/liming-plan.svg'
  }
]

export function ScreenshotGallery() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {screenshots.map((screenshot, index) => (
        <div
          key={screenshot.id}
          className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group ${
            index === 2 ? 'md:col-span-2 lg:col-span-1' : ''
          }`}
        >
          <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
            <Image
              src={imageErrors[screenshot.id] ? screenshot.fallback : screenshot.image}
              alt={screenshot.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(screenshot.id)}
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {screenshot.title}
            </h3>
            <p className="text-gray-600">
              {screenshot.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}


