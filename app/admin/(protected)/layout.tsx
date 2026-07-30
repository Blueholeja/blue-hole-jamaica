import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, BookOpen, MessageSquare, Map, Car, Hotel, LogOut, ExternalLink } from 'lucide-react'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import AdminPendingBadge from '@/components/AdminPendingBadge'

export const metadata: Metadata = {
  title: 'Admin Portal | Blue Hole Jamaica',
  robots: { index: false, follow: false },
}

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/bookings', label: 'Bookings', icon: <BookOpen size={18} /> },
  { href: '/admin/inquiries', label: 'Inquiries', icon: <MessageSquare size={18} /> },
  { href: '/admin/tours', label: 'Tours', icon: <Map size={18} /> },
  { href: '/admin/services', label: 'Services', icon: <Car size={18} /> },
  { href: '/admin/stays', label: 'Stays', icon: <Hotel size={18} /> },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B3A2D] text-white flex flex-col shrink-0 fixed h-full z-40">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <path d="M18 2C18 2 6 12 6 21C6 27.627 11.373 33 18 33C24.627 33 30 27.627 30 21C30 12 18 2 18 2Z" fill="#00B896" />
              <path d="M18 10C18 10 11 17 11 22C11 25.866 14.134 29 18 29C21.866 29 25 25.866 25 22C25 17 18 10 18 10Z" fill="#1B3A2D" />
              <circle cx="18" cy="22" r="4" fill="#00B896" opacity="0.7" />
            </svg>
            <div>
              <p className="font-bold text-sm leading-tight">Blue Hole Jamaica</p>
              <p className="text-[#00B896] text-xs">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
            >
              {link.icon}
              {link.label}
              {link.href === '/admin/bookings' && <AdminPendingBadge />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-xs transition-colors"
          >
            <ExternalLink size={14} />
            View Website
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 text-xs transition-colors w-full text-left"
            >
              <LogOut size={14} />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
