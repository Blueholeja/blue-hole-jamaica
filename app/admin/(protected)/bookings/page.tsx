'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Check,
  X,
  Flag,
  Printer,
  Trash2,
  Mail,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Reservation,
  RESERVATION_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  parseReservationRoute,
  parseFlightInfo,
} from '@/lib/reservation-utils'

type StatusFilter = 'all' | (typeof RESERVATION_STATUSES)[number]

export default function AdminBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [viewing, setViewing] = useState<Reservation | null>(null)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [editForm, setEditForm] = useState<Partial<Reservation>>({})
  const [declining, setDeclining] = useState<Reservation | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [emailing, setEmailing] = useState<Reservation | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [deleting, setDeleting] = useState<Reservation | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function fetchReservations() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch {
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const serviceOptions = useMemo(() => {
    const names = reservations.map((r) => r.tours?.name).filter((n): n is string => Boolean(n))
    return Array.from(new Set(names)).sort()
  }, [reservations])

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (serviceFilter !== 'all' && r.tours?.name !== serviceFilter) return false
      if (dateFilter && r.date !== dateFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matches =
          r.customer_name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [reservations, statusFilter, serviceFilter, dateFilter, searchQuery])

  function clearFilters() {
    setStatusFilter('all')
    setServiceFilter('all')
    setDateFilter('')
    setSearchQuery('')
  }

  async function updateStatus(id: string, status: string, extra?: Record<string, unknown>) {
    setActionLoading(id)
    setActionError(null)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      if (!res.ok) throw new Error('Failed to update reservation')
      await fetchReservations()
      setViewing((v) => (v && v.id === id ? { ...v, status, ...extra } : v))
    } catch {
      setActionError('Something went wrong updating this reservation.')
    } finally {
      setActionLoading(null)
    }
  }

  async function confirmDecline() {
    if (!declining || !declineReason.trim()) return
    await updateStatus(declining.id, 'declined', { decline_reason: declineReason.trim() })
    setDeclining(null)
    setDeclineReason('')
  }

  async function saveEdit() {
    if (!editing) return
    setActionLoading(editing.id)
    setActionError(null)
    try {
      const res = await fetch(`/api/bookings/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: editForm.customer_name,
          email: editForm.email,
          phone: editForm.phone,
          date: editForm.date,
          guests: Number(editForm.guests),
          total_amount: Number(editForm.total_amount),
          special_requests: editForm.special_requests,
        }),
      })
      if (!res.ok) throw new Error('Failed to save changes')
      await fetchReservations()
      setEditing(null)
    } catch {
      setActionError('Something went wrong saving changes.')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteReservation() {
    if (!deleting) return
    setActionLoading(deleting.id)
    try {
      await fetch(`/api/bookings/${deleting.id}`, { method: 'DELETE' })
      await fetchReservations()
      setDeleting(null)
      setViewing(null)
    } catch {
      setActionError('Failed to delete reservation.')
    } finally {
      setActionLoading(null)
    }
  }

  async function sendEmail() {
    if (!emailing || !emailSubject.trim() || !emailMessage.trim()) return
    setActionLoading(emailing.id)
    setActionError(null)
    try {
      const res = await fetch(`/api/bookings/${emailing.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
      })
      if (!res.ok) throw new Error('Failed to send email')
      setEmailing(null)
      setEmailSubject('')
      setEmailMessage('')
    } catch {
      setActionError('Failed to send email. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  function openWhatsApp(reservation: Reservation) {
    const phone = (reservation.phone || '').replace(/\D/g, '')
    if (!phone) return
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${reservation.customer_name}, this is Blue Hole Jamaica regarding your reservation.`)}`,
      '_blank'
    )
  }

  function openPrint(id: string) {
    window.open(`/print/reservation/${id}`, '_blank')
  }

  const inputClass = 'rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {reservations.length} total</p>
        </div>
        <button
          onClick={fetchReservations}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, or ID..."
              className={cn(inputClass, 'w-full pl-9')}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={inputClass}
          >
            <option value="all">All Statuses</option>
            {RESERVATION_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">All Services</option>
            {serviceOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={inputClass}
          />
          {(statusFilter !== 'all' || serviceFilter !== 'all' || dateFilter || searchQuery) && (
            <button
              onClick={clearFilters}
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
          <div className="text-center py-20 text-gray-400">No reservations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Reservation ID', 'Customer', 'Service', 'Pickup', 'Destination', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((reservation) => {
                  const { pickup, destination } = parseReservationRoute(reservation)
                  const isPending = reservation.status === 'pending'
                  const isConfirmed = reservation.status === 'confirmed'
                  const busy = actionLoading === reservation.id

                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                        {reservation.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1B3A2D] text-sm">{reservation.customer_name}</p>
                        <p className="text-gray-400 text-xs">{reservation.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {reservation.tours?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate" title={pickup}>
                        {pickup}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate" title={destination}>
                        {destination}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{reservation.date}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap', STATUS_COLORS[reservation.status] || 'bg-gray-100 text-gray-600')}>
                          {STATUS_LABELS[reservation.status] || reservation.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            title="View"
                            onClick={() => setViewing(reservation)}
                            className="p-1.5 text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => {
                              setEditing(reservation)
                              setEditForm(reservation)
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          {isPending && (
                            <>
                              <button
                                title="Confirm"
                                disabled={busy}
                                onClick={() => updateStatus(reservation.id, 'confirmed')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                title="Decline"
                                disabled={busy}
                                onClick={() => {
                                  setDeclining(reservation)
                                  setDeclineReason('')
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          {isConfirmed && (
                            <button
                              title="Mark as Completed"
                              disabled={busy}
                              onClick={() => updateStatus(reservation.id, 'completed')}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Flag size={15} />
                            </button>
                          )}
                          <button
                            title="Print"
                            onClick={() => openPrint(reservation.id)}
                            className="p-1.5 text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeleting(reservation)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
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
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-[#1B3A2D] text-lg">Reservation Details</h3>
                <p className="text-xs font-mono text-gray-400">{viewing.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[viewing.status] || 'bg-gray-100 text-gray-600')}>
                  {STATUS_LABELS[viewing.status] || viewing.status}
                </span>
                <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <DetailSection title="Customer Information">
                <DetailRow label="Full Name" value={viewing.customer_name} />
              </DetailSection>

              <DetailSection title="Contact Information">
                <DetailRow label="Email" value={viewing.email} />
                <DetailRow label="Phone" value={viewing.phone || 'Not provided'} />
              </DetailSection>

              <DetailSection title="Trip Details">
                <DetailRow label="Service" value={viewing.tours?.name || '—'} />
                {(() => {
                  const { pickup, destination } = parseReservationRoute(viewing)
                  return (
                    <>
                      <DetailRow label="Pickup Location" value={pickup} />
                      <DetailRow label="Destination" value={destination} />
                    </>
                  )
                })()}
                <DetailRow label="Date" value={viewing.date} />
                <DetailRow label="Passenger Count" value={String(viewing.guests)} />
                {parseFlightInfo(viewing) && (
                  <DetailRow label="Flight Information" value={parseFlightInfo(viewing) || ''} />
                )}
              </DetailSection>

              <DetailSection title="Special Requests">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewing.special_requests || 'None'}</p>
              </DetailSection>

              {viewing.decline_reason && (
                <DetailSection title="Decline Reason">
                  <p className="text-sm text-red-600 whitespace-pre-wrap">{viewing.decline_reason}</p>
                </DetailSection>
              )}

              <DetailSection title="Payment">
                <DetailRow label="Total Amount" value={`$${viewing.total_amount?.toFixed(2)}`} />
                <DetailRow label="Payment Status" value={viewing.payment_status} />
              </DetailSection>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {viewing.status === 'pending' && (
                  <>
                    <ActionButton
                      icon={<Check size={14} />}
                      label="Confirm"
                      onClick={() => updateStatus(viewing.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    />
                    <ActionButton
                      icon={<X size={14} />}
                      label="Decline"
                      onClick={() => {
                        setDeclining(viewing)
                        setDeclineReason('')
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    />
                  </>
                )}
                {viewing.status === 'confirmed' && (
                  <ActionButton
                    icon={<Flag size={14} />}
                    label="Mark as Completed"
                    onClick={() => updateStatus(viewing.id, 'completed')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  />
                )}
                <ActionButton
                  icon={<Printer size={14} />}
                  label="Print Reservation"
                  onClick={() => openPrint(viewing.id)}
                  className="border border-gray-200 text-gray-600 hover:bg-gray-50"
                />
                <ActionButton
                  icon={<Mail size={14} />}
                  label="Send Email"
                  onClick={() => {
                    setEmailing(viewing)
                    setEmailSubject('')
                    setEmailMessage('')
                  }}
                  className="border border-gray-200 text-gray-600 hover:bg-gray-50"
                />
                <ActionButton
                  icon={<MessageCircle size={14} />}
                  label="WhatsApp"
                  onClick={() => openWhatsApp(viewing)}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                />
                <ActionButton
                  icon={<X size={14} />}
                  label="Close"
                  onClick={() => setViewing(null)}
                  className="border border-gray-200 text-gray-600 hover:bg-gray-50 ml-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1B3A2D] text-lg">Edit Reservation</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
                <input
                  value={editForm.customer_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                  className={cn(inputClass, 'w-full')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <input
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={cn(inputClass, 'w-full')}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                  <input
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className={cn(inputClass, 'w-full')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className={cn(inputClass, 'w-full')}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Passengers</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.guests ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, guests: Number(e.target.value) })}
                    className={cn(inputClass, 'w-full')}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Total Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.total_amount ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, total_amount: Number(e.target.value) })}
                  className={cn(inputClass, 'w-full')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Special Requests</label>
                <textarea
                  value={editForm.special_requests || ''}
                  onChange={(e) => setEditForm({ ...editForm, special_requests: e.target.value })}
                  rows={4}
                  className={cn(inputClass, 'w-full resize-none')}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={actionLoading === editing.id}
                className="flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {actionLoading === editing.id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {declining && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !actionLoading && setDeclining(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-[#1B3A2D] text-lg mb-1">Decline Reservation</h3>
            <p className="text-gray-500 text-sm mb-4">
              Let {declining.customer_name} know why, so they can reschedule or choose another option.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              placeholder="e.g. We're unable to accommodate those dates — fully booked. Please try a different date range."
              className={cn(inputClass, 'w-full resize-none')}
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeclining(null)}
                disabled={actionLoading === declining.id}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                disabled={actionLoading === declining.id || !declineReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {actionLoading === declining.id ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !actionLoading && setEmailing(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-[#1B3A2D] text-lg mb-1">Send Email</h3>
            <p className="text-gray-500 text-sm mb-4">To {emailing.customer_name} ({emailing.email})</p>
            <div className="space-y-3">
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject"
                className={cn(inputClass, 'w-full')}
              />
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={5}
                placeholder="Message"
                className={cn(inputClass, 'w-full resize-none')}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEmailing(null)}
                disabled={actionLoading === emailing.id}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={actionLoading === emailing.id || !emailSubject.trim() || !emailMessage.trim()}
                className="flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {actionLoading === emailing.id ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !actionLoading && setDeleting(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-[#1B3A2D] text-lg mb-2">Delete Reservation?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This will permanently delete {deleting.customer_name}&apos;s reservation. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                disabled={actionLoading === deleting.id}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteReservation}
                disabled={actionLoading === deleting.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
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
    <button
      onClick={onClick}
      className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors', className)}
    >
      {icon}
      {label}
    </button>
  )
}
