import { io, Socket } from 'socket.io-client'

/**
 * Centralized Socket.io client connection for the Canada Marketplace.
 *
 * IMPORTANT: Uses XTransformPort query parameter for Caddy reverse proxy routing.
 * NEVER use "http://localhost:3003" directly in the URL.
 */

let socketInstance: Socket | null = null

export function getSocket(userId?: string | null, userRole?: string | null): Socket {
  if (socketInstance?.connected) {
    return socketInstance
  }

  // Disconnect existing socket if any
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }

  const query: Record<string, string> = {}
  if (userId) query['x-user-id'] = userId
  if (userRole) query['x-user-role'] = userRole

  socketInstance = io('/?XTransformPort=3003', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    query,
  })

  socketInstance.on('connect', () => {
    console.log('[Socket] Connected:', socketInstance!.id)
  })

  socketInstance.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
  })

  socketInstance.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message)
  })

  return socketInstance
}

/**
 * Disconnect and clean up the socket instance.
 * Call this on logout.
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

/**
 * Reconnect the socket with new user credentials.
 * Call this on login/logout.
 */
export function reconnectSocket(userId?: string | null, userRole?: string | null) {
  disconnectSocket()
  if (userId) {
    return getSocket(userId, userRole)
  }
  return null
}
