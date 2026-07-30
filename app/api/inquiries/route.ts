import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{ name, email, phone, subject, message, status: 'unread' }])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Auto-reply to customer
    try {
      await resend.emails.send({
        from: 'Blue Hole Jamaica <noreply@blueholejamaica.com>',
        to: email,
        subject: 'Thanks for contacting Blue Hole Jamaica!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1B3A2D; padding: 24px; text-align: center;">
              <h1 style="color: #00B896; margin: 0;">Blue Hole Jamaica</h1>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="color: #1B3A2D;">Hi ${name},</h2>
              <p style="color: #555;">Thank you for reaching out! We've received your message and will get back to you within 24 hours.</p>
              <p style="color: #555;">In the meantime, feel free to WhatsApp us at <strong>+1 (876) 723-4567</strong> for faster assistance.</p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send auto-reply:', emailError)
    }

    // Notify admin
    try {
      await resend.emails.send({
        from: 'Blue Hole Jamaica <noreply@blueholejamaica.com>',
        to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
        subject: `New Inquiry: ${subject || 'General'} from ${name}`,
        html: `
          <p><strong>New inquiry from ${name}</strong></p>
          <p>Email: ${email}</p>
          <p>Phone: ${phone || 'Not provided'}</p>
          <p>Subject: ${subject || 'General'}</p>
          <p>Message: ${message}</p>
        `,
      })
    } catch {
      console.error('Failed to send admin notification')
    }

    return Response.json(data, { status: 201 })
  } catch {
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
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
