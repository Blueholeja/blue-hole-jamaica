export interface Tour {
  id: string
  name: string
  slug: string
  description: string
  duration: string
  price: number
  category: 'airport_transfer' | 'day_tour' | 'overnight'
  images: string[]
  highlights: string[]
  available: boolean
  created_at?: string
}

export interface Booking {
  id: string
  tour_id: string
  customer_name: string
  email: string
  phone?: string
  date: string
  guests: number
  special_requests?: string
  decline_reason?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_id?: string
  total_amount: number
  created_at: string
  tour?: Tour
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status: 'unread' | 'read' | 'responded'
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  message: string
  avatar?: string
}
