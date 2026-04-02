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
  Store, ChevronRight, Sparkles, Loader2, Package, HelpCircle, ArrowRight
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: { label: string; action: string; params?: Record<string, string> }[]
  timestamp: Date
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
        const { openAuthModal } = useNavigation.getState()
        openAuthModal('register')
        break
      case 'register-seller':
        const nav = useNavigation.getState()
        nav.openAuthModal('register-seller')
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
      default:
        break
    }
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
          {/* Pulse ring */}
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
            className="fixed bottom-6 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
            style={{ background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111]/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                    {t('chat.mapleAI')}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">{t('chat.beta')}</span>
                  </h3>
                  <p className="text-[11px] text-stone-500">{t('chat.yourAssistant')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Leaf className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-md'
                            : 'bg-white/5 text-stone-200 rounded-bl-md border border-white/5'
                        }`}
                      >
                        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-semibold text-stone-100">{part.slice(2, -2)}</strong>
                          }
                          return part
                        })}
                      </div>

                      {/* Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAction(action.action, action.params)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all group"
                            >
                              {getActionIcon(action.action)}
                              {action.label}
                              <ChevronRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <Leaf className="w-3 h-3 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span className="text-xs text-stone-500">{t('chat.mapleThinking')}</span>
                      </div>
                    </div>
                  </div>
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
                  className="flex-1 h-9 bg-white/5 border-white/10 rounded-xl text-sm text-stone-200 placeholder:text-stone-600 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
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
    default: return <HelpCircle className="w-3 h-3" />
  }
}
