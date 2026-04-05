import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"
import { calculateTax } from "@/lib/canadian-tax"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get("sellerId")
    const storeId = searchParams.get("storeId")

    const where: any = {}
    if (sellerId) where.sellerId = sellerId
    if (storeId) where.storeId = storeId

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
    const { buyerId, items, shippingAddress, shippingCity, shippingProvince, shippingPostalCode, notes } = body

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

    const total = Math.round((subtotal + fee + taxAmount) * 100) / 100

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

    // Update product stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } },
      })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
