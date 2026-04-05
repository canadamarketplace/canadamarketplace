import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/coupons/validate - Validate coupon code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, orderAmount, sellerId } = body

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" })
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" })
    }

    // Check if expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" })
    }

    // Check if not yet started
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon is not yet available" })
    }

    // Check max uses
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" })
    }

    // Check minimum order amount
    const minAmount = coupon.minOrderAmount || 0
    if (orderAmount !== undefined && orderAmount < minAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount of $${minAmount.toFixed(2)} required`,
      })
    }

    // Check seller restriction (seller-specific coupons)
    if (coupon.sellerId && sellerId && coupon.sellerId !== sellerId) {
      return NextResponse.json({
        valid: false,
        error: "This coupon is not valid for this seller",
      })
    }

    // Calculate discount
    let discountAmount = 0
    const amount = orderAmount || 0
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (amount * coupon.value) / 100
    } else if (coupon.type === "FIXED") {
      discountAmount = coupon.value
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        remainingUses: coupon.maxUses ? coupon.maxUses - coupon.usedCount : null,
      },
    })
  } catch (error) {
    console.error("Coupon validate error:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
