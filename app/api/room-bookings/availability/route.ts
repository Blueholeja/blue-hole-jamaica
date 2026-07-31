import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { ROOM_CAPACITY, type RoomType } from '@/lib/room-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const type = searchParams.get('type') as RoomType | null

  if (!checkIn || !checkOut || !type || !(type in ROOM_CAPACITY)) {
    return Response.json({ error: 'checkIn, checkOut, and a valid type are required' }, { status: 400 })
  }
  if (checkOut <= checkIn) {
    return Response.json({ error: 'Check-out must be after check-in' }, { status: 400 })
  }

  const supabase = await createSupabaseAdminClient()
  const { count, error } = await supabase
    .from('room_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('room_type', type)
    .in('status', ['confirmed', 'completed'])
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const capacity = ROOM_CAPACITY[type]
  const occupied = count ?? 0
  const availableCount = Math.max(0, capacity - occupied)

  return Response.json({ available: availableCount > 0, availableCount, capacity })
}
