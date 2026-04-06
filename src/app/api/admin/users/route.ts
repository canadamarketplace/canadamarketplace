import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
          store: { select: { id: true, name: true, slug: true, rating: true, totalSales: true, isActive: true, approvalStatus: true } },
          _count: { select: { orders: true, reviews: true, disputes: true, reports: true } },
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
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, role, isActive, isVerified, approvalStatus } = body

    // If approvalStatus is provided, update the seller's store
    if (approvalStatus) {
      const store = await db.store.findUnique({ where: { sellerId: userId } })
      if (store) {
        await db.store.update({
          where: { sellerId: userId },
          data: { approvalStatus },
        })
      } else {
        return NextResponse.json({ error: 'User does not have a store' }, { status: 404 })
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(isVerified !== undefined && { isVerified }),
      },
      include: { store: { select: { id: true, name: true, approvalStatus: true } } },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
