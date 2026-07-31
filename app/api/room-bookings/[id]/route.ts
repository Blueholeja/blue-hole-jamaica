import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { computeNights } from '@/lib/room-utils'

const EDITABLE_FIELDS = [
  'guest_name',
  'email',
  'phone',
  'adults',
  'children',
  'check_in',
  'check_out',
  'special_requests',
  'status',
  'payment_status',
  'checked_in',
  'checked_out',
  'total_amount',
  'deposit_amount',
]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('room_bookings')
    .select('*, rooms(room_number, type)')
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  for (const key of EDITABLE_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createSupabaseAdminClient()

  // If dates changed (without a total_amount override), recompute the
  // total/deposit at the existing per-night price rather than silently
  // leaving stale totals.
  if ((updates.check_in || updates.check_out) && !('total_amount' in updates)) {
    const { data: existing } = await supabase
      .from('room_bookings')
      .select('check_in, check_out, price_per_night')
      .eq('id', id)
      .single()

    if (existing) {
      const newCheckIn = (updates.check_in as string) || existing.check_in
      const newCheckOut = (updates.check_out as string) || existing.check_out
      const nights = computeNights(newCheckIn, newCheckOut)
      const total = Math.round(existing.price_per_night * nights * 100) / 100
      updates.total_amount = total
      updates.deposit_amount = Math.round(total * 0.5 * 100) / 100
    }
  }

  const { data, error } = await supabase
    .from('room_bookings')
    .update(updates)
    .eq('id', id)
    .select('*, rooms(room_number, type)')
    .single()

  if (error) {
    if (error.code === '23P01') {
      return Response.json(
        { error: 'These dates conflict with another booking for this room.' },
        { status: 409 }
      )
    }
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createSupabaseAdminClient()
  const { error } = await supabase.from('room_bookings').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ success: true })
}
