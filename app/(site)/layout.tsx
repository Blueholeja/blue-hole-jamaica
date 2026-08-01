import { ViewTransition } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ChatWidget from '@/components/ChatWidget'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ViewTransition default="page-transition">{children}</ViewTransition>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  )
}
