'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, ArrowLeft, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  guest_name: string
  guest_email: string | null
  status: 'open' | 'closed'
  last_message_at: string
  last_message_by: string | null
  unread_by_admin: boolean
  created_at: string
}

interface ChatMessage {
  id: string
  sender_type: 'customer' | 'admin'
  sender_name: string
  message: string
  created_at: string
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/admin')
      const data = await res.json()
      if (Array.isArray(data)) setConversations(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  const fetchThread = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat/admin/${id}`)
      if (!res.ok) return
      const data = await res.json()
      setSelected(data.conversation)
      setMessages(data.messages)
      fetchConversations()
    } catch {}
  }, [fetchConversations])

  useEffect(() => {
    if (!selectedId) return
    fetchThread(selectedId)
    const interval = setInterval(() => fetchThread(selectedId), 4000)
    return () => clearInterval(interval)
  }, [selectedId, fetchThread])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !selectedId) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const res = await fetch(`/api/chat/admin/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        setSelected((s) => (s ? { ...s, status: 'open' } : s))
        fetchConversations()
      }
    } finally {
      setSending(false)
    }
  }

  async function toggleStatus() {
    if (!selectedId || !selected) return
    const nextStatus = selected.status === 'open' ? 'closed' : 'open'
    const res = await fetch(`/api/chat/admin/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) {
      setSelected((s) => (s ? { ...s, status: nextStatus } : s))
      fetchConversations()
    }
  }

  async function deleteConversation() {
    if (!selectedId || !selected) return
    if (!confirm(`Delete the conversation with ${selected.guest_name}? This cannot be undone.`)) return
    const res = await fetch(`/api/chat/admin/${selectedId}`, { method: 'DELETE' })
    if (res.ok) {
      setSelectedId(null)
      setSelected(null)
      setMessages([])
      fetchConversations()
    }
  }

  function timeAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="h-screen flex flex-col p-6 sm:p-8 pb-0">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-[#1B3A2D]">Live Chat</h1>
        <p className="text-gray-500 text-sm mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 bg-white rounded-t-2xl shadow-sm border border-gray-100 border-b-0 overflow-hidden flex min-h-0">
        {/* Conversation List */}
        <div className={cn('w-full sm:w-80 border-r border-gray-100 flex flex-col shrink-0', selectedId && 'hidden sm:flex')}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00B896]" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm px-4">No conversations yet</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                    selectedId === c.id && 'bg-[#F0F9F5]'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#1B3A2D] text-sm truncate">{c.guest_name}</p>
                    {c.unread_by_admin && <span className="w-2 h-2 rounded-full bg-[#00B896] shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full', c.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500')}>
                      {c.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                    <span className="text-gray-400 text-xs">{timeAgo(c.last_message_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={cn('flex-1 flex flex-col min-w-0', !selectedId && 'hidden sm:flex')}>
          {!selectedId || !selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setSelectedId(null)} className="sm:hidden text-gray-400 hover:text-gray-600 shrink-0">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1B3A2D] text-sm truncate">{selected.guest_name}</p>
                    <p className="text-gray-400 text-xs truncate">{selected.guest_email || 'No email provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={toggleStatus}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      selected.status === 'open' ? 'text-gray-500 hover:bg-gray-100' : 'text-[#00B896] hover:bg-[#00B896]/10'
                    )}
                  >
                    {selected.status === 'open' ? <><CheckCircle2 size={14} /> Close</> : <><RotateCcw size={14} /> Reopen</>}
                  </button>
                  <button
                    onClick={deleteConversation}
                    title="Delete conversation"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div ref={threadRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F0F9F5]">
                {messages.map((m) => (
                  <div key={m.id} className={cn('flex', m.sender_type === 'admin' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                        m.sender_type === 'admin' ? 'bg-[#00B896] text-white' : 'bg-white text-gray-700 border border-gray-100'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-gray-100 shrink-0">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00B896] hover:bg-[#009B7F] disabled:opacity-50 text-white shrink-0 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
