export const RESERVATION_STATUSES = ['pending', 'confirmed', 'declined', 'completed'] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

export interface Reservation {
  id: string
  tour_id: string
  customer_name: string
  email: string
  phone: string
  date: string
  guests: number
  total_amount: number
  status: string
  payment_status: string
  special_requests: string
  decline_reason?: string
  created_at: string
  tours?: { name: string; slug?: string; price?: number } | null
}

/**
 * Best-effort extraction of pickup/destination from the free-text special_requests
 * field, since booking details vary by service type (Charter, Round Trip, Airport
 * Pickup/Drop-off, Custom Attractions, or a fixed-location excursion).
 */
export function parseReservationRoute(reservation: Reservation): { pickup: string; destination: string } {
  const text = reservation.special_requests || ''
  const tourName = reservation.tours?.name
  const tourSlug = reservation.tours?.slug

  let pickup = ''
  let destination = ''

  const destinationMatch = text.match(/Destination:\s*(.+)/i)
  if (destinationMatch) destination = destinationMatch[1].trim()

  const accommodationMatch = text.match(/Accommodation:\s*(.+)/i)
  if (accommodationMatch) pickup = accommodationMatch[1].trim()

  const dropoffAddressMatch = text.match(/Drop-off Address:\s*(.+)/i)
  if (dropoffAddressMatch) destination = dropoffAddressMatch[1].trim()

  const pickupAddressMatch = text.match(/Pickup Address:\s*(.+)/i)
  if (pickupAddressMatch) pickup = pickupAddressMatch[1].trim()

  const pickupLineMatch = text.match(/^Pickup:.*from\s+(.+)$/im)
  if (pickupLineMatch) pickup = pickupLineMatch[1].trim()

  const dropoffLineMatch = text.match(/^Drop-off:\s*(.+)$/im)
  if (dropoffLineMatch) destination = dropoffLineMatch[1].trim()

  if (!pickup && (tourSlug === 'airport-pickup' || tourSlug === 'round-trip-transfers')) {
    pickup = 'Airport'
  }
  if (!destination && tourSlug === 'airport-dropoff') {
    destination = 'Airport'
  }

  if (!pickup) pickup = '—'
  if (!destination) destination = tourName || '—'

  return { pickup, destination }
}

/** Extracts "Flight #" style references from special_requests, if present. */
export function parseFlightInfo(reservation: Reservation): string | null {
  const text = reservation.special_requests || ''
  const matches = [...text.matchAll(/Flight\s+([A-Za-z0-9]+)/gi)].map((m) => m[1])
  if (matches.length === 0) return null
  return matches.join(' / ')
}

/** Slugs shown under the site's "Services" tab (transport, not excursions). */
export const SERVICE_SLUGS = ['airport-pickup', 'airport-dropoff', 'round-trip-transfers', 'charter']

export type ReservationCategory = 'Service' | 'Excursion'

/** Separates transport Services (Airport Pickup/Drop-off, Round Trip, Charter) from Excursions. */
export function getReservationCategory(reservation: Reservation): ReservationCategory {
  const slug = reservation.tours?.slug
  return slug && SERVICE_SLUGS.includes(slug) ? 'Service' : 'Excursion'
}

export const CATEGORY_COLORS: Record<ReservationCategory, string> = {
  Service: 'bg-purple-100 text-purple-700',
  Excursion: 'bg-teal-100 text-teal-700',
}
