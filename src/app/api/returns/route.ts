import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth-guard"

// GET /api/returns — List returns with filters
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const buyerId = searchParams.get("buyerId")
    const sellerId = searchParams.get("sellerId")
    const admin = searchParams.get("admin") === "true"

    const where: any = {}

    if (admin && auth.user.role === "ADMIN") {
      // Admin can see all
    } else if (sellerId) {
      where.sellerId = sellerId
    } else if (buyerId) {
      where.buyerId = buyerId
    } else {
      // Default: show returns relevant to the authenticated user
      if (auth.user.role === "SELLER") {
        where.sellerId = auth.user.id
      } else if (auth.user.role === "BUYER") {
        where.buyerId = auth.user.id
      }
    }

    if (status && status !== "all") {
      where.status = status
    }

    const returns = await db.return.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            items: { select: { id: true, title: true, price: true, quantity: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(returns)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/returns — Create a new return request (buyer only)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["BUYER"])
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { orderId, orderItemId, reason, description } = body

    if (!orderId || !reason || !description) {
      return NextResponse.json({ error: "Missing required fields: orderId, reason, description" }, { status: 400 })
    }

    // Validate order exists and belongs to buyer
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        returns: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.buyerId !== auth.user.id) {
      return NextResponse.json({ error: "This order does not belong to you" }, { status: 403 })
    }

    // Validate order status
    if (!["PAID", "SHIPPED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json({ error: "Cannot request a return for this order status" }, { status: 400 })
    }

    // Check if there's already an open return for this order
    const openReturn = order.returns.find(
      (r: any) => ["REQUESTED", "APPROVED", "RETURN_RECEIVED", "INSPECTING"].includes(r.status)
    )
    if (openReturn) {
      return NextResponse.json({ error: "An open return already exists for this order" }, { status: 400 })
    }

    // Find the seller from the order items
    const item = orderItemId
      ? order.items.find((i: any) => i.id === orderItemId)
      : order.items[0]

    if (!item) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: { store: true },
    })

    if (!product?.store) {
      return NextResponse.json({ error: "Seller store not found" }, { status: 404 })
    }

    // Generate RMA number
    const rmaNumber = `RMA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const returnRecord = await db.return.create({
      data: {
        rmaNumber,
        orderId,
        orderItemId: orderItemId || null,
        buyerId: auth.user.id,
        sellerId: product.store.sellerId,
        reason,
        description,
        status: "REQUESTED",
      },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        order: { select: { orderNumber: true } },
      },
    })

    // Add timeline entry to the order
    await db.orderTimeline.create({
      data: {
        orderId,
        event: "RETURN_REQUESTED",
        title: "Return Requested",
        description: `Return ${rmaNumber} requested for reason: ${reason}`,
        metadata: JSON.stringify({ returnId: returnRecord.id, rmaNumber, reason }),
      },
    })

    return NextResponse.json(returnRecord, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
