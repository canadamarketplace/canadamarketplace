'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Send, MessageCircle, Search, ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'

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
  SELLER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  BUYER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function MessagingPage() {
  const { user } = useAuth()
  const { navigate, pageParams } = useNavigation()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [fullConversation, setFullConversation] = useState<FullConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          setMessages(data.conversation.messages || [])

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

    fetchMessages()
  }, [selectedConversationId, user])

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

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user || sendingMessage) return

    const messageContent = newMessage.trim()
    setNewMessage('')

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
    setMessages((prev) => [...prev, optimisticMessage])

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
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? data.message : m))
        )
      } else {
        toast.error('Failed to send message')
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      }
    } catch (error) {
      toast.error('Failed to send message')
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
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

  // Loading state
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <MessageCircle className="w-16 h-16 text-stone-700 mb-4" />
          <h2 className="text-xl font-semibold text-stone-300 mb-2">Sign in to message sellers</h2>
          <p className="text-stone-500 mb-6">You need an account to send messages</p>
          <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-stone-100">Messages</h1>
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 border">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex gap-0 rounded-2xl overflow-hidden border border-white/5 bg-neutral-900/60" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        {/* Left Panel — Conversation List */}
        <div
          className={`flex flex-col border-r border-white/5 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-[360px] flex-shrink-0`}
        >
          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-neutral-800 border-white/10 text-stone-100 placeholder:text-stone-600 rounded-xl h-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-sm text-stone-500 mt-3">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <MessageCircle className="w-12 h-12 text-stone-700 mb-3" />
                <p className="text-stone-400 font-medium mb-1">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-sm text-stone-600 text-center">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a conversation by messaging a seller from a product page'}
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
                        ? 'bg-white/5 border border-white/10'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={conv.otherParticipant.avatar || undefined} alt={conv.otherParticipant.name} />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-amber-500 text-white text-sm font-semibold">
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
                        <span className="text-sm font-medium text-stone-200 truncate">
                          {conv.otherParticipant.name}
                        </span>
                        <span className="text-[10px] text-stone-600 flex-shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-xs truncate flex-1 ${conv.unreadCount > 0 ? 'text-stone-300 font-medium' : 'text-stone-500'}`}>
                          {conv.lastMessage || 'No messages yet'}
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
              <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-neutral-900/80">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-stone-400 hover:text-stone-200 hover:bg-white/5 h-9 w-9"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={fullConversation.otherParticipant.avatar || undefined} alt={fullConversation.otherParticipant.name} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-amber-500 text-white text-sm font-semibold">
                    {getInitials(fullConversation.otherParticipant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-stone-100 truncate">
                    {fullConversation.otherParticipant.name}
                  </h3>
                  <Badge className={`${ROLE_COLORS[fullConversation.otherParticipant.role] || ROLE_COLORS.BUYER} text-[10px] border px-1.5 py-0 mt-0.5`}>
                    {fullConversation.otherParticipant.role}
                  </Badge>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3 max-w-3xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <MessageCircle className="w-12 h-12 text-stone-700 mb-3" />
                      <p className="text-stone-400 font-medium">No messages yet</p>
                      <p className="text-sm text-stone-600 mt-1">
                        Say hello to {fullConversation.otherParticipant.name}!
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
                              <AvatarFallback className="bg-gradient-to-br from-red-500 to-amber-500 text-white text-[10px] font-semibold">
                                {getInitials(msg.sender.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                msg.isOwn
                                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-md'
                                  : 'bg-neutral-800 text-stone-200 rounded-bl-md'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1.5 mt-1 px-1 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="text-[10px] text-stone-600">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {msg.isOwn && (
                                msg.isRead
                                  ? <span className="text-[10px] text-blue-400">Read</span>
                                  : <span className="text-[10px] text-stone-600">Sent</span>
                              )
                            }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-white/5 bg-neutral-900/80">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                  <Input
                    ref={inputRef}
                    placeholder={`Message ${fullConversation.otherParticipant.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-neutral-800 border-white/10 text-stone-100 placeholder:text-stone-600 rounded-xl h-11"
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
              <div className="w-20 h-20 rounded-2xl bg-neutral-800/60 border border-white/5 flex items-center justify-center mb-5">
                <MessageCircle className="w-10 h-10 text-stone-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-300 mb-2">Select a conversation</h3>
              <p className="text-sm text-stone-500 text-center max-w-sm">
                Choose a conversation from the list or start a new one by messaging a seller from any product page.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('browse')}
                className="mt-5 border-white/10 text-stone-400 hover:bg-white/5 hover:text-stone-200 rounded-xl"
              >
                Browse Products
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
