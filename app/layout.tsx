import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Blue Hole Jamaica | Discover Jamaica',
  description:
    'Explore Jamaica with Blue Hole Jamaica — airport transfers, day trips, overnight stays, and unforgettable adventures. Book your trip today.',
  keywords: 'Jamaica tours, Blue Hole Jamaica, Dunn\'s River Falls, airport transfers, day trips, Ocho Rios',
  openGraph: {
    title: 'Blue Hole Jamaica | Discover Jamaica',
    description: 'Explore. Experience. Enjoy. Discover Jamaica with our expert local guides.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
