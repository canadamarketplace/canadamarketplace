import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { store: { select: { sellerId: true, name: true } } } } } },
        disputes: true,
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
      include: { items: true, buyer: { select: { id: true, name: true } } },
    })

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
