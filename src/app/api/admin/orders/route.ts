import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orders = await db.order.findMany({
      include: { buyer: { select: { id: true, name: true, email: true } }, items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
