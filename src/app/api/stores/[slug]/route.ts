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
    return NextResponse.json(store)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
