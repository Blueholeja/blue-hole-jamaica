import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { TOURS } from '@/lib/tours-data'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (error) {
      // Fall back to static data if Supabase not configured
      return Response.json(TOURS)
    }

    // If no tours in DB, return static data
    if (!data || data.length === 0) {
      return Response.json(TOURS)
    }

    return Response.json(data)
  } catch {
    return Response.json(TOURS)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('tours')
      .insert([body])
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
