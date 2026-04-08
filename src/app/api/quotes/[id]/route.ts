import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

// GET /api/quotes/[id] — Get single quote with product and user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const quote = await db.quoteRequest.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, province: true, city: true } },
        seller: { select: { id: true, name: true, email: true } },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            slug: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: "Quote request not found" }, { status: 404 })
    }

    // Authorization: must be buyer, seller, or admin
    if (
      auth.user.role !== "ADMIN" &&
      quote.buyerId !== auth.user.id &&
      quote.sellerId !== auth.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(quote)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/quotes/[id] — Update quote (seller responds or admin updates)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, response, quotePrice, expiresAt } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const quote = await db.quoteRequest.findUnique({
      where: { id },
    })

    if (!quote) {
      return NextResponse.json({ error: "Quote request not found" }, { status: 404 })
    }

    // Authorization
    const isSeller = quote.sellerId === auth.user.id
    const isBuyer = quote.buyerId === auth.user.id
    const isAdmin = auth.user.role === "ADMIN"

    // Seller: can respond to quotes directed to them
    if (isSeller) {
      if (!["RESPONDED", "DECLINED"].includes(status)) {
        return NextResponse.json({ error: "Sellers can only set status to RESPONDED or DECLINED" }, { status: 400 })
      }
      if (status === "RESPONDED" && !response && quotePrice === undefined) {
        return NextResponse.json({ error: "Response and/or quote price are required when responding" }, { status: 400 })
      }
    } else if (isAdmin) {
      // Admin can update freely
    } else {
      return NextResponse.json({ error: "Only the seller or admin can update this quote" }, { status: 403 })
    }

    const updateData: any = { status }

    if (response !== undefined) updateData.response = response
    if (quotePrice !== undefined) updateData.quotePrice = quotePrice
    if (expiresAt) updateData.expiresAt = new Date(expiresAt)

    const updated = await db.quoteRequest.update({
      where: { id },
      data: updateData,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, price: true, images: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
