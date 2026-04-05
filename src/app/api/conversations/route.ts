import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { db } from '@/lib/db'

// GET /api/conversations — list all conversations for current user
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = auth.user.id

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        participant2: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        messages: {
          select: { id: true, isRead: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Transform conversations to include other participant info and unread count
    const transformed = conversations.map((conv) => {
      const isParticipant1 = conv.participant1Id === userId
      const otherParticipant = isParticipant1 ? conv.participant2 : conv.participant1
      const unreadCount = conv.messages.filter(
        (msg) => !msg.isRead && msg.senderId !== userId
      ).length

      return {
        id: conv.id,
        otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt,
      }
    })

    return NextResponse.json({ conversations: transformed })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/conversations — create or find existing conversation
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { recipientId } = await req.json()

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }

    if (recipientId === auth.user.id) {
      return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 })
    }

    // Check if recipient exists
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
      select: { id: true, name: true, avatar: true, role: true },
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Check if conversation already exists between these two users
    const existingConversation = await db.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: auth.user.id,
            participant2Id: recipientId,
          },
          {
            participant1Id: recipientId,
            participant2Id: auth.user.id,
          },
        ],
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        participant2: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        messages: {
          select: { id: true, isRead: true, senderId: true },
        },
      },
    })

    if (existingConversation) {
      const isParticipant1 = existingConversation.participant1Id === auth.user.id
      const otherParticipant = isParticipant1
        ? existingConversation.participant2
        : existingConversation.participant1
      const unreadCount = existingConversation.messages.filter(
        (msg) => !msg.isRead && msg.senderId !== auth.user.id
      ).length

      return NextResponse.json({
        conversation: {
          id: existingConversation.id,
          otherParticipant,
          lastMessage: existingConversation.lastMessage,
          lastMessageAt: existingConversation.lastMessageAt,
          unreadCount,
          createdAt: existingConversation.createdAt,
        },
      })
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        participant1Id: auth.user.id,
        participant2Id: recipientId,
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        participant2: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        messages: {
          select: { id: true, isRead: true, senderId: true },
        },
      },
    })

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherParticipant: recipient,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: 0,
        createdAt: conversation.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
