import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth-guard"

// GET /api/gift-cards — List user's gift cards
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get("all") === "true"

    const where: any = {}

    if (showAll && auth.user.role === "ADMIN") {
      // Admin can see all
    } else {
      where.OR = [
        { purchasedById: auth.user.id },
        { redeemedById: auth.user.id },
      ]
    }

    const giftCards = await db.giftCard.findMany({
      where,
      include: {
        purchasedBy: { select: { id: true, name: true, email: true } },
        redeemedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(giftCards)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/gift-cards — Purchase a new gift card (admin only)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"])
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { amount, recipientName, recipientEmail, message } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "A valid amount is required" }, { status: 400 })
    }

    // Generate unique code with prefix "GC-"
    const code = `GC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Check uniqueness
    const existing = await db.giftCard.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: "Generated code already exists, please try again" }, { status: 409 })
    }

    const giftCard = await db.giftCard.create({
      data: {
        code,
        balance: amount,
        initialAmount: amount,
        senderId: auth.user.id,
        purchasedById: auth.user.id,
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        message: message || null,
        isActive: true,
      },
      include: {
        purchasedBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(giftCard, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
