import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (typeof token !== 'string' || !token) {
      return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle()

    if (!customer || !customer.reset_token_expires || new Date(customer.reset_token_expires) < new Date()) {
      return Response.json({ error: 'This reset link is invalid or has expired' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const { error } = await supabase
      .from('customers')
      .update({ password_hash: passwordHash, reset_token: null, reset_token_expires: null })
      .eq('id', customer.id)

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
