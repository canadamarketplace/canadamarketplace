import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const moderationStatus = searchParams.get("moderationStatus")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {}
    if (moderationStatus) where.moderationStatus = moderationStatus
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true, store: { select: { id: true, name: true, slug: true, sellerId: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ products, total, pages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Handle bulk operations
    if (body.action === "bulk_update") {
      const { productIds, status, moderationStatus } = body

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return NextResponse.json({ error: 'productIds must be a non-empty array' }, { status: 400 })
      }

      const updateData: any = {}
      if (status) updateData.status = status
      if (moderationStatus) updateData.moderationStatus = moderationStatus

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Must provide status or moderationStatus' }, { status: 400 })
      }

      const result = await db.product.updateMany({
        where: { id: { in: productIds } },
        data: updateData,
      })

      return NextResponse.json({ success: true, updated: result.count })
    }

    // Single product update
    const { productId, status, moderationStatus } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (moderationStatus) updateData.moderationStatus = moderationStatus

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Must provide status or moderationStatus' }, { status: 400 })
    }

    const product = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true, store: true },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
