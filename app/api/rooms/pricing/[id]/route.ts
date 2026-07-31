import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { price_per_night } = await request.json()

  if (typeof price_per_night !== 'number' || price_per_night <= 0) {
    return Response.json({ error: 'Invalid price' }, { status: 400 })
  }

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('room_pricing')
    .update({ price_per_night })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
