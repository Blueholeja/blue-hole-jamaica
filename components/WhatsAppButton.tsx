import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '18767234567'

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27m%20interested%20in%20booking%20a%20tour%20with%20Blue%20Hole%20Jamaica!`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
    >
      <MessageCircle size={28} fill="white" strokeWidth={1.5} />
    </a>
  )
}
