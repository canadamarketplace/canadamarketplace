import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/coupons - List coupons (admin sees all, seller sees their own)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")
    const userRole = req.headers.get("x-user-role")

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let coupons
    if (userRole === "ADMIN") {
      coupons = await db.coupon.findMany({
        orderBy: { createdAt: "desc" },
      })
    } else if (userRole === "SELLER") {
      coupons = await db.coupon.findMany({
        where: {
          OR: [
            { sellerId: userId },
            { sellerId: null }, // Platform-wide coupons
          ],
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Buyers see only active platform-wide coupons
      coupons = await db.coupon.findMany({
        where: {
          sellerId: null,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Coupons GET error:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

// POST /api/coupons - Create coupon (admin or seller)
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")
    const userRole = req.headers.get("x-user-role")

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (userRole !== "ADMIN" && userRole !== "SELLER") {
      return NextResponse.json({ error: "Only admin or sellers can create coupons" }, { status: 403 })
    }

    const body = await req.json()
    const { code, type, value, minOrderAmount, maxUses, startsAt, expiresAt, isActive } = body

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Code, type, and value are required" }, { status: 400 })
    }

    // Check for duplicate code
    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
    }

    // Only admin can create platform-wide coupons (sellerId: null)
    const sellerId = userRole === "ADMIN" ? (body.sellerId || null) : userId

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type: type || "PERCENTAGE",
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true,
        sellerId,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Coupons POST error:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
