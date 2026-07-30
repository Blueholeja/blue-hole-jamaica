'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="fixed top-6 right-6 print:hidden flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition-colors"
    >
      <Printer size={18} />
      Print / Save as PDF
    </button>
  )
}
