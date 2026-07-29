'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { TOURS } from '@/lib/tours-data'
import BookingModal from '@/components/BookingModal'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'All Tours' },
  { value: 'day_tour', label: 'Day Tours' },
  { value: 'airport_transfer', label: 'Airport Transfers' },
  { value: 'overnight', label: 'Overnight Stays' },
]

export default function AttractionsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTours =
    activeCategory === 'all' ? TOURS : TOURS.filter((t) => t.category === activeCategory)

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">
            Explore Jamaica
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Our Attractions & Tours</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            From thrilling day adventures to seamless airport transfers, we have the perfect experience for every traveler.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-150',
                  activeCategory === cat.value
                    ? 'bg-[#00B896] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-12 sm:py-16 bg-[#F0F9F5] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTours.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No tours found for this category.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <div
                  key={tour.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100"
                >
                  <Link href={`/attractions/${tour.slug}`}>
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={tour.images[0]}
                        alt={tour.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={cn(
                          'text-xs font-semibold px-2.5 py-1 rounded-full',
                          tour.category === 'airport_transfer' ? 'bg-blue-500 text-white' :
                          tour.category === 'overnight' ? 'bg-purple-500 text-white' :
                          'bg-[#00B896] text-white'
                        )}>
                          {tour.category === 'airport_transfer' ? 'Airport Transfer' :
                           tour.category === 'overnight' ? 'Overnight' : 'Day Tour'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 text-[#1B3A2D] text-xs font-bold px-2.5 py-1 rounded-full">
                          From ${tour.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/attractions/${tour.slug}`}>
                      <h3 className="font-bold text-[#1B3A2D] text-xl mb-2 hover:text-[#00B896] transition-colors">{tour.name}</h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{tour.description}</p>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
                      <Clock size={14} />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/attractions/${tour.slug}`}
                        className="flex-1 text-center border border-[#1B3A2D] text-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200"
                      >
                        View Details
                      </Link>
                      <BookingModal defaultTourSlug={tour.slug}>
                        <button className="flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200">
                          Book Now
                        </button>
                      </BookingModal>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#1B3A2D]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-300 mb-6">
            We offer fully customizable tours. Contact us and let&apos;s plan your perfect Jamaica adventure.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            Get in Touch
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
