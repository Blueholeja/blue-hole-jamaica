'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/customers/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Reset Your Password</h1>
          <p className="text-gray-500 text-sm mt-1">We&apos;ll email you a link to reset it</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
              <p className="text-[#1B3A2D] font-semibold mb-1">Check your email</p>
              <p className="text-gray-500 text-sm">
                If an account exists for {email}, we&apos;ve sent a link to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B3A2D] hover:bg-[#0D2318] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/account/login" className="text-[#00B896] font-semibold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
