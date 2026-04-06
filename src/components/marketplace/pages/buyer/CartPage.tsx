'use client'
import { useNavigation, useCart, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag,
  CreditCard, Tag, Store
} from 'lucide-react'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { toast } from 'sonner'

export default function CartPage() {
  const { navigate, openAuthModal } = useNavigation()
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const { user } = useAuth()
  const subtotal = total()
  const fee = Math.round(subtotal * 0.08 * 100) / 100
  const cartTotal = subtotal + fee

  const handleCheckout = () => {
    if (!user) {
      openAuthModal('login')
      return
    }
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    navigate('checkout')
  }

  if (items.length === 0) {
    return (
      <DashboardSidebar role="buyer" activeItem="cart" onNavigate={(page) => navigate(page)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-cm-hover flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-cm-faint" />
        </div>
        <h1 className="text-2xl font-bold text-cm-secondary mb-2">Your cart is empty</h1>
        <p className="text-cm-dim mb-6">Add some products to get started</p>
        <Button onClick={() => navigate('browse')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
          Browse Products <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar role="buyer" activeItem="cart" onNavigate={(page) => navigate(page)}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-cm-primary mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-cm-input flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cm-faint">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button onClick={() => navigate('product-detail', { id: item.productId })} className="block">
                  <h3 className="text-base font-medium text-cm-secondary hover:text-cm-primary truncate">{item.title}</h3>
                </button>
                <button onClick={() => navigate('storefront', { slug: item.storeId })} className="flex items-center gap-1 text-xs text-cm-faint hover:text-cm-muted mt-0.5">
                  <Store className="w-3 h-3" /> {item.storeName}
                </button>
                <p className="text-lg font-bold text-red-400 mt-2">${item.price.toFixed(2)} <span className="text-xs text-cm-faint font-normal">CAD</span></p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-cm-hover rounded-lg px-1">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-md hover:bg-cm-hover-strong flex items-center justify-center text-cm-muted">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm text-cm-secondary w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-md hover:bg-cm-hover-strong flex items-center justify-center text-cm-muted">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => { removeItem(item.productId); toast.success('Item removed') }}
                    className="text-xs text-cm-faint hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
              <p className="text-lg font-bold text-cm-secondary">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          <Button
            variant="ghost"
            onClick={() => { clearCart(); toast.success('Cart cleared') }}
            className="text-cm-faint hover:text-red-400 justify-start text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear all items
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6">
            <h2 className="text-lg font-semibold text-cm-primary mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-cm-dim">Subtotal ({items.length} items)</span>
                <span className="text-cm-secondary">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cm-dim flex items-center gap-1"><Tag className="w-3 h-3" /> Marketplace fee (8%)</span>
                <span className="text-cm-secondary">${fee.toFixed(2)}</span>
              </div>
              <Separator className="bg-cm-hover" />
              <div className="flex justify-between">
                <span className="text-base font-semibold text-cm-secondary">Total</span>
                <span className="text-xl font-bold text-cm-primary">${cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-cm-faint">All prices in Canadian Dollars (CAD)</p>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-12 mt-6"
            >
              <CreditCard className="w-5 h-5 mr-2" /> Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
    </DashboardSidebar>
  )
}
