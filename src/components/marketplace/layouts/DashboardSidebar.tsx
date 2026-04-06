'use client'
import { useState } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, Users, Package, ShoppingCart, AlertTriangle, Settings,
  Store, PlusCircle, DollarSign, Tag, ExternalLink, Heart, User,
  MessageCircle, Bell, Menu, X, ChevronLeft, ShoppingBag, Star, CreditCard,
  Receipt, Truck, Megaphone, BarChart3, MapPin
} from 'lucide-react'

interface DashboardSidebarProps {
  role: 'admin' | 'seller' | 'buyer'
  activeItem: string
  onNavigate: (page: string, params?: Record<string, string>) => void
  children: React.ReactNode
}

interface MenuItem {
  label: string
  icon: typeof LayoutDashboard
  page: string
  badge?: string
}

const ADMIN_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'admin-dashboard' },
  { label: 'Users', icon: Users, page: 'admin-users' },
  { label: 'Products', icon: Package, page: 'admin-products' },
  { label: 'Orders', icon: ShoppingCart, page: 'admin-orders' },
  { label: 'Disputes', icon: AlertTriangle, page: 'admin-disputes' },
  { label: 'Reports', icon: BarChart3, page: 'admin-reports' },
  { label: 'Tax Rules', icon: Receipt, page: 'admin-tax' },
  { label: 'Payments', icon: CreditCard, page: 'admin-payments' },
  { label: 'Shipping', icon: Truck, page: 'admin-shipping' },
  { label: 'Marketing', icon: Megaphone, page: 'admin-marketing' },
  { label: 'Settings', icon: Settings, page: 'admin-settings' },
]

const SELLER_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Products', icon: Package, page: 'my-products' },
  { label: 'Add Product', icon: PlusCircle, page: 'add-product' },
  { label: 'Orders', icon: ShoppingCart, page: 'my-orders' },
  { label: 'Shipping', icon: Truck, page: 'seller-shipping' },
  { label: 'Store Profile', icon: Store, page: 'my-store' },
  { label: 'Payouts', icon: DollarSign, page: 'my-payouts' },
  { label: 'Transactions', icon: CreditCard, page: 'seller-transactions' },
  { label: 'Reviews', icon: Star, page: 'seller-reviews' },
  { label: 'Coupons', icon: Tag, page: 'coupons' },
]

const BUYER_MENU: MenuItem[] = [
  { label: 'My Orders', icon: ShoppingCart, page: 'orders' },
  { label: 'Shopping Cart', icon: ShoppingBag, page: 'cart' },
  { label: 'Wishlist', icon: Heart, page: 'wishlist' },
  { label: 'My Profile', icon: User, page: 'profile' },
  { label: 'Address Book', icon: MapPin, page: 'address-book' },
  { label: 'My Reviews', icon: Star, page: 'buyer-reviews' },
  { label: 'Messages', icon: MessageCircle, page: 'messaging' },
  { label: 'Notifications', icon: Bell, page: 'notifications' },
  { label: 'Become a Seller', icon: Store, page: 'become-seller' },
]

const MENU_MAP: Record<string, MenuItem[]> = {
  admin: ADMIN_MENU,
  seller: SELLER_MENU,
  buyer: BUYER_MENU,
}

const ROLE_LABELS: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  admin: { label: 'Admin', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  seller: { label: 'Seller', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  buyer: { label: 'Buyer', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
}

export default function DashboardSidebar({ role, activeItem, onNavigate, children }: DashboardSidebarProps) {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = MENU_MAP[role] || []
  const roleStyle = ROLE_LABELS[role] || ROLE_LABELS.buyer

  const handleNav = (page: string) => {
    onNavigate(page)
    setSidebarOpen(false)
  }

  const content = (
    <div className="flex min-h-screen bg-cm-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 w-[260px] bg-cm-elevated/95 backdrop-blur-xl border-r border-cm-border-subtle z-30">
        <SidebarContent
          menuItems={menuItems}
          activeItem={activeItem}
          onNav={handleNav}
          user={user}
          roleStyle={roleStyle}
          role={role}
          onNavigateHome={() => navigate('home')}
        />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-cm-elevated border-r border-cm-border-subtle z-50 shadow-2xl shadow-black/40">
            <SidebarContent
              menuItems={menuItems}
              activeItem={activeItem}
              onNav={handleNav}
              user={user}
              roleStyle={roleStyle}
              role={role}
              onNavigateHome={() => navigate('home')}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-[260px]">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-cm-elevated/90 backdrop-blur-xl border-b border-cm-border-subtle px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-cm-secondary hover:bg-cm-hover hover:text-cm-primary h-9 w-9 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">CM</span>
            </div>
            <span className="text-sm font-semibold text-cm-secondary">Canada Marketplace</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-0px)]">
          {children}
        </div>
      </main>
    </div>
  )

  return content
}

// ─── Sidebar Inner Content ─────────────────────────────────────────────────

interface SidebarContentProps {
  menuItems: MenuItem[]
  activeItem: string
  onNav: (page: string) => void
  user: any
  roleStyle: { label: string; color: string; bgColor: string; borderColor: string }
  role: string
  onNavigateHome: () => void
  onClose?: () => void
}

function SidebarContent({ menuItems, activeItem, onNav, user, roleStyle, role, onNavigateHome, onClose }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header / Logo */}
      <div className="p-5 border-b border-cm-border-subtle">
        <div className="flex items-center justify-between">
          <button onClick={onNavigateHome} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30 transition-shadow">
              <span className="text-xs font-bold text-white">CM</span>
            </div>
            <div>
              <p className="text-sm font-bold text-cm-primary leading-tight">Canada</p>
              <p className="text-[10px] text-cm-dim leading-tight">Marketplace</p>
            </div>
          </button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-cm-dim hover:text-cm-secondary h-8 w-8 rounded-lg lg:hidden">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-5 py-4 border-b border-cm-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cm-secondary truncate">{user.name}</p>
              <Badge className={`${roleStyle.bgColor} ${roleStyle.color} ${roleStyle.borderColor} border text-[9px] px-1.5 py-0 mt-0.5`}>
                {roleStyle.label}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            // Hide "Become a Seller" if user is already a seller or admin
            if (item.page === 'become-seller' && user && (user.role === 'SELLER' || user.role === 'ADMIN')) {
              return null
            }
            const isActive = activeItem === item.page || (activeItem === 'dashboard' && item.page === 'dashboard' && role === 'seller')
            return (
              <button
                key={item.page}
                onClick={() => onNav(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                  isActive
                    ? 'bg-red-500/10 text-red-400 border-l-[3px] border-red-400 pl-[9px]'
                    : 'text-cm-dim hover:bg-cm-hover hover:text-cm-secondary border-l-[3px] border-transparent pl-[9px]'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-red-400' : 'text-cm-muted group-hover:text-cm-secondary'}`} />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500/15 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom: Back to Marketplace */}
      <div className="p-4 border-t border-cm-border-subtle">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cm-dim hover:bg-cm-hover hover:text-cm-secondary transition-all group"
        >
          <ExternalLink className="w-4 h-4 text-cm-muted group-hover:text-cm-secondary" />
          <span className="font-medium">Back to Marketplace</span>
          <ChevronLeft className="w-3.5 h-3.5 ml-auto text-cm-faint group-hover:text-cm-muted rotate-180" />
        </button>
      </div>
    </div>
  )
}
