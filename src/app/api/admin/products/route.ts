import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const products = await db.product.findMany({
      include: { category: true, store: { select: { id: true, name: true, slug: true, sellerId: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(products)
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
    const { productId, status } = body
    const product = await db.product.update({ where: { id: productId }, data: { status } })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
