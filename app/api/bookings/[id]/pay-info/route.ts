import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

/**
 * Public, unauthenticated endpoint for the customer-facing payment page.
 * Keyed by the booking's unguessable UUID (same trust model as the
 * confirmation page). Deliberately returns only the minimal fields needed
 * to show a payment summary - not the full record (no email/phone/notes).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('id, customer_name, date, guests, total_amount, status, payment_status, tours(name)')
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
