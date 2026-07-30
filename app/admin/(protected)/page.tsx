import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { BookOpen, Clock, CheckCircle2, Flag, XCircle, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/reservation-utils'

async function getDashboardData() {
  try {
    const supabase = await createSupabaseAdminClient()

    const [bookingsRes, inquiriesRes] = await Promise.all([
      supabase.from('bookings').select('*, tours(name)').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
    ])

    const bookings = bookingsRes.data || []
    const inquiries = inquiriesRes.data || []
    const todayStr = new Date().toISOString().split('T')[0]

    return {
      totalReservations: bookings.length,
      pendingReservations: bookings.filter((b) => b.status === 'pending').length,
      confirmedReservations: bookings.filter((b) => b.status === 'confirmed').length,
      completedReservations: bookings.filter((b) => b.status === 'completed').length,
      declinedReservations: bookings.filter((b) => b.status === 'declined').length,
      todaysReservations: bookings.filter((b) => b.date === todayStr).length,
      newInquiries: inquiries.filter((i) => i.status === 'unread').length,
      recentBookings: bookings.slice(0, 8),
      recentInquiries: inquiries.slice(0, 5),
    }
  } catch {
    return {
      totalReservations: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      completedReservations: 0,
      declinedReservations: 0,
      todaysReservations: 0,
      newInquiries: 0,
      recentBookings: [],
      recentInquiries: [],
    }
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[status] || 'bg-gray-100 text-gray-600')}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    {
      label: 'Total Reservations',
      value: data.totalReservations,
      icon: <BookOpen size={22} className="text-[#00B896]" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Requests',
      value: data.pendingReservations,
      icon: <Clock size={22} className="text-yellow-500" />,
      bg: 'bg-yellow-50',
    },
    {
      label: 'Confirmed Reservations',
      value: data.confirmedReservations,
      icon: <CheckCircle2 size={22} className="text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Completed Reservations',
      value: data.completedReservations,
      icon: <Flag size={22} className="text-blue-500" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Declined Reservations',
      value: data.declinedReservations,
      icon: <XCircle size={22} className="text-red-500" />,
      bg: 'bg-red-50',
    },
    {
      label: "Today's Reservations",
      value: data.todaysReservations,
      icon: <CalendarCheck size={22} className="text-purple-500" />,
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        {/* Recent Reservations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1B3A2D]">Recent Reservations</h2>
            <Link href="/admin/bookings" className="text-[#00B896] text-xs hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No reservations yet</div>
            ) : (
              data.recentBookings.map((booking: Record<string, unknown>) => (
                <div key={booking.id as string} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1B3A2D] text-sm">{booking.customer_name as string}</p>
                    <p className="text-gray-400 text-xs">
                      {((booking.tours as { name?: string } | null)?.name) || 'Reservation'} · {booking.date as string}
                    </p>
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
            <Link href="/admin/inquiries" className="text-[#00B896] text-xs hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentInquiries.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No inquiries yet</div>
            ) : (
              data.recentInquiries.map((inquiry: Record<string, unknown>) => (
                <div key={inquiry.id as string} className="px-6 py-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-[#1B3A2D] text-sm">{inquiry.name as string}</p>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', inquiry.status === 'unread' ? 'bg-red-100 text-red-700' : inquiry.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {inquiry.status as string}
                    </span>
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
