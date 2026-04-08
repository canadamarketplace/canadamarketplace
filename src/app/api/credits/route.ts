import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

// GET /api/credits — Return user's store credit balance and history
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active store credits for the user
    const credits = await db.storeCredit.findMany({
      where: {
        userId: auth.user.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate balance
    const balance = credits.reduce((sum, credit) => sum + credit.amount, 0)

    // Get full history including inactive credits
    const history = await db.storeCredit.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      balance,
      activeCredits: credits,
      history,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
