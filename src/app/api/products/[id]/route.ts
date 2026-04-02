import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { optionalAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Public route — get user context if available, but don't require it
    const auth = await optionalAuth(req)

    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        store: {
          include: {
            seller: { select: { id: true, name: true, isVerified: true, province: true, city: true } },
            _count: { select: { products: true } },
          },
        },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
        variants: { orderBy: { position: 'asc' } },
      },
    })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    await db.product.update({ where: { id }, data: { views: { increment: 1 } } })

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
      : 0

    return NextResponse.json({ ...product, avgRating })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
