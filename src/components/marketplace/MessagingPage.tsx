'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth, useNavigation } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Send, MessageCircle, Search, ArrowLeft, User, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSocket, useConversationSocket } from '@/hooks/use-socket'

interface ConversationSummary {
  id: string
  otherParticipant: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
}

interface ChatMessage {
  id: string
  content: string
  type: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
  isOwn: boolean
}

interface FullConversation {
  id: string
  otherParticipant: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
  lastMessage: string | null
  lastMessageAt: string | null
  createdAt: string
  messages: ChatMessage[]
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const ROLE_COLORS: Record<string, string> = {
  SELLER: 'bg-red-500/10 text-red-300 border-red-500/20',
  BUYER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function MessagingPage() {
  const { user } = useAuth()
  const { navigate, pageParams } = useNavigation()
  const { t } = useTranslation()
  const { isConnected: socketConnected, isUserOnline } = useSocket()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [fullConversation, setFullConversation] = useState<FullConversation | null>(null)
  const [baseMessages, setBaseMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Socket hook for the selected conversation
  const {
    messages: socketMessages,
    addLocalMessage,
    clearMessages: clearSocketMessages,
    sendMessage: sendSocketMessage,
    sendTyping,
    isTyping: isOtherTyping,
    typingUserId,
  } = useConversationSocket(selectedConversationId)

  // Merge base messages (from API) with socket messages
  const messages = baseMessages.length > 0 || socketMessages.length === 0
    ? baseMessages
    : socketMessages

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user-id': user!.id,
    'x-user-role': user!.role,
  }), [user])

