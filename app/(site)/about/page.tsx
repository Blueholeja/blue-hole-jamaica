import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Star, Users, Map, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Blue Hole Jamaica',
  description: 'Learn about Blue Hole Jamaica — our story, mission, and the passionate team behind your perfect Jamaican adventure.',
}

const STATS = [
  { value: '500+', label: 'Happy Travelers', icon: <Users className="w-6 h-6 text-[#00B896]" /> },
  { value: '50+', label: 'Destinations', icon: <Map className="w-6 h-6 text-[#00B896]" /> },
  { value: '5', label: 'Years Experience', icon: <Clock className="w-6 h-6 text-[#00B896]" /> },
  { value: '4.9', label: 'Star Rating', icon: <Star className="w-6 h-6 text-[#00B896]" /> },
]

const TEAM = [
  {
    name: 'Devon Campbell',
    role: 'Founder & Lead Guide',
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&q=80',
    bio: 'Born and raised in Ocho Rios, Devon has over 10 years of experience guiding tourists through Jamaica\'s most spectacular landscapes.',
  },
  {
    name: 'Keisha Brown',
    role: 'Customer Experience Manager',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
    bio: 'Keisha ensures every guest receives world-class service from the moment they inquire to long after their tour ends.',
  },
  {
    name: 'Marcus Reid',
    role: 'Senior Driver & Guide',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80',
    bio: 'With a decade of safe driving and local knowledge, Marcus makes every transfer and tour seamless and enjoyable.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="relative py-20 sm:py-28 bg-[#1B3A2D] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/why-us-bg.jpg"
            alt="Jamaica background"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">About Blue Hole Jamaica</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            We are passionate Jamaicans dedicated to sharing the authentic beauty of our island with the world.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#F0F9F5] py-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-[#1B3A2D] mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">Our Mission</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3A2D] mb-6">
                Creating Authentic Jamaican Experiences
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed">
                Blue Hole Jamaica was founded with a simple but powerful mission: to share the real Jamaica with visitors from around the world. We believe tourism should benefit local communities, preserve natural beauty, and create genuine connections between travelers and our island home.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Every tour we operate is designed to go beyond the typical tourist experience. We take you to places with deep cultural significance, hidden natural wonders, and authentic local flavor that you simply cannot find in a guidebook.
              </p>
              <div className="space-y-3">
                {[
                  'Locally owned and operated since 2019',
                  'All guides are certified and licensed',
                  'Committed to sustainable tourism practices',
                  'Trusted by travelers from 30+ countries',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#00B896] shrink-0" />
                    <span className="text-gray-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden">
                <Image
                  src="/images/tours/blue-hole.jpg"
                  alt="Jamaica tropical scenery"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-[#F0F9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">Our Values</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3A2D] mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              These are the principles that guide everything we do at Blue Hole Jamaica.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Safety First',
                description: 'Every driver is licensed and insured. Every vehicle is regularly inspected and maintained. Your safety is never compromised.',
              },
              {
                title: 'Authentic Experiences',
                description: "We show you the real Jamaica — the hidden gems, the local food, the cultural stories — not just the tourist highlights.",
              },
              {
                title: 'Community Impact',
                description: "By choosing us, you support local families, local businesses, and conservation efforts that protect Jamaica's natural beauty.",
              },
              {
                title: 'Reliability',
                description: "We monitor flights, track traffic, and communicate proactively. When you're with us, you're never left waiting or wondering.",
              },
              {
                title: 'Personal Service',
                description: "We treat every guest as an individual, not a group number. Your preferences, comfort, and enjoyment are our priority.",
              },
              {
                title: 'Value for Money',
                description: "We offer competitive pricing without cutting corners. Great experiences don't have to cost a fortune.",
              },
            ].map((val) => (
              <div key={val.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#F0F9F5] rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle size={20} className="text-[#00B896]" />
                </div>
                <h3 className="font-bold text-[#1B3A2D] text-lg mb-2">{val.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">Our People</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3A2D] mb-4">Meet the Team</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Passionate Jamaicans who love sharing their island and creating memorable experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <h3 className="font-bold text-[#1B3A2D] text-lg mb-1">{member.name}</h3>
                <p className="text-[#00B896] text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#1B3A2D]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore With Us?</h2>
          <p className="text-gray-300 mb-7">
            Join hundreds of satisfied travelers who have experienced Jamaica at its finest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              Book a Tour
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
