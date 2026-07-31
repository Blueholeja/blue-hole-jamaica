import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'
import { PACKAGE_LABELS, ROOM_TYPE_LABELS } from '@/lib/room-utils'

/**
 * Public, unauthenticated endpoint the deposit payment page calls after
 * PayPal capture succeeds. Records the deposit against the booking - the
 * remaining 50% is settled in person at checkout.
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
      .from('room_bookings')
      .select('*, rooms(room_number)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (booking.status === 'cancelled') {
      return Response.json({ error: 'This reservation has been cancelled' }, { status: 400 })
    }

    if (booking.payment_status !== 'unpaid') {
      return Response.json({ error: 'This reservation has already been paid' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('room_bookings')
      .update({ payment_status: 'deposit_paid', payment_id })
      .eq('id', id)
      .select('id, payment_status')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })

    after(async () => {
      try {
        await sendEmail({
          to: booking.email,
          subject: `Room Booking Confirmed — ${booking.id.slice(0, 8).toUpperCase()} | Blue Hole Jamaica`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B3A2D; padding: 24px; text-align: center;">
                <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="color: #1B3A2D; margin-top: 0;">Your stay is booked, ${booking.guest_name}!</h2>
                <div style="background: #F0F9F5; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 8px; color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold;">Booking Reference</p>
                  <p style="margin: 0; color: #1B3A2D; font-size: 20px; font-weight: bold; font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Room</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${ROOM_TYPE_LABELS[booking.room_type as 'single' | 'double']}${booking.rooms?.room_number ? ` (${booking.rooms.room_number})` : ''}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Package</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${PACKAGE_LABELS[booking.package as 'room_only' | 'breakfast' | 'breakfast_dinner']}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Check-in</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${booking.check_in}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Check-out</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${booking.check_out}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Nights</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${booking.nights}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Total Cost</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">$${Number(booking.total_amount).toFixed(2)}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Deposit Paid</td><td style="padding: 10px 0; color: #00B896; font-weight: bold; text-align: right; font-size: 16px;">$${Number(booking.deposit_amount).toFixed(2)}</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; font-size: 14px;">Balance Due on Arrival</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: bold; text-align: right; font-size: 16px;">$${(Number(booking.total_amount) - Number(booking.deposit_amount)).toFixed(2)}</td></tr>
                </table>
                <p style="color: #555; font-size: 14px;">Questions? Contact us:</p>
                <p style="color: #555; font-size: 14px;">📞 +1 (876) 723-4567 | WhatsApp: wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'}</p>
              </div>
              <div style="background: #1B3A2D; padding: 16px; text-align: center;">
                <p style="color: #888; font-size: 12px; margin: 0;">© 2024 Blue Hole Jamaica. Ocho Rios, St. Ann, Jamaica.</p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send room booking confirmation email:', emailError)
      }
    })

    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
