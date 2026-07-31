import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { tourId } = await params
  const supabase = await createSupabaseAdminClient()
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('customer_id', session.id)
    .eq('tour_id', tourId)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ success: true })
}
