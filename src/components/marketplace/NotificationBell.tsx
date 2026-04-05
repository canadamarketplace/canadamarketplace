'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth, useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import {
  Bell,
  Package,
  MessageCircle,
  Star,
  DollarSign,
  AlertTriangle,
  CheckCheck,
  ChevronRight,
  BellOff,
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link?: string | null
  createdAt: string
}

const typeIcons: Record<string, { icon: typeof Package; color: string; bg: string }> = {
  ORDER: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  MESSAGE: { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  REVIEW: { icon: Star, color: 'text-red-300', bg: 'bg-red-500/10' },
  PAYOUT: { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  DISPUTE: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
}

function getTypeIcon(type: string) {
  return typeIcons[type] || { icon: Bell, color: 'text-stone-400', bg: 'bg-white/5' }
}

function formatRelativeTime(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSecs < 60) return t('notifications.justNow')
  if (diffMins < 60) return t('notifications.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('notifications.hoursAgo', { count: diffHours })
  if (diffDays === 1) return t('notifications.yesterday')
  if (diffDays < 7) return t('notifications.daysAgo', { count: diffDays })
  if (diffWeeks < 4) return t('notifications.weeksAgo', { count: diffWeeks })
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export default function NotificationBell() {
  const { user } = useAuth()
  const { navigate } = useNavigation()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [user])

  // WebSocket connection
  useEffect(() => {
    if (!user) return

    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[NotificationBell] WebSocket connected')
      // Join user's notification room
      socket.emit('join', { room: `notifications-${user.id}` })
      // On successful connection, clear polling fallback
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    })

    socket.on('notification', (data: { id: string; type: string; title: string; message: string; link?: string; createdAt: string }) => {
      // Add to notifications list at the top
      setNotifications((prev) => [
        {
          id: data.id,
          type: data.type,
          title: data.title,
          message: data.message,
          isRead: false,
          link: data.link || null,
          createdAt: data.createdAt,
        },
        ...prev,
      ])
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      const { icon: Icon } = getTypeIcon(data.type)
      const toastFn = typeof window !== 'undefined' && (window as Record<string, unknown>).sonnerToast
      if (toastFn) {
        // toast imported from sonner at module level won't work inside socket callback reliably,
        // so we use a dynamic approach
      }
    })

    socket.on('disconnect', () => {
      console.log('[NotificationBell] WebSocket disconnected, falling back to polling')
      // Start polling as fallback
      if (!pollingIntervalRef.current) {
        fetchNotifications()
        pollingIntervalRef.current = setInterval(fetchNotifications, 30000)
      }
    })

    socket.on('reconnect', () => {
      console.log('[NotificationBell] WebSocket reconnected')
      socket.emit('join', { room: `notifications-${user.id}` })
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    })

    // Initial fetch + start polling (polling runs until WebSocket connects)
    fetchNotifications()
    pollingIntervalRef.current = setInterval(fetchNotifications, 30000)

    return () => {
      socket.disconnect()
      socketRef.current = null
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [user, fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    if (!user) return

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({ isRead: true }),
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }

    setIsOpen(false)
    if (link) {
      navigate(link as Parameters<typeof navigate>[0])
    }
  }

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return
    setMarkingAll(true)
    try {
      const res = await fetch('/api/notifications/mark-all', {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  if (!user) return null

  return (
    <>
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5 transition-all"
        aria-label={t('notifications.title')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-stone-100">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {markingAll ? t('notifications.marking') : t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellOff className="w-10 h-10 text-stone-600 mb-3" />
                <p className="text-sm text-stone-500">{t('notifications.noNotifications')}</p>
                <p className="text-xs text-stone-600 mt-1">{t('notifications.noNotificationsDesc')}</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 10).map((notification) => {
                  const { icon: Icon, color, bg } = getTypeIcon(notification.type)
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id, notification.link)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 border-b border-white/5 last:border-b-0 ${
                        !notification.isRead ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      {/* Type Icon */}
                      <div className={`shrink-0 w-8 h-8 rounded-lg ${bg} flex items-center justify-center mt-0.5`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className={`text-sm leading-snug flex-1 ${!notification.isRead ? 'font-semibold text-stone-100' : 'text-stone-300'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-stone-600 mt-1">
                          {formatRelativeTime(notification.createdAt, t)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/10">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('notifications')
                }}
                className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
              >
                {t('notifications.viewAll')}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
