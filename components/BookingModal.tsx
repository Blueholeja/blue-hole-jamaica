'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Calendar, Users, MapPin } from 'lucide-react'
import { TOURS } from '@/lib/tours-data'
import { cn } from '@/lib/utils'

interface BookingModalProps {
  children: React.ReactNode
  defaultTourSlug?: string
}

export default function BookingModal({ children, defaultTourSlug }: BookingModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tourSlug, setTourSlug] = useState(defaultTourSlug || '')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(1)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (tourSlug) params.set('tour', tourSlug)
    if (date) params.set('date', date)
    params.set('guests', String(guests))
    setOpen(false)
    router.push(`/book?${params.toString()}`)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-xl font-bold text-[#1B3A2D]">
              Quick Reservation
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tour Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <MapPin size={16} className="text-[#00B896]" />
                Select Tour
              </label>
              <select
                value={tourSlug}
                onChange={(e) => setTourSlug(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
              >
                <option value="">Choose a tour...</option>
                {TOURS.filter((t) => t.available).map((tour) => (
                  <option key={tour.slug} value={tour.slug}>
                    {tour.name} — ${tour.price}/person
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Calendar size={16} className="text-[#00B896]" />
                Preferred Date
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Users size={16} className="text-[#00B896]" />
                Number of Guests
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className={cn(
                    'w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#00B896] hover:text-[#00B896] transition-colors',
                    guests <= 1 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  -
                </button>
                <span className="text-lg font-semibold text-[#1B3A2D] w-8 text-center">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(20, guests + 1))}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#00B896] hover:text-[#00B896] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold py-3 rounded-lg transition-colors duration-150 mt-2"
            >
              Continue Booking
            </button>
          </form>

          <p className="mt-3 text-xs text-gray-400 text-center">
            No payment required until you complete your booking
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
