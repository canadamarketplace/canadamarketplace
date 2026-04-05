import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

function createTimelineEntry(
  orderId: string,
  event: string,
  title: string,
  description?: string,
  metadata?: Record<string, any>
) {
  return db.orderTimeline.create({
    data: {
      orderId,
      event,
      title,
      description: description || null,
      metadata: metadata ? JSON.stringify(metadata) : "{}",
    },
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { store: { select: { sellerId: true, name: true } } } } } },
        disputes: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch order with store seller info to check ownership
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { store: { select: { sellerId: true } } } } } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only BUYER (own order), SELLER (order items from their store), or ADMIN can update
    const isBuyer = order.buyerId === auth.user.id
    const isSeller = order.items.some((item: any) => item.product?.store?.sellerId === auth.user.id)
    const isAdmin = auth.user.role === 'ADMIN'
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status, trackingNumber } = body

    const updateData: any = {}
    const previousStatus = order.status
    if (status) {
      updateData.status = status
      if (status === "SHIPPED") updateData.shippedAt = new Date()
      if (status === "DELIVERED") updateData.deliveredAt = new Date()
      if (status === "CANCELLED") updateData.cancelledAt = new Date()
    }
    if (trackingNumber) updateData.trackingNumber = trackingNumber

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true, buyer: { select: { id: true, name: true } }, timeline: { orderBy: { createdAt: "desc" } } },
    })

    // Create timeline entries based on status transitions
    if (status && status !== previousStatus) {
      const timelineEntries: Promise<any>[] = []

      switch (status) {
        case "PAID":
          if (previousStatus === "PENDING") {
            timelineEntries.push(
              createTimelineEntry(id, "PAYMENT_RECEIVED", "Payment Received", "Your payment has been confirmed and is held in escrow.")
            )
          }
          break
        case "SHIPPED":
          timelineEntries.push(
            createTimelineEntry(
              id,
              "SHIPPED",
              "Order Shipped",
              "Your order has been shipped and is on its way.",
              trackingNumber ? { trackingNumber, trackingUrl: `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}` } : undefined
            )
          )
          break
        case "DELIVERED":
          timelineEntries.push(
            createTimelineEntry(id, "DELIVERED", "Order Delivered", "Your order has been delivered successfully.")
          )
          break
        case "CANCELLED":
          timelineEntries.push(
            createTimelineEntry(id, "CANCELLED", "Order Cancelled", "This order has been cancelled.")
          )
          break
        case "REFUNDED":
          timelineEntries.push(
            createTimelineEntry(id, "REFUNDED", "Order Refunded", "A refund has been issued for this order.")
          )
          break
      }

      if (timelineEntries.length > 0) {
        await Promise.all(timelineEntries)
        // Re-fetch to include new timeline entries
        const refreshedOrder = await db.order.findUnique({
          where: { id },
          include: { items: true, buyer: { select: { id: true, name: true } }, timeline: { orderBy: { createdAt: "desc" } } },
        })
        if (refreshedOrder) return NextResponse.json(refreshedOrder)
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
