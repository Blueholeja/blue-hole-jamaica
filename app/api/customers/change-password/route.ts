import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'

export async function POST(request: NextRequest) {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await request.json()

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return Response.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('password_hash')
      .eq('id', session.id)
      .single()

    if (!customer || !(await bcrypt.compare(currentPassword, customer.password_hash))) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    const { error } = await supabase
      .from('customers')
      .update({ password_hash: newHash })
      .eq('id', session.id)

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
