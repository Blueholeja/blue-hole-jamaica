import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

/**
 * Public, unauthenticated endpoint for the customer-facing deposit payment
 * page. Keyed by the booking's unguessable UUID (same trust model as the
 * tour booking pay page). Returns only the fields needed for a payment
 * summary.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('room_bookings')
      .select(
        'id, guest_name, check_in, check_out, nights, room_type, package, total_amount, deposit_amount, status, payment_status, rooms(room_number)'
      )
      .eq('id', id)
      .single()

    if (error || !data) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
