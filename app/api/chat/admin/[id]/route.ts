import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createSupabaseAdminClient()

  const { data: conversation, error: convError } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (convError || !conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const { data: messages, error: msgError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (msgError) return Response.json({ error: msgError.message }, { status: 500 })

  await supabase.from('chat_conversations').update({ unread_by_admin: false }).eq('id', id)

  return Response.json({ conversation, messages })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await request.json()

  if (status !== 'open' && status !== 'closed') {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createSupabaseAdminClient()
  const { error } = await supabase.from('chat_conversations').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ success: true })
}
