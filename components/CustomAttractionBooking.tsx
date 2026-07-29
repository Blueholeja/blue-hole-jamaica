'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, ChevronRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CustomAttractionBooking() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState(1)

  const today = new Date().toISOString().split('T')[0]
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('tour', 'custom-attractions')
    if (startDate) params.set('date', startDate)
    if (endDate) params.set('end', endDate)
    if (destination) params.set('destination', destination)
    params.set('guests', String(guests))
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div id="custom-booking-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-[#1B3A2D] mb-1">Plan Your Custom Trip</h2>
      <p className="text-gray-500 text-sm mb-6">
        Tell us where you&apos;d like to go and when — we&apos;ll take care of the rest.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
            <MapPin size={16} className="text-[#00B896]" />
            Where would you like to go? *
          </label>
          <textarea
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            rows={3}
            placeholder="Tell us the places you'd like to visit..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Calendar size={16} className="text-[#00B896]" />
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Calendar size={16} className="text-[#00B896]" />
              End Date *
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
            />
          </div>
        </div>

        {/* Guests */}
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
          Book This Tour
          <ChevronRight size={18} />
        </button>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20booking%20a%20Custom%20Attractions%20tour.`}
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
