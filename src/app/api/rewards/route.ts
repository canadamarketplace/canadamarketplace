import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

// GET /api/rewards — Return user's reward points balance and history
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all reward point entries for the user
    const entries = await db.rewardPoints.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
    })

    // Calculate balance
    const balance = entries.reduce((sum, entry) => sum + entry.points, 0)

    return NextResponse.json({
      balance,
      history: entries,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
