import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, optionalAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    // Public route — get user context if available, but don't require it
    const auth = await optionalAuth(req)

    const { searchParams } = new URL(req.url)
    const province = searchParams.get("province")
    const search = searchParams.get("search")

    const where: any = { isActive: true }

    if (province) {
      where.seller = { province }
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { seller: { name: { contains: search } } },
        { seller: { city: { contains: search } } },
      ]
    }

    const stores = await db.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        rating: true,
        totalSales: true,
        facebookUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        websiteUrl: true,
        vacationMode: true,
        vacationMessage: true,
        seller: {
          select: {
            id: true,
            name: true,
            province: true,
            city: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            products: { where: { status: "ACTIVE" } },
          },
        },
      },
    })

    return NextResponse.json(stores)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['SELLER'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { storeId, name, description, logo, banner, facebookUrl, twitterUrl, instagramUrl, websiteUrl, vacationMode, vacationMessage } = body

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (logo !== undefined) updateData.logo = logo
    if (banner !== undefined) updateData.banner = banner
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl
    if (vacationMode !== undefined) updateData.vacationMode = vacationMode
    if (vacationMessage !== undefined) updateData.vacationMessage = vacationMessage

    const store = await db.store.update({
      where: { id: storeId },
      data: updateData,
    })

    return NextResponse.json(store)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
