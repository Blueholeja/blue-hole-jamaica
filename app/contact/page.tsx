'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>()

  async function onSubmit(data: ContactFormData) {
    setStatus('loading')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent transition-all'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#1B3A2D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B896] text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg">
            Have a question or ready to plan your Jamaica adventure? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#F0F9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-[#1B3A2D] mb-6">Send Us a Message</h2>

              {status === 'success' && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                  <CheckCircle size={20} className="text-green-600 shrink-0" />
                  <p className="text-green-700 text-sm">
                    Message sent! We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-sm">
                    Something went wrong. Please try again or contact us on WhatsApp.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      placeholder="Your name"
                      className={cn(inputClass, errors.name && 'border-red-300 focus:ring-red-400')}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      placeholder="your@email.com"
                      className={cn(inputClass, errors.email && 'border-red-300 focus:ring-red-400')}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="+1 (876) 000-0000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Subject *</label>
                    <select
                      {...register('subject', { required: 'Please select a subject' })}
                      className={cn(inputClass, errors.subject && 'border-red-300 focus:ring-red-400')}
                    >
                      <option value="">Select a subject...</option>
                      <option value="booking">Tour Booking</option>
                      <option value="airport_transfer">Airport Transfer</option>
                      <option value="custom_tour">Custom Tour</option>
                      <option value="group_booking">Group Booking</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                    </select>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea
                    {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message must be at least 10 characters' } })}
                    rows={5}
                    placeholder="Tell us about your trip plans, questions, or how we can help..."
                    className={cn(inputClass, 'resize-none', errors.message && 'border-red-300 focus:ring-red-400')}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#00B896] hover:bg-[#009B7F] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors duration-200"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Phone size={22} className="text-[#00B896]" />,
                    title: 'Phone',
                    content: '+1 (876) 723-4567',
                    href: 'tel:+18767234567',
                  },
                  {
                    icon: <Mail size={22} className="text-[#00B896]" />,
                    title: 'Email',
                    content: 'info@blueholejamaica.com',
                    href: 'mailto:info@blueholejamaica.com',
                  },
                  {
                    icon: <MapPin size={22} className="text-[#00B896]" />,
                    title: 'Location',
                    content: 'Ocho Rios, St. Ann, Jamaica',
                    href: null,
                  },
                  {
                    icon: <Clock size={22} className="text-[#00B896]" />,
                    title: 'Hours',
                    content: 'Mon–Sun: 7:00 AM – 8:00 PM',
                    href: null,
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="bg-[#F0F9F5] rounded-xl p-2.5 w-fit mb-3">{item.icon}</div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="text-[#1B3A2D] font-medium text-sm hover:text-[#00B896] transition-colors">
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-[#1B3A2D] font-medium text-sm">{item.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-[#1B3A2D] rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={28} fill="white" className="text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Chat on WhatsApp</h3>
                <p className="text-gray-300 text-sm mb-5">
                  Prefer to chat? Message us on WhatsApp for the fastest response. We&apos;re usually online within minutes.
                </p>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi%20Blue%20Hole%20Jamaica!%20I%27d%20like%20to%20inquire%20about%20your%20tours.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  <MessageCircle size={18} />
                  Open WhatsApp Chat
                </a>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MapPin size={32} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Ocho Rios, St. Ann, Jamaica</p>
                    <a
                      href="https://maps.google.com/?q=Ocho+Rios+Jamaica"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00B896] text-xs hover:underline mt-1 block"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
