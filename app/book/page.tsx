'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { CheckCircle, AlertCircle, ChevronRight, Calendar, Users, User, Mail, Phone, FileText } from 'lucide-react'
import { TOURS } from '@/lib/tours-data'
import PayPalButton from '@/components/PayPalButton'
import { cn } from '@/lib/utils'

interface BookingFormData {
  name: string
  email: string
  phone: string
  special_requests: string
}

const STEPS = ['Select Tour', 'Your Details', 'Review & Pay']

function BookingPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [selectedTourSlug, setSelectedTourSlug] = useState(searchParams.get('tour') || '')
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1)
  const [personalData, setPersonalData] = useState<BookingFormData | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const selectedTour = TOURS.find((t) => t.slug === selectedTourSlug)
  const totalAmount = selectedTour ? selectedTour.price * guests : 0

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>()

  async function createBooking(paymentId?: string): Promise<string> {
    if (!selectedTour || !personalData) throw new Error('Missing booking data')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tour_id: selectedTour.id,
        customer_name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        date,
        guests,
        special_requests: personalData.special_requests,
        total_amount: totalAmount,
        payment_id: paymentId,
        payment_status: paymentId ? 'paid' : 'unpaid',
        status: 'pending',
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create booking')
    return data.id
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTourSlug || !date || guests < 1) return
    setStep(2)
  }

  function handleStep2Submit(data: BookingFormData) {
    setPersonalData(data)
    setStep(3)
  }

  async function handlePaymentSuccess(orderId: string) {
    setIsCreatingBooking(true)
    try {
      const id = await createBooking(orderId)
      setBookingId(id)
      router.push(`/book/confirmation/${id}`)
    } catch (err) {
      setPaymentError('Payment received but booking failed. Please contact us with your payment ID: ' + orderId)
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'
  const labelClass = 'flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5]">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white text-center mb-6">Book Your Tour</h1>
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((s, idx) => {
              const stepNum = idx + 1
              const isActive = step === stepNum
              const isCompleted = step > stepNum
              return (
                <div key={s} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      isCompleted ? 'bg-[#00B896] text-white' :
                      isActive ? 'bg-white text-[#1B3A2D]' :
                      'bg-white/20 text-white/60'
                    )}>
                      {isCompleted ? <CheckCircle size={18} /> : stepNum}
                    </div>
                    <span className={cn(
                      'text-xs mt-1 font-medium hidden sm:block',
                      isActive ? 'text-white' : 'text-white/50'
                    )}>
                      {s}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={cn(
                      'w-16 sm:w-24 h-0.5 mx-2 transition-all',
                      step > stepNum ? 'bg-[#00B896]' : 'bg-white/20'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1 */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#1B3A2D] mb-6">Select Your Tour</h2>
                <form onSubmit={handleStep1Submit} className="space-y-5">
                  <div>
                    <label className={labelClass}>
                      <FileText size={16} className="text-[#00B896]" />
                      Tour *
                    </label>
                    <select
                      value={selectedTourSlug}
                      onChange={(e) => setSelectedTourSlug(e.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="">Choose a tour...</option>
                      {TOURS.filter((t) => t.available).map((tour) => (
                        <option key={tour.slug} value={tour.slug}>
                          {tour.name} — ${tour.price}/person ({tour.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar size={16} className="text-[#00B896]" />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Users size={16} className="text-[#00B896]" />
                      Number of Guests *
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg font-medium hover:border-[#00B896] hover:text-[#00B896] transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold text-[#1B3A2D] w-8 text-center">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(20, guests + 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg font-medium hover:border-[#00B896] hover:text-[#00B896] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00B896] hover:bg-[#009B7F] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Continue to Details
                    <ChevronRight size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#1B3A2D] mb-6">Your Details</h2>
                <form onSubmit={handleSubmit(handleStep2Submit)} className="space-y-5">
                  <div>
                    <label className={labelClass}>
                      <User size={16} className="text-[#00B896]" />
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      placeholder="Your full name"
                      className={cn(inputClass, errors.name && 'border-red-300')}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Mail size={16} className="text-[#00B896]" />
                      Email Address *
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      placeholder="your@email.com"
                      className={cn(inputClass, errors.email && 'border-red-300')}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Phone size={16} className="text-[#00B896]" />
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      placeholder="+1 (876) 000-0000"
                      className={cn(inputClass, errors.phone && 'border-red-300')}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FileText size={16} className="text-[#00B896]" />
                      Special Requests
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      {...register('special_requests')}
                      rows={3}
                      placeholder="Any dietary requirements, accessibility needs, or special requests..."
                      className={cn(inputClass, 'resize-none')}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3.5 rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-2 flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      Review & Pay
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && personalData && (
              <div className="space-y-5">
                {/* Booking Summary */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-[#1B3A2D] mb-5">Review Your Booking</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Tour</span>
                      <span className="font-medium text-[#1B3A2D]">{selectedTour?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium text-[#1B3A2D]">{date}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-medium text-[#1B3A2D]">{guests}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium text-[#1B3A2D]">{personalData.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-[#1B3A2D]">{personalData.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-[#1B3A2D]">{personalData.phone}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-700 font-bold text-base">Total Amount</span>
                      <span className="font-bold text-[#00B896] text-xl">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-[#1B3A2D] mb-2">Secure Payment</h2>
                  <p className="text-gray-500 text-sm mb-5">
                    Pay securely with PayPal. Your payment information is protected.
                  </p>

                  {paymentError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                      <AlertCircle size={18} className="text-red-500 shrink-0" />
                      <p className="text-red-600 text-xs">{paymentError}</p>
                    </div>
                  )}

                  {isCreatingBooking ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
                      <span className="ml-3 text-gray-600 text-sm">Confirming your booking...</span>
                    </div>
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                        currency: 'USD',
                      }}
                    >
                      <PayPalButton
                        amount={totalAmount.toFixed(2)}
                        onSuccess={handlePaymentSuccess}
                        onError={() => setPaymentError('Payment failed. Please try again.')}
                      />
                    </PayPalScriptProvider>
                  )}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Back to Details
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-[#1B3A2D] mb-4">Booking Summary</h3>
              {selectedTour ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Tour</p>
                    <p className="font-medium text-[#1B3A2D]">{selectedTour.name}</p>
                  </div>
                  {date && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Date</p>
                      <p className="font-medium text-[#1B3A2D]">{date}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Guests</p>
                    <p className="font-medium text-[#1B3A2D]">{guests} person{guests > 1 ? 's' : ''}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>${selectedTour.price} × {guests}</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-[#1B3A2D]">
                      <span>Total</span>
                      <span className="text-[#00B896]">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Select a tour to see pricing</p>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Free cancellation (48h notice)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Confirmation email sent instantly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#F0F9F5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B896]" />
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  )
}
