import Image from 'next/image'
import Link from 'next/link'
import { Plane, Map, Hotel, Shield, Star, CheckCircle, MessageCircle, ArrowRight, Clock, Users } from 'lucide-react'
import BookingModal from '@/components/BookingModal'
import { TOURS } from '@/lib/tours-data'

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Sarah J.',
    location: 'Canada',
    rating: 5,
    message: 'The Blue Hole tour was the highlight of our trip! The team was amazing and made everything so easy.',
    initials: 'SJ',
  },
  {
    id: '2',
    name: 'Mark T.',
    location: 'UK',
    rating: 5,
    message: 'Excellent airport transfer and beautiful tour at Blue Hole. Highly recommended.',
    initials: 'MT',
  },
  {
    id: '3',
    name: 'Emma L.',
    location: '',
    rating: 5,
    message: "Wabba's Weed Adventure was so much fun! Great service and unforgettable memories.",
    initials: 'EL',
  },
]

const WHY_US = [
  {
    icon: <Shield className="w-5 h-5 text-[#00B896]" />,
    title: 'Professional Drivers',
    description: 'Experienced, friendly & knowledgeable local drivers.',
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-[#00B896]" />,
    title: 'Comfort & Safety',
    description: 'Modern vehicles, professional drivers, total peace of mind.',
  },
  {
    icon: <Clock className="w-5 h-5 text-[#00B896]" />,
    title: 'Flexible & Reliable',
    description: 'We work around your schedule and make it easy for you.',
  },
  {
    icon: <Map className="w-5 h-5 text-[#00B896]" />,
    title: 'Local Expertise',
    description: 'Discover hidden gems and authentic Jamaican experiences.',
  },
]

const SERVICES = [
  {
    icon: <Plane className="w-7 h-7 text-[#00B896]" />,
    title: 'Airport Transfers',
    description: 'Reliable pickup & drop-off anywhere in Jamaica.',
    href: '/attractions?category=airport_transfer',
  },
  {
    icon: <Map className="w-7 h-7 text-[#00B896]" />,
    title: 'Day Trips & Tours',
    description: 'Explore the best attractions across the island.',
    href: '/attractions?category=day_tour',
  },
  {
    icon: <Hotel className="w-7 h-7 text-[#00B896]" />,
    title: 'Overnight Stays',
    description: 'Stay overnight at the beautiful Blue Hole.',
    href: '/attractions?category=overnight',
  },
  {
    icon: <Shield className="w-7 h-7 text-[#00B896]" />,
    title: 'Safe & Comfortable',
    description: 'Modern vehicles, professional drivers, total peace of mind.',
    href: '/about',
  },
]

const popularTours = TOURS.filter((t) =>
  ['blue-hole', 'wabbas-weed-adventure', 'dunns-river-falls', 'custom-day-tours'].includes(t.slug)
)

export default function HomePage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[580px] max-h-[860px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero.jpg"
            alt="Beautiful Blue Hole Jamaica tropical waterfall"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <p className="text-[#00B896] text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Explore. Experience. Enjoy.
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Discover Jamaica.<br />
            <span className="whitespace-nowrap">Live the Adventure.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
            From airport transfers to unforgettable island adventures, we make your journey safe, comfortable and memorable.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <BookingModal>
              <button className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#00B896] text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                <Plane size={16} />
                Reserve Your Trip
              </button>
            </BookingModal>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'd%20like%20to%20know%20more%20about%20your%20tours.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors duration-200 border border-white/40 backdrop-blur-sm"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICE STRIP ─────────────────────────────────────────────── */}
      <section id="services" className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group flex items-start gap-4 p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                <div className="shrink-0 mt-0.5">{s.icon}</div>
                <div>
                  <h3 className="font-semibold text-[#1B3A2D] text-sm sm:text-base mb-1 group-hover:text-[#00B896] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-snug">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ATTRACTIONS ───────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#00B896] text-xs font-bold uppercase tracking-widest mb-2">
                Explore the Best of Jamaica
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A2D]">Popular Attractions</h2>
            </div>
            <Link
              href="/attractions"
              className="hidden sm:inline-flex items-center gap-1 text-[#00B896] hover:text-[#009B7F] text-sm font-semibold transition-colors shrink-0"
            >
              View All Attractions <ArrowRight size={15} />
            </Link>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularTours.map((tour, i) => (
              <div
                key={tour.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={tour.images[0]}
                    alt={tour.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {i === 0 && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-[#00B896] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-[#1B3A2D] text-base mb-1">{tour.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{tour.description}</p>
                  <div className="flex items-center gap-3 text-gray-400 text-xs mb-4">
                    <span className="flex items-center gap-1"><Clock size={11} /> {tour.duration}</span>
                    <span className="flex items-center gap-1"><Users size={11} /> All Ages</span>
                  </div>
                  <BookingModal defaultTourSlug={tour.slug}>
                    <button className="w-full bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                      Reserve Now
                    </button>
                  </BookingModal>
                </div>
              </div>
            ))}
          </div>

          <div className="sm:hidden text-center mt-6">
            <Link href="/attractions" className="inline-flex items-center gap-1 text-[#00B896] font-semibold text-sm">
              View All Attractions <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#1B3A2D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-[#00B896] text-xs font-bold uppercase tracking-widest mb-4">Why Choose Us</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
                Your Journey,<br />Our Priority
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                We are passionate about showcasing the real Jamaica with service you can trust and experiences you&apos;ll never forget.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {WHY_US.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="bg-white/10 rounded-lg p-2 h-fit shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors duration-200"
              >
                Learn More About Us
              </Link>
            </div>

            {/* Right — vehicle image */}
            <div className="relative rounded-2xl overflow-hidden h-72 lg:h-[420px]">
              <Image
                src="/images/why-us-car.jpg"
                alt="Professional tour vehicle"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A2D]/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#00B896] text-xs font-bold uppercase tracking-widest mb-2">What Our Guests Say</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A2D] mb-3">Trusted by Travelers</h2>
            <div className="flex items-center justify-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} fill="#00B896" className="text-[#00B896]" />
              ))}
              <span className="text-gray-500 text-sm ml-1">5.0 (320+ Reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1B3A2D] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B3A2D] text-sm">{t.name}</p>
                    {t.location && <p className="text-gray-400 text-xs">{t.location}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={13} fill="#00B896" className="text-[#00B896]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{t.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/cta-bg.jpg"
            alt="Jamaica tropical scenery"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#1B3A2D]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Ready to Explore Jamaica?
          </h2>
          <p className="text-gray-300 mb-8 text-sm sm:text-base max-w-xl mx-auto">
            Send us your reservation request today and let&apos;s plan your perfect adventure!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors duration-200"
            >
              Reserve Now
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-colors duration-200 border border-white/30"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
