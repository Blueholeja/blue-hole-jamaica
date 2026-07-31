import { NextRequest, after } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { createCustomerSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/customer-auth'
import { sendVerificationEmail } from '@/lib/customer-emails'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string') {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = await createSupabaseAdminClient()

    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return Response.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone || null,
          password_hash: passwordHash,
          email_verified: false,
          verification_token: verificationToken,
        },
      ])
      .select('id, name, email')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    after(() => sendVerificationEmail(data.email, data.name, verificationToken))

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, createCustomerSessionToken(data.id, data.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    })

    return Response.json({ success: true }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
