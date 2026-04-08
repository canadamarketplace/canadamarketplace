import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")
    const userRole = req.headers.get("x-user-role")
    if (!userId || !userRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get("all") === "true"
    const slug = searchParams.get("slug")

    if (slug) {
      const brand = await db.brand.findUnique({ where: { slug } })
      if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 })
      return NextResponse.json(brand)
    }

    const brands = await db.brand.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(brands)
  } catch (error) {
    console.error("Brands GET error:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")
    const userRole = req.headers.get("x-user-role")
    if (!userId || !userRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (userRole !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 })

    const body = await req.json()
    const { name, slug, description, website, logo, isActive } = body
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    const existing = await db.brand.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: "Brand slug already exists" }, { status: 409 })

    const brand = await db.brand.create({
      data: { name, slug, description, website, logo, isActive: isActive !== false },
    })
    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error("Brands POST error:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}
