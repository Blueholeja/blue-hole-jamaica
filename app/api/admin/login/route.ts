import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createSessionToken, SESSION_COOKIE } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminEmail || !adminPasswordHash) {
      return Response.json({ error: 'Admin not configured' }, { status: 500 })
    }

    if (typeof email !== 'string' || typeof password !== 'string' || email !== adminEmail) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const passwordMatches = await bcrypt.compare(password, adminPasswordHash)
    if (!passwordMatches) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, createSessionToken(adminEmail), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
