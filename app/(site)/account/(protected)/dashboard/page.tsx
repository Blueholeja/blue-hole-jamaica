'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, AlertCircle, MapPin } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, parseReservationRoute, type Reservation } from '@/lib/reservation-utils'

interface CustomerInfo {
  name: string
  email: string
  email_verified: boolean
}

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null)
  const [bookings, setBookings] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [meRes, bookingsRes] = await Promise.all([
          fetch('/api/customers/me'),
          fetch('/api/customers/bookings'),
        ])
        if (meRes.ok) setCustomer(await meRes.json())
        if (bookingsRes.ok) setBookings(await bookingsRes.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleResendVerification() {
    await fetch('/api/customers/resend-verification', { method: 'POST' })
    setResent(true)
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = bookings.filter((b) => b.date >= today)
  const past = bookings.filter((b) => b.date < today)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B3A2D] mb-1">
        Welcome back{customer ? `, ${customer.name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-gray-500 text-sm mb-6">Here&apos;s everything you&apos;ve booked with us.</p>

      {customer && !customer.email_verified && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={18} className="text-yellow-600 shrink-0" />
          <p className="text-yellow-800 text-sm flex-1">Please verify your email address.</p>
          {resent ? (
            <span className="text-yellow-700 text-xs font-medium">Email sent!</span>
          ) : (
            <button onClick={handleResendVerification} className="text-yellow-800 text-xs font-semibold hover:underline shrink-0">
              Resend email
            </button>
          )}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 mb-4">You don&apos;t have any bookings yet.</p>
          <Link
            href="/book"
            className="inline-block bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Make a Reservation
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Past</h2>
              <div className="space-y-3">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking }: { booking: Reservation }) {
  const { pickup, destination } = parseReservationRoute(booking)
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-[#1B3A2D]">{booking.tours?.name || 'Reservation'}</p>
          <p className="text-gray-400 text-xs font-mono mt-0.5">
            REF-{booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLORS[booking.status]}`}>
          {STATUS_LABELS[booking.status] || booking.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {booking.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} /> {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
        </span>
        {(pickup !== '—' || destination !== '—') && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {pickup} → {destination}
          </span>
        )}
      </div>
      {booking.status === 'confirmed' && booking.payment_status !== 'paid' && (
        <Link
          href={`/book/pay/${booking.id}`}
          className="inline-block mt-3 bg-[#00B896] hover:bg-[#009B7F] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Complete Payment
        </Link>
      )}
    </div>
  )
}
