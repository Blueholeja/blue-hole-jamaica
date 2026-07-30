import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

/**
 * Public, unauthenticated endpoint the customer payment page calls after
 * PayPal capture succeeds, to record payment against the booking. Only
 * allowed once the reservation has been confirmed by an admin, and only
 * updates payment_status/payment_id - nothing else.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { payment_id } = await request.json()

    if (!payment_id) {
      return Response.json({ error: 'Missing payment_id' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('status, payment_status')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (booking.status !== 'confirmed') {
      return Response.json({ error: 'This reservation is not ready for payment yet' }, { status: 400 })
    }

    if (booking.payment_status === 'paid') {
      return Response.json({ error: 'This reservation has already been paid' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ payment_status: 'paid', payment_id })
      .eq('id', id)
      .select('id, payment_status')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
