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
    const { productId, rating, title, comment, reviewerId, orderId } = body

    const existing = await db.review.findFirst({
      where: { reviewerId, orderId },
    })
    if (existing) {
      return NextResponse.json({ error: "You already reviewed this order" }, { status: 409 })
    }

    const review = await db.review.create({
      data: { productId, reviewerId, orderId, rating, title, comment },
      include: { reviewer: { select: { name: true, avatar: true } } },
    })

    return NextResponse.json(review)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
