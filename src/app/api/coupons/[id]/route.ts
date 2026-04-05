import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// PATCH /api/coupons/[id] - Update coupon
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id")
    const userRole = req.headers.get("x-user-role")

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    // Only admin or coupon owner can update
    if (userRole !== "ADMIN" && existing.sellerId !== userId) {
      return NextResponse.json({ error: "Not authorized to update this coupon" }, { status: 403 })
    }

    const body = await req.json()
    const { code, type, value, minOrderAmount, maxUses, startsAt, expiresAt, isActive } = body

    // If changing code, check for duplicates
    if (code && code.toUpperCase() !== existing.code) {
      const duplicate = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })
      if (duplicate) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
      }
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(type && { type }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(minOrderAmount !== undefined && { minOrderAmount: parseFloat(minOrderAmount) }),
        ...(maxUses !== undefined && { maxUses: maxUses ? parseInt(maxUses) : null }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Coupon PATCH error:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

// DELETE /api/coupons/[id] - Deactivate coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id")
    const userRole = req.headers.get("x-user-role")

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    // Only admin or coupon owner can deactivate
    if (userRole !== "ADMIN" && existing.sellerId !== userId) {
      return NextResponse.json({ error: "Not authorized to deactivate this coupon" }, { status: 403 })
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Coupon DELETE error:", error)
    return NextResponse.json({ error: "Failed to deactivate coupon" }, { status: 500 })
  }
}
