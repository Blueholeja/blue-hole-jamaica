'use client'

import { useEffect, useState } from 'react'

export default function AdminPendingBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchPendingCount() {
      try {
        const res = await fetch('/api/bookings')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setCount(data.filter((b: { status: string }) => b.status === 'pending').length)
        }
      } catch {
        // ignore transient errors
      }
    }

    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#00B896] text-white text-[11px] font-bold">
      {count > 99 ? '99+' : count}
    </span>
  )
}
