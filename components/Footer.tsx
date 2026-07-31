import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <footer className="bg-[#1B3A2D] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo dark height={34} />
              <p className="text-[#00B896] text-xs leading-tight mt-2">Explore. Experience. Enjoy.</p>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Safe travels. Unforgettable memories. The best of Jamaica awaits you.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="bg-white/10 hover:bg-[#00B896] p-2 rounded-full transition-colors duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="bg-white/10 hover:bg-[#00B896] p-2 rounded-full transition-colors duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="bg-white/10 hover:bg-[#00B896] p-2 rounded-full transition-colors duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.97a8.17 8.17 0 004.79 1.53V7.07a4.85 4.85 0 01-1.02-.38z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="bg-white/10 hover:bg-[#00B896] p-2 rounded-full transition-colors duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/attractions', label: 'Services' },
                { href: '/excursions', label: 'Excursions' },
                { href: '/about', label: 'About Us' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact' },
                { href: '/book', label: 'Book a Tour' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#00B896] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Attractions */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Top Attractions</h3>
            <ul className="space-y-2">
              {[
                { href: '/attractions/blue-hole', label: 'Blue Hole' },
                { href: '/attractions/dunns-river-falls', label: "Dunn's River Falls" },
                { href: '/attractions/wabbas-weed-adventure', label: "Wabba's Weed Adventure" },
                { href: '/attractions/custom-attractions', label: 'Custom Attractions' },
                { href: '/attractions/airport-pickup', label: 'Airport Pickup' },
                { href: '/attractions/blue-hole-overnight', label: 'Overnight Stays' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#00B896] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Contact Us</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[#00B896] mt-0.5 shrink-0" />
                <a href="tel:+18767234567" className="text-sm text-gray-400 hover:text-[#00B896] transition-colors">
                  +1 (876) 723-4567
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#00B896] mt-0.5 shrink-0" />
                <a href="mailto:info@blueholejamaica.com" className="text-sm text-gray-400 hover:text-[#00B896] transition-colors">
                  info@blueholejamaica.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#00B896] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Ocho Rios, St. Ann, Jamaica</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-[#00B896] mt-0.5 shrink-0" />
                <div className="text-sm text-gray-400">
                  <p className="font-medium text-white">Business Hours</p>
                  <p>Mon – Sun: 7:00 AM – 8:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            &copy; 2024 Blue Hole Jamaica. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#00B896] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#00B896] transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

        {/* Photo Credits */}
        <p className="mt-4 text-xs text-gray-600 text-center sm:text-left">
          Photo credits:{' '}
          <a href="https://commons.wikimedia.org/wiki/File:Divers_at_Ricks_Cafe_in_Negril_-_panoramio.jpg" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 underline">
            Alfred Moya
          </a>{' '}
          (CC BY 3.0),{' '}
          <a href="https://commons.wikimedia.org/wiki/File:Black_River_%E2%80%93_Boot_mit_Safari-G%C3%A4sten_auf_dem_Black_River_(1998).jpg" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 underline">
            ingostrutz/Letterix
          </a>{' '}
          (CC BY-SA 3.0), and{' '}
          <a href="https://commons.wikimedia.org/wiki/File:Hope_Road_Jamaika2.jpg" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 underline">
            Hitachi-Hu
          </a>{' '}
          (CC BY-SA 4.0) via Wikimedia Commons.
        </p>
      </div>
    </footer>
  )
}
