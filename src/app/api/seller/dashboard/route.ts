import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SELLER'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const [totalProducts, sellerOrders, monthlyStats] = await Promise.all([
      db.product.count({ where: { storeId } }),
      db.order.findMany({
        where: { items: { some: { product: { storeId } } } },
        include: {
          buyer: { select: { name: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      Promise.all(Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
        return db.order.aggregate({
          _sum: { total: true }, _count: true,
          where: {
            createdAt: { gte: start, lte: end },
            status: { not: "CANCELLED" },
            items: { some: { product: { storeId } } },
          },
        }).then((r) => ({ month: date.toLocaleString("default", { month: "short" }), revenue: r._sum.total || 0, orders: r._count }))
      })),
    ])

    const totalRevenue = sellerOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0)

    return NextResponse.json({
      totalProducts,
      totalRevenue,
      totalOrders: sellerOrders.length,
      recentOrders: sellerOrders.slice(0, 10),
      monthlyStats,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
