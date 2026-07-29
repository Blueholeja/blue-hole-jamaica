'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MessageCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    question: 'How do I book a tour with Blue Hole Jamaica?',
    answer: "Booking is easy! You can book online through our website by clicking \"Reserve Now\" or \"Book Now\" on any tour page. Alternatively, you can contact us directly via WhatsApp at +1 (876) 723-4567 or email info@blueholejamaica.com and we'll set everything up for you.",
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'We offer free cancellation up to 48 hours before your tour date. Cancellations within 48 hours are subject to a 50% fee. No-shows or cancellations on the day of the tour are charged the full amount. We understand that travel plans change, so please contact us as early as possible.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards via PayPal (Visa, Mastercard, American Express), as well as PayPal balance. Cash payments in USD or Jamaican Dollars are also accepted for on-site bookings. A deposit may be required to secure your booking.',
  },
  {
    question: 'Are your drivers licensed and insured?',
    answer: 'Absolutely. All our drivers hold valid Jamaican commercial driving licenses and undergo thorough background checks. Our vehicles are fully insured, regularly serviced, and meet all safety standards required by Jamaican transportation authorities.',
  },
  {
    question: 'Do you offer airport pickup services?',
    answer: "Yes! We offer airport pickup and drop-off services from all major Jamaican airports including Sangster International Airport (MBJ) in Montego Bay and Norman Manley International Airport (KIN) in Kingston. We monitor your flight and will adjust if there are delays — no extra charge.",
  },
  {
    question: 'What should I bring on a day tour?',
    answer: 'We recommend bringing: a swimsuit and towel (for water activities), comfortable walking shoes, sunscreen and sunglasses, insect repellent, a change of clothes, water (though we provide bottled water), and your camera! For specific tours, we will send you a detailed packing list after booking.',
  },
  {
    question: 'Are your tours suitable for children and elderly guests?',
    answer: 'Many of our tours are family-friendly, but some have minimum age or fitness requirements (like cliff jumping at Blue Hole). We always recommend discussing your group\'s needs when booking so we can suggest the best options. Airport transfers and custom day tours are suitable for all ages.',
  },
  {
    question: 'How far in advance should I book?',
    answer: "We recommend booking at least 24-48 hours in advance to ensure availability, especially during peak season (December-April). Last-minute bookings may be possible — contact us on WhatsApp and we'll do our best to accommodate you.",
  },
  {
    question: 'Do you offer private tours?',
    answer: 'Yes! All our tours can be booked as private experiences for your group. Private tours offer more flexibility with timing, pace, and routes. Contact us for custom private tour pricing — rates vary based on group size and itinerary.',
  },
  {
    question: 'What happens if it rains during my tour?',
    answer: "Jamaica can experience brief tropical showers, especially in the afternoon. Most outdoor activities continue in light rain, as the waterfalls and rivers are just as beautiful! In the case of severe weather that makes an activity unsafe, we will reschedule or provide a full refund.",
  },
  {
    question: 'Do you provide hotel pickup and drop-off?',
    answer: "Yes, we offer hotel pickup and drop-off for all tours throughout the Ocho Rios area and beyond. Your driver will meet you at your hotel lobby at the agreed time. For transfers from/to airports, we cover hotels islandwide.",
  },
  {
    question: 'Can I customize my tour itinerary?',
    answer: "Absolutely! Our Custom Day Tours are completely flexible — you choose the destinations and we handle everything else. Even on our standard tours, we can often accommodate special requests. Just let us know what you have in mind when booking.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">
            Got Questions?
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Everything you need to know before booking your Jamaica adventure.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 sm:py-16 bg-[#F0F9F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className={cn(
                    'font-semibold text-base pr-4 transition-colors',
                    openIndex === idx ? 'text-[#00B896]' : 'text-[#1B3A2D]'
                  )}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={cn(
                      'text-gray-400 shrink-0 transition-transform duration-200',
                      openIndex === idx && 'rotate-180 text-[#00B896]'
                    )}
                  />
                </button>
                {openIndex === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-14 bg-[#1B3A2D]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-300 mb-7">
            Our friendly team is here to help. Reach out to us any time and we&apos;ll get back to you quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20"
            >
              Send us a Message
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
