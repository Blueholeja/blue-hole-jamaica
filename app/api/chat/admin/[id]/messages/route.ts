import { NextRequest, after } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { message } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, guest_name, guest_email, last_message_by')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const { data: msg, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: id,
          sender_type: 'admin',
          sender_name: 'Blue Hole Jamaica',
          message: message.trim(),
        },
      ])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString(), last_message_by: 'admin', unread_by_customer: true, status: 'open' })
      .eq('id', id)

    // Only email the guest (if we have an address) when it's a fresh reply
    // to their message, not on back-to-back admin messages.
    if (conversation.guest_email && conversation.last_message_by !== 'admin') {
      after(async () => {
        try {
          await sendEmail({
            to: conversation.guest_email,
            subject: `New reply from Blue Hole Jamaica`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1B3A2D; padding: 24px; text-align: center;">
                  <h1 style="color: #00B896; margin: 0; font-size: 24px;">Blue Hole Jamaica</h1>
                </div>
                <div style="padding: 32px 24px;">
                  <h2 style="color: #1B3A2D; margin-top: 0;">Hi ${conversation.guest_name},</h2>
                  <p style="color: #555;">You have a new message from our team:</p>
                  <div style="background: #F0F9F5; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #1B3A2D; white-space: pre-wrap;">${message.trim()}</p>
                  </div>
                  <p style="color: #555; font-size: 14px;">Reply on the website where you started the chat to continue the conversation.</p>
                </div>
              </div>
            `,
          })
        } catch (emailError) {
          console.error('Failed to send chat reply email:', emailError)
        }
      })
    }

    return Response.json(msg, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
