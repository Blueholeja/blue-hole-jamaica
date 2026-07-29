'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/excursions', label: 'Excursions' },
  { href: '/attractions', label: 'Services' },
  { href: '/about', label: 'About Us' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <header
      style={{ viewTransitionName: 'site-header' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-[#1B3A2D]',
        scrolled ? 'shadow-lg' : ''
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M18 2C18 2 6 12 6 21C6 27.627 11.373 33 18 33C24.627 33 30 27.627 30 21C30 12 18 2 18 2Z"
                fill="#00B896"
              />
              <path
                d="M18 10C18 10 11 17 11 22C11 25.866 14.134 29 18 29C21.866 29 25 25.866 25 22C25 17 18 10 18 10Z"
                fill="#1B3A2D"
              />
              <circle cx="18" cy="22" r="4" fill="#00B896" opacity="0.7" />
            </svg>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm leading-tight">Blue Hole</span>
              <span className="text-[#00B896] text-xs leading-tight">Jamaica</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-200 hover:text-[#00B896] px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00B896] hover:text-white transition-colors duration-150"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle size={22} />
            </a>
            <Link
              href="/book"
              className="bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors duration-150"
            >
              Reserve Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-white/10 py-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-200 hover:text-[#00B896] hover:bg-white/5 px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 px-3">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#00B896] hover:text-white transition-colors text-sm"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
                <Link
                  href="/book"
                  className="bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors duration-150 ml-auto"
                  onClick={() => setIsOpen(false)}
                >
                  Reserve Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
