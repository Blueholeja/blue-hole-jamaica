'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, Plane, ChevronRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AirportDropoffBooking() {
  const router = useRouter()
  const [departureDate, setDepartureDate] = useState('')
  const [departureFlight, setDepartureFlight] = useState('')
  const [address, setAddress] = useState('')
  const [guests, setGuests] = useState(1)

  const today = new Date().toISOString().split('T')[0]
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('tour', 'airport-dropoff')
    if (departureDate) params.set('date', departureDate)
    if (departureFlight) params.set('departureFlight', departureFlight)
    if (address) params.set('address', address)
    params.set('guests', String(guests))
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div id="airport-dropoff-booking-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-[#1B3A2D] mb-1">Book Your Airport Drop-Off</h2>
      <p className="text-gray-500 text-sm mb-6">
        Give us your flight details and where to pick you up — we&apos;ll get you there on time.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Calendar size={16} className="text-[#00B896]" />
              Departure Date *
            </label>
            <input
              type="date"
              value={departureDate}
              min={today}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Plane size={16} className="text-[#00B896]" />
              Departure Flight # *
            </label>
            <input
              type="text"
              value={departureFlight}
              onChange={(e) => setDepartureFlight(e.target.value)}
              required
              placeholder="e.g. AA5678"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <MapPin size={16} className="text-[#00B896]" />
            Pickup Address *
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={2}
            placeholder="Hotel or villa name and address where we'll pick you up"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <Users size={16} className="text-[#00B896]" />
            Number of Guests
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className={cn(
                'w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 hover:border-[#00B896] hover:text-[#00B896] transition-colors',
                guests <= 1 && 'opacity-50 cursor-not-allowed'
              )}
            >
              -
            </button>
            <span className="text-xl font-bold text-[#1B3A2D] w-8 text-center">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(Math.min(20, guests + 1))}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 hover:border-[#00B896] hover:text-[#00B896] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#00B896] hover:bg-[#009B7F] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Continue Booking
          <ChevronRight size={18} />
        </button>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20booking%20an%20Airport%20Drop-Off.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <MessageCircle size={18} />
          Enquire on WhatsApp
        </a>
      </form>
    </div>
  )
}
