import { after } from 'next/server'
import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { getCurrentCustomer } from '@/lib/customer-auth'
import { sendVerificationEmail } from '@/lib/customer-emails'

export async function POST() {
  const session = await getCurrentCustomer()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseAdminClient()
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, email, email_verified')
    .eq('id', session.id)
    .single()

  if (!customer) return Response.json({ error: 'Not found' }, { status: 404 })
  if (customer.email_verified) return Response.json({ success: true, alreadyVerified: true })

  const verificationToken = crypto.randomBytes(32).toString('hex')
  const { error } = await supabase
    .from('customers')
    .update({ verification_token: verificationToken })
    .eq('id', customer.id)

  if (error) return Response.json({ error: error.message }, { status: 400 })

  after(() => sendVerificationEmail(customer.email, customer.name, verificationToken))

  return Response.json({ success: true })
}
