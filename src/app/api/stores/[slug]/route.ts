import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { optionalAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Public route — get user context if available, but don't require it
    const auth = await optionalAuth(req)

    const { slug } = await params
    const store = await db.store.findUnique({
      where: { slug },
      include: {
        seller: { select: { id: true, name: true, avatar: true, isVerified: true, province: true, city: true, createdAt: true } },
        products: {
          where: { status: "ACTIVE" },
          include: { category: true, _count: { select: { reviews: true } } },
          take: 50,
        },
        _count: { select: { products: true } },
      },
    })
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    // Fetch reviews for all products in this store
    const productIds = store.products.map((p: any) => p.id)
    const reviews = productIds.length > 0
      ? await db.review.findMany({
          where: { productId: { in: productIds } },
          include: { reviewer: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : []

    // Compute average rating and review count
    const allReviews = productIds.length > 0
      ? await db.review.findMany({
          where: { productId: { in: productIds } },
          select: { rating: true },
        })
      : []
    const totalReviewCount = allReviews.length
    const averageRating = totalReviewCount > 0
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviewCount
      : 0

    return NextResponse.json({ ...store, reviews, averageRating, reviewCount: totalReviewCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
