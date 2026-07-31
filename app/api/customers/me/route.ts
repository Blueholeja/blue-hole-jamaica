import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer, SESSION_COOKIE } from '@/lib/customer-auth'

export async function GET() {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, email, phone, email_verified, created_at')
    .eq('id', session.id)
    .maybeSingle()

  // A signed session can outlive the account it points to (e.g. deleted from
  // another device); treat that the same as no session rather than leaking
  // a raw Postgrest error.
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return Response.json(data)
}

export async function PATCH(request: NextRequest) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, phone } = await request.json()
    if (typeof name !== 'string' || !name.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('customers')
      .update({ name: name.trim(), phone: phone || null })
      .eq('id', session.id)
      .select('id, name, email, phone, email_verified, created_at')
      .maybeSingle()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    if (!data) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { password } = await request.json()
    if (typeof password !== 'string') {
      return Response.json({ error: 'Password is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('password_hash')
      .eq('id', session.id)
      .single()

    if (!customer || !(await bcrypt.compare(password, customer.password_hash))) {
      return Response.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const { error } = await supabase.from('customers').delete().eq('id', session.id)
    if (error) return Response.json({ error: error.message }, { status: 400 })

    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
