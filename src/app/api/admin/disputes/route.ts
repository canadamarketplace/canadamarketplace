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
    const type = searchParams.get("type") || "all"
    let where: any = {}
    if (type === "open") where.status = { in: ["OPEN", "UNDER_REVIEW"] }
    if (type === "resolved") where.status = { in: ["RESOLVED", "CLOSED"] }
    const disputes = await db.dispute.findMany({
      where,
      include: { buyer: { select: { id: true, name: true, email: true } }, seller: { select: { id: true, name: true, email: true } }, order: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(disputes)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
