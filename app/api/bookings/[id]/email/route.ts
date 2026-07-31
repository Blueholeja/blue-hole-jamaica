import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { subject, message } = await request.json()

    if (!subject?.trim() || !message?.trim()) {
      return Response.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: reservation, error } = await supabase
      .from('bookings')
      .select('customer_name, email')
      .eq('id', id)
      .single()

    if (error || !reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    await sendEmail({
      to: reservation.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B3A2D; padding: 24px; text-align: center;">
            <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #1B3A2D; margin-top: 0;">Hi ${reservation.customer_name},</h2>
            <p style="color: #555; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
