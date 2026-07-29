import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, CheckCircle, ArrowLeft, MessageCircle, Star } from 'lucide-react'
import { getTourBySlug, TOURS } from '@/lib/tours-data'
import BookingModal from '@/components/BookingModal'

export async function generateStaticParams() {
  return TOURS.map((tour) => ({ slug: tour.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tour = getTourBySlug(slug)
  if (!tour) return { title: 'Tour Not Found' }
  return {
    title: `${tour.name} | Blue Hole Jamaica`,
    description: tour.description,
  }
}

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = getTourBySlug(slug)

  if (!tour) notFound()

  const related = TOURS.filter((t) => t.slug !== tour.slug && t.category === tour.category).slice(0, 3)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative h-72 sm:h-96 overflow-hidden">
        <Image
          src={tour.images[0]}
          alt={tour.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="bg-[#00B896] text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            From ${tour.price}/person
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">{tour.name}</h1>
          <div className="flex items-center gap-2 text-gray-200 text-sm">
            <Clock size={15} />
            <span>{tour.duration}</span>
            <span className="mx-2">•</span>
            <Star size={15} fill="#00B896" className="text-[#00B896]" />
            <span>4.9 (120+ reviews)</span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#00B896] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/attractions" className="hover:text-[#00B896] transition-colors">Attractions</Link>
            <span>/</span>
            <span className="text-[#1B3A2D] font-medium">{tour.name}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 sm:py-16 bg-[#F0F9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Back Link */}
              <Link
                href="/attractions"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00B896] transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Back to attractions
              </Link>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1B3A2D] mb-4">About This Tour</h2>
                <p className="text-gray-600 leading-relaxed text-base">{tour.description}</p>
              </div>

              {/* Highlights */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1B3A2D] mb-5">What&apos;s Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-[#00B896] shrink-0" />
                      <span className="text-gray-700 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              {tour.images.length > 1 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-[#1B3A2D] mb-5">Gallery</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {tour.images.map((img, i) => (
                      <div key={i} className="relative h-48 rounded-xl overflow-hidden">
                        <Image
                          src={img}
                          alt={`${tour.name} photo ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Booking CTA */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <div className="text-center mb-5">
                  <div className="text-3xl font-bold text-[#1B3A2D]">
                    ${tour.price}
                    <span className="text-base font-normal text-gray-400">/person</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#00B896" className="text-[#00B896]" />
                    ))}
                    <span className="text-gray-400 text-xs ml-1">(120 reviews)</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-[#1B3A2D]">{tour.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium text-[#1B3A2D] capitalize">
                      {tour.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium text-green-600">
                      {tour.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <BookingModal defaultTourSlug={tour.slug}>
                  <button className="w-full bg-[#00B896] hover:bg-[#009B7F] text-white font-bold py-3.5 rounded-xl transition-colors mb-3">
                    Book This Tour
                  </button>
                </BookingModal>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(tour.name)}%20tour.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <MessageCircle size={18} />
                  Enquire on WhatsApp
                </a>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Free cancellation up to 48 hours before your tour
                </p>
              </div>
            </div>
          </div>

          {/* Related Tours */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="text-2xl font-bold text-[#1B3A2D] mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((t) => (
                  <Link
                    key={t.id}
                    href={`/attractions/${t.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={t.images[0]}
                        alt={t.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#1B3A2D] mb-1 group-hover:text-[#00B896] transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-2 line-clamp-1">{t.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{t.duration}</span>
                        <span className="text-[#00B896] font-semibold text-sm">From ${t.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
