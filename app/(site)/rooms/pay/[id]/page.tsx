'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import PayPalButton from '@/components/PayPalButton'
import { ROOM_TYPE_LABELS, PACKAGE_LABELS, type RoomType, type RoomPackage } from '@/lib/room-utils'

interface PayInfo {
  id: string
  guest_name: string
  check_in: string
  check_out: string
  nights: number
  room_type: RoomType
  package: RoomPackage
  total_amount: number
  deposit_amount: number
  status: string
  payment_status: string
  rooms?: { room_number: string } | null
}

export default function RoomPayPage() {
  const params = useParams<{ id: string }>()
  const [booking, setBooking] = useState<PayInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [paidJustNow, setPaidJustNow] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/room-bookings/${params.id}/pay-info`)
        if (!res.ok) {
          setNotFound(true)
          return
        }
        setBooking(await res.json())
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [params.id])

  async function handlePaymentSuccess(orderId: string) {
    try {
      const res = await fetch(`/api/room-bookings/${params.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: orderId }),
      })
      if (!res.ok) throw new Error()
      setPaidJustNow(true)
    } catch {
      setPaymentError('Payment was received but we couldn\'t update your booking. Please contact us with your payment ID: ' + orderId)
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#F0F9F5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B896]" />
      </div>
    )
  }

  if (notFound || !booking) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#F0F9F5] px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <XCircle size={40} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#1B3A2D] mb-2">Booking Not Found</h1>
          <p className="text-gray-500 text-sm">
            We couldn&apos;t find a room booking matching this link. Double-check the link from your email, or contact us if you need help.
          </p>
        </div>
      </div>
    )
  }

  const isPaid = paidJustNow || booking.payment_status !== 'unpaid'
  const balanceDue = booking.total_amount - booking.deposit_amount

  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {isPaid ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B3A2D] mb-3">Deposit Received!</h1>
            <p className="text-gray-500 text-sm mb-4">
              Thank you, {booking.guest_name}. Your {ROOM_TYPE_LABELS[booking.room_type]} is booked for{' '}
              {booking.check_in} to {booking.check_out}.
            </p>
            <p className="text-gray-400 text-xs">
              Balance due on arrival: <span className="font-semibold text-[#1B3A2D]">${balanceDue.toFixed(2)}</span>
            </p>
          </div>
        ) : booking.status === 'cancelled' ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center">
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#1B3A2D] mb-2">Booking Cancelled</h1>
            <p className="text-gray-500 text-sm">This booking has been cancelled. No payment is needed.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-5">
              <h1 className="text-xl font-bold text-[#1B3A2D] mb-1">Complete Your Deposit</h1>
              <p className="text-gray-500 text-sm mb-5">Pay 50% now to confirm your room — the rest is due on arrival.</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Room</span>
                  <span className="font-medium text-[#1B3A2D]">{ROOM_TYPE_LABELS[booking.room_type]}{booking.rooms?.room_number ? ` (${booking.rooms.room_number})` : ''}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Package</span>
                  <span className="font-medium text-[#1B3A2D]">{PACKAGE_LABELS[booking.package]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-medium text-[#1B3A2D]">{booking.check_in}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-medium text-[#1B3A2D]">{booking.check_out}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-medium text-[#1B3A2D]">${booking.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-700 font-bold text-base">Deposit Due Now</span>
                  <span className="font-bold text-[#00B896] text-xl">${booking.deposit_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1B3A2D] mb-2">Secure Payment</h2>
              <p className="text-gray-500 text-sm mb-5">Pay securely with PayPal.</p>

              {paymentError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-xs">{paymentError}</p>
                </div>
              )}

              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                  currency: 'USD',
                }}
              >
                <PayPalButton
                  amount={booking.deposit_amount.toFixed(2)}
                  onSuccess={handlePaymentSuccess}
                  onError={() => setPaymentError('Payment failed. Please try again.')}
                />
              </PayPalScriptProvider>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
