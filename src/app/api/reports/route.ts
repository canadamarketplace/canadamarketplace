import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN'])
    if (!auth) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const targetType = searchParams.get("targetType")

    const where: any = {}
    if (status) where.status = status
    if (targetType) where.targetType = targetType

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.report.count({ where }),
    ])

    return NextResponse.json({ reports, total, pages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { targetType, targetId, reason, description } = body

    // Validate required fields
    if (!targetType || !targetId || !reason || !description) {
      return NextResponse.json(
        { error: 'targetType, targetId, reason, and description are required' },
        { status: 400 }
      )
    }

    const validTargetTypes = ['PRODUCT', 'SELLER', 'ORDER']
    if (!validTargetTypes.includes(targetType)) {
      return NextResponse.json(
        { error: `targetType must be one of: ${validTargetTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const validReasons = ['SPAM', 'INAPPROPRIATE', 'FRAUD', 'COPYRIGHT', 'OTHER']
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `reason must be one of: ${validReasons.join(', ')}` },
        { status: 400 }
      )
    }

    // Prevent duplicate reports by same user for same target
    const existing = await db.report.findFirst({
      where: {
        reporterId: auth.user.id,
        targetType,
        targetId,
        status: { in: ['OPEN', 'REVIEWING'] },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'You have already reported this item. It is being reviewed.' },
        { status: 409 }
      )
    }

    const report = await db.report.create({
      data: {
        reporterId: auth.user.id,
        targetType,
        targetId,
        reason,
        description,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(report, { status: 201 })
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
    const { reportId, status, adminNotes } = body

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 })
    }

    const validStatuses = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const report = await db.report.update({
      where: { id: reportId },
      data: updateData,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(report)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
