// app/api/webhook/route.js
// Handles Stripe webhook events — upgrades user tier after payment
// Set STRIPE_WEBHOOK_SECRET in .env.local

export const dynamic = 'force-dynamic'

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ received: true, demo: true })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      return Response.json({ error: 'Webhook signature failed' }, { status: 400 })
    }

    // Handle successful subscription
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, plan } = session.metadata || {}

      // In production: update your database here
      // For localStorage-based auth, the client handles it via URL params
      console.log(`[Webhook] User ${userId} upgraded to ${plan}`)
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      console.log(`[Webhook] Subscription cancelled: ${sub.id}`)
      // In production: downgrade user in database
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
