import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { TOURS } from '@/lib/tours-data'

export const metadata: Metadata = {
  title: 'Excursions | Blue Hole Jamaica',
  description:
    'Blue Hole, Wabba\'s Weed Adventure, Dunn\'s River Falls, Mayfield Falls, Y.S. Falls, Black River Safari, Benta River, Rick\'s Cafe, 7 Miles Beach Negril, Pelican Bar, the Bob Marley Museum, and fully custom attractions.',
}

const EXCURSION_SLUGS = [
  'blue-hole',
  'wabbas-weed-adventure',
  'dunns-river-falls',
  'mayfield-falls',
  'ys-falls',
  'black-river-safari-tour',
  'benta-river',
  'ricks-cafe',
  'seven-mile-beach-negril',
  'pelican-bar',
  'bob-marley-museum-kingston',
  'custom-attractions',
]

const excursions = EXCURSION_SLUGS.map((slug) => TOURS.find((t) => t.slug === slug)).filter(
  (t): t is (typeof TOURS)[number] => Boolean(t)
)

export default function ExcursionsPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">
            What We Offer
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Our Excursions</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Pick a destination and we&apos;ll handle the rest. Prices below are estimates —
            confirm final pricing when you book.
          </p>
        </div>
      </section>

      {/* Excursion Cards */}
      <section className="py-12 sm:py-16 bg-[#F0F9F5] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {excursions.map((tour) => (
              <div
                key={tour.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100"
              >
                <Link href={`/attractions/${tour.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={tour.images[0]}
                      alt={tour.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 text-[#1B3A2D] text-xs font-bold px-2.5 py-1 rounded-full">
                        Est. from ${tour.price}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <Link href={`/attractions/${tour.slug}`}>
                    <h3 className="font-bold text-[#1B3A2D] text-lg mb-2 hover:text-[#00B896] transition-colors">
                      {tour.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{tour.description}</p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
                    <Clock size={14} />
                    <span>{tour.duration}</span>
                  </div>
                  <Link
                    href={`/attractions/${tour.slug}`}
                    className="inline-flex items-center gap-1.5 text-[#00B896] hover:text-[#009B7F] text-sm font-semibold transition-colors"
                  >
                    View Details <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#1B3A2D]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to plan your trip?
          </h2>
          <p className="text-gray-300 mb-6">
            Browse all our tours and transfers, or reach out and we&apos;ll put together a custom
            itinerary for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/attractions"
              className="inline-flex items-center justify-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-7 py-3 rounded-xl transition-colors"
            >
              View All Attractions
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-xl transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
