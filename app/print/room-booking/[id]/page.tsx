import { redirect, notFound } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { ROOM_TYPE_LABELS, PACKAGE_LABELS, PAYMENT_STATUS_LABELS, getStayPhase, STAY_PHASE_LABELS } from '@/lib/room-utils'
import type { RoomBooking } from '@/types'
import PrintButton from '@/components/PrintButton'
import Logo from '@/components/Logo'

export default async function PrintRoomBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  const { id } = await params
  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('room_bookings')
    .select('*, rooms(room_number, type)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const booking = data as RoomBooking

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-10 print:py-0 px-4">
      <PrintButton />

      <div className="max-w-2xl mx-auto bg-white shadow-lg print:shadow-none rounded-2xl print:rounded-none p-10 print:p-0">
        <div className="flex items-center justify-between pb-6 border-b-2 border-[#1B3A2D] mb-6">
          <div>
            <Logo height={38} />
            <p className="text-[#00B896] text-xs mt-1">Room Booking Summary</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Booking ID</p>
            <p className="font-mono font-bold text-[#1B3A2D]">{booking.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs font-semibold mt-1 text-[#1B3A2D]">
              Status: {STAY_PHASE_LABELS[getStayPhase(booking)]}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Guest Information</h2>
            <Row label="Full Name" value={booking.guest_name} />
            <Row label="Email" value={booking.email} />
            <Row label="Phone" value={booking.phone || 'Not provided'} />
            <Row label="Adults" value={String(booking.adults)} />
            <Row label="Children" value={String(booking.children)} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Stay Details</h2>
            <Row label="Room" value={`${ROOM_TYPE_LABELS[booking.room_type]}${booking.rooms?.room_number ? ` (${booking.rooms.room_number})` : ''}`} />
            <Row label="Package" value={PACKAGE_LABELS[booking.package]} />
            <Row label="Check-in" value={booking.check_in} />
            <Row label="Check-out" value={booking.check_out} />
            <Row label="Nights" value={String(booking.nights)} />
            <Row label="Checked In" value={booking.checked_in ? 'Yes' : 'No'} />
            <Row label="Checked Out" value={booking.checked_out ? 'Yes' : 'No'} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Special Requests</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 rounded-lg p-3 bg-gray-50 print:bg-white">
              {booking.special_requests || 'None'}
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Payment</h2>
            <Row label="Price Per Night" value={`$${booking.price_per_night.toFixed(2)}`} />
            <Row label="Total Cost" value={`$${booking.total_amount.toFixed(2)}`} />
            <Row label="Deposit" value={`$${booking.deposit_amount.toFixed(2)}`} />
            <Row label="Balance Due on Arrival" value={`$${(booking.total_amount - booking.deposit_amount).toFixed(2)}`} />
            <Row label="Payment Status" value={PAYMENT_STATUS_LABELS[booking.payment_status]} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Booking Created</h2>
            <p className="text-sm text-gray-700">
              {new Date(booking.created_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Internal Notes</h2>
            <div className="border border-dashed border-gray-300 rounded-lg h-24" />
          </section>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10 pt-4 border-t border-gray-200">
          Blue Hole Jamaica &middot; Ocho Rios, St. Ann, Jamaica &middot; +1 (876) 723-4567
        </p>
      </div>
    </div>
  )
}
