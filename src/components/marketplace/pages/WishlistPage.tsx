'use client'
import { useNavigation, useCart, useAuth, useWishlist } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2, ArrowLeft, Store } from 'lucide-react'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { toast } from 'sonner'

export default function WishlistPage() {
  const { navigate, openAuthModal } = useNavigation()
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { t } = useTranslation()

  const handleAddToCart = (item: typeof items[0]) => {
    if (!user) {
      openAuthModal('login')
      return
    }
    addItem({
      productId: item.productId,
      title: item.title,
      price: item.price,
      image: item.image,
      storeName: item.storeName,
      storeId: '',
    })
    toast.success('Added to cart!')
  }

  const handleMoveAllToCart = () => {
    if (!user) {
      openAuthModal('login')
      return
    }
    items.forEach(item => {
      addItem({
        productId: item.productId,
        title: item.title,
        price: item.price,
        image: item.image,
        storeName: item.storeName,
        storeId: '',
      })
    })
    toast.success(`${items.length} items added to cart!`)
  }

  const handleRemove = (productId: string) => {
    removeItem(productId)
    toast.success('Removed from wishlist')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-cm-elevated border border-cm-border-subtle flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-cm-faint" />
          </div>
          <h1 className="text-2xl font-bold text-cm-primary mb-2">{t('wishlist.empty')}</h1>
          <p className="text-sm text-cm-dim mb-6">{t('wishlist.emptyDesc')}</p>
          <Button
            onClick={() => navigate('browse')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('wishlist.startShopping')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardSidebar role="buyer" activeItem="wishlist" onNavigate={(page) => navigate(page)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => navigate('browse')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-3 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('common.back')}
          </button>
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h1 className="text-2xl font-bold text-cm-primary">{t('wishlist.title')}</h1>
            <span className="px-2 py-0.5 rounded-full bg-cm-hover text-xs text-cm-muted border border-cm-border-hover">
              {items.length} {items.length === 1 ? t('wishlist.item') : t('wishlist.items')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleMoveAllToCart}
            variant="outline"
            className="border-cm-border-hover text-cm-primary hover:bg-cm-hover hidden sm:flex"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('wishlist.moveAllToCart')}
          </Button>
          <Button
            onClick={() => { clearWishlist(); toast.success('Wishlist cleared') }}
            variant="ghost"
            className="text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('wishlist.clearAll')}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.productId} className="rounded-2xl bg-cm-elevated backdrop-blur-xl border border-cm-border-subtle hover:border-cm-border-hover overflow-hidden transition-all group">
            <div className="relative">
              <button
                onClick={() => navigate('product-detail', { id: item.productId })}
                className="block w-full"
              >
                <div className="aspect-square bg-cm-input overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cm-faint">
                      <ShoppingCart className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleRemove(item.productId)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-cm-secondary hover:text-red-400 hover:bg-black/80 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4">
              <button onClick={() => navigate('product-detail', { id: item.productId })} className="block w-full text-left">
                <h3 className="text-sm font-medium text-cm-secondary truncate group-hover:text-cm-primary">{item.title}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Store className="w-3 h-3 text-cm-faint" />
                  <p className="text-xs text-cm-dim truncate">{item.storeName}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-bold text-red-400">${item.price.toFixed(2)}</span>
                </div>
              </button>
              <Button
                onClick={() => handleAddToCart(item)}
                size="sm"
                className="w-full mt-3 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-9 text-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                {t('browse.addToCart')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </DashboardSidebar>
  )
}
