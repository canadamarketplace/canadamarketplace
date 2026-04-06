import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"
import { calculateTax } from "@/lib/canadian-tax"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get("sellerId")
    const storeId = searchParams.get("storeId")
    const buyerId = searchParams.get("buyerId")

    const where: any = {}
    if (sellerId) where.sellerId = sellerId
    if (storeId) where.storeId = storeId
    if (buyerId) where.buyerId = buyerId

    const orders = await db.order.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, email: true, province: true, city: true } },
        items: true,
        _count: { select: { disputes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['BUYER', 'SELLER'])
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { buyerId, items, shippingAddress, shippingCity, shippingProvince, shippingPostalCode, notes, couponCode } = body

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const fee = Math.round(subtotal * 0.08 * 100) / 100

    // Calculate tax based on shipping province
    let taxAmount = 0
    let taxRate = 0
    let taxProvince: string | null = null
    if (shippingProvince) {
      const taxResult = calculateTax(subtotal, shippingProvince)
      taxAmount = taxResult.tax.totalTax
      taxRate = taxResult.tax.totalRate
      taxProvince = taxResult.tax.provinceCode
    }

    // Validate and apply coupon discount
    let discountAmount = 0
    let appliedCouponId: string | null = null

    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
      if (!coupon.isActive) {
        return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }
      if (coupon.startsAt && coupon.startsAt > new Date()) {
        return NextResponse.json({ error: 'This coupon is not yet available' }, { status: 400 })
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: 'This coupon has reached its maximum uses' }, { status: 400 })
      }
      if (coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount) {
        return NextResponse.json({ error: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon` }, { status: 400 })
      }

      if (coupon.type === 'PERCENTAGE') {
        discountAmount = Math.round(subtotal * coupon.value / 100 * 100) / 100
      } else {
        discountAmount = coupon.value
      }

      appliedCouponId = coupon.id
    }

    const total = Math.round((subtotal + fee + taxAmount - discountAmount) * 100) / 100

    const orderNumber = `CM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const order = await db.order.create({
      data: {
        orderNumber,
        buyerId,
        status: "PAID",
        subtotal,
        fee,
        total,
        taxAmount,
        taxRate,
        taxProvince,
        paymentStatus: "COMPLETED",
        shippingAddress,
        shippingCity,
        shippingProvince,
        shippingPostalCode,
        notes,
        paidAt: new Date(),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
        timeline: {
          create: [
            {
              event: "ORDER_PLACED",
              title: "Order Placed",
              description: "Your order has been placed successfully.",
              metadata: "{}",
            },
            {
              event: "PAYMENT_RECEIVED",
              title: "Payment Received",
              description: "Your payment has been confirmed and is held in escrow.",
              metadata: "{}",
            },
          ],
        },
      },
      include: {
        items: true,
        timeline: { orderBy: { createdAt: "desc" } },
      },
    })

    // Create AppliedCoupon record and increment coupon usedCount if coupon was applied
    if (appliedCouponId) {
      await Promise.all([
        db.appliedCoupon.create({
          data: {
            couponId: appliedCouponId,
            orderId: order.id,
            discountAmount,
          },
        }),
        db.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        }),
      ])
    }

    // Update product stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } },
      })
    }

    return NextResponse.json({
      ...order,
      discountAmount,
      couponCode: couponCode || null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
