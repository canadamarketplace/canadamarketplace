import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth-guard"

// GET /api/quotes — List quote requests
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = {}

    // Role-based filtering
    if (auth.user.role === "ADMIN") {
      // Admin sees all
    } else if (auth.user.role === "SELLER") {
      where.sellerId = auth.user.id
    } else {
      where.buyerId = auth.user.id
    }

    if (status && status !== "all") {
      where.status = status
    }

    const quotes = await db.quoteRequest.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, price: true, images: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(quotes)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/quotes — Create a quote request (buyer only)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["BUYER"])
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { productId, sellerId, message, quantity, targetPrice } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Validate product if provided
    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId } })
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
    }

    // Validate seller if provided
    if (sellerId) {
      const seller = await db.user.findUnique({ where: { id: sellerId } })
      if (!seller) {
        return NextResponse.json({ error: "Seller not found" }, { status: 404 })
      }
    }

    const quote = await db.quoteRequest.create({
      data: {
        buyerId: auth.user.id,
        productId: productId || null,
        sellerId: sellerId || null,
        message,
        quantity: quantity || null,
        targetPrice: targetPrice || null,
        status: "PENDING",
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, price: true, images: true } },
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
