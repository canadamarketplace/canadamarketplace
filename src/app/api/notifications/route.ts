import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { db } from '@/lib/db'
import { emitNewNotification } from '@/lib/socket-emit'

// GET /api/notifications - Fetch all notifications for current user
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await db.notification.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await db.notification.count({
      where: {
        userId: auth.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        link: n.link,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications - Create a notification
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, type, title, message, link } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      )
    }

    // Only ADMIN can create notifications for other users
    // Users can create notifications for themselves
    const targetUserId = userId || auth.user.id
    if (userId && userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create notifications for other users' },
        { status: 403 }
      )
    }

    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        type: type.toUpperCase(),
        title,
        message,
        link: link || null,
      },
    })

    const notificationData = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
    }

    // Emit the new notification via socket service (non-blocking)
    emitNewNotification(targetUserId, notificationData).catch(() => {
      // Fail silently — the notification was saved to DB regardless
    })

    return NextResponse.json(notificationData, { status: 201 })
  } catch (error) {
    console.error('POST /api/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
