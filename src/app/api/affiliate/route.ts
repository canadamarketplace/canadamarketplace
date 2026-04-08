import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

// GET /api/affiliate — Return user's affiliate stats
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let affiliate = await db.affiliate.findUnique({
      where: { userId: auth.user.id },
    })

    // Create affiliate record if none exists
    if (!affiliate) {
      const referralCode = `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      // Check uniqueness
      const existing = await db.affiliate.findUnique({ where: { referralCode } })
      if (existing) {
        return NextResponse.json({ error: "Generated referral code already exists, please try again" }, { status: 409 })
      }

      affiliate = await db.affiliate.create({
        data: {
          userId: auth.user.id,
          referralCode,
        },
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

    return NextResponse.json({
      referralCode: affiliate.referralCode,
      totalEarnings: affiliate.totalEarnings,
      totalReferrals: affiliate.totalReferrals,
      isActive: affiliate.isActive,
      referralLink: `${baseUrl}/ref/${affiliate.referralCode}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
