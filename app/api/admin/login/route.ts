import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return Response.json({ error: 'Admin not configured' }, { status: 500 })
    }

    if (email !== adminEmail || password !== adminPassword) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
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
