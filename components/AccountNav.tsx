'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UserCog, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/account/dashboard', label: 'My Bookings', icon: <LayoutDashboard size={16} /> },
  { href: '/account/profile', label: 'Profile', icon: <UserCog size={16} /> },
]

export default function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/customers/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 mb-8 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm w-fit">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === link.href
              ? 'bg-[#1B3A2D] text-white'
              : 'text-gray-500 hover:text-[#1B3A2D] hover:bg-gray-50'
          )}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  )
}
