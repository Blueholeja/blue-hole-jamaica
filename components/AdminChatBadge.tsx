'use client'

import { useEffect, useState } from 'react'

export default function AdminChatBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/chat/admin')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setCount(data.filter((c: { unread_by_admin: boolean }) => c.unread_by_admin).length)
        }
      } catch {
        // ignore transient errors
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 15000)
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
