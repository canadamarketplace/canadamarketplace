import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { db } from '@/lib/db'

// POST /api/notifications/mark-all - Mark all notifications as read
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.notification.updateMany({
      where: {
        userId: auth.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
    })
  } catch (error) {
    console.error('POST /api/notifications/mark-all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
