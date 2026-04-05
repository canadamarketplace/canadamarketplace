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

    // Fetch all seller orders with buyer info and items
    const sellerOrders = await db.order.findMany({
      where: { items: { some: { product: { storeId } } } },
      include: {
        buyer: { select: { name: true, id: true } },
        items: {
          include: {
            product: {
              select: { title: true, categoryId: true, views: true, sold: true }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Fetch all products for this store
    const storeProducts = await db.product.findMany({
      where: { storeId },
      include: { category: { select: { name: true } } },
    })

    const totalProducts = storeProducts.length

    // Monthly stats for last 6 months
    const monthlyStats = await Promise.all(Array.from({ length: 6 }, (_, i) => {
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
    }))

    const totalRevenue = sellerOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0)

    const activeOrders = sellerOrders.filter((o) => o.status !== "CANCELLED")

    // === TOP PRODUCTS (by sales revenue) ===
    const productMap: Record<string, { title: string; sold: number; revenue: number; views: number }> = {}
    sellerOrders.forEach((o) => {
      if (o.status === "CANCELLED") return
      o.items.forEach((item) => {
        const key = item.productId
        if (!productMap[key]) {
          productMap[key] = {
            title: item.title,
            sold: 0,
            revenue: 0,
            views: item.product?.views || 0,
          }
        }
        productMap[key].sold += item.quantity
        productMap[key].revenue += item.price * item.quantity
      })
    })
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // === RECENT ORDERS (last 5) ===
    const recentOrders = sellerOrders.slice(0, 5).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyerName: o.buyer.name,
      total: o.total,
      status: o.status,
      itemsCount: o.items.length,
      createdAt: o.createdAt.toISOString(),
      shippingProvince: o.shippingProvince,
    }))

    // === CATEGORY BREAKDOWN ===
    const categoryMap: Record<string, { category: string; revenue: number; count: number }> = {}
    sellerOrders.forEach((o) => {
      if (o.status === "CANCELLED") return
      o.items.forEach((item) => {
        const cat = item.product?.category?.name || "Other"
        if (!categoryMap[cat]) {
          categoryMap[cat] = { category: cat, revenue: 0, count: 0 }
        }
        categoryMap[cat].revenue += item.price * item.quantity
        categoryMap[cat].count += item.quantity
      })
    })
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue)

    // === PROVINCE BREAKDOWN ===
    const provinceMap: Record<string, { province: string; revenue: number; count: number }> = {}
    sellerOrders.forEach((o) => {
      if (o.status === "CANCELLED") return
      const prov = o.shippingProvince || "Unknown"
      if (!provinceMap[prov]) {
        provinceMap[prov] = { province: prov, revenue: 0, count: 0 }
      }
      provinceMap[prov].revenue += o.total
      provinceMap[prov].count += 1
    })
    const provinceBreakdown = Object.values(provinceMap).sort((a, b) => b.revenue - a.revenue)

    // === WEEKLY TREND (last 7 days) ===
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
      return {
        date: date.toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
        revenue: 0,
        orders: 0,
      }
    })
    sellerOrders.forEach((o) => {
      if (o.status === "CANCELLED") return
      const orderDate = new Date(o.createdAt)
      const dayEntry = weeklyTrend.find((d) => {
        const wd = new Date()
        wd.setDate(wd.getDate() - (6 - weeklyTrend.indexOf(d)))
        return wd.toDateString() === orderDate.toDateString()
      })
      if (dayEntry) {
        dayEntry.revenue += o.total
        dayEntry.orders += 1
      }
    })

    // === CONVERSION RATE ===
    const totalProductViews = storeProducts.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalOrdersCount = activeOrders.length
    const conversionRate = totalProductViews > 0
      ? ((totalOrdersCount / totalProductViews) * 100)
      : 0

    // === AVERAGE ORDER VALUE ===
    const averageOrderValue = totalOrdersCount > 0
      ? totalRevenue / totalOrdersCount
      : 0

    // === GROWTH RATES ===
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonthOrders = sellerOrders.filter((o) => {
      if (o.status === "CANCELLED") return false
      return new Date(o.createdAt) >= thisMonthStart
    })
    const lastMonthOrders = sellerOrders.filter((o) => {
      if (o.status === "CANCELLED") return false
      const d = new Date(o.createdAt)
      return d >= lastMonthStart && d < thisMonthStart
    })

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.total, 0)
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0)
    const thisMonthOrderCount = thisMonthOrders.length
    const lastMonthOrderCount = lastMonthOrders.length

    // Unique buyers this month vs last month
    const thisMonthBuyers = new Set(thisMonthOrders.map((o) => o.buyerId)).size
    const lastMonthBuyers = new Set(lastMonthOrders.map((o) => o.buyerId)).size

    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : (thisMonthRevenue > 0 ? 100 : 0)

    const ordersGrowth = lastMonthOrderCount > 0
      ? ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100
      : (thisMonthOrderCount > 0 ? 100 : 0)

    const customersGrowth = lastMonthBuyers > 0
      ? ((thisMonthBuyers - lastMonthBuyers) / lastMonthBuyers) * 100
      : (thisMonthBuyers > 0 ? 100 : 0)

    const thisMonthAOV = thisMonthOrderCount > 0 ? thisMonthRevenue / thisMonthOrderCount : 0
    const lastMonthAOV = lastMonthOrderCount > 0 ? lastMonthRevenue / lastMonthOrderCount : 0
    const aovGrowth = lastMonthAOV > 0
      ? ((thisMonthAOV - lastMonthAOV) / lastMonthAOV) * 100
      : (thisMonthAOV > 0 ? 100 : 0)

    const growthRates = [
      { metric: "revenue", current: thisMonthRevenue, previous: lastMonthRevenue, change: Math.round(revenueGrowth * 10) / 10 },
      { metric: "orders", current: thisMonthOrderCount, previous: lastMonthOrderCount, change: Math.round(ordersGrowth * 10) / 10 },
      { metric: "customers", current: thisMonthBuyers, previous: lastMonthBuyers, change: Math.round(customersGrowth * 10) / 10 },
      { metric: "avgOrderValue", current: Math.round(thisMonthAOV * 100) / 100, previous: Math.round(lastMonthAOV * 100) / 100, change: Math.round(aovGrowth * 10) / 10 },
    ]

    return NextResponse.json({
      totalProducts,
      totalRevenue,
      totalOrders: sellerOrders.length,
      monthlyStats,
      topProducts,
      recentOrders,
      categoryBreakdown,
      provinceBreakdown,
      weeklyTrend,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      growthRates,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
