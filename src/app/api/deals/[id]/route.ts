import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dealId = searchParams.get("id")

    if (!dealId) {
      return NextResponse.json({ error: "Deal ID required" }, { status: 400 })
    }

    await db.dailyDeal.delete({ where: { id: dealId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting deal:", error)
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 })
  }
}
