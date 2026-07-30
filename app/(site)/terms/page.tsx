import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Blue Hole Jamaica',
}

export default function TermsPage() {
  return (
    <div className="pt-16">
      <section className="bg-[#1B3A2D] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white">Terms &amp; Conditions</h1>
          <p className="text-gray-300 mt-2 text-sm">Last updated: January 2024</p>
        </div>
      </section>

      <section className="py-12 bg-[#F0F9F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">1. Booking & Payments</h2>
            <p className="text-gray-600 mb-5">
              All bookings require payment in full at time of reservation unless otherwise agreed. Prices are in USD and include all applicable taxes.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">2. Cancellation Policy</h2>
            <p className="text-gray-600 mb-5">
              Cancellations made 48+ hours before the tour date receive a full refund. Cancellations within 48 hours are subject to a 50% cancellation fee. No-shows are charged the full amount.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">3. Our Responsibilities</h2>
            <p className="text-gray-600 mb-5">
              Blue Hole Jamaica will provide professional drivers, safe vehicles, and knowledgeable guides as described. We are not responsible for delays caused by weather, traffic, or other circumstances beyond our control.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">4. Safety</h2>
            <p className="text-gray-600 mb-5">
              Guests must follow all safety instructions from guides. Blue Hole Jamaica reserves the right to refuse service or modify tours for safety reasons. Participation in adventure activities is at guests&apos; own risk.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">5. Contact</h2>
            <p className="text-gray-600 mb-5">
              For questions about these terms, contact us at info@blueholejamaica.com.
            </p>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-[#00B896] hover:underline text-sm">
              Return to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
