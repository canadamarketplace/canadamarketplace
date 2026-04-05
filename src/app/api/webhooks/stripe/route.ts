import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature") || ""

    let event: Stripe.Event

    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
      } catch (err: any) {
        console.error("Stripe webhook signature verification failed:", err.message)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    } else {
      // Dev mode: parse without verification
      event = JSON.parse(body) as Stripe.Event
    }

    // Handle events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        if (paymentIntent.metadata?.orderId) {
          await db.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: {
              paymentStatus: "PAID",
              paidAt: new Date(),
              paymentIntentId: paymentIntent.id,
            },
          })
          console.log(`Order ${paymentIntent.metadata.orderId} marked as PAID`)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        if (paymentIntent.metadata?.orderId) {
          await db.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: {
              paymentStatus: "FAILED",
              paymentIntentId: paymentIntent.id,
            },
          })
          console.log(`Order ${paymentIntent.metadata.orderId} marked as FAILED`)
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        if (charge.metadata?.orderId) {
          await db.order.update({
            where: { id: charge.metadata.orderId },
            data: {
              status: "REFUNDED",
              paymentStatus: "REFUNDED",
            },
          })
          console.log(`Order ${charge.metadata.orderId} marked as REFUNDED`)
        } else if (charge.payment_intent) {
          // Try to find order by paymentIntentId
          const order = await db.order.findFirst({
            where: { paymentIntentId: charge.payment_intent as string },
          })
          if (order) {
            await db.order.update({
              where: { id: order.id },
              data: {
                status: "REFUNDED",
                paymentStatus: "REFUNDED",
              },
            })
            console.log(`Order ${order.id} marked as REFUNDED`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
