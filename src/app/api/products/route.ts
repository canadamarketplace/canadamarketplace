import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { optionalAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
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
    const condition = searchParams.get("condition")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const rating = searchParams.get("rating")

    const where: any = { status: status || "ACTIVE" }

    if (category) {
      const cats = category.split(",").map(c => c.trim())
      if (cats.length === 1) {
        where.category = { slug: cats[0] }
      } else {
        where.category = { slug: { in: cats } }
      }
    }
    if (province) {
      const provs = province.split(",").map(p => p.trim())
      if (provs.length === 1) {
        where.province = provs[0]
      } else {
        where.province = { in: provs }
      }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
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
    if (condition) {
      const conditions = condition.split(",").map(c => c.trim().toUpperCase())
      where.condition = { in: conditions }
    }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (rating) {
      const minRating = parseFloat(rating)
      where.store = { ...(where.store || {}), rating: { gte: minRating } }
    }

    const orderBy: any = { createdAt: "desc" }
    if (sort === "price-low" || sort === "price_asc") orderBy.price = "asc"
    if (sort === "price-high" || sort === "price_desc") orderBy.price = "desc"
    if (sort === "popular") orderBy.views = "desc"
    if (sort === "rating") orderBy.createdAt = "desc"

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          store: { select: { id: true, name: true, slug: true, rating: true } },
          _count: { select: { reviews: true } },
          variants: { orderBy: { position: 'asc' } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    // If sorting by rating, do it in-memory since SQLite doesn't support avg rating sort
    let sortedProducts = products
    if (sort === "rating") {
      const productIds = products.map(p => p.id)
      const reviewCounts = await db.review.groupBy({
        by: ["productId"],
        where: { productId: { in: productIds } },
        _avg: { rating: true },
      })
      const ratingMap: Record<string, number> = {}
      reviewCounts.forEach(rc => {
        if (rc._avg.rating) ratingMap[rc.productId] = rc._avg.rating
      })
      sortedProducts = [...products].sort((a, b) => (ratingMap[b.id] || 0) - (ratingMap[a.id] || 0))
    }

    return NextResponse.json({
      products: sortedProducts,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
