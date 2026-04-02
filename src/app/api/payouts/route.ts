import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SELLER'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    const payouts = await db.payout.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(payouts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
