import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const now = new Date()

    const deals = await db.dailyDeal.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        product: {
          include: {
            store: {
              select: { id: true, name: true, slug: true, rating: true },
            },
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { endsAt: "asc" },
      take: 20,
    })

    return NextResponse.json({ deals })
  } catch (error) {
    console.error("Error fetching deals:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, dealPrice, startsAt, endsAt, maxQty, isActive } = body

    if (!productId || dealPrice == null || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if product already has a deal
    const existing = await db.dailyDeal.findUnique({ where: { productId } })
    if (existing) {
      // Update existing deal
      const deal = await db.dailyDeal.update({
        where: { productId },
        data: {
          dealPrice,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          maxQty: maxQty || null,
          isActive: isActive !== false,
        },
      })
      return NextResponse.json({ deal })
    }

    const deal = await db.dailyDeal.create({
      data: {
        productId,
        dealPrice,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        maxQty: maxQty || null,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ deal }, { status: 201 })
  } catch (error) {
    console.error("Error creating deal:", error)
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
  }
}
