import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { optionalAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    // Public route — get user context if available, but don't require it
    const auth = await optionalAuth(req)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "24")
    const category = searchParams.get("category")
    const province = searchParams.get("province")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "newest"
    const store = searchParams.get("store")
    const storeId = searchParams.get("storeId")
    const featured = searchParams.get("featured")
    const status = searchParams.get("status")

    const where: any = { status: status || "ACTIVE" }

    if (category) {
      where.category = { slug: category }
    }
    if (province) {
      where.province = province
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (store) {
      where.store = { slug: store }
    }
    if (storeId) {
      where.storeId = storeId
    }
    if (featured === "true") {
      where.isFeatured = true
    }

    const orderBy: any = { createdAt: "desc" }
    if (sort === "price-low") orderBy.price = "asc"
    if (sort === "price-high") orderBy.price = "desc"
    if (sort === "popular") orderBy.views = "desc"

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          store: { select: { id: true, name: true, slug: true, rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
