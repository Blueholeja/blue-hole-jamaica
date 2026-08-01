import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

/**
 * Public, unauthenticated endpoint for the customer-facing chat widget.
 * Keyed by the conversation's unguessable UUID — same trust model as the
 * booking confirmation/pay pages.
 *
 * Pass ?markRead=1 when the widget panel is actually open and being viewed,
 * to clear unread_by_customer. Without it (e.g. a lightweight background
 * poll while the panel is closed, just to show a notification dot), the
 * unread flag is left alone.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const markRead = new URL(request.url).searchParams.get('markRead') === '1'
    const supabase = await createSupabaseAdminClient()

    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, guest_name, guest_email, status, last_message_at, last_message_by, unread_by_customer')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('id, sender_type, sender_name, message, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (msgError) return Response.json({ error: msgError.message }, { status: 500 })

    if (markRead && conversation.unread_by_customer) {
      await supabase.from('chat_conversations').update({ unread_by_customer: false }).eq('id', id)
      conversation.unread_by_customer = false
    }

    return Response.json({ conversation, messages })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Lets the customer optionally add their email later from within the chat
 * thread, without it ever being asked for up front. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { guest_email } = await request.json()

    if (!guest_email?.trim()) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({ guest_email: guest_email.trim() })
      .eq('id', id)
      .select('id, guest_email')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
