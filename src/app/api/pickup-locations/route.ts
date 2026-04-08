import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get("sellerId")
    const storeId = searchParams.get("storeId")

    const locations = await db.pickupLocation.findMany({
      where: {
        isActive: true,
        ...(sellerId ? { sellerId } : {}),
        ...(storeId ? { storeId } : {}),
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("Error fetching pickup locations:", error)
    return NextResponse.json({ error: "Failed to fetch pickup locations" }, { status: 500 })
  }
}
