import { NextRequest } from 'next/server'

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
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
    const { orderId } = await request.json()

    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()

    const res = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to capture PayPal payment')

    const captureId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId

    return Response.json({
      success: true,
      orderId,
      captureId,
      status: data.status,
    })
  } catch (error) {
    console.error('PayPal capture-order error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to capture payment' },
      { status: 500 }
    )
  }
}
