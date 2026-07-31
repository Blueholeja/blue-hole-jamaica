import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tour_id,
      customer_name,
      email,
      phone,
      date,
      guests,
      special_requests,
      total_amount,
      payment_id,
      payment_status = 'unpaid',
      status = 'pending',
    } = body

    if (!customer_name || !email || !date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          tour_id,
          customer_name,
          email,
          phone,
          date,
          guests: Number(guests) || 1,
          special_requests,
          total_amount: Number(total_amount),
          payment_id,
          payment_status,
          status,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Send both emails after the response is already sent, so the customer
    // isn't stuck waiting on the browser for two Resend API round-trips.
    after(async () => {
      try {
        await sendEmail({
          to: email,
          subject: `Booking Confirmation — ${data.id.slice(0, 8).toUpperCase()} | Blue Hole Jamaica`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B3A2D; padding: 24px; text-align: center;">
                <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
                <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px;">Explore. Experience. Enjoy.</p>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="color: #1B3A2D; margin-top: 0;">Booking Confirmed!</h2>
                <p style="color: #555;">Hi ${customer_name}, your booking has been received! We'll send you a final confirmation shortly.</p>
                <div style="background: #F0F9F5; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 8px; color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold;">Booking Reference</p>
                  <p style="margin: 0; color: #1B3A2D; font-size: 20px; font-weight: bold; font-family: monospace;">${data.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Date</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${date}</td></tr>
                  <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666; font-size: 14px;">Guests</td><td style="padding: 10px 0; color: #1B3A2D; font-weight: 600; text-align: right; font-size: 14px;">${guests}</td></tr>
                  <tr><td style="padding: 10px 0; color: #666; font-size: 14px;">Total Amount</td><td style="padding: 10px 0; color: #00B896; font-weight: bold; text-align: right; font-size: 16px;">$${Number(total_amount).toFixed(2)}</td></tr>
                </table>
                <p style="color: #555; font-size: 14px;">Questions? Contact us:</p>
                <p style="color: #555; font-size: 14px;">📞 +1 (876) 723-4567 | WhatsApp: wa.me/18767234567</p>
              </div>
              <div style="background: #1B3A2D; padding: 16px; text-align: center;">
                <p style="color: #888; font-size: 12px; margin: 0;">© 2024 Blue Hole Jamaica. Ocho Rios, St. Ann, Jamaica.</p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send customer email:', emailError)
      }

      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
          subject: `New Booking: ${customer_name} — ${date}`,
          html: `
            <p><strong>New booking received!</strong></p>
            <p>Customer: ${customer_name} (${email})</p>
            <p>Phone: ${phone || 'Not provided'}</p>
            <p>Date: ${date}</p>
            <p>Guests: ${guests}</p>
            <p>Total: $${Number(total_amount).toFixed(2)}</p>
            <p>Payment Status: ${payment_status}</p>
            <p>Special Requests: ${special_requests || 'None'}</p>
            <p>Booking ID: ${data.id}</p>
          `,
        })
      } catch (adminEmailError) {
        console.error('Failed to send admin notification:', adminEmailError)
      }
    })

    return Response.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, tours(name, slug)')
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
