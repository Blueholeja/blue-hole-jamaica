import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/** Admin-only: the full roster of 10 physical rooms, for the occupancy panel. */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase.from('rooms').select('*').order('id')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
