'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessagesSquare, X, Send, AlertCircle, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'bh_chat_conversation_id'

interface ChatMessage {
  id: string
  sender_type: 'customer' | 'admin'
  sender_name: string
  message: string
  created_at: string
}

interface Conversation {
  id: string
  guest_name: string
  guest_email?: string | null
  status: string
  unread_by_customer?: boolean
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasUnread, setHasUnread] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const [showAddEmail, setShowAddEmail] = useState(false)
  const [emailDraft, setEmailDraft] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setConversationId(stored)

    fetch('/api/customers/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.name || '')
          setEmail(data.email || '')
        }
      })
      .catch(() => {})
  }, [])

  const fetchConversation = useCallback(async (id: string, markRead: boolean) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}${markRead ? '?markRead=1' : ''}`)
      if (!res.ok) return
      const data = await res.json()
      setConversation(data.conversation)
      setMessages(data.messages)
      if (markRead) setHasUnread(false)
      else setHasUnread(Boolean(data.conversation.unread_by_customer))
    } catch {}
  }, [])

  // Poll for updates: faster while the panel is open, slower (just checking
  // for the notification dot) while it's closed.
  useEffect(() => {
    if (!conversationId) return
    fetchConversation(conversationId, isOpen)
    const interval = setInterval(() => fetchConversation(conversationId, isOpen), isOpen ? 4000 : 15000)
    return () => clearInterval(interval)
  }, [conversationId, isOpen, fetchConversation])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [messages, isOpen])

  async function handleStartChat(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setStarting(true)
    setStartError('')
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_name: name, guest_email: email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStartError(data.error || 'Something went wrong. Please try again.')
        return
      }
      localStorage.setItem(STORAGE_KEY, data.id)
      setConversationId(data.id)
      setConversation(data)
      setMessages([])
    } catch {
      setStartError('Something went wrong. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!emailDraft.trim() || !conversationId) return
    setSavingEmail(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_email: emailDraft.trim() }),
      })
      if (res.ok) {
        setConversation((c) => (c ? { ...c, guest_email: emailDraft.trim() } : c))
        setShowAddEmail(false)
      }
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !conversationId) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Live chat"
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#00B896] hover:bg-[#009B7F] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
      >
        {isOpen ? <X size={26} /> : <MessagesSquare size={26} />}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 right-6 z-50 w-[90vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: '480px' }}>
          <div className="bg-[#1B3A2D] px-5 py-4 shrink-0">
            <p className="text-white font-bold text-sm">Chat with Blue Hole Jamaica</p>
            <p className="text-gray-300 text-xs mt-0.5">We usually reply within a few minutes</p>
          </div>

          {!conversationId ? (
            <form onSubmit={handleStartChat} className="flex-1 flex flex-col justify-center p-5 space-y-3 overflow-y-auto">
              <p className="text-gray-500 text-sm mb-1">Start a conversation with our team.</p>
              {startError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-xs">{startError}</p>
                </div>
              )}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={starting}
                className="w-full bg-[#00B896] hover:bg-[#009B7F] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {starting ? 'Starting...' : 'Start Chat'}
              </button>
            </form>
          ) : (
            <>
              {!conversation?.guest_email && (
                <div className="px-4 py-2 border-b border-gray-100 shrink-0">
                  {showAddEmail ? (
                    <form onSubmit={handleAddEmail} className="flex items-center gap-1.5">
                      <input
                        type="email"
                        value={emailDraft}
                        onChange={(e) => setEmailDraft(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={savingEmail || !emailDraft.trim()}
                        className="text-xs font-semibold text-[#00B896] hover:text-[#009B7F] disabled:opacity-50 px-1.5"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddEmail(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowAddEmail(true)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#00B896] transition-colors"
                    >
                      <Mail size={12} />
                      Add your email to get notified of replies (optional)
                    </button>
                  )}
                </div>
              )}
              <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F0F9F5]">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs mt-4">Send a message to get started.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={cn('flex', m.sender_type === 'customer' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                          m.sender_type === 'customer' ? 'bg-[#00B896] text-white' : 'bg-white text-gray-700 border border-gray-100'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  ))
                )}
                {conversation?.status === 'closed' && (
                  <p className="text-center text-gray-400 text-xs">This conversation has been closed.</p>
                )}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-100 shrink-0">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={conversation?.status === 'closed' ? 'Conversation closed' : 'Type a message...'}
                  disabled={conversation?.status === 'closed'}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim() || conversation?.status === 'closed'}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#00B896] hover:bg-[#009B7F] disabled:opacity-50 text-white shrink-0 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
