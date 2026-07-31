'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, Plane, ChevronRight, MessageCircle, GlassWater } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AirportPickupBooking() {
  const router = useRouter()
  const [arrivalDate, setArrivalDate] = useState('')
  const [arrivalFlight, setArrivalFlight] = useState('')
  const [address, setAddress] = useState('')
  const [guests, setGuests] = useState(1)

  const today = new Date().toISOString().split('T')[0]
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('tour', 'airport-pickup')
    if (arrivalDate) params.set('date', arrivalDate)
    if (arrivalFlight) params.set('arrivalFlight', arrivalFlight)
    if (address) params.set('address', address)
    params.set('guests', String(guests))
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div id="airport-pickup-booking-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-[#1B3A2D] mb-1">Book Your Airport Pickup</h2>
      <p className="text-gray-500 text-sm mb-6">
        Give us your flight details and where you&apos;re staying — we&apos;ll be waiting at arrivals.
      </p>

      <div className="flex items-start gap-3 bg-[#F0F9F5] border border-[#00B896]/20 rounded-xl px-4 py-3.5 mb-6">
        <GlassWater size={18} className="text-[#00B896] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#1B3A2D]">Complimentary Welcome Refreshments</p>
          <p className="text-xs text-gray-500 mt-1">
            Every airport transfer includes your choice of Red Stripe Beer &amp; Water or Rum Punch &amp; Water.
            Guests who smoke receive 2 grams of complimentary herb upon arrival (only where legally permitted
            and in accordance with applicable laws).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Calendar size={16} className="text-[#00B896]" />
              Arrival Date *
            </label>
            <input
              type="date"
              value={arrivalDate}
              min={today}
              onChange={(e) => setArrivalDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Plane size={16} className="text-[#00B896]" />
              Arrival Flight # *
            </label>
            <input
              type="text"
              value={arrivalFlight}
              onChange={(e) => setArrivalFlight(e.target.value)}
              required
              placeholder="e.g. AA1234"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <MapPin size={16} className="text-[#00B896]" />
            Drop-off Address *
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={2}
            placeholder="Hotel or villa name and address where we'll drop you off"
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
          href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20booking%20an%20Airport%20Pickup.`}
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
