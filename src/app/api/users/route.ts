import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: any = {}
    if (role) where.role = role
    if (status === "active") where.isActive = true
    if (status === "inactive") where.isActive = false
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, avatar: true,
          province: true, city: true, isVerified: true, isActive: true,
          createdAt: true,
          store: { select: { id: true, name: true, slug: true, rating: true, totalSales: true, isActive: true } },
          _count: { select: { orders: true, reviews: true, disputes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({ users, total, pages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, role, isActive, isVerified } = body

    const user = await db.user.update({
      where: { id: userId },
      data: { ...(role && { role }), ...(isActive !== undefined && { isActive }), ...(isVerified !== undefined && { isVerified }) },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, name, email, phone, province, city, address, postalCode, bio, avatar } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (province !== undefined) updateData.province = province
    if (city !== undefined) updateData.city = city
    if (address !== undefined) updateData.address = address
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      phone: user.phone,
      province: user.province,
      city: user.city,
      address: user.address,
      postalCode: user.postalCode,
      bio: user.bio,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
