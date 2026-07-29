import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('inquiries')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return Response.json({ error: error.message }, { status: 404 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
