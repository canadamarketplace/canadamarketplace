import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

// POST /api/gift-cards/redeem — Redeem a gift card code
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Gift card code is required" }, { status: 400 })
    }

    const giftCard = await db.giftCard.findUnique({ where: { code } })

    if (!giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 })
    }

    if (!giftCard.isActive) {
      return NextResponse.json({ error: "This gift card is no longer active" }, { status: 400 })
    }

    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This gift card has expired" }, { status: 400 })
    }

    if (giftCard.balance <= 0) {
      return NextResponse.json({ error: "This gift card has no remaining balance" }, { status: 400 })
    }

    // Mark as redeemed
    const updated = await db.giftCard.update({
      where: { id: giftCard.id },
      data: {
        redeemedById: auth.user.id,
        redeemedAt: new Date(),
      },
      include: {
        purchasedBy: { select: { id: true, name: true, email: true } },
        redeemedBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      ...updated,
      redeemableBalance: updated.balance,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