  // Fetch conversations on mount
  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations', {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role },
        })
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      }
      setLoading(false)
    }

    fetchConversations()
  }, [user])

  // Auto-start conversation with recipient from pageParams
  useEffect(() => {
    if (!user || !pageParams.recipientId) return

    const startConversation = async () => {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ recipientId: pageParams.recipientId }),
        })

        if (res.ok) {
          const data = await res.json()
          const conv = data.conversation
          setSelectedConversationId(conv.id)
          setMobileShowChat(true)
          // Refresh conversations list
          const listRes = await fetch('/api/conversations', {
            headers: { 'x-user-id': user.id, 'x-user-role': user.role },
          })
          if (listRes.ok) {
            const listData = await listRes.json()
            setConversations(listData.conversations || [])
          }
        }
      } catch (error) {
        console.error('Failed to start conversation:', error)
      }
    }

    startConversation()
  }, [user, pageParams.recipientId, authHeaders])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversationId || !user) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedConversationId}`, {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role },
        })
        if (res.ok) {
          const data = await res.json()
          setFullConversation(data.conversation)
          setBaseMessages(data.conversation.messages || [])

          // Update unread count to 0 for this conversation in the list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c
            )
          )
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }

    // Clear previous socket messages
    clearSocketMessages()
    fetchMessages()
  }, [selectedConversationId, user, clearSocketMessages])

  // Merge incoming socket messages into base messages
  useEffect(() => {
    if (socketMessages.length === 0) return
    setBaseMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id))
      const newMsgs = socketMessages.filter((m: any) => !existingIds.has(m.id))
      if (newMsgs.length === 0) return prev
      return [...prev, ...newMsgs]
    })
  }, [socketMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Select conversation
  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId)
    setMobileShowChat(true)
    setMessages([])
    setFullConversation(null)
  }

  // Go back to list on mobile
  const handleBackToList = () => {
    setMobileShowChat(false)
  }

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setNewMessage(value)
    sendTyping(true)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false)
    }, 2000)
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user || sendingMessage) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // Stop typing indicator
    sendTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      type: 'TEXT',
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || null,
        role: user.role,
      },
      isOwn: true,
    }
    setBaseMessages((prev) => [...prev, optimisticMessage])
    addLocalMessage(optimisticMessage)

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
          : c
      )
    )

    try {
      setSendingMessage(true)
      const res = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: messageContent }),
      })

      if (res.ok) {
        const data = await res.json()
        const realMessage = data.message
        // Replace optimistic message with real one
        setBaseMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? { ...realMessage, isOwn: true } : m))
        )
      } else {
        toast.error(t('messaging.failedToSend'))
        // Remove optimistic message on failure
        setBaseMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      }
    } catch (error) {
      toast.error(t('messaging.failedToSend'))
      setBaseMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
    } finally {
      setSendingMessage(false)
      inputRef.current?.focus()
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conv) =>
    conv.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConvSummary = conversations.find((c) => c.id === selectedConversationId)
  const isParticipantOnline = selectedConversationId && fullConversation
    ? isUserOnline(fullConversation.otherParticipant.id)
    : false

  // Loading state
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <MessageCircle className="w-16 h-16 text-cm-faint mb-4" />
          <h2 className="text-xl font-semibold text-cm-secondary mb-2">{t('messaging.signInToMessage')}</h2>
          <p className="text-cm-dim mb-6">{t('messaging.signInToMessageDesc')}</p>
          <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
            {t('nav.signIn')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-cm-primary">{t('messaging.title')}</h1>
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 border">
          {conversations.length} {conversations.length !== 1 ? t('messaging.conversations_plural') : t('messaging.conversations')}
        </Badge>
        {/* Connection Status */}
        <div className={`flex items-center gap-1.5 ml-auto text-xs ${socketConnected ? 'text-green-400' : 'text-red-400'}`}>
          {socketConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Reconnecting...
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-0 rounded-2xl overflow-hidden border border-cm-border-subtle bg-cm-elevated" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        {/* Left Panel — Conversation List */}
        <div
          className={`flex flex-col border-r border-cm-border-subtle ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-[360px] flex-shrink-0`}
        >
          {/* Search */}
          <div className="p-4 border-b border-cm-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-dim" />
              <Input
                placeholder={t('messaging.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-cm-input border-cm-border-hover text-cm-primary placeholder:text-cm-faint rounded-xl h-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-sm text-cm-dim mt-3">{t('messaging.loadingConversations')}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <MessageCircle className="w-12 h-12 text-cm-faint mb-3" />
                <p className="text-cm-muted font-medium mb-1">
                  {searchQuery ? t('messaging.noConversationsFound') : t('messaging.noConversations')}
                </p>
                <p className="text-sm text-cm-faint text-center">
                  {searchQuery
                    ? t('messaging.tryDifferentSearch')
                    : t('messaging.noConversationsDesc')}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                      selectedConversationId === conv.id
                        ? 'bg-cm-hover border border-cm-border-hover'
                        : 'hover:bg-cm-hover border border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={conv.otherParticipant.avatar || undefined} alt={conv.otherParticipant.name} />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-500 text-white text-sm font-semibold">
                          {getInitials(conv.otherParticipant.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-cm-secondary truncate">
                          {conv.otherParticipant.name}
                        </span>
                        <span className="text-[10px] text-cm-faint flex-shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-xs truncate flex-1 ${conv.unreadCount > 0 ? 'text-cm-secondary font-medium' : 'text-cm-dim'}`}>
                          {conv.lastMessage || ''}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel — Chat View */}
        <div
          className={`flex flex-col flex-1 ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConversationId && fullConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-cm-border-subtle bg-cm-elevated/80">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-cm-secondary hover:text-cm-primary hover:bg-cm-hover h-9 w-9"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={fullConversation.otherParticipant.avatar || undefined} alt={fullConversation.otherParticipant.name} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-500 text-white text-sm font-semibold">
                      {getInitials(fullConversation.otherParticipant.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator dot on avatar */}
                  {isParticipantOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-neutral-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-cm-primary truncate">
                    {fullConversation.otherParticipant.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={`${ROLE_COLORS[fullConversation.otherParticipant.role] || ROLE_COLORS.BUYER} text-[10px] border px-1.5 py-0`}>
                      {fullConversation.otherParticipant.role}
                    </Badge>
                    <span className={`flex items-center gap-1 text-[10px] ${isParticipantOnline ? 'text-green-400' : 'text-cm-dim'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isParticipantOnline ? 'bg-green-400' : 'bg-stone-500'}`} />
                      {isParticipantOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3 max-w-3xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <MessageCircle className="w-12 h-12 text-cm-faint mb-3" />
                      <p className="text-cm-muted font-medium">{t('messaging.noMessagesYet')}</p>
                      <p className="text-sm text-cm-faint mt-1">
                        {t('messaging.sayHelloTo', { name: fullConversation.otherParticipant.name })}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex gap-2 max-w-[75%] ${
                            msg.isOwn ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          {/* Avatar for received messages */}
                          {!msg.isOwn && (
                            <Avatar className="w-7 h-7 flex-shrink-0 mt-auto">
                              <AvatarImage src={msg.sender.avatar || undefined} alt={msg.sender.name} />
                              <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-500 text-white text-[10px] font-semibold">
                                {getInitials(msg.sender.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                msg.isOwn
                                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-md'
                                  : 'bg-cm-input text-cm-secondary rounded-bl-md'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1.5 mt-1 px-1 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="text-[10px] text-cm-faint">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {msg.isOwn && (
                                msg.isRead
                                  ? <span className="text-[10px] text-blue-400">{t('messaging.read')}</span>
                                  : <span className="text-[10px] text-cm-faint">{t('messaging.sent')}</span>
                              )
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {isOtherTyping && typingUserId !== user?.id && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[75%]">
                        <Avatar className="w-7 h-7 flex-shrink-0 mt-auto">
                          <AvatarImage src={fullConversation.otherParticipant.avatar || undefined} alt={fullConversation.otherParticipant.name} />
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-500 text-white text-[10px] font-semibold">
                            {getInitials(fullConversation.otherParticipant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-cm-input px-4 py-3 rounded-2xl rounded-bl-md">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-cm-border-subtle bg-cm-elevated/80">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                  <Input
                    ref={inputRef}
                    placeholder={t('messaging.message', { name: fullConversation.otherParticipant.name })}
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sendingMessage}
                    className="flex-1 bg-cm-input border-cm-border-hover text-cm-primary placeholder:text-cm-faint rounded-xl h-11 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11 w-11 p-0 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : selectedConversationId && !fullConversation ? (
            /* Loading conversation */
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : (
            /* Empty state — no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-cm-input border border-cm-border-subtle flex items-center justify-center mb-5">
                <MessageCircle className="w-10 h-10 text-cm-faint" />
              </div>
              <h3 className="text-lg font-semibold text-cm-secondary mb-2">{t('messaging.selectConversation')}</h3>
              <p className="text-sm text-cm-dim text-center max-w-sm">
                {t('messaging.selectConversationDesc')}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('browse')}
                className="mt-5 border-cm-border-hover text-cm-primary hover:bg-cm-hover hover:text-cm-primary rounded-xl"
              >
                {t('browse.title')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
