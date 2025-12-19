'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { PortalImage } from '@/lib/types/database'

interface PortalGalleryProps {
  images: PortalImage[]
}

export function PortalGallery({ images }: PortalGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      {/* Carousel */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-xl">
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].alt || images[currentIndex].title || 'Portal screenshot'}
            fill
            className="object-contain cursor-pointer"
            onClick={() => openLightbox(currentIndex)}
            priority={currentIndex === 0}
          />
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Info */}
        {(images[currentIndex].title || images[currentIndex].description) && (
          <div className="mt-4 text-center">
            {images[currentIndex].title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {images[currentIndex].title}
              </h3>
            )}
            {images[currentIndex].description && (
              <p className="text-gray-600 mt-1">
                {images[currentIndex].description}
              </p>
            )}
          </div>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary-green w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Grid (for more than 3 images) */}
      {images.length > 3 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:opacity-75 transition-opacity ${
                index === currentIndex ? 'ring-4 ring-primary-green' : ''
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || image.title || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || images[currentIndex].title || 'Portal screenshot'}
              fill
              className="object-contain"
            />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
