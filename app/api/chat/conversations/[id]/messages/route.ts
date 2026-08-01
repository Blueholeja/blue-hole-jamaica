import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { message } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, guest_name, status, last_message_by')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }
    if (conversation.status === 'closed') {
      return Response.json({ error: 'This conversation has been closed' }, { status: 400 })
    }

    const { data: msg, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: id,
          sender_type: 'customer',
          sender_name: conversation.guest_name,
          message: message.trim(),
        },
      ])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString(), last_message_by: 'customer', unread_by_admin: true })
      .eq('id', id)

    // Only email admin when the customer is replying after admin's turn —
    // avoids a flood of emails if the customer sends several messages in a
    // row before anyone's replied (the unread badge already covers that).
    if (conversation.last_message_by === 'admin') {
      after(async () => {
        try {
          await sendEmail({
            to: process.env.ADMIN_EMAIL || 'admin@blueholejamaica.com',
            subject: `New Live Chat Reply from ${conversation.guest_name}`,
            html: `
              <p><strong>${conversation.guest_name}</strong> replied.</p>
              <p>${message.trim()}</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/chat">Reply in the admin panel</a></p>
            `,
          })
        } catch (emailError) {
          console.error('Failed to send chat message admin notification:', emailError)
        }
      })
    }

    return Response.json(msg, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
