import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, tours(name, slug, price)')
      .eq('id', id)
      .single()

    if (error) return Response.json({ error: error.message }, { status: 404 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })

    if (body.status === 'confirmed') {
      try {
        await resend.emails.send({
          from: 'Blue Hole Jamaica <noreply@blueholejamaica.com>',
          to: data.email,
          subject: `Your reservation has been confirmed | Blue Hole Jamaica`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B3A2D; padding: 24px; text-align: center;">
                <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="color: #1B3A2D; margin-top: 0;">Good news, ${data.customer_name}!</h2>
                <p style="color: #555;">Your reservation has been confirmed for <strong>${data.date}</strong>.</p>
                <p style="color: #555;">Our team will be in touch with final details ahead of your trip.</p>
                <p style="color: #555; font-size: 14px;">Questions? Contact us on WhatsApp: wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'}</p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send acceptance email:', emailError)
      }
    }

    if (body.status === 'declined' && body.decline_reason) {
      try {
        await resend.emails.send({
          from: 'Blue Hole Jamaica <noreply@blueholejamaica.com>',
          to: data.email,
          subject: `Update on your reservation | Blue Hole Jamaica`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B3A2D; padding: 24px; text-align: center;">
                <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="color: #1B3A2D; margin-top: 0;">Hi ${data.customer_name},</h2>
                <p style="color: #555;">Unfortunately we're unable to accommodate your request for <strong>${data.date}</strong> as submitted.</p>
                <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
                  <p style="margin: 0 0 6px; color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold;">Reason</p>
                  <p style="margin: 0; color: #1B3A2D; font-size: 14px;">${body.decline_reason}</p>
                </div>
                <p style="color: #555;">You're welcome to reschedule with different dates or browse our other excursions.</p>
                <p style="color: #555; font-size: 14px;">Questions? Contact us on WhatsApp: wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'}</p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send decline email:', emailError)
      }
    }

    if (body.status === 'completed') {
      try {
        await resend.emails.send({
          from: 'Blue Hole Jamaica <noreply@blueholejamaica.com>',
          to: data.email,
          subject: `Thanks for traveling with us! | Blue Hole Jamaica`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B3A2D; padding: 24px; text-align: center;">
                <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="color: #1B3A2D; margin-top: 0;">Hi ${data.customer_name},</h2>
                <p style="color: #555;">We hope you enjoyed your time with us! Your reservation is now marked as completed.</p>
                <p style="color: #555;">We'd love to have you again on your next trip to Jamaica.</p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError)
      }
    }

    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    const { error } = await supabase.from('bookings').delete().eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
