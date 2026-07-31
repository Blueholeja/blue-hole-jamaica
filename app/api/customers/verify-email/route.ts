import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (typeof token !== 'string' || !token) {
      return Response.json({ error: 'Invalid verification link' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email_verified')
      .eq('verification_token', token)
      .maybeSingle()

    if (!customer) {
      return Response.json({ error: 'This verification link is invalid or has already been used' }, { status: 404 })
    }

    if (customer.email_verified) {
      return Response.json({ success: true, alreadyVerified: true })
    }

    const { error } = await supabase
      .from('customers')
      .update({ email_verified: true, verification_token: null })
      .eq('id', customer.id)

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
