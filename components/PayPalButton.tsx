'use client'

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'

interface PayPalButtonProps {
  amount: string
  onSuccess: (orderId: string) => void
  onError?: (error: unknown) => void
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer()

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B896]" />
      </div>
    )
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
      }}
      createOrder={async () => {
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create order')
        return data.orderId
      }}
      onApprove={async (data) => {
        const res = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderID }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to capture payment')
        onSuccess(data.orderID)
      }}
      onError={(err) => {
        console.error('PayPal error:', err)
        onError?.(err)
      }}
    />
  )
}
