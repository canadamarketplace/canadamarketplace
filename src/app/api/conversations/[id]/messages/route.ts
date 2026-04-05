import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { db } from '@/lib/db'
import { emitNewMessage } from '@/lib/socket-emit'

// POST /api/conversations/[id]/messages — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const userId = auth.user.id

    // Verify conversation exists and user is a participant
    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create the message
    const message = await db.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: content.trim(),
        type: 'TEXT',
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    })

    // Update conversation's lastMessage and lastMessageAt
    await db.conversation.update({
      where: { id },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    })

    const messageData = {
      id: message.id,
      content: message.content,
      type: message.type,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
      isOwn: false, // The recipient will see isOwn: false
      conversationId: id,
    }

    // Emit the new message via socket service (non-blocking)
    emitNewMessage(id, messageData).catch(() => {
      // Fail silently — the message was saved to DB regardless
    })

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        type: message.type,
        isRead: message.isRead,
        createdAt: message.createdAt,
        sender: message.sender,
        isOwn: true,
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
