import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RoomBooking from '@/components/RoomBooking'

export const metadata: Metadata = {
  title: 'Book a Room | Blue Hole Jamaica',
  description: 'Reserve a Single or Double room at Blue Hole Jamaica with a 50% deposit — settle the balance on arrival.',
}

export default function BookRoomPage() {
  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00B896] transition-colors text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Back to Rooms
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3A2D] mb-1">Book Your Stay</h1>
        <p className="text-gray-500 text-sm mb-8">Pay a 50% deposit now, settle the rest when you arrive.</p>
        <RoomBooking />
      </div>
    </div>
  )
}
