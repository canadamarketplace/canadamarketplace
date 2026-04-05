import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { db } from '@/lib/db'

// GET /api/conversations/[id] — fetch conversation with messages, mark as read
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const userId = auth.user.id

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        participant1: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        participant2: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user is a participant
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Mark unread messages from the other participant as read
    const unreadMessageIds = conversation.messages
      .filter((msg) => !msg.isRead && msg.senderId !== userId)
      .map((msg) => msg.id)

    if (unreadMessageIds.length > 0) {
      await db.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true },
      })
      // Update the messages in the response to reflect read status
      conversation.messages = conversation.messages.map((msg) => ({
        ...msg,
        isRead: true,
      }))
    }

    const isParticipant1 = conversation.participant1Id === userId
    const otherParticipant = isParticipant1 ? conversation.participant2 : conversation.participant1

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherParticipant,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        messages: conversation.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          type: msg.type,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          sender: msg.sender,
          isOwn: msg.senderId === userId,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}
