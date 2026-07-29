'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  unread: 'bg-red-100 text-red-700',
  read: 'bg-gray-100 text-gray-600',
  responded: 'bg-green-100 text-green-700',
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function fetchInquiries() {
    setLoading(true)
    try {
      const res = await fetch('/api/inquiries', {
        headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}` },
      })
      const data = await res.json()
      setInquiries(Array.isArray(data) ? data : [])
    } catch {
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchInquiries()
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Inquiries</h1>
          <p className="text-gray-500 text-sm mt-1">
            {inquiries.filter((i) => i.status === 'unread').length} unread
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-2xl text-center py-20 text-gray-400 shadow-sm border border-gray-100">
          No inquiries yet
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={cn(
                'bg-white rounded-2xl shadow-sm border transition-all',
                inquiry.status === 'unread' ? 'border-[#00B896]/30 border-l-4 border-l-[#00B896]' : 'border-gray-100'
              )}
            >
              <div
                className="px-5 py-4 flex items-start justify-between cursor-pointer hover:bg-gray-50/50"
                onClick={() => {
                  setExpanded(expanded === inquiry.id ? null : inquiry.id)
                  if (inquiry.status === 'unread') updateStatus(inquiry.id, 'read')
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-[#1B3A2D] text-sm">{inquiry.name}</p>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[inquiry.status] || 'bg-gray-100 text-gray-600')}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">{inquiry.email} · {inquiry.subject || 'General Inquiry'}</p>
                  <p className="text-gray-500 text-sm line-clamp-1">{inquiry.message}</p>
                </div>
                <div className="text-xs text-gray-400 ml-4 shrink-0">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </div>
              </div>

              {expanded === inquiry.id && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{inquiry.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject || 'Your Inquiry'}`}
                      className="flex items-center gap-2 px-3 py-2 bg-[#1B3A2D] text-white text-xs font-medium rounded-lg hover:bg-[#0D2318] transition-colors"
                    >
                      <Mail size={13} />
                      Reply via Email
                    </a>
                    {inquiry.phone && (
                      <a
                        href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}?text=Hi ${inquiry.name}, thanks for contacting Blue Hole Jamaica!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#20BA5A] transition-colors"
                      >
                        <Phone size={13} />
                        WhatsApp
                      </a>
                    )}
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00B896]"
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Mark as Read</option>
                      <option value="responded">Responded</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
