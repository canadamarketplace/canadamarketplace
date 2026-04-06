import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get configurable threshold from SiteSetting (default: 5)
    const thresholdSetting = await db.siteSetting.findUnique({
      where: { key: "low_stock_threshold" },
    })
    const threshold = thresholdSetting ? parseInt(thresholdSetting.value) : 5

    const where: any = {
      stock: { lte: threshold },
      status: "ACTIVE",
    }

    // Sellers can only see their own products; admins see all
    if (auth.user.role !== 'ADMIN') {
      const sellerStore = await db.store.findUnique({
        where: { sellerId: auth.user.id },
        select: { id: true },
      })
      if (sellerStore) {
        where.storeId = sellerStore.id
      } else {
        // Not a seller, return empty
        return NextResponse.json({ products: [], threshold })
      }
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        store: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { stock: "asc" },
    })

    return NextResponse.json({ products, threshold })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
