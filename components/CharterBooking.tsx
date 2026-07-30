'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import { getTourBySlug } from '@/lib/tours-data'
import { cn } from '@/lib/utils'

type TripType = 'one_way' | 'round_trip'

const charterTour = getTourBySlug('charter')

export default function CharterBooking() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [tripType, setTripType] = useState<TripType>('one_way')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [returnPickupLocation, setReturnPickupLocation] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const isRoundTrip = tripType === 'round_trip'
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'
  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'
  const labelClass = 'flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5'

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !pickupDate ||
      !pickupTime ||
      !pickupLocation.trim() ||
      !dropoffLocation.trim()
    ) {
      return
    }
    if (isRoundTrip && (!returnDate || !returnTime || !returnPickupLocation.trim())) {
      return
    }
    setStep(2)
  }

  async function handleSubmitRequest() {
    if (!charterTour) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const specialRequests = [
        `Trip Type: ${isRoundTrip ? 'Round Trip' : 'One Way'}`,
        `Pickup: ${pickupDate} ${pickupTime} from ${pickupLocation}`,
        `Drop-off: ${dropoffLocation}`,
        isRoundTrip ? `Return: ${returnDate} ${returnTime} from ${returnPickupLocation}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_id: charterTour.id,
          customer_name: name,
          email,
          phone,
          date: pickupDate,
          guests: 1,
          special_requests: specialRequests,
          total_amount: charterTour.price,
          payment_status: 'unpaid',
          status: 'pending',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit request')
      router.push(`/book/confirmation/${data.id}?custom=1`)
    } catch {
      setSubmitError('Something went wrong submitting your request. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 2) {
    return (
      <div id="charter-booking-form" className="space-y-5">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#1B3A2D] mb-1">Review Your Charter Request</h2>
          <p className="text-gray-500 text-sm mb-6">
            Check everything below before submitting — no payment is needed yet.
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-[#1B3A2D]">{name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-[#1B3A2D]">{email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-[#1B3A2D]">{phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Trip Type</span>
              <span className="font-medium text-[#1B3A2D]">{isRoundTrip ? 'Round Trip' : 'One Way'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Pickup</span>
              <span className="font-medium text-[#1B3A2D] text-right max-w-[60%]">
                {pickupDate} at {pickupTime}
                <br />
                {pickupLocation}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Drop-off</span>
              <span className="font-medium text-[#1B3A2D] text-right max-w-[60%]">{dropoffLocation}</span>
            </div>
            {isRoundTrip && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Return</span>
                <span className="font-medium text-[#1B3A2D] text-right max-w-[60%]">
                  {returnDate} at {returnTime}
                  <br />
                  {returnPickupLocation}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-gray-700 font-bold text-base">Estimated Total</span>
              <span className="font-bold text-[#00B896] text-xl">${charterTour?.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#1B3A2D] mb-2">Submit for Review</h2>
          <p className="text-gray-500 text-sm mb-5">
            No payment is needed yet. Our team will review your request and confirm pricing and
            availability — or reach out with a reason if we can&apos;t accommodate it.
          </p>

          {submitError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-600 text-xs">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              Edit
            </button>
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="charter-booking-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-[#1B3A2D] mb-1">Book Your Charter</h2>
      <p className="text-gray-500 text-sm mb-6">
        Tell us where you&apos;re going and we&apos;ll take care of the rest.
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1B3A2D] uppercase tracking-wide">Customer Information</h3>
          <div>
            <label className={labelClass}>
              <User size={16} className="text-[#00B896]" />
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Mail size={16} className="text-[#00B896]" />
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Phone size={16} className="text-[#00B896]" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+1 (876) 000-0000"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <h3 className="text-sm font-bold text-[#1B3A2D] uppercase tracking-wide pt-4">Trip Details</h3>

          <div>
            <label className={labelClass}>Trip Type *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTripType('one_way')}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                  tripType === 'one_way'
                    ? 'bg-[#00B896] text-white border-[#00B896]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#00B896]'
                )}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('round_trip')}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                  tripType === 'round_trip'
                    ? 'bg-[#00B896] text-white border-[#00B896]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#00B896]'
                )}
              >
                Round Trip
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Calendar size={16} className="text-[#00B896]" />
                Pickup Date *
              </label>
              <input
                type="date"
                value={pickupDate}
                min={today}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Clock size={16} className="text-[#00B896]" />
                Pickup Time *
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <MapPin size={16} className="text-[#00B896]" />
              Pickup Location *
            </label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
              placeholder="Hotel, villa, or address"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <MapPin size={16} className="text-[#00B896]" />
              Drop-off Location *
            </label>
            <input
              type="text"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              required
              placeholder="Where you'd like to go"
              className={inputClass}
            />
          </div>

          {isRoundTrip && (
            <div className="space-y-4 pt-2 border-t border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Return Trip</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Calendar size={16} className="text-[#00B896]" />
                    Return Date *
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    min={pickupDate || today}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required={isRoundTrip}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Clock size={16} className="text-[#00B896]" />
                    Return Time *
                  </label>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    required={isRoundTrip}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  <MapPin size={16} className="text-[#00B896]" />
                  Return Pickup Location *
                </label>
                <input
                  type="text"
                  value={returnPickupLocation}
                  onChange={(e) => setReturnPickupLocation(e.target.value)}
                  required={isRoundTrip}
                  placeholder="Where we should pick you up for the return trip"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#00B896] hover:bg-[#009B7F] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Review Booking
          <ChevronRight size={18} />
        </button>

        <a
          href={`https://wa.me/${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20booking%20a%20Charter.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <MessageCircle size={18} />
          Enquire on WhatsApp
        </a>
      </form>
    </div>
  )
}
