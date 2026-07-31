import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AirVent, Tv, Armchair, Refrigerator, Wifi, CircleParking, ArrowRight, CheckCircle } from 'lucide-react'
import { ROOM_PRICING } from '@/lib/room-utils'

export const metadata: Metadata = {
  title: 'Rooms & Accommodation | Blue Hole Jamaica',
  description: 'Book a Single or Double room at Blue Hole Jamaica — air conditioned rooms with Smart TV, free Wi-Fi, and optional breakfast and dinner packages.',
}

const AMENITIES = [
  { icon: AirVent, label: 'Air Conditioning' },
  { icon: Tv, label: 'Smart Television' },
  { icon: Armchair, label: 'Couch' },
  { icon: Refrigerator, label: 'Refrigerator' },
  { icon: Wifi, label: 'Free Wi-Fi' },
  { icon: CircleParking, label: 'Parking Available' },
]

const singlePricing = ROOM_PRICING.filter((p) => p.room_type === 'single')
const doublePricing = ROOM_PRICING.filter((p) => p.room_type === 'double')

export default function RoomsPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">
            Accommodation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Rooms & Stays</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            10 rooms surrounded by nature at the Blue Hole. Book directly with a small deposit —
            the rest is due when you arrive.
          </p>
        </div>
      </section>

      {/* Room Type Cards */}
      <section className="py-12 sm:py-16 bg-[#F0F9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-56">
                <Image
                  src="/images/rooms/single-room.jpg"
                  alt="Single Room"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="absolute top-3 right-3 bg-white/90 text-[#1B3A2D] text-xs font-bold px-2.5 py-1 rounded-full">
                  8 Available
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#1B3A2D] mb-1">Single Room</h2>
                <p className="text-gray-500 text-sm mb-4">Perfect for solo travelers or couples.</p>
                <p className="text-[#00B896] font-bold text-lg">From $125/night</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-56">
                <Image
                  src="/images/rooms/double-room.jpg"
                  alt="Double Room"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="absolute top-3 right-3 bg-white/90 text-[#1B3A2D] text-xs font-bold px-2.5 py-1 rounded-full">
                  2 Available
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#1B3A2D] mb-1">Double Room</h2>
                <p className="text-gray-500 text-sm mb-4">More space, includes breakfast at minimum.</p>
                <p className="text-[#00B896] font-bold text-lg">From $170/night</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-14">
            <h2 className="text-2xl font-bold text-[#1B3A2D] mb-6 text-center">Every Room Includes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {AMENITIES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#F0F9F5] flex items-center justify-center">
                    <Icon size={22} className="text-[#00B896]" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
            <div>
              <h3 className="text-xl font-bold text-[#1B3A2D] mb-4">Single Room Pricing</h3>
              <div className="space-y-3">
                {singlePricing.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-[#00B896] shrink-0" />
                      <span className="font-medium text-[#1B3A2D]">{p.label}</span>
                    </div>
                    <span className="font-bold text-[#00B896]">${p.price_per_night}<span className="text-gray-400 font-normal text-sm">/night</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1B3A2D] mb-4">Double Room Pricing</h3>
              <div className="space-y-3">
                {doublePricing.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-[#00B896] shrink-0" />
                      <span className="font-medium text-[#1B3A2D]">{p.label}</span>
                    </div>
                    <span className="font-bold text-[#00B896]">${p.price_per_night}<span className="text-gray-400 font-normal text-sm">/night</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/rooms/book"
              className="inline-flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Book Now
              <ArrowRight size={18} />
            </Link>
            <p className="text-gray-400 text-sm mt-3">Pay a 50% deposit now, settle the rest on arrival.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
