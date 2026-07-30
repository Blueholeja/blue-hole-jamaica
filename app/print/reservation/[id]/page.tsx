import { redirect, notFound } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { STATUS_LABELS, parseReservationRoute, parseFlightInfo, parseCustomerNote, getReservationCategory, Reservation } from '@/lib/reservation-utils'
import PrintButton from '@/components/PrintButton'

export default async function PrintReservationPage({
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
    .from('bookings')
    .select('*, tours(name, slug, price)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const reservation = data as Reservation
  const { pickup, destination } = parseReservationRoute(reservation)
  const flightInfo = parseFlightInfo(reservation)

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
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-[#1B3A2D] mb-6">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
              <path d="M18 2C18 2 6 12 6 21C6 27.627 11.373 33 18 33C24.627 33 30 27.627 30 21C30 12 18 2 18 2Z" fill="#00B896" />
              <path d="M18 10C18 10 11 17 11 22C11 25.866 14.134 29 18 29C21.866 29 25 25.866 25 22C25 17 18 10 18 10Z" fill="#1B3A2D" />
              <circle cx="18" cy="22" r="4" fill="#00B896" opacity="0.7" />
            </svg>
            <div>
              <p className="font-bold text-lg text-[#1B3A2D] leading-tight">Blue Hole Jamaica</p>
              <p className="text-[#00B896] text-xs">Reservation Summary</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Reservation ID</p>
            <p className="font-mono font-bold text-[#1B3A2D]">{reservation.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs font-semibold mt-1 text-[#1B3A2D]">
              Status: {STATUS_LABELS[reservation.status] || reservation.status}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Customer Information</h2>
            <Row label="Full Name" value={reservation.customer_name} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Contact Details</h2>
            <Row label="Email" value={reservation.email} />
            <Row label="Phone" value={reservation.phone || 'Not provided'} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Trip Details</h2>
            <Row label="Service Booked" value={reservation.tours?.name || '—'} />
            <Row label="Type" value={getReservationCategory(reservation)} />
            <Row label="Pickup Location" value={pickup} />
            <Row label="Destination" value={destination} />
            <Row label="Date" value={reservation.date} />
            <Row label="Passenger Count" value={String(reservation.guests)} />
            {flightInfo && <Row label="Flight Information" value={flightInfo} />}
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Special Requests</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 rounded-lg p-3 bg-gray-50 print:bg-white">
              {parseCustomerNote(reservation) || 'None'}
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Payment</h2>
            <Row label="Total Amount" value={`$${reservation.total_amount?.toFixed(2)}`} />
            <Row label="Payment Status" value={reservation.payment_status} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Reservation Created</h2>
            <p className="text-sm text-gray-700">
              {new Date(reservation.created_at).toLocaleString('en-US', {
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
