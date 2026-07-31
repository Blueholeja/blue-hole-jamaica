import { NextRequest, after } from 'next/server'
import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { sendPasswordResetEmail } from '@/lib/customer-emails'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (typeof email !== 'string' || !email.trim()) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    // Always respond the same way, whether or not the email exists,
    // so this endpoint can't be used to enumerate registered accounts.
    if (customer) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetExpires = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour

      await supabase
        .from('customers')
        .update({ reset_token: resetToken, reset_token_expires: resetExpires })
        .eq('id', customer.id)

      after(() => sendPasswordResetEmail(customer.email, customer.name, resetToken))
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
