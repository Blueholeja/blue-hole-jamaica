import { NextRequest, after } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await request.json()
  if (typeof message !== 'string' || !message.trim()) {
    return Response.json({ error: 'Please describe the change you need' }, { status: 400 })
  }

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

  after(async () => {
    try {
      await resend.emails.send({
        from: 'Blue Hole Jamaica <noreply@blueholejamaica.com>',
        to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
        subject: `Change Requested: ${booking.customer_name} — ${(booking.tours as { name?: string } | null)?.name || booking.id}`,
        html: `
          <p><strong>${booking.customer_name}</strong> (${booking.email}) requested a change to their reservation.</p>
          <p>Current date: ${booking.date}</p>
          <p>Booking ID: ${booking.id}</p>
          <div style="background:#F0F9F5;border-radius:12px;padding:16px 20px;margin:16px 0;">
            <p style="margin:0;white-space:pre-wrap;">${message.trim()}</p>
          </div>
          <p style="color:#666;font-size:13px;">Reply directly to the customer's email or update the reservation from the admin panel.</p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send change request:', emailError)
    }
  })

  return Response.json({ success: true })
}
