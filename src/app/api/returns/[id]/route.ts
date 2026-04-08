import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth-guard"

// GET /api/returns/[id] — Get single return with order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const returnRecord = await db.return.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, province: true, city: true } },
        seller: { select: { id: true, name: true, email: true } },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            subtotal: true,
            total: true,
            items: { select: { id: true, title: true, price: true, quantity: true, image: true } },
          },
        },
      },
    })

    if (!returnRecord) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 })
    }

    // Authorization check: must be buyer, seller, or admin
    if (
      auth.user.role !== "ADMIN" &&
      returnRecord.buyerId !== auth.user.id &&
      returnRecord.sellerId !== auth.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(returnRecord)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/returns/[id] — Update return status (seller/admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, refundAmount, refundMethod, returnShippingMethod, sellerNotes, adminNotes, trackingNumber } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const returnRecord = await db.return.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!returnRecord) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 })
    }

    // Authorization
    const isSeller = returnRecord.sellerId === auth.user.id
    const isAdmin = auth.user.role === "ADMIN"

    if (!isSeller && !isAdmin) {
      return NextResponse.json({ error: "Only the seller or admin can update a return" }, { status: 403 })
    }

    // Validate status transitions
    const validSellerTransitions: Record<string, string[]> = {
      REQUESTED: ["APPROVED", "REJECTED"],
      APPROVED: ["RETURN_RECEIVED"],
      RETURN_RECEIVED: ["INSPECTING"],
      INSPECTING: ["REFUNDED", "PARTIAL_REFUND", "CLOSED"],
    }

    if (!isAdmin && returnRecord.status in validSellerTransitions) {
      const allowed = validSellerTransitions[returnRecord.status]
      if (!allowed.includes(status)) {
        return NextResponse.json({ error: `Cannot transition from ${returnRecord.status} to ${status}` }, { status: 400 })
      }
    }

    // Build update data
    const updateData: any = { status }

    // Set timestamps based on status
    const now = new Date()
    switch (status) {
      case "APPROVED":
        updateData.approvedAt = now
        break
      case "REJECTED":
        updateData.rejectedAt = now
        break
      case "RETURN_RECEIVED":
        updateData.receivedAt = now
        break
      case "REFUNDED":
      case "PARTIAL_REFUND":
        updateData.refundedAt = now
        if (refundAmount !== undefined) updateData.refundAmount = refundAmount
        if (refundMethod) updateData.refundMethod = refundMethod
        break
      case "CLOSED":
        updateData.closedAt = now
        break
    }

    if (returnShippingMethod) updateData.returnShippingMethod = returnShippingMethod
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (sellerNotes !== undefined) updateData.sellerNotes = sellerNotes
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const updated = await db.return.update({
      where: { id },
      data: updateData,
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        order: { select: { orderNumber: true } },
      },
    })

    // Add timeline entry
    const timelineEvents: Record<string, string> = {
      APPROVED: "Return Approved",
      REJECTED: "Return Rejected",
      RETURN_RECEIVED: "Return Package Received",
      INSPECTING: "Return Under Inspection",
      REFUNDED: "Return Refunded",
      PARTIAL_REFUND: "Return Partially Refunded",
      CLOSED: "Return Closed",
    }

    await db.orderTimeline.create({
      data: {
        orderId: returnRecord.orderId,
        event: `RETURN_${status}`,
        title: timelineEvents[status] || `Return status updated to ${status}`,
        description: `RMA ${returnRecord.rmaNumber}: ${timelineEvents[status] || status}`,
        metadata: JSON.stringify({ returnId: id, rmaNumber: returnRecord.rmaNumber, status, refundAmount, refundMethod, updatedBy: auth.user.name }),
      },
    })

    // If refunded, update order status
    if (status === "REFUNDED" && returnRecord.order) {
      await db.order.update({
        where: { id: returnRecord.orderId },
        data: { status: "REFUNDED", cancelledAt: now },
      })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
