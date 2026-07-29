import Link from 'next/link'
import { CheckCircle, MessageCircle, Phone, Mail, Calendar, ArrowRight } from 'lucide-react'

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Success Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3A2D] mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 mb-5 text-base">
            Thank you for booking with Blue Hole Jamaica. Your adventure awaits!
          </p>
          <div className="bg-[#F0F9F5] rounded-xl px-5 py-3 inline-block mb-6">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Booking Reference</p>
            <p className="font-mono font-bold text-[#1B3A2D] text-lg">{id.slice(0, 8).toUpperCase()}</p>
          </div>
          <p className="text-gray-500 text-sm">
            A confirmation email has been sent to you with all the details of your booking.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-[#1B3A2D] mb-5">What Happens Next</h2>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Check your email',
                description: 'We\'ve sent a booking confirmation with all the details to your email address.',
              },
              {
                step: '2',
                title: 'Our team will confirm',
                description: 'Within 2-4 hours, our team will send you a final confirmation and your guide\'s contact details.',
              },
              {
                step: '3',
                title: "We'll be in touch",
                description: 'Your driver/guide will contact you the day before to confirm pickup time and location.',
              },
              {
                step: '4',
                title: 'Enjoy your adventure!',
                description: "Show up ready to explore. We'll take care of everything else.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 bg-[#00B896] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B3A2D] text-sm mb-0.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-[#1B3A2D] rounded-2xl p-6 sm:p-8 text-white mb-6">
          <h2 className="text-lg font-bold mb-4">Need Help or Have Questions?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi!%20My%20booking%20reference%20is%20${id.slice(0, 8).toUpperCase()}.%20I%20have%20a%20question.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] px-4 py-3 rounded-xl transition-colors text-sm font-medium"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a
              href="tel:+18767234567"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors text-sm font-medium"
            >
              <Phone size={18} />
              Call Us
            </a>
            <a
              href="mailto:info@blueholejamaica.com"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors text-sm font-medium"
            >
              <Mail size={18} />
              Email Us
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 text-center bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/attractions"
            className="flex-1 text-center border border-[#1B3A2D] text-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Browse More Tours
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
