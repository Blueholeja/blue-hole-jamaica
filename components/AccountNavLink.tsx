'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function AccountNavLink({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/customers/me')
      .then((res) => setLoggedIn(res.ok))
      .catch(() => setLoggedIn(false))
  }, [])

  if (loggedIn === null) return null

  const href = loggedIn ? '/account/dashboard' : '/account/login'
  const label = loggedIn ? 'My Account' : 'Sign In'

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="flex items-center gap-2 text-gray-200 hover:text-[#00B896] transition-colors text-sm"
      >
        <User size={18} />
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 text-gray-200 hover:text-[#00B896] transition-colors duration-150 text-sm font-medium"
      aria-label={label}
    >
      <User size={18} />
      <span className="hidden xl:inline">{label}</span>
    </Link>
  )
}
