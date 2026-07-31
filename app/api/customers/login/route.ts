import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { createCustomerSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/customer-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (typeof email !== 'string' || typeof password !== 'string') {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, name, password_hash')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (!customer) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const passwordMatches = await bcrypt.compare(password, customer.password_hash)
    if (!passwordMatches) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, createCustomerSessionToken(customer.id, customer.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
