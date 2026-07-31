'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch('/api/customers/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: params.token }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Verification failed')
          setStatus('error')
          return
        }
        setStatus('success')
      } catch {
        setError('Something went wrong. Please try again.')
        setStatus('error')
      }
    }
    verify()
  }, [params.token])

  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B896] mx-auto" />
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-[#1B3A2D] mb-2">Email Verified!</h1>
              <p className="text-gray-500 text-sm mb-5">Your account is now fully activated.</p>
              <Link
                href="/account/dashboard"
                className="inline-block bg-[#1B3A2D] hover:bg-[#0D2318] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-[#1B3A2D] mb-2">Verification Failed</h1>
              <p className="text-gray-500 text-sm">{error}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
