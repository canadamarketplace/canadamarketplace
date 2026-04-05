'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigation, useAuth, useCart } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MessageCircle, X, Send, ShoppingCart, Search, Leaf, Shield, UserPlus,
  Store, ChevronRight, Sparkles, Loader2, Package, HelpCircle, ArrowRight,
  Trash2, Minus, MapPin, Bell, Heart, Truck, BookOpen, User
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: { label: string; action: string; params?: Record<string, string> }[]
  timestamp: Date
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match
  let keyIdx = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[0].startsWith('**')) {
      parts.push(
        <strong key={`b-${keyIdx}`} className="font-semibold text-stone-100">
          {match[0].slice(2, -2)}
        </strong>
      )
    } else {
      parts.push(
        <em key={`i-${keyIdx}`} className="italic text-stone-300">
          {match[0].slice(1, -1)}
        </em>
      )
    }
    lastIndex = match.index + match[0].length
    keyIdx++
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function parseMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const blocks = text.split(/\n\n+/)

  blocks.forEach((block, blockIdx) => {
    const lines = block.split('\n')
    const isList = lines.every(l => /^[\s]*[-*]\s/.test(l.trim()))

    if (isList) {
      nodes.push(
        <ul key={`block-${blockIdx}`} className="list-disc list-inside space-y-0.5 my-1">
          {lines.map((line, li) => {
            const cleaned = line.replace(/^[\s]*[-*]\s/, '').trim()
            return <li key={li}>{renderInline(cleaned)}</li>
          })}
        </ul>
      )
    } else {
      const parts = block.split('\n')
      parts.forEach((line, lineIdx) => {
        if (lineIdx > 0) {
          nodes.push(<br key={`br-${blockIdx}-${lineIdx}`} />)
        }
        nodes.push(<span key={`span-${blockIdx}-${lineIdx}`}>{renderInline(line)}</span>)
      })
    }
  })

  return nodes
}

export default function ChatAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigate, currentPage } = useNavigation()
  const { user } = useAuth()
  const { items: cartItems } = useCart()
  const { t, locale } = useTranslation()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true)
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: user
          ? t('chat.greetingLoggedIn', { name: user.name.split(' ')[0] })
          : t('chat.greeting'),
        actions: [
          { label: t('home.startShopping'), action: 'browse' },
          { label: t('nav.howItWorks'), action: 'safety' },
          { label: t('nav.getStarted'), action: 'register' },
        ],
        timestamp: new Date(),
      }
      setMessages([greeting])
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, hasGreeted, user, t])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          cartItems,
          currentPage,
          user: user ? { name: user.name, role: user.role, email: user.email } : null,
          locale,
        }),
      })

      const data = await response.json()

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        actions: data.actions || [],
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('chat.connectionError'),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = (action: string, params?: Record<string, string>) => {
    switch (action) {
      case 'browse':
        navigate('browse', params || {})
        break
      case 'cart':
        navigate('cart')
        break
      case 'checkout':
        navigate('checkout')
        break
      case 'register':
        useNavigation.getState().openAuthModal('register')
        break
      case 'register-seller':
        useNavigation.getState().openAuthModal('register-seller')
        break
      case 'become-seller':
        navigate('become-seller')
        break
      case 'orders':
        navigate('orders')
        break
      case 'safety':
        navigate('safety')
        break
      case 'seller-locator':
        navigate('seller-locator')
        break
      case 'messaging':
        navigate('messaging')
        break
      case 'notifications':
        navigate('notifications')
        break
      case 'wishlist':
        navigate('wishlist')
        break
      case 'faq':
        navigate('faq')
        break
      case 'shipping':
        navigate('shipping')
        break
      case 'escrow':
        navigate('escrow')
        break
      case 'seller-guide':
        navigate('seller-guide')
        break
      case 'profile':
        navigate('profile')
        break
      default:
        if (action) navigate(action, params || {})
        break
    }
  }

  const clearChat = () => {
    setMessages([])
    setHasGreeted(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const QUICK_PROMPTS = [
    { label: t('chat.findAProduct'), icon: Search, message: "I'm looking for a specific product" },
    { label: t('chat.howCheckoutWorks'), icon: ShoppingCart, message: "How does checkout work?" },
    { label: t('chat.isItSafe'), icon: Shield, message: "How are buyers protected?" },
    { label: t('chat.startSelling'), icon: Store, message: "I want to sell on Canada Marketplace" },
  ]

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 flex items-center justify-center hover:shadow-red-500/50 transition-shadow group"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[60] w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
            style={{ background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111]/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                    {t('chat.mapleAI')}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-300 font-medium border border-red-500/20">{t('chat.beta')}</span>
                  </h3>
                  <p className="text-[11px] text-stone-500">{t('chat.yourAssistant')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all"
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Leaf className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[82%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-md'
                            : 'bg-white/5 text-stone-200 rounded-bl-md border border-white/5'
                        }`}
                      >
                        {msg.role === 'assistant' ? parseMarkdown(msg.content) : msg.content}
                      </div>

                      {/* Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.actions.map((action, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => handleAction(action.action, action.params)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-white transition-all group"
                            >
                              {getActionIcon(action.action)}
                              {action.label}
                              <ChevronRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* "Maple is thinking..." Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                      </motion.div>
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-red-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          />
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-red-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-red-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-xs text-stone-500">{t('chat.mapleThinking')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Prompts (show only on initial state) */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.message)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-stone-400 hover:bg-white/10 hover:text-stone-200 transition-all"
                    >
                      <prompt.icon className="w-3 h-3" />
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/5 bg-[#111]/60 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  disabled={isLoading}
                  className="flex-1 h-9 bg-white/5 border-white/10 rounded-xl text-sm text-stone-200 placeholder:text-stone-600 focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-9 w-9 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-stone-600 mt-1.5 text-center">
                {t('chat.aiDisclaimer')}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function getActionIcon(action: string) {
  switch (action) {
    case 'browse': return <Search className="w-3 h-3" />
    case 'cart': return <ShoppingCart className="w-3 h-3" />
    case 'checkout': return <ArrowRight className="w-3 h-3" />
    case 'register': return <UserPlus className="w-3 h-3" />
    case 'register-seller': return <Store className="w-3 h-3" />
    case 'become-seller': return <Store className="w-3 h-3" />
    case 'orders': return <Package className="w-3 h-3" />
    case 'safety': return <Shield className="w-3 h-3" />
    case 'seller-locator': return <MapPin className="w-3 h-3" />
    case 'messaging': return <MessageCircle className="w-3 h-3" />
    case 'notifications': return <Bell className="w-3 h-3" />
    case 'wishlist': return <Heart className="w-3 h-3" />
    case 'faq': return <HelpCircle className="w-3 h-3" />
    case 'shipping': return <Truck className="w-3 h-3" />
    case 'escrow': return <Shield className="w-3 h-3" />
    case 'seller-guide': return <BookOpen className="w-3 h-3" />
    case 'profile': return <User className="w-3 h-3" />
    default: return <HelpCircle className="w-3 h-3" />
  }
}
