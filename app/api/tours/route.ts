import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { TOURS } from '@/lib/tours-data'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('tours')
      .select('*')
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
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
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
