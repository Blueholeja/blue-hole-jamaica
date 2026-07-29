import { NextRequest } from 'next/server'

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Failed to get PayPal token')
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()

    if (!amount || isNaN(parseFloat(amount))) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()

    const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: parseFloat(amount).toFixed(2),
            },
            description: 'Blue Hole Jamaica Tour Booking',
          },
        ],
        application_context: {
          brand_name: 'Blue Hole Jamaica',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to create PayPal order')

    return Response.json({ orderId: data.id })
  } catch (error) {
    console.error('PayPal create-order error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
