'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Users, Calendar, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ROOM_PRICING,
  ROOM_TYPE_LABELS,
  PACKAGE_LABELS,
  computeNights,
  findPricing,
  type RoomType,
  type RoomPackage,
  type RoomPricingRow,
} from '@/lib/room-utils'

const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'
const labelClass = 'flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5'

export default function RoomBooking() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [pricing, setPricing] = useState<RoomPricingRow[]>(ROOM_PRICING)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [roomType, setRoomType] = useState<RoomType>('single')
  const [pkg, setPkg] = useState<RoomPackage>('room_only')
  const [specialRequests, setSpecialRequests] = useState('')

  const [availability, setAvailability] = useState<{ available: boolean; availableCount: number } | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const packageOptions = useMemo<RoomPackage[]>(
    () => (roomType === 'single' ? ['room_only', 'breakfast', 'breakfast_dinner'] : ['breakfast', 'breakfast_dinner']),
    [roomType]
  )

  useEffect(() => {
    fetch('/api/rooms/pricing')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && data.length > 0 && setPricing(data))
      .catch(() => {})
  }, [])

  // Pre-select the room type when arriving from a "Book Now" link on a
  // specific room card (e.g. /rooms/book?type=double). Read directly from
  // the URL rather than useSearchParams so this stays a plain effect and
  // doesn't require wrapping the page in a Suspense boundary.
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get('type')
    if (type === 'single' || type === 'double') setRoomType(type)
  }, [])

  // Double rooms don't offer Room Only — keep the selected package valid
  // whenever the room type changes.
  useEffect(() => {
    if (!packageOptions.includes(pkg)) setPkg(packageOptions[0])
  }, [packageOptions, pkg])

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setAvailability(null)
      return
    }
    setCheckingAvailability(true)
    const controller = new AbortController()
    fetch(`/api/room-bookings/availability?checkIn=${checkIn}&checkOut=${checkOut}&type=${roomType}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .catch(() => {})
      .finally(() => setCheckingAvailability(false))
    return () => controller.abort()
  }, [checkIn, checkOut, roomType])

  const priceRow = findPricing(pricing, roomType, pkg)
  const nights = checkIn && checkOut ? computeNights(checkIn, checkOut) : 0
  const totalAmount = priceRow ? priceRow.price_per_night * nights : 0
  const depositAmount = Math.round(totalAmount * 0.5 * 100) / 100

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !checkIn || !checkOut || checkOut <= checkIn) return
    if (availability && !availability.available) return
    setStep(2)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: name,
          email,
          phone,
          adults,
          children,
          check_in: checkIn,
          check_out: checkOut,
          room_type: roomType,
          package: pkg,
          special_requests: specialRequests,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
        return
      }
      router.push(`/rooms/pay/${data.id}`)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 text-sm font-medium">
        <span className={cn('flex items-center justify-center w-6 h-6 rounded-full text-xs', step === 1 ? 'bg-[#1B3A2D] text-white' : 'bg-[#00B896] text-white')}>
          {step > 1 ? <CheckCircle2 size={14} /> : 1}
        </span>
        <span className={step === 1 ? 'text-[#1B3A2D]' : 'text-gray-400'}>Stay Details</span>
        <div className="flex-1 h-px bg-gray-200 mx-2" />
        <span className={cn('flex items-center justify-center w-6 h-6 rounded-full text-xs', step === 2 ? 'bg-[#1B3A2D] text-white' : 'bg-gray-200 text-gray-500')}>2</span>
        <span className={step === 2 ? 'text-[#1B3A2D]' : 'text-gray-400'}>Review & Book</span>
      </div>

      {step === 1 && (
        <form onSubmit={handleContinue} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><User size={16} className="text-[#00B896]" />Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Mail size={16} className="text-[#00B896]" />Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}><Phone size={16} className="text-[#00B896]" />Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Users size={16} className="text-[#00B896]" />Adults</label>
              <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Users size={16} className="text-[#00B896]" />Children</label>
              <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><Calendar size={16} className="text-[#00B896]" />Check-in *</label>
              <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Calendar size={16} className="text-[#00B896]" />Check-out *</label>
              <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Room Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {(['single', 'double'] as RoomType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRoomType(t)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors text-left',
                    roomType === t ? 'border-[#00B896] bg-[#F0F9F5] text-[#1B3A2D]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  {ROOM_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {checkIn && checkOut && checkOut > checkIn && (
            <div className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
              checkingAvailability ? 'bg-gray-50 text-gray-500' :
              availability?.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            )}>
              {checkingAvailability ? (
                'Checking availability...'
              ) : availability?.available ? (
                <><CheckCircle2 size={16} /> {availability.availableCount} {ROOM_TYPE_LABELS[roomType]}{availability.availableCount !== 1 ? 's' : ''} available for these dates</>
              ) : (
                <><AlertCircle size={16} /> Fully booked for these dates — try different dates or the other room type</>
              )}
            </div>
          )}

          <div>
            <label className={labelClass}>Package *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packageOptions.map((p) => {
                const row = findPricing(pricing, roomType, p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPkg(p)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm text-left transition-colors',
                      pkg === p ? 'border-[#00B896] bg-[#F0F9F5]' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-semibold text-[#1B3A2D]">{PACKAGE_LABELS[p]}</p>
                    <p className="text-[#00B896] font-bold text-sm">${row?.price_per_night ?? '—'}/night</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className={labelClass}>Special Requests (Optional)</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              placeholder="Anything else we should know?"
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <button
            type="submit"
            disabled={!!availability && !availability.available}
            className="w-full flex items-center justify-center gap-2 bg-[#1B3A2D] hover:bg-[#0D2318] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Continue to Review
            <ChevronRight size={18} />
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-[#1B3A2D]">Booking Summary</h3>
          <div className="bg-[#F0F9F5] rounded-xl p-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Guest</span><span className="font-medium text-[#1B3A2D]">{name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Room Type</span><span className="font-medium text-[#1B3A2D]">{ROOM_TYPE_LABELS[roomType]}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Package</span><span className="font-medium text-[#1B3A2D]">{PACKAGE_LABELS[pkg]}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span className="font-medium text-[#1B3A2D]">{checkIn}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span className="font-medium text-[#1B3A2D]">{checkOut}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Nights</span><span className="font-medium text-[#1B3A2D]">{nights}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-medium text-[#1B3A2D]">{adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Price per night</span><span className="font-medium text-[#1B3A2D]">${priceRow?.price_per_night.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t border-[#00B896]/20"><span className="text-gray-700 font-bold">Total Cost</span><span className="font-bold text-[#1B3A2D]">${totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-700 font-bold">Deposit Due Now (50%)</span><span className="font-bold text-[#00B896] text-base">${depositAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 text-xs">Balance due on arrival</span><span className="text-gray-500 text-xs">${(totalAmount - depositAmount).toFixed(2)}</span></div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold px-5 py-3.5 rounded-xl transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#00B896] hover:bg-[#009B7F] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {isSubmitting ? 'Booking...' : `Book Now — Pay $${depositAmount.toFixed(2)} Deposit`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
