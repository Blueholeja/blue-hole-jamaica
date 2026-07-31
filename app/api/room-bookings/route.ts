import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { ROOM_PRICING, PACKAGE_LABELS, ROOM_TYPE_LABELS, computeNights, findPricing, type RoomType, type RoomPackage } from '@/lib/room-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guest_name,
      email,
      phone,
      adults,
      children,
      check_in,
      check_out,
      room_type,
      package: pkg,
      special_requests,
    } = body

    if (!guest_name?.trim() || !email?.trim() || !check_in || !check_out || !room_type || !pkg) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (check_out <= check_in) {
      return Response.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }
    if (room_type !== 'single' && room_type !== 'double') {
      return Response.json({ error: 'Invalid room type' }, { status: 400 })
    }
    if (room_type === 'double' && pkg === 'room_only') {
      return Response.json({ error: 'Room Only is not available for Double Rooms' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    let pricing = ROOM_PRICING
    const { data: pricingData } = await supabase.from('room_pricing').select('*')
    if (pricingData && pricingData.length > 0) pricing = pricingData

    const priceRow = findPricing(pricing, room_type as RoomType, pkg as RoomPackage)
    if (!priceRow) {
      return Response.json({ error: 'Invalid room type / package combination' }, { status: 400 })
    }

    const nights = computeNights(check_in, check_out)
    const totalAmount = Math.round(priceRow.price_per_night * nights * 100) / 100
    const depositAmount = Math.round(totalAmount * 0.5 * 100) / 100

    const { data: candidateRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('type', room_type)
      .order('id')

    if (roomsError) return Response.json({ error: roomsError.message }, { status: 500 })
    if (!candidateRooms || candidateRooms.length === 0) {
      return Response.json({ error: 'No rooms configured for this room type' }, { status: 500 })
    }

    const bookingBase = {
      guest_name: guest_name.trim(),
      email: email.trim(),
      phone: phone || null,
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      check_in,
      check_out,
      room_type,
      package: pkg,
      price_per_night: priceRow.price_per_night,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      special_requests: special_requests || null,
      status: 'confirmed',
      payment_status: 'unpaid',
    }

    // Try each candidate room in turn. The exclusion constraint on
    // room_bookings guarantees correctness even under concurrent requests —
    // if a room is already taken for an overlapping range, the insert fails
    // with Postgres error 23P01 and we just move to the next candidate.
    for (const room of candidateRooms) {
      const { data, error } = await supabase
        .from('room_bookings')
        .insert([{ ...bookingBase, room_id: room.id }])
        .select('*, rooms(room_number, type)')
        .single()

      if (!error) {
        after(async () => {
          try {
            await sendEmail({
              to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
              subject: `New Room Booking: ${data.guest_name} — ${data.check_in} to ${data.check_out}`,
              html: `
                <p><strong>New room booking received!</strong></p>
                <p>Guest: ${data.guest_name} (${data.email})</p>
                <p>Phone: ${data.phone || 'Not provided'}</p>
                <p>Room: ${ROOM_TYPE_LABELS[data.room_type as 'single' | 'double']} — ${data.rooms?.room_number || data.room_id}</p>
                <p>Package: ${PACKAGE_LABELS[data.package as 'room_only' | 'breakfast' | 'breakfast_dinner']}</p>
                <p>Check-in: ${data.check_in} | Check-out: ${data.check_out} (${data.nights} nights)</p>
                <p>Adults: ${data.adults} | Children: ${data.children}</p>
                <p>Total: $${Number(data.total_amount).toFixed(2)} (deposit: $${Number(data.deposit_amount).toFixed(2)})</p>
                <p>Special Requests: ${data.special_requests || 'None'}</p>
                <p>Booking ID: ${data.id}</p>
              `,
            })
          } catch (emailError) {
            console.error('Failed to send room booking admin notification:', emailError)
          }
        })
        return Response.json(data, { status: 201 })
      }
      if (error.code !== '23P01') {
        return Response.json({ error: error.message }, { status: 500 })
      }
    }

    return Response.json(
      { error: 'Sorry, all rooms of this type are booked for the selected dates.' },
      { status: 409 }
    )
  } catch (error) {
    console.error('POST /api/room-bookings error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('room_bookings')
    .select('*, rooms(room_number, type)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
