import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Blue Hole Jamaica',
}

export default function PrivacyPage() {
  return (
    <div className="pt-16">
      <section className="bg-[#1B3A2D] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-300 mt-2 text-sm">Last updated: January 2024</p>
        </div>
      </section>

      <section className="py-12 bg-[#F0F9F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 prose prose-sm max-w-none">
            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 mb-5">
              We collect information you provide when booking tours or contacting us, including your name, email address, phone number, and travel details. We also collect payment information processed securely through PayPal.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-5">
              We use your information to process bookings, send confirmation emails, communicate about your tour, and improve our services. We never sell your personal information to third parties.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">3. Data Security</h2>
            <p className="text-gray-600 mb-5">
              We implement industry-standard security measures to protect your personal information. All payment processing is handled by PayPal and we do not store credit card information.
            </p>

            <h2 className="text-[#1B3A2D] font-bold text-lg mb-3">4. Contact Us</h2>
            <p className="text-gray-600 mb-5">
              If you have questions about this Privacy Policy, please contact us at info@blueholejamaica.com or +1 (876) 723-4567.
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
