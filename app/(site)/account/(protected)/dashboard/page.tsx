'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users, AlertCircle, MapPin, X, Heart } from 'lucide-react'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  parseReservationRoute,
  canCustomerCancel,
  type Reservation,
} from '@/lib/reservation-utils'

interface CustomerInfo {
  name: string
  email: string
  email_verified: boolean
}

interface FavoriteEntry {
  tour_id: string
  tours: { id: string; name: string; slug: string; price: number; images: string[]; duration: string } | null
}

const PAYMENT_LABELS: Record<string, string> = { unpaid: 'Unpaid', paid: 'Paid', refunded: 'Refunded' }
const PAYMENT_COLORS: Record<string, string> = {
  unpaid: 'bg-gray-100 text-gray-500',
  paid: 'bg-green-50 text-green-700',
  refunded: 'bg-orange-50 text-orange-700',
}

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null)
  const [bookings, setBookings] = useState<Reservation[]>([])
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [resent, setResent] = useState(false)
  const [changeModalFor, setChangeModalFor] = useState<string | null>(null)

  async function loadBookings() {
    const res = await fetch('/api/customers/bookings')
    if (res.ok) setBookings(await res.json())
  }

  async function loadFavorites() {
    const res = await fetch('/api/customers/favorites')
    if (res.ok) setFavorites(await res.json())
  }

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch('/api/customers/me')
        if (meRes.ok) setCustomer(await meRes.json())
        await Promise.all([loadBookings(), loadFavorites()])
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

  async function handleCancel(id: string) {
    if (!confirm('Cancel this reservation? This cannot be undone.')) return
    const res = await fetch(`/api/customers/bookings/${id}/cancel`, { method: 'POST' })
    if (res.ok) {
      loadBookings()
    } else {
      const data = await res.json()
      alert(data.error || 'Could not cancel this reservation.')
    }
  }

  async function handleRemoveFavorite(tourId: string) {
    setFavorites((prev) => prev.filter((f) => f.tour_id !== tourId))
    await fetch(`/api/customers/favorites/${tourId}`, { method: 'DELETE' })
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
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center mb-8">
          <p className="text-gray-500 mb-4">You don&apos;t have any bookings yet.</p>
          <Link
            href="/book"
            className="inline-block bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Make a Reservation
          </Link>
        </div>
      ) : (
        <div className="space-y-8 mb-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancel={() => handleCancel(b.id)}
                    onRequestChange={() => setChangeModalFor(b.id)}
                  />
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

      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Saved Favorites</h2>
        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">
              Tap the heart icon on any excursion to save it here for later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((f) =>
              f.tours ? (
                <div key={f.tour_id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="relative h-32">
                    {f.tours.images?.[0] && (
                      <Image src={f.tours.images[0]} alt={f.tours.name} fill className="object-cover" sizes="33vw" />
                    )}
                    <button
                      onClick={() => handleRemoveFavorite(f.tour_id)}
                      aria-label="Remove from favorites"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                    >
                      <Heart size={15} className="fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-[#1B3A2D] text-sm mb-1">{f.tours.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{f.tours.duration}</span>
                      <Link href={`/attractions/${f.tours.slug}`} className="text-[#00B896] text-xs font-semibold hover:underline">
                        View & Book
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </section>

      {changeModalFor && (
        <RequestChangeModal bookingId={changeModalFor} onClose={() => setChangeModalFor(null)} />
      )}
    </div>
  )
}

function BookingCard({
  booking,
  onCancel,
  onRequestChange,
}: {
  booking: Reservation
  onCancel?: () => void
  onRequestChange?: () => void
}) {
  const { pickup, destination } = parseReservationRoute(booking)
  const cancellable = onCancel && canCustomerCancel(booking)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-[#1B3A2D]">{booking.tours?.name || 'Reservation'}</p>
          <p className="text-gray-400 text-xs font-mono mt-0.5">
            REF-{booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
            {STATUS_LABELS[booking.status] || booking.status}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[booking.payment_status]}`}>
            {PAYMENT_LABELS[booking.payment_status] || booking.payment_status}
          </span>
        </div>
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
      <div className="flex flex-wrap gap-3 mt-3">
        {booking.status === 'confirmed' && booking.payment_status !== 'paid' && (
          <Link
            href={`/book/pay/${booking.id}`}
            className="inline-block bg-[#00B896] hover:bg-[#009B7F] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Complete Payment
          </Link>
        )}
        {onRequestChange && (booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={onRequestChange}
            className="text-sm font-semibold text-[#1B3A2D] border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
          >
            Request a Change
          </button>
        )}
        {cancellable && (
          <button
            onClick={onCancel}
            className="text-sm font-semibold text-red-500 hover:text-red-600 px-2 py-2 transition-colors"
          >
            Cancel Reservation
          </button>
        )}
      </div>
    </div>
  )
}

function RequestChangeModal({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const res = await fetch(`/api/customers/bookings/${bookingId}/request-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#1B3A2D] text-lg">Request a Change</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {sent ? (
          <p className="text-gray-600 text-sm">
            Thanks — we&apos;ve sent your request to our team. We&apos;ll follow up by email shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="e.g. Can we move this to July 20th and add 2 more guests?"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent resize-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#1B3A2D] hover:bg-[#0D2318] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
