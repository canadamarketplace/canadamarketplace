import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"
import { sendReviewReminder } from "@/lib/email"
import { emitNewNotification } from "@/lib/socket-emit"

/**
 * POST /api/reviews/reminder
 *
 * Admin or system endpoint to trigger review reminders for delivered orders.
 * Accepts either:
 *   - { orderId } — send reminder for a specific order
 *   - { daysAfterDelivery: 7 } — batch-process all eligible delivered orders
 *
 * Rate limit: max 1 reminder per order (tracked via notification type).
 */
export async function POST(req: NextRequest) {
  try {
    // Require ADMIN role
    const auth = await requireRole(req, ["ADMIN"])
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { orderId, daysAfterDelivery } = body

    // ── Single order reminder ──
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          items: { select: { title: true } },
          reviews: { select: { id: true } },
        },
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      if (order.status !== "DELIVERED") {
        return NextResponse.json(
          { error: "Order has not been delivered yet" },
          { status: 400 }
        )
      }

      if (order.reviews.length > 0) {
        return NextResponse.json(
          { error: "Order already has a review" },
          { status: 400 }
        )
      }

      // Check if a reminder was already sent for this order
      const existingReminder = await db.notification.findFirst({
        where: {
          userId: order.buyerId,
          type: "REVIEW_REMINDER",
          message: { contains: order.orderNumber },
        },
      })

      if (existingReminder) {
        return NextResponse.json(
          { error: "Reminder already sent for this order" },
          { status: 409 }
        )
      }

      // Send review reminder email
      const productTitles = order.items.map((item) => item.title)
      await sendReviewReminder(
        order.buyer.email,
        order.buyer.name,
        order.orderNumber,
        productTitles
      )

      // Create notification
      const notification = await db.notification.create({
        data: {
          userId: order.buyerId,
          type: "REVIEW_REMINDER",
          title: "Leave a Review",
          message: `How was your recent order ${order.orderNumber}? Your feedback helps other buyers!`,
          link: "orders",
        },
      })

      // Emit notification via socket
      emitNewNotification(order.buyerId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        link: notification.link,
        createdAt: notification.createdAt.toISOString(),
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: `Review reminder sent for order ${order.orderNumber}`,
        orderId: order.id,
      })
    }

    // ── Batch reminder for delivered orders ──
    const days = typeof daysAfterDelivery === "number" ? daysAfterDelivery : 7
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const eligibleOrders = await db.order.findMany({
      where: {
        status: "DELIVERED",
        deliveredAt: { lte: cutoffDate },
        reviews: { none: {} },
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: { select: { title: true } },
      },
      take: 50, // Limit batch size
    })

    let sentCount = 0
    let skippedCount = 0

    for (const order of eligibleOrders) {
      // Check if reminder already sent
      const existingReminder = await db.notification.findFirst({
        where: {
          userId: order.buyerId,
          type: "REVIEW_REMINDER",
          message: { contains: order.orderNumber },
        },
      })

      if (existingReminder) {
        skippedCount++
        continue
      }

      // Send email
      const productTitles = order.items.map((item) => item.title)
      await sendReviewReminder(
        order.buyer.email,
        order.buyer.name,
        order.orderNumber,
        productTitles
      )

      // Create notification
      const notification = await db.notification.create({
        data: {
          userId: order.buyerId,
          type: "REVIEW_REMINDER",
          title: "Leave a Review",
          message: `How was your recent order ${order.orderNumber}? Your feedback helps other buyers!`,
          link: "orders",
        },
      })

      // Emit notification via socket
      emitNewNotification(order.buyerId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        link: notification.link,
        createdAt: notification.createdAt.toISOString(),
      }).catch(() => {})

      sentCount++
    }

    return NextResponse.json({
      success: true,
      message: `Batch review reminders processed`,
      sent: sentCount,
      skipped: skippedCount,
      totalEligible: eligibleOrders.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("POST /api/reviews/reminder error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
