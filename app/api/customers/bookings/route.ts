import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'

export async function GET() {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, tours(name, slug)')
    .ilike('email', session.email)
    .order('date', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
