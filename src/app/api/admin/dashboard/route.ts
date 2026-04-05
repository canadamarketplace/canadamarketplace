import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue, pendingDisputes, recentOrders, monthlyStats] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "SELLER" } }),
      db.product.count({ where: { status: "ACTIVE" } }),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      db.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      db.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { buyer: { select: { name: true } }, items: true } }),
      Promise.all(Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
        return db.order.aggregate({
          _sum: { total: true }, _count: true,
          where: { createdAt: { gte: start, lte: end }, status: { not: "CANCELLED" } },
        }).then((r) => ({ month: date.toLocaleString("default", { month: "short" }), revenue: r._sum.total || 0, orders: r._count }))
      })),
    ])
    const ordersByStatus = await db.order.groupBy({ by: ["status"], _count: true })
    return NextResponse.json({ totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue: totalRevenue._sum.total || 0, pendingDisputes, recentOrders, monthlyStats, ordersByStatus })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
