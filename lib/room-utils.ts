export type RoomType = 'single' | 'double'
export type RoomPackage = 'room_only' | 'breakfast' | 'breakfast_dinner'

export interface RoomPricingRow {
  id: string
  room_type: RoomType
  package: RoomPackage
  label: string
  price_per_night: number
}

/** Static fallback, mirrors the TOURS fallback pattern in lib/tours-data.ts /
 * app/api/tours/route.ts — used if Supabase is briefly unavailable. */
export const ROOM_PRICING: RoomPricingRow[] = [
  { id: 'single_room_only', room_type: 'single', package: 'room_only', label: 'Room Only', price_per_night: 125 },
  { id: 'single_breakfast', room_type: 'single', package: 'breakfast', label: 'Room + Breakfast', price_per_night: 150 },
  { id: 'single_breakfast_dinner', room_type: 'single', package: 'breakfast_dinner', label: 'Room + Breakfast + Dinner', price_per_night: 180 },
  { id: 'double_breakfast', room_type: 'double', package: 'breakfast', label: 'Room + Breakfast', price_per_night: 170 },
  { id: 'double_breakfast_dinner', room_type: 'double', package: 'breakfast_dinner', label: 'Room + Breakfast + Dinner', price_per_night: 200 },
]

export const ROOM_CAPACITY: Record<RoomType, number> = { single: 8, double: 2 }

export const ROOM_TYPE_LABELS: Record<RoomType, string> = { single: 'Single Room', double: 'Double Room' }

export const PACKAGE_LABELS: Record<RoomPackage, string> = {
  room_only: 'Room Only',
  breakfast: 'Room + Breakfast',
  breakfast_dinner: 'Room + Breakfast + Dinner',
}

export function computeNights(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

export function findPricing(pricing: RoomPricingRow[], roomType: RoomType, pkg: RoomPackage): RoomPricingRow | undefined {
  return pricing.find((p) => p.room_type === roomType && p.package === pkg)
}

export const ROOM_BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed'] as const
export type RoomBookingStatus = (typeof ROOM_BOOKING_STATUSES)[number]

export type StayPhase = 'upcoming' | 'current' | 'completed' | 'cancelled'

export const STAY_PHASE_LABELS: Record<StayPhase, string> = {
  upcoming: 'Upcoming',
  current: 'Current',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const STAY_PHASE_COLORS: Record<StayPhase, string> = {
  upcoming: 'bg-yellow-100 text-yellow-700',
  current: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

export interface RoomBookingLike {
  status: string
  check_in: string
  check_out: string
  checked_out: boolean
}

/** Date-relative phase for the admin filter, layered on top of the stored
 * `status` — mirrors how the rest of the admin panel derives display state
 * from a mix of stored fields and computed date logic. */
export function getStayPhase(booking: RoomBookingLike): StayPhase {
  if (booking.status === 'cancelled') return 'cancelled'
  if (booking.status === 'completed' || booking.checked_out) return 'completed'

  const today = new Date().toISOString().slice(0, 10)
  if (booking.check_in > today) return 'upcoming'
  if (booking.check_out <= today) return 'completed'
  return 'current'
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Unpaid',
  deposit_paid: 'Deposit Paid',
  paid_in_full: 'Paid in Full',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-gray-100 text-gray-500',
  deposit_paid: 'bg-yellow-50 text-yellow-700',
  paid_in_full: 'bg-green-50 text-green-700',
  refunded: 'bg-orange-50 text-orange-700',
}
