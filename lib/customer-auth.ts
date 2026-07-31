import crypto from 'crypto'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'customer_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
const SESSION_SECRET = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret-set-CUSTOMER_SESSION_SECRET'

interface SessionPayload {
  id: string
  email: string
  exp: number
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
}

export function createCustomerSessionToken(id: string, email: string): string {
  const payload = Buffer.from(JSON.stringify({ id, email, exp: Date.now() + SESSION_TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyCustomerSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof data.exp !== 'number' || Date.now() > data.exp) return null
    if (typeof data.id !== 'string' || typeof data.email !== 'string') return null
    return data as SessionPayload
  } catch {
    return null
  }
}

export async function getCurrentCustomer(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  return verifyCustomerSessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export { SESSION_COOKIE, SESSION_TTL_MS }
