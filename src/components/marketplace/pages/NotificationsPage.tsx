'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useNavigation } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Package,
  MessageCircle,
  Star,
  DollarSign,
  AlertTriangle,
  CheckCheck,
  Trash2,
  BellOff,
  Filter,
  Loader2,
  ChevronLeft,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link?: string | null
  createdAt: string
}

type FilterTab = 'ALL' | 'UNREAD' | 'ORDER' | 'MESSAGE' | 'REVIEW' | 'PAYOUT' | 'DISPUTE'

const typeIcons: Record<string, { icon: typeof Package; color: string; bg: string }> = {
  ORDER: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  MESSAGE: { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  REVIEW: { icon: Star, color: 'text-red-300', bg: 'bg-red-500/10 border-red-500/20' },
  PAYOUT: { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  DISPUTE: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
}

const filterTabs: { key: FilterTab; label: string; icon: typeof Filter }[] = [
  { key: 'ALL', label: 'All', icon: Bell },
  { key: 'UNREAD', label: 'Unread', icon: Filter },
  { key: 'ORDER', label: 'Orders', icon: Package },
  { key: 'MESSAGE', label: 'Messages', icon: MessageCircle },
  { key: 'REVIEW', label: 'Reviews', icon: Star },
  { key: 'PAYOUT', label: 'Payouts', icon: DollarSign },
  { key: 'DISPUTE', label: 'Disputes', icon: AlertTriangle },
]

function getTypeIcon(type: string) {
  return typeIcons[type] || { icon: Bell, color: 'text-cm-muted', bg: 'bg-cm-hover border-cm-border-hover' }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const { user } = useAuth()
  const { navigate } = useNavigation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [markingAll, setMarkingAll] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'UNREAD') return !n.isRead
    return n.type === activeTab
  })

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visibleNotifications = filteredNotifications.slice(0, visibleCount)
  const hasMore = visibleCount < filteredNotifications.length

  // Reset visible count when tab changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeTab])

  const handleMarkAsRead = async (notification: Notification) => {
    if (!user || notification.isRead) return
    setMarkingId(notification.id)

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await fetch(`/api/notifications/${notification.id}`, {
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
    } finally {
      setMarkingId(null)
      if (notification.link) {
        navigate(notification.link as Parameters<typeof navigate>[0])
      }
    }
  }

  const handleToggleRead = async (notification: Notification) => {
    if (!user) return
    const newReadState = !notification.isRead

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: newReadState } : n))
    )
    setUnreadCount((prev) =>
      newReadState ? Math.max(0, prev - 1) : prev + 1
    )

    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({ isRead: newReadState }),
      })
    } catch (error) {
      console.error('Failed to toggle read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    setDeletingId(id)
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    } finally {
      setDeletingId(null)
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-cm-faint mx-auto mb-4" />
          <p className="text-cm-muted mb-4">Please sign in to view notifications</p>
          <Button
            onClick={() => navigate('home')}
            variant="outline"
            className="border-cm-border-hover text-cm-primary hover:bg-cm-hover"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1.5 text-sm text-cm-dim hover:text-cm-secondary mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cm-primary">Notifications</h1>
            <p className="text-sm text-cm-dim mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'You\'re all caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              variant="outline"
              size="sm"
              className="border-cm-border-hover text-cm-primary hover:bg-cm-hover hover:text-cm-primary"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4 mr-2" />
              )}
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.key
            const count =
              tab.key === 'ALL'
                ? notifications.length
                : tab.key === 'UNREAD'
                  ? notifications.filter((n) => !n.isRead).length
                  : notifications.filter((n) => n.type === tab.key).length

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-cm-dim hover:text-cm-secondary hover:bg-cm-hover border border-transparent'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-medium flex items-center justify-center ${
                      isActive ? 'bg-red-500/20 text-red-300' : 'bg-cm-hover text-cm-dim'
                    }`}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cm-faint animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-cm-elevated border border-cm-border-subtle rounded-xl p-12 text-center">
            <BellOff className="w-12 h-12 text-cm-faint mx-auto mb-4" />
            <h3 className="text-lg font-medium text-cm-muted mb-2">No notifications</h3>
            <p className="text-sm text-cm-dim">
              {activeTab === 'ALL'
                ? "You don't have any notifications yet."
                : activeTab === 'UNREAD'
                  ? "All notifications have been read."
                  : `No ${activeTab.toLowerCase()} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleNotifications.map((notification) => {
              const { icon: Icon, color, bg } = getTypeIcon(notification.type)
              const isMarking = markingId === notification.id
              const isDeleting = deletingId === notification.id

              return (
                <div
                  key={notification.id}
                  className={`group bg-cm-elevated border rounded-xl p-4 transition-all hover:border-cm-border-hover ${
                    !notification.isRead
                      ? 'border-blue-500/20 bg-blue-500/[0.02]'
                      : 'border-cm-border-subtle'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <button
                      onClick={() => handleMarkAsRead(notification)}
                      className={`shrink-0 w-10 h-10 rounded-xl ${bg} border flex items-center justify-center transition-all hover:scale-105 ${
                        isMarking ? 'opacity-50' : ''
                      }`}
                      title={notification.isRead ? 'Already read' : 'Mark as read & navigate'}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {!notification.isRead && (
                            <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shadow-lg shadow-blue-500/30" />
                          )}
                          <h3
                            className={`text-sm leading-snug ${
                              !notification.isRead
                                ? 'font-semibold text-cm-primary'
                                : 'font-medium text-cm-secondary'
                            }`}
                          >
                            {notification.title}
                          </h3>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleRead(notification)}
                            className="p-1.5 rounded-lg hover:bg-cm-hover text-cm-dim hover:text-cm-secondary transition-colors"
                            title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-cm-dim hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Delete notification"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-cm-muted mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-cm-faint">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        {notification.link && (
                          <button
                            onClick={() => handleMarkAsRead(notification)}
                            className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                          >
                            View details →
                          </button>
                        )}
                        <span
                          className="text-[10px] text-cm-faint uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-cm-hover"
                          title={formatFullDate(notification.createdAt)}
                        >
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  variant="outline"
                  className="border-cm-border-hover text-cm-primary hover:bg-cm-hover hover:text-cm-primary"
                >
                  Load More ({filteredNotifications.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
