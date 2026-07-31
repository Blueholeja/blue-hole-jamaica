import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { canCustomerCancel } from '@/lib/reservation-utils'
import { sendEmail } from '@/lib/email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createSupabaseAdminClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, email, customer_name, date, status, tours(name)')
    .eq('id', id)
    .maybeSingle()

  if (!booking || booking.email.toLowerCase() !== session.email.toLowerCase()) {
    return Response.json({ error: 'Reservation not found' }, { status: 404 })
  }

  if (!canCustomerCancel(booking)) {
    return Response.json(
      { error: 'This reservation can no longer be cancelled online. Please contact us directly.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })

  after(async () => {
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
        subject: `Booking Cancelled by Customer: ${booking.customer_name}`,
        html: `
          <p><strong>${booking.customer_name}</strong> cancelled their own reservation.</p>
          <p>Tour: ${(booking.tours as { name?: string } | null)?.name || 'N/A'}</p>
          <p>Date: ${booking.date}</p>
          <p>Booking ID: ${booking.id}</p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send cancellation notice:', emailError)
    }
  })

  return Response.json(data)
}
