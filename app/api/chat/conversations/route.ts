import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { guest_name, guest_email, message } = await request.json()

    if (!guest_name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const session = await getCurrentCustomer()
    const supabase = await createSupabaseAdminClient()

    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .insert([
        {
          customer_id: session?.id || null,
          guest_name: guest_name.trim(),
          guest_email: guest_email?.trim() || session?.email || null,
          status: 'open',
          unread_by_admin: true,
          unread_by_customer: false,
        },
      ])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    if (message?.trim()) {
      await supabase.from('chat_messages').insert([
        {
          conversation_id: conversation.id,
          sender_type: 'customer',
          sender_name: guest_name.trim(),
          message: message.trim(),
        },
      ])
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString(), last_message_by: 'customer' })
        .eq('id', conversation.id)
    }

    after(async () => {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
          subject: `New Live Chat: ${guest_name}`,
          html: `
            <p><strong>${guest_name}</strong> started a new live chat.</p>
            ${message?.trim() ? `<p>Message: ${message.trim()}</p>` : ''}
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/chat">Reply in the admin panel</a></p>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send new chat admin notification:', emailError)
      }
    })

    return Response.json(conversation, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
