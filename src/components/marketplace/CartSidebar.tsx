'use client'
import { useNavigation, useCart, useAuth } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function CartSidebar() {
  const { isCartOpen, toggleCart, navigate } = useNavigation()
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useTranslation()
  const subtotal = total()
  const fee = Math.round(subtotal * 0.08 * 100) / 100
  const cartTotal = subtotal + fee

  const handleCheckout = () => {
    if (!user) {
      toggleCart()
      useNavigation.getState().openAuthModal('login')
      toast.error(t('cart.pleaseSignIn'))
      return
    }
    if (items.length === 0) {
      toast.error(t('cart.empty'))
      return
    }
    toggleCart()
    navigate('checkout')
  }

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm" onClick={toggleCart} />
      )}

      {/* Panel */}
      <div className={`fixed top-0 right-0 z-[56] h-full w-full max-w-md bg-neutral-900 border-l border-white/10 shadow-2xl shadow-black/50 transform transition-transform duration-300 ease-out ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-stone-100">{t('cart.title')}</h2>
              <span className="text-xs text-stone-500 bg-white/5 px-2 py-0.5 rounded-full">{items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}</span>
            </div>
            <button onClick={toggleCart} className="p-2 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <ScrollArea className="flex-1 px-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-stone-600" />
                </div>
                <p className="text-stone-400 font-medium mb-1">{t('cart.empty')}</p>
                <p className="text-xs text-stone-600 mb-4">{t('cart.emptyDesc')}</p>
                <Button
                  onClick={() => { toggleCart(); navigate('browse') }}
                  variant="outline"
                  className="border-white/10 text-stone-300 hover:bg-white/5 rounded-xl"
                >
                  {t('cart.browseProducts')}
                </Button>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-200 truncate">{item.title}</p>
                      <p className="text-xs text-stone-500 truncate">{item.storeName}</p>
                      <p className="text-sm font-bold text-red-400 mt-1">${item.price.toFixed(2)} {t('common.currency')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-stone-300 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => { removeItem(item.productId); toast.success(t('common.itemRemoved')) }}
                      className="p-1.5 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-white/5 px-6 py-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">{t('cart.subtotal')}</span>
                  <span className="text-stone-300">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">{t('cart.marketplaceFee')}</span>
                  <span className="text-stone-300">${fee.toFixed(2)}</span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-stone-200">{t('cart.total')}</span>
                  <span className="text-lg font-bold text-stone-100">${cartTotal.toFixed(2)} <span className="text-xs text-stone-500">{t('common.currency')}</span></span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-11"
              >
                {t('cart.checkout')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={() => { clearCart(); toast.success(t('common.cartCleared')) }}
                className="w-full text-xs text-stone-600 hover:text-red-400 py-1 text-center transition-colors"
              >
                {t('cart.clearCart')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
