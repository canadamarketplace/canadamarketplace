import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['BUYER'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { orderId, buyerId, sellerId, reason, description } = body

    const dispute = await db.dispute.create({
      data: { orderId, buyerId, sellerId, reason, description },
      include: { order: true, buyer: { select: { name: true } }, seller: { select: { name: true } } },
    })

    await db.order.update({
      where: { id: orderId },
      data: { status: "DISPUTED" },
    })

    return NextResponse.json(dispute)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { disputeId, status, resolution, adminNotes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (resolution) updateData.resolution = resolution
    if (adminNotes) updateData.adminNotes = adminNotes
    if (["RESOLVED", "CLOSED"].includes(status)) updateData.resolvedAt = new Date()

    const dispute = await db.dispute.update({
      where: { id: disputeId },
      data: updateData,
    })

    if (status === "RESOLVED" && resolution === "REFUND") {
      const order = await db.order.findUnique({ where: { id: dispute.orderId } })
      if (order) {
        await db.order.update({
          where: { id: dispute.orderId },
          data: { status: "REFUNDED" },
        })
      }
    }

    return NextResponse.json(dispute)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
