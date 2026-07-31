import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { ROOM_PRICING } from '@/lib/room-utils'

export async function GET() {
  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase.from('room_pricing').select('*').order('id')

  if (error || !data || data.length === 0) {
    return Response.json(ROOM_PRICING)
  }
  return Response.json(data)
}
