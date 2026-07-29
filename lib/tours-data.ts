import { Tour } from '@/types'

export const TOURS: Tour[] = [
  {
    id: '1',
    name: 'Blue Hole',
    slug: 'blue-hole',
    description: 'Swim, jump and explore the iconic Blue Hole in St. Ann. Surrounded by lush tropical forest, this natural swimming hole is one of Jamaica\'s hidden gems. Enjoy cliff jumping, rope swings, and crystal-clear fresh water.',
    duration: '3-4 Hours',
    price: 85,
    category: 'day_tour',
    images: [
      '/images/tours/blue-hole.jpg',
      '/images/tours/dunns-river.jpg',
      '/images/tours/custom-tours.jpg',
    ],
    highlights: [
      'Guided nature walk through tropical forest',
      'Cliff jumping and rope swings',
      'Natural fresh water swimming',
      'Stunning waterfall scenery',
      'Local guide with safety briefing',
      'Refreshments included',
    ],
    available: true,
  },
  {
    id: '2',
    name: "Wabba's Weed Adventure",
    slug: 'wabbas-weed-adventure',
    description: 'An exciting river adventure on the Martha Brae River. Float through lush jungle terrain on bamboo rafts guided by expert local rafters. Experience the magic of Jamaica\'s river culture.',
    duration: '2-3 Hours',
    price: 65,
    category: 'day_tour',
    images: [
      '/images/tours/wabbas-adventure.jpg',
      '/images/tours/blue-hole.jpg',
      '/images/tours/custom-tours.jpg',
    ],
    highlights: [
      'Bamboo raft river tour',
      'Expert local rafter guide',
      'Scenic jungle waterway',
      'Wildlife sightings',
      'Photo opportunities throughout',
      'Authentic Jamaican river experience',
    ],
    available: true,
  },
  {
    id: '3',
    name: "Dunn's River Falls",
    slug: 'dunns-river-falls',
    description: "Climb the world-famous Dunn's River Falls in Ocho Rios. This iconic terraced waterfall stretches over 600 feet and is one of Jamaica's most popular attractions. A guided group climb makes it safe and fun for all fitness levels.",
    duration: '3-5 Hours',
    price: 75,
    category: 'day_tour',
    images: [
      '/images/tours/dunns-river.jpg',
      '/images/tours/wabbas-adventure.jpg',
      '/images/tours/blue-hole.jpg',
    ],
    highlights: [
      'Guided waterfall climb',
      'Over 600 feet of terraced falls',
      'Beach access at base',
      'Professional photography available',
      'Gift shops and dining nearby',
      'Suitable for all fitness levels',
    ],
    available: true,
  },
  {
    id: '4',
    name: 'Custom Day Tours',
    slug: 'custom-day-tours',
    description: 'Create your perfect day. You choose the places, we handle the rest. Our knowledgeable local drivers will take you anywhere in Jamaica — from hidden beaches to mountain villages to cultural landmarks.',
    duration: 'Flexible',
    price: 120,
    category: 'day_tour',
    images: [
      '/images/tours/custom-tours.jpg',
      '/images/tours/blue-hole.jpg',
      '/images/tours/wabbas-adventure.jpg',
    ],
    highlights: [
      'Fully customizable itinerary',
      'Expert local driver/guide',
      'Comfortable air-conditioned vehicle',
      'Multiple stops included',
      'Restaurant recommendations',
      'Flexible pickup times',
    ],
    available: true,
  },
  {
    id: '5',
    name: 'Airport Pickup',
    slug: 'airport-pickup',
    description: 'Reliable, comfortable airport pickup service anywhere in Jamaica. Start your vacation stress-free with a professional driver waiting for you at arrivals. We monitor your flight and adjust for any delays.',
    duration: 'As needed',
    price: 50,
    category: 'airport_transfer',
    images: [
      '/images/tours/airport.jpg',
      '/images/tours/custom-tours.jpg',
    ],
    highlights: [
      'Meet & greet at arrivals',
      'Flight monitoring service',
      'Air-conditioned vehicle',
      'Professional licensed driver',
      'Bottled water provided',
      'Door-to-door service',
    ],
    available: true,
  },
  {
    id: '6',
    name: 'Airport Drop-Off',
    slug: 'airport-dropoff',
    description: "Stress-free airport drop-off so you never miss a flight. Our punctual drivers will ensure you arrive at the airport with plenty of time. End your Jamaica vacation as smoothly as it began.",
    duration: 'As needed',
    price: 50,
    category: 'airport_transfer',
    images: [
      '/images/tours/airport.jpg',
      '/images/tours/custom-tours.jpg',
    ],
    highlights: [
      'Punctual pickup from hotel',
      'Real-time traffic monitoring',
      'Assistance with luggage',
      'Air-conditioned comfort',
      'Professional licensed driver',
      'Fixed price — no surprises',
    ],
    available: true,
  },
  {
    id: '7',
    name: 'Blue Hole Overnight Stay',
    slug: 'blue-hole-overnight',
    description: 'Spend a magical night at the Blue Hole Resort surrounded by nature. Wake up to birdsong, enjoy private access to the Blue Hole, and experience Jamaica\'s natural beauty at your own pace.',
    duration: '1-3 Nights',
    price: 200,
    category: 'overnight',
    images: [
      '/images/tours/overnight.jpg',
      '/images/tours/blue-hole.jpg',
      '/images/tours/wabbas-adventure.jpg',
    ],
    highlights: [
      'Private resort accommodation',
      'Exclusive Blue Hole access',
      'Breakfast included',
      'Evening bonfire and entertainment',
      'Nature trail walks',
      'Airport transfers available',
    ],
    available: true,
  },
]

export function getTourBySlug(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug)
}

export function getToursByCategory(category: string): Tour[] {
  if (category === 'all') return TOURS
  return TOURS.filter((t) => t.category === category)
}
