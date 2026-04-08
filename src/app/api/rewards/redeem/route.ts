import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

// POST /api/rewards/redeem — Redeem reward points for store credit
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { points } = body

    if (!points || points < 100) {
      return NextResponse.json({ error: "Minimum 100 points required to redeem" }, { status: 400 })
    }

    // Calculate current balance
    const entries = await db.rewardPoints.findMany({
      where: { userId: auth.user.id },
    })
    const balance = entries.reduce((sum, entry) => sum + entry.points, 0)

    if (balance < points) {
      return NextResponse.json({ error: "Insufficient reward points" }, { status: 400 })
    }

    const creditAmount = points / 100 // 100 points = $1

    // Create negative RewardPoints entry
    const rewardEntry = await db.rewardPoints.create({
      data: {
        userId: auth.user.id,
        points: -points,
        type: "REDEEM",
        description: `Redeemed ${points} points for $${creditAmount.toFixed(2)} store credit`,
      },
    })

    // Create positive StoreCredit entry
    const storeCredit = await db.storeCredit.create({
      data: {
        userId: auth.user.id,
        amount: creditAmount,
        type: "REWARD_REDEEM",
        description: `From reward points redemption (${points} points)`,
        isActive: true,
      },
    })

    return NextResponse.json({
      rewardEntry,
      storeCredit,
      pointsRedeemed: points,
      creditAmount,
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
