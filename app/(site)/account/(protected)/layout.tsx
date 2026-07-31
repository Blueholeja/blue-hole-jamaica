import { redirect } from 'next/navigation'
import { getCurrentCustomer } from '@/lib/customer-auth'
import AccountNav from '@/components/AccountNav'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentCustomer()
  if (!session) {
    redirect('/account/login')
  }

  return (
    <div className="pt-16 min-h-screen bg-[#F0F9F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <AccountNav />
        {children}
      </div>
    </div>
  )
}
