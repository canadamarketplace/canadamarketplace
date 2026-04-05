'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket, reconnectSocket } from '@/lib/socket'
import { useAuth } from '@/lib/store'

/**
 * Core socket hook — returns the socket instance and connection status.
 * Automatically connects when user is authenticated.
 */
export function useSocket() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user) {
      disconnectSocket()
      socketRef.current = null
      setIsConnected(false)
      setOnlineUsers([])
      return
    }

    const socket = getSocket(user.id, user.role)
    socketRef.current = socket

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // Online status tracking
    socket.on('user-online', (data: { userId: string }) => {
      setOnlineUsers((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      )
    })

    socket.on('user-offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId))
    })

    socket.on('online-users', (users: string[]) => {
      setOnlineUsers(users)
    })

    // Request current online users
    socket.emit('get-online-users')

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('user-online')
      socket.off('user-offline')
      socket.off('online-users')
    }
  }, [user])

  const isUserOnline = useCallback(
    (userId: string) => onlineUsers.includes(userId),
    [onlineUsers]
  )

  // Provide a function to access the socket (avoids returning ref during render)
  const getSocketInstance = useCallback(() => socketRef.current, [])

  return {
    isConnected,
    onlineUsers,
    isUserOnline,
    getSocketInstance,
  }
}

/**
 * Conversation-specific socket hook.
 * Handles joining/leaving conversation rooms, sending/receiving messages,
 * and typing indicators.
 */
export function useConversationSocket(conversationId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<{ userId: string; isTyping: boolean } | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Connect and join conversation room
  useEffect(() => {
    if (!user || !conversationId) return

    const socket = getSocket(user.id, user.role)
    socketRef.current = socket

    // Join the conversation room (new event name)
    socket.emit('join-conversation', conversationId)
    // Also join via legacy event name for backward compat
    socket.emit('join', { room: `messaging-${conversationId}` })

    // Listen for messages via new event name
    const handleMessage = (data: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data]
      })
    }

    socket.on(`message:${conversationId}`, handleMessage)
    // Also listen on legacy event
    socket.on('message', (data: any) => {
      // Only process if this message belongs to our conversation
      if (data?.conversationId === conversationId || data?.sender?.id !== user.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev
          return [...prev, data]
        })
      }
    })

    // Typing indicators
    const handleTyping = (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (data.userId !== user.id && data.conversationId === conversationId) {
        setTypingUser({ userId: data.userId, isTyping: data.isTyping })
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        // Auto-clear typing after 3 seconds of no updates
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null)
          }, 3000)
        }
      }
    }

    socket.on('typing', handleTyping)

    return () => {
      socket.emit('leave-conversation', conversationId)
      socket.emit('leave', { room: `messaging-${conversationId}` })
      socket.off(`message:${conversationId}`, handleMessage)
      socket.off('message')
      socket.off('typing', handleTyping)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [user, conversationId])

  const sendMessage = useCallback(
    (messageData: any) => {
      if (!socketRef.current?.connected || !conversationId) return
      socketRef.current.emit('send-message', {
        conversationId,
        message: messageData,
      })
    },
    [conversationId]
  )

  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!socketRef.current?.connected || !conversationId) return
      socketRef.current.emit('typing', {
        conversationId,
        isTyping: typing,
      })
    },
    [conversationId]
  )

  const addLocalMessage = useCallback((message: any) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    addLocalMessage,
    clearMessages,
    sendMessage,
    sendTyping,
    isTyping: typingUser?.isTyping ?? false,
    typingUserId: typingUser?.userId ?? null,
  }
}

/**
 * Notification socket hook.
 * Listens for new notifications pushed via WebSocket.
 */
export function useNotificationSocket() {
  const { user } = useAuth()
  const [latestNotification, setLatestNotification] = useState<any>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user) return

    const socket = getSocket(user.id, user.role)
    socketRef.current = socket

    // Join user's notification room
    socket.emit('join', { room: `notifications-${user.id}` })

    // Listen for new notifications
    const handleNotification = (data: any) => {
      setLatestNotification(data)
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [user])

  const clearLatest = useCallback(() => {
    setLatestNotification(null)
  }, [])

  return {
    latestNotification,
    clearLatest,
  }
}
