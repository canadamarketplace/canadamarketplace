/**
 * Helper to emit events to the realtime Socket.io service.
 * The socket service runs on port 3003 and exposes an HTTP /emit endpoint.
 */
const SOCKET_SERVICE_URL = process.env.SOCKET_SERVICE_URL || 'http://localhost:3003'

interface EmitOptions {
  event: string
  room?: string
  data: unknown
}

export async function emitToSocket(options: EmitOptions): Promise<void> {
  try {
    const res = await fetch(`${SOCKET_SERVICE_URL}/emit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: options.event,
        room: options.room || null,
        data: options.data,
      }),
    })

    if (!res.ok) {
      console.warn(`[Socket Emit] Failed to emit "${options.event}": ${res.status}`)
    }
  } catch (error) {
    // Socket service may not be running — fail silently
    console.warn(`[Socket Emit] Socket service unreachable, skipping emit "${options.event}"`)
  }
}

/**
 * Emit a new message to a conversation room.
 */
export async function emitNewMessage(conversationId: string, message: unknown): Promise<void> {
  // Emit to the new room format
  await emitToSocket({
    event: `message:${conversationId}`,
    room: `conversation:${conversationId}`,
    data: message,
  })
  // Also emit to legacy room format for backward compatibility
  await emitToSocket({
    event: 'message',
    room: `messaging-${conversationId}`,
    data: message,
  })
}

/**
 * Emit a new notification to a user's room.
 */
export async function emitNewNotification(userId: string, notification: unknown): Promise<void> {
  await emitToSocket({
    event: 'notification',
    room: `notifications-${userId}`,
    data: notification,
  })
}
