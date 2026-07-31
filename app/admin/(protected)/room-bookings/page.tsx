'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Ban,
  LogIn,
  LogOut,
  CheckCheck,
  Printer,
  Trash2,
  Download,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoomBooking } from '@/types'
import {
  ROOM_TYPE_LABELS,
  PACKAGE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  STAY_PHASE_LABELS,
  STAY_PHASE_COLORS,
  ROOM_CAPACITY,
  getStayPhase,
  type StayPhase,
  type RoomPricingRow,
} from '@/lib/room-utils'

type PhaseFilter = 'all' | StayPhase

interface RoomRow {
  id: string
  room_number: string
  type: 'single' | 'double'
}

export default function AdminRoomBookingsPage() {
  const [bookings, setBookings] = useState<RoomBooking[]>([])
  const [rooms, setRooms] = useState<RoomRow[]>([])
  const [pricing, setPricing] = useState<RoomPricingRow[]>([])
  const [loading, setLoading] = useState(true)

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const [viewing, setViewing] = useState<RoomBooking | null>(null)
  const [editing, setEditing] = useState<RoomBooking | null>(null)
  const [editForm, setEditForm] = useState<Partial<RoomBooking>>({})
  const [deleting, setDeleting] = useState<RoomBooking | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await fetch('/api/room-bookings')
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      if (Array.isArray(data)) setRooms(data)
    } catch {}
  }

  async function fetchPricing() {
    try {
      const res = await fetch('/api/rooms/pricing')
      const data = await res.json()
      if (Array.isArray(data)) {
        setPricing(data)
        setPriceDrafts(Object.fromEntries(data.map((p: RoomPricingRow) => [p.id, String(p.price_per_night)])))
      }
    } catch {}
  }

  useEffect(() => {
    fetchBookings()
    fetchRooms()
    fetchPricing()
  }, [])

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (phaseFilter !== 'all' && getStayPhase(b) !== phaseFilter) return false
      if (dateFilter && b.check_in !== dateFilter && b.check_out !== dateFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matches =
          b.guest_name?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [bookings, phaseFilter, dateFilter, searchQuery])

  const today = new Date().toISOString().slice(0, 10)
  const occupiedToday = useMemo(() => {
    const map = new Map<string, RoomBooking>()
    for (const b of bookings) {
      if (b.status === 'cancelled') continue
      if (b.check_in <= today && b.check_out > today && b.room_id) map.set(b.room_id, b)
    }
    return map
  }, [bookings, today])

  async function patchBooking(id: string, updates: Record<string, unknown>) {
    setActionLoading(id)
    setActionError(null)
    try {
      const res = await fetch(`/api/room-bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Something went wrong updating this booking.')
        return
      }
      await fetchBookings()
      setViewing((v) => (v && v.id === id ? { ...v, ...data } : v))
    } catch {
      setActionError('Something went wrong updating this booking.')
    } finally {
      setActionLoading(null)
    }
  }

  function cancelBooking(booking: RoomBooking) {
    if (!confirm(`Cancel ${booking.guest_name}'s booking? This frees up the room.`)) return
    patchBooking(booking.id, { status: 'cancelled' })
  }

  async function saveEdit() {
    if (!editing) return
    setActionLoading(editing.id)
    setActionError(null)
    try {
      const res = await fetch(`/api/room-bookings/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: editForm.guest_name,
          email: editForm.email,
          phone: editForm.phone,
          adults: Number(editForm.adults),
          children: Number(editForm.children),
          check_in: editForm.check_in,
          check_out: editForm.check_out,
          special_requests: editForm.special_requests,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Something went wrong saving changes.')
        return
      }
      await fetchBookings()
      setEditing(null)
    } catch {
      setActionError('Something went wrong saving changes.')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteBooking() {
    if (!deleting) return
    setActionLoading(deleting.id)
    try {
      await fetch(`/api/room-bookings/${deleting.id}`, { method: 'DELETE' })
      await fetchBookings()
      setDeleting(null)
      setViewing(null)
    } catch {
      setActionError('Failed to delete booking.')
    } finally {
      setActionLoading(null)
    }
  }

  async function savePricing(id: string) {
    const price = Number(priceDrafts[id])
    if (!price || price <= 0) return
    try {
      await fetch(`/api/rooms/pricing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_per_night: price }),
      })
      await fetchPricing()
    } catch {}
  }

  function openPrint(id: string) {
    window.open(`/print/room-booking/${id}`, '_blank')
  }

  function exportCSV() {
    const headers = ['Booking ID', 'Guest', 'Email', 'Phone', 'Room Type', 'Package', 'Check-in', 'Check-out', 'Nights', 'Total', 'Deposit', 'Payment Status', 'Status']
    const rows = filtered.map((b) => [
      b.id, b.guest_name, b.email, b.phone || '', ROOM_TYPE_LABELS[b.room_type], PACKAGE_LABELS[b.package],
      b.check_in, b.check_out, b.nights, b.total_amount, b.deposit_amount, b.payment_status, b.status,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `room-bookings-${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputClass = 'rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Room Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {bookings.length} total</p>
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
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* Room Occupancy */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-[#1B3A2D] mb-3 text-sm">Room Occupancy — Today</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {rooms.map((room) => {
            const booking = occupiedToday.get(room.id)
            return (
              <div
                key={room.id}
                className={cn(
                  'rounded-xl p-3 text-center border',
                  booking ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                )}
                title={booking ? `Occupied by ${booking.guest_name}` : 'Available'}
              >
                <p className="font-semibold text-[#1B3A2D] text-xs">{room.room_number}</p>
                <p className={cn('text-xs mt-1', booking ? 'text-red-600' : 'text-green-600')}>
                  {booking ? booking.guest_name.split(' ')[0] : 'Free'}
                </p>
              </div>
            )
          })}
        </div>
        <p className="text-gray-400 text-xs mt-3">
          {occupiedToday.size} of {rooms.length} rooms occupied ({ROOM_CAPACITY.single} Single, {ROOM_CAPACITY.double} Double total)
        </p>
      </div>

      {/* Pricing Editor */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-[#1B3A2D] mb-3 text-sm">Room Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pricing.map((p) => (
            <div key={p.id} className="flex items-center gap-2 border border-gray-100 rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1B3A2D] truncate">{ROOM_TYPE_LABELS[p.room_type]}</p>
                <p className="text-xs text-gray-400 truncate">{p.label}</p>
              </div>
              <span className="text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={priceDrafts[p.id] ?? ''}
                onChange={(e) => setPriceDrafts({ ...priceDrafts, [p.id]: e.target.value })}
                className={cn(inputClass, 'w-20')}
              />
              <button
                onClick={() => savePricing(p.id)}
                disabled={priceDrafts[p.id] === String(p.price_per_night)}
                className="text-xs font-semibold text-[#00B896] hover:text-[#009B7F] disabled:opacity-40 px-2"
              >
                Save
              </button>
            </div>
          ))}
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
              placeholder="Search by Booking ID, guest name, or email..."
              className={cn(inputClass, 'w-full pl-9')}
            />
          </div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as PhaseFilter)}
            className={inputClass}
          >
            <option value="all">All Stays</option>
            {(['upcoming', 'current', 'completed', 'cancelled'] as StayPhase[]).map((s) => (
              <option key={s} value={s}>{STAY_PHASE_LABELS[s]}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={inputClass}
          />
          {(phaseFilter !== 'all' || dateFilter || searchQuery) && (
            <button
              onClick={() => { setPhaseFilter('all'); setDateFilter(''); setSearchQuery('') }}
              className="text-sm text-gray-500 hover:text-[#00B896] px-3 py-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No room bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Booking ID', 'Guest', 'Room', 'Package', 'Check-in', 'Check-out', 'Total', 'Payment', 'Stay', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((booking) => {
                  const phase = getStayPhase(booking)
                  const busy = actionLoading === booking.id
                  const cancellable = phase !== 'cancelled' && phase !== 'completed'

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1B3A2D] text-sm">{booking.guest_name}</p>
                        <p className="text-gray-400 text-xs">{booking.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {ROOM_TYPE_LABELS[booking.room_type]}{booking.rooms?.room_number ? ` (${booking.rooms.room_number})` : ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{PACKAGE_LABELS[booking.package]}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{booking.check_in}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{booking.check_out}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">${booking.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', PAYMENT_STATUS_COLORS[booking.payment_status])}>
                          {PAYMENT_STATUS_LABELS[booking.payment_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', STAY_PHASE_COLORS[phase])}>
                          {STAY_PHASE_LABELS[phase]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button title="View" onClick={() => setViewing(booking)} className="p-1.5 text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-md transition-colors">
                            <Eye size={15} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => { setEditing(booking); setEditForm(booking) }}
                            className="p-1.5 text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          {!booking.checked_in && cancellable && (
                            <button title="Check In" disabled={busy} onClick={() => patchBooking(booking.id, { checked_in: true })} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50">
                              <LogIn size={15} />
                            </button>
                          )}
                          {booking.checked_in && !booking.checked_out && (
                            <button title="Check Out" disabled={busy} onClick={() => patchBooking(booking.id, { checked_out: true, status: 'completed' })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50">
                              <LogOut size={15} />
                            </button>
                          )}
                          {booking.payment_status !== 'paid_in_full' && phase !== 'cancelled' && (
                            <button title="Mark Paid in Full" disabled={busy} onClick={() => patchBooking(booking.id, { payment_status: 'paid_in_full' })} className="p-1.5 text-[#00B896] hover:bg-[#00B896]/10 rounded-md transition-colors disabled:opacity-50">
                              <CheckCheck size={15} />
                            </button>
                          )}
                          {cancellable && (
                            <button title="Cancel" disabled={busy} onClick={() => cancelBooking(booking)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50">
                              <Ban size={15} />
                            </button>
                          )}
                          <button title="Print" onClick={() => openPrint(booking.id)} className="p-1.5 text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-md transition-colors">
                            <Printer size={15} />
                          </button>
                          <button title="Delete" onClick={() => setDeleting(booking)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-[#1B3A2D] text-lg">Room Booking Details</h3>
                <p className="text-xs font-mono text-gray-400">{viewing.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STAY_PHASE_COLORS[getStayPhase(viewing)])}>
                  {STAY_PHASE_LABELS[getStayPhase(viewing)]}
                </span>
                <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <DetailSection title="Guest Information">
                <DetailRow label="Full Name" value={viewing.guest_name} />
                <DetailRow label="Email" value={viewing.email} />
                <DetailRow label="Phone" value={viewing.phone || 'Not provided'} />
                <DetailRow label="Adults" value={String(viewing.adults)} />
                <DetailRow label="Children" value={String(viewing.children)} />
              </DetailSection>

              <DetailSection title="Stay Details">
                <DetailRow label="Room" value={`${ROOM_TYPE_LABELS[viewing.room_type]}${viewing.rooms?.room_number ? ` (${viewing.rooms.room_number})` : ''}`} />
                <DetailRow label="Package" value={PACKAGE_LABELS[viewing.package]} />
                <DetailRow label="Check-in" value={viewing.check_in} />
                <DetailRow label="Check-out" value={viewing.check_out} />
                <DetailRow label="Nights" value={String(viewing.nights)} />
                <DetailRow label="Checked In" value={viewing.checked_in ? 'Yes' : 'No'} />
                <DetailRow label="Checked Out" value={viewing.checked_out ? 'Yes' : 'No'} />
              </DetailSection>

              <DetailSection title="Special Requests">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewing.special_requests || 'None'}</p>
              </DetailSection>

              <DetailSection title="Payment">
                <DetailRow label="Price Per Night" value={`$${viewing.price_per_night.toFixed(2)}`} />
                <DetailRow label="Total Cost" value={`$${viewing.total_amount.toFixed(2)}`} />
                <DetailRow label="Deposit" value={`$${viewing.deposit_amount.toFixed(2)}`} />
                <DetailRow label="Balance Due on Arrival" value={`$${(viewing.total_amount - viewing.deposit_amount).toFixed(2)}`} />
                <DetailRow label="Payment Status" value={PAYMENT_STATUS_LABELS[viewing.payment_status]} />
              </DetailSection>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {!viewing.checked_in && getStayPhase(viewing) !== 'cancelled' && getStayPhase(viewing) !== 'completed' && (
                  <ActionButton icon={<LogIn size={14} />} label="Check In" onClick={() => patchBooking(viewing.id, { checked_in: true })} className="bg-green-600 hover:bg-green-700 text-white" />
                )}
                {viewing.checked_in && !viewing.checked_out && (
                  <ActionButton icon={<LogOut size={14} />} label="Check Out" onClick={() => patchBooking(viewing.id, { checked_out: true, status: 'completed' })} className="bg-blue-600 hover:bg-blue-700 text-white" />
                )}
                {viewing.payment_status !== 'paid_in_full' && getStayPhase(viewing) !== 'cancelled' && (
                  <ActionButton icon={<CheckCheck size={14} />} label="Mark Paid in Full" onClick={() => patchBooking(viewing.id, { payment_status: 'paid_in_full' })} className="bg-[#00B896] hover:bg-[#009B7F] text-white" />
                )}
                {getStayPhase(viewing) !== 'cancelled' && getStayPhase(viewing) !== 'completed' && (
                  <ActionButton icon={<Ban size={14} />} label="Cancel Booking" onClick={() => cancelBooking(viewing)} className="bg-red-600 hover:bg-red-700 text-white" />
                )}
                <ActionButton icon={<Printer size={14} />} label="Print" onClick={() => openPrint(viewing.id)} className="border border-gray-200 text-gray-600 hover:bg-gray-50" />
                <ActionButton icon={<X size={14} />} label="Close" onClick={() => setViewing(null)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1B3A2D] text-lg">Edit Room Booking</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
                <input value={editForm.guest_name || ''} onChange={(e) => setEditForm({ ...editForm, guest_name: e.target.value })} className={cn(inputClass, 'w-full')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={cn(inputClass, 'w-full')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                  <input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={cn(inputClass, 'w-full')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Check-in</label>
                  <input type="date" value={editForm.check_in || ''} onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })} className={cn(inputClass, 'w-full')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Check-out</label>
                  <input type="date" value={editForm.check_out || ''} onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })} className={cn(inputClass, 'w-full')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Adults</label>
                  <input type="number" min={1} value={editForm.adults ?? ''} onChange={(e) => setEditForm({ ...editForm, adults: Number(e.target.value) })} className={cn(inputClass, 'w-full')} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Children</label>
                  <input type="number" min={0} value={editForm.children ?? ''} onChange={(e) => setEditForm({ ...editForm, children: Number(e.target.value) })} className={cn(inputClass, 'w-full')} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Special Requests</label>
                <textarea value={editForm.special_requests || ''} onChange={(e) => setEditForm({ ...editForm, special_requests: e.target.value })} rows={4} className={cn(inputClass, 'w-full resize-none')} />
              </div>
              <p className="text-xs text-gray-400">
                Changing dates recalculates the total at this booking&apos;s existing nightly rate. Room type / package can&apos;t be changed here — cancel and create a new booking if the guest needs a different room.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={actionLoading === editing.id} className="flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {actionLoading === editing.id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !actionLoading && setDeleting(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-[#1B3A2D] text-lg mb-2">Delete Room Booking?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This will permanently delete {deleting.guest_name}&apos;s booking. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} disabled={actionLoading === deleting.id} className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
                Cancel
              </button>
              <button onClick={deleteBooking} disabled={actionLoading === deleting.id} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
                {actionLoading === deleting.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-[#1B3A2D] text-right max-w-[65%]">{value}</span>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors', className)}>
      {icon}
      {label}
    </button>
  )
}
