// app/api/stripe/route.js
// Creates a Stripe Checkout session for plan upgrades
// Set STRIPE_SECRET_KEY in your .env.local

export const dynamic = 'force-dynamic'

const PLANS = {
  pro: {
    name: 'APEX Pro',
    price: 2900, // $29.00 in cents
    interval: 'month',
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
  expert: {
    name: 'APEX Expert',
    price: 9900, // $99.00 in cents
    interval: 'month',
    priceId: process.env.STRIPE_EXPERT_PRICE_ID || null,
  },
}

export async function POST(req) {
  try {
    const { plan, userEmail, userId } = await req.json()

    // If no Stripe key configured, return demo response
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({
        error: 'Stripe not configured',
        demo: true,
        message: 'Add STRIPE_SECRET_KEY to .env.local to enable payments',
      }, { status: 200 })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const planData = PLANS[plan]
    if (!planData) return Response.json({ error: 'Invalid plan' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      metadata: { userId, plan },
      line_items: [
        planData.priceId
          ? { price: planData.priceId, quantity: 1 }
          : {
              price_data: {
                currency: 'usd',
                recurring: { interval: planData.interval },
                product_data: { name: planData.name, description: `APEX ${plan.charAt(0).toUpperCase() + plan.slice(1)} — All features unlocked` },
                unit_amount: planData.price,
              },
              quantity: 1,
            },
      ],
      success_url: `${appUrl}?upgraded=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?cancelled=true`,
    })

    return Response.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('[Stripe] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
