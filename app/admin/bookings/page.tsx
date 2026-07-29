'use client'

import { useState, useEffect } from 'react'
import { Filter, RefreshCw, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'

interface Booking {
  id: string
  customer_name: string
  email: string
  phone: string
  date: string
  guests: number
  total_amount: number
  status: string
  payment_status: string
  special_requests: string
  decline_reason?: string
  created_at: string
  tours?: { name: string }
}

const STATUS_FILTERS: { value: BookingStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-gray-100 text-gray-600',
  refunded: 'bg-orange-100 text-orange-700',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<BookingStatus>('all')
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [decliningBooking, setDecliningBooking] = useState<Booking | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [isDeclining, setIsDeclining] = useState(false)

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}` },
      })
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchBookings()
  }

  async function confirmDecline() {
    if (!decliningBooking || !declineReason.trim()) return
    setIsDeclining(true)
    try {
      await fetch(`/api/bookings/${decliningBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', decline_reason: declineReason.trim() }),
      })
      await fetchBookings()
      setDecliningBooking(null)
      setDeclineReason('')
    } finally {
      setIsDeclining(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} total</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f.value ? 'bg-[#1B3A2D] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Customer', 'Tour', 'Date', 'Guests', 'Amount', 'Status', 'Payment', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1B3A2D] text-sm">{booking.customer_name}</p>
                      <p className="text-gray-400 text-xs">{booking.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking.tours?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{booking.guests}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#00B896]">
                      ${booking.total_amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          >
                            <Check size={13} />
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setDecliningBooking(booking)
                              setDeclineReason('')
                            }}
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <X size={13} />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <select
                          value={booking.status}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-1 focus:ring-[#00B896] cursor-pointer',
                            STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {['pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', PAYMENT_COLORS[booking.payment_status] || 'bg-gray-100 text-gray-600')}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-xs text-[#00B896] hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-[#1B3A2D] text-lg mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              {[
                ['ID', selectedBooking.id.slice(0, 8).toUpperCase()],
                ['Customer', selectedBooking.customer_name],
                ['Email', selectedBooking.email],
                ['Phone', selectedBooking.phone || 'Not provided'],
                ['Date', selectedBooking.date],
                ['Guests', selectedBooking.guests],
                ['Amount', `$${selectedBooking.total_amount?.toFixed(2)}`],
                ['Status', selectedBooking.status],
                ['Payment', selectedBooking.payment_status],
                ['Special Requests', selectedBooking.special_requests || 'None'],
                ...(selectedBooking.decline_reason
                  ? [['Decline Reason', selectedBooking.decline_reason]]
                  : []),
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-[#1B3A2D] text-right max-w-[60%]">{String(value)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-5 bg-[#1B3A2D] text-white font-semibold py-2.5 rounded-xl hover:bg-[#0D2318] transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {decliningBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !isDeclining && setDecliningBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-[#1B3A2D] text-lg mb-1">Decline Request</h3>
            <p className="text-gray-500 text-sm mb-4">
              Let {decliningBooking.customer_name} know why, so they can reschedule or choose another excursion.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              placeholder="e.g. We're unable to accommodate those dates — fully booked. Please try a different date range."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDecliningBooking(null)}
                disabled={isDeclining}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                disabled={isDeclining || !declineReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {isDeclining ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
