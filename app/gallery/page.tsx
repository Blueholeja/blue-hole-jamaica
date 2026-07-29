'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

const GALLERY_IMAGES = [
  { src: '/images/gallery/1.jpg', alt: 'Crystal blue swimming hole in tropical jungle', caption: 'The iconic Blue Hole' },
  { src: '/images/gallery/2.jpg', alt: 'Tropical waterfall cascading into turquoise pool', caption: 'Hidden waterfall paradise' },
  { src: '/images/gallery/3.jpg', alt: 'Turquoise Caribbean beach with palm trees', caption: "Jamaica's pristine beaches" },
  { src: '/images/gallery/4.jpg', alt: 'Dramatic tropical waterfall', caption: "Dunn's River Falls" },
  { src: '/images/gallery/5.jpg', alt: 'Cliff jumping into blue water', caption: 'Cliff jumping thrills' },
  { src: '/images/gallery/6.jpg', alt: 'Crystal clear Jamaican waters', caption: 'Crystal clear waters' },
  { src: '/images/gallery/7.jpg', alt: 'Aerial view of Jamaica tropical coastline', caption: 'Jamaica from above' },
  { src: '/images/gallery/8.jpg', alt: 'Lush tropical green forest canopy', caption: 'Through the jungle' },
  { src: '/images/gallery/9.jpg', alt: 'Tropical resort surrounded by nature', caption: 'Blue Hole overnight resort' },
  { src: '/images/gallery/10.jpg', alt: 'Beautiful white sand Caribbean beach', caption: 'Secluded Jamaican beach' },
  { src: '/images/gallery/11.jpg', alt: 'Airport arrivals terminal', caption: 'Smooth airport transfers' },
  { src: '/images/gallery/12.jpg', alt: 'River adventure through the jungle', caption: 'Martha Brae River adventure' },
]

export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  function openLightbox(idx: number) {
    setLightboxIndex(idx)
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  function prevImage() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)
  }

  function nextImage() {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % GALLERY_IMAGES.length)
  }

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">
            Visual Journey
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Gallery</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg">
            A glimpse into the breathtaking beauty of Jamaica and the unforgettable experiences we create.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16 bg-[#F0F9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {GALLERY_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="group relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200"
                onClick={() => openLightbox(idx)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end">
                  <p className="text-white text-sm font-medium px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-[#00B896] transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          {/* Prev button */}
          <button
            className="absolute left-4 text-white hover:text-[#00B896] transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); prevImage() }}
            aria-label="Previous image"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl w-full max-h-[80vh] aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={GALLERY_IMAGES[lightboxIndex].src}
              alt={GALLERY_IMAGES[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next button */}
          <button
            className="absolute right-4 text-white hover:text-[#00B896] transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); nextImage() }}
            aria-label="Next image"
          >
            <ChevronRight size={40} />
          </button>

          {/* Caption & counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white text-sm mb-1">{GALLERY_IMAGES[lightboxIndex].caption}</p>
            <p className="text-gray-400 text-xs">{lightboxIndex + 1} / {GALLERY_IMAGES.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}
