import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'

export async function GET() {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('favorites')
    .select('tour_id, created_at, tours(id, name, slug, price, images, duration)')
    .eq('customer_id', session.id)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { tour_id } = await request.json()
    if (typeof tour_id !== 'string' || !tour_id) {
      return Response.json({ error: 'tour_id is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { error } = await supabase
      .from('favorites')
      .upsert([{ customer_id: session.id, tour_id }], { onConflict: 'customer_id,tour_id' })

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
