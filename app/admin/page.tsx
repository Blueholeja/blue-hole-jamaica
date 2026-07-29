import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { BookOpen, MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getDashboardData() {
  try {
    const supabase = await createSupabaseAdminClient()

    const [bookingsRes, inquiriesRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
    ])

    const bookings = bookingsRes.data || []
    const inquiries = inquiriesRes.data || []

    const totalRevenue = bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)

    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
      totalRevenue,
      newInquiries: inquiries.filter((i) => i.status === 'unread').length,
      recentBookings: bookings.slice(0, 10),
      recentInquiries: inquiries.slice(0, 5),
    }
  } catch {
    return {
      totalBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
      newInquiries: 0,
      recentBookings: [],
      recentInquiries: [],
    }
  }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    confirmed: { color: 'bg-green-100 text-green-700', label: 'Confirmed' },
    cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
    completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
    unread: { color: 'bg-red-100 text-red-700', label: 'Unread' },
    read: { color: 'bg-gray-100 text-gray-600', label: 'Read' },
    responded: { color: 'bg-green-100 text-green-700', label: 'Responded' },
  }
  const { color, label } = config[status] || { color: 'bg-gray-100 text-gray-600', label: status }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', color)}>
      {label}
    </span>
  )
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    {
      label: 'Total Bookings',
      value: data.totalBookings,
      icon: <BookOpen size={22} className="text-[#00B896]" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Bookings',
      value: data.pendingBookings,
      icon: <Clock size={22} className="text-yellow-500" />,
      bg: 'bg-yellow-50',
    },
    {
      label: 'Total Revenue',
      value: `$${data.totalRevenue.toFixed(2)}`,
      icon: <DollarSign size={22} className="text-blue-500" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'New Inquiries',
      value: data.newInquiries,
      icon: <MessageSquare size={22} className="text-purple-500" />,
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B3A2D]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s an overview of your business.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-[#1B3A2D] mb-0.5">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1B3A2D]">Recent Bookings</h2>
            <a href="/admin/bookings" className="text-[#00B896] text-xs hover:underline">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No bookings yet</div>
            ) : (
              data.recentBookings.map((booking: Record<string, unknown>) => (
                <div key={booking.id as string} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1B3A2D] text-sm">{booking.customer_name as string}</p>
                    <p className="text-gray-400 text-xs">{booking.date as string} · {booking.guests as number} guest{(booking.guests as number) > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#00B896] font-semibold text-sm">${(booking.total_amount as number)?.toFixed(2)}</span>
                    <StatusBadge status={booking.status as string} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1B3A2D]">Recent Inquiries</h2>
            <a href="/admin/inquiries" className="text-[#00B896] text-xs hover:underline">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentInquiries.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No inquiries yet</div>
            ) : (
              data.recentInquiries.map((inquiry: Record<string, unknown>) => (
                <div key={inquiry.id as string} className="px-6 py-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-[#1B3A2D] text-sm">{inquiry.name as string}</p>
                    <StatusBadge status={inquiry.status as string} />
                  </div>
                  <p className="text-gray-400 text-xs mb-1">{inquiry.email as string} · {inquiry.subject as string}</p>
                  <p className="text-gray-500 text-xs line-clamp-1">{inquiry.message as string}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
