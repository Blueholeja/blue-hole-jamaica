'use client'

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Search, Download, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROOM_TYPE_LABELS, PACKAGE_LABELS, type RoomType, type RoomPackage } from '@/lib/room-utils'

interface Booking {
  id: string
  customer_name: string
  email: string
  total_amount: number
  payment_status: string
  payment_id: string | null
  created_at: string
  tours?: { name: string } | null
}

interface RoomBooking {
  id: string
  guest_name: string
  email: string
  room_type: RoomType
  package: RoomPackage
  total_amount: number
  deposit_amount: number
  payment_status: string
  payment_id: string | null
  created_at: string
}

interface PaymentRow {
  id: string
  source: 'booking' | 'room_booking'
  date: string
  customerName: string
  email: string
  description: string
  amountCharged: number
  totalValue: number
  paymentStatus: string
  paymentId: string | null
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-50 text-green-700',
  deposit_paid: 'bg-yellow-50 text-yellow-700',
  paid_in_full: 'bg-green-50 text-green-700',
  refunded: 'bg-orange-50 text-orange-700',
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  deposit_paid: 'Deposit Paid',
  paid_in_full: 'Paid in Full',
  refunded: 'Refunded',
}

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'booking' | 'room_booking'>('all')
  const [statusFilter, setStatusFilter] = useState('all')

  async function fetchAll() {
    setLoading(true)
    try {
      const [bRes, rRes] = await Promise.all([fetch('/api/bookings'), fetch('/api/room-bookings')])
      const bData = await bRes.json()
      const rData = await rRes.json()
      setBookings(Array.isArray(bData) ? bData : [])
      setRoomBookings(Array.isArray(rData) ? rData : [])
    } catch {
      setBookings([])
      setRoomBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const payments: PaymentRow[] = useMemo(() => {
    const fromBookings: PaymentRow[] = bookings
      .filter((b) => b.payment_status !== 'unpaid')
      .map((b) => ({
        id: b.id,
        source: 'booking',
        date: b.created_at,
        customerName: b.customer_name,
        email: b.email,
        description: b.tours?.name || 'Reservation',
        amountCharged: b.total_amount,
        totalValue: b.total_amount,
        paymentStatus: b.payment_status,
        paymentId: b.payment_id,
      }))

    const fromRooms: PaymentRow[] = roomBookings
      .filter((b) => b.payment_status !== 'unpaid')
      .map((b) => ({
        id: b.id,
        source: 'room_booking',
        date: b.created_at,
        customerName: b.guest_name,
        email: b.email,
        description: `${ROOM_TYPE_LABELS[b.room_type]} — ${PACKAGE_LABELS[b.package]}`,
        amountCharged: b.payment_status === 'paid_in_full' ? b.total_amount : b.deposit_amount,
        totalValue: b.total_amount,
        paymentStatus: b.payment_status,
        paymentId: b.payment_id,
      }))

    return [...fromBookings, ...fromRooms].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bookings, roomBookings])

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (sourceFilter !== 'all' && p.source !== sourceFilter) return false
      if (statusFilter !== 'all' && p.paymentStatus !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matches =
          p.customerName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.paymentId || '').toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [payments, sourceFilter, statusFilter, searchQuery])

  const totals = useMemo(() => {
    const collected = filtered
      .filter((p) => p.paymentStatus !== 'refunded')
      .reduce((sum, p) => sum + p.amountCharged, 0)
    const refunded = filtered
      .filter((p) => p.paymentStatus === 'refunded')
      .reduce((sum, p) => sum + p.amountCharged, 0)
    return { collected, refunded, count: filtered.length }
  }, [filtered])

  function exportCSV() {
    const headers = ['Date', 'Type', 'Customer', 'Email', 'Description', 'Amount Charged', 'Total Booking Value', 'Payment Status', 'Payment ID', 'Booking ID']
    const rows = filtered.map((p) => [
      new Date(p.date).toISOString().slice(0, 10),
      p.source === 'booking' ? 'Excursion/Service' : 'Room',
      p.customerName,
      p.email,
      p.description,
      p.amountCharged.toFixed(2),
      p.totalValue.toFixed(2),
      STATUS_LABELS[p.paymentStatus] || p.paymentStatus,
      p.paymentId || '',
      p.id,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputClass = 'rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Every payment across excursions, services, and room bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-[#00B896]">${totals.collected.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Total Refunded</p>
          <p className="text-2xl font-bold text-orange-500">${totals.refunded.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Transactions</p>
          <p className="text-2xl font-bold text-[#1B3A2D]">{totals.count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, email, booking ID, or PayPal transaction ID..."
              className={cn(inputClass, 'w-full pl-9')}
            />
          </div>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)} className={inputClass}>
            <option value="all">All Types</option>
            <option value="booking">Excursions &amp; Services</option>
            <option value="room_booking">Rooms</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="deposit_paid">Deposit Paid</option>
            <option value="paid_in_full">Paid in Full</option>
            <option value="refunded">Refunded</option>
          </select>
          {(sourceFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setSourceFilter('all'); setStatusFilter('all'); setSearchQuery('') }}
              className="text-sm text-gray-500 hover:text-[#00B896] px-3 py-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Type', 'Customer', 'Description', 'Amount Charged', 'Booking Value', 'Status', 'Payment ID'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={`${p.source}-${p.id}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', p.source === 'booking' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700')}>
                        {p.source === 'booking' ? 'Excursion/Service' : 'Room'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1B3A2D] text-sm">{p.customerName}</p>
                      <p className="text-gray-400 text-xs">{p.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.description}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1B3A2D] whitespace-nowrap">${p.amountCharged.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">${p.totalValue.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', STATUS_COLORS[p.paymentStatus] || 'bg-gray-100 text-gray-600')}>
                        {STATUS_LABELS[p.paymentStatus] || p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                      {p.paymentId ? (
                        <span className="flex items-center gap-1.5">
                          <CreditCard size={12} className="text-gray-400" />
                          {p.paymentId}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
