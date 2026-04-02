"use client"
import { create } from "zustand"
import { getLocalePrefix, stripLocalePrefix } from './i18n'

export type PageView =
  | "home"
  | "browse"
  | "product-detail"
  | "category"
  | "regions"
  | "safety"
  | "sellers"
  | "storefront"
  | "login"
  | "register"
  | "register-seller"
  | "forgot-password"
  | "cart"
  | "checkout"
  | "orders"
  | "order-detail"
  | "profile"
  | "dashboard"
  | "my-products"
  | "add-product"
  | "edit-product"
  | "my-orders"
  | "my-store"
  | "my-payouts"
  | "terms"
  | "privacy"
  | "cookies"
  | "seller-terms"
  | "dispute-policy"
  | "contact"
  | "about"
  | "become-seller"
  | "file-dispute"
  | "notifications"
  | "messaging"
  | "seller-locator"
  | "escrow"
  | "seller-guide"
  | "shipping"
  | "faq"
  | "admin-dashboard"
  | "admin-users"
  | "admin-products"
  | "admin-orders"
  | "admin-disputes"
  | "admin-settings"
  | "admin-user-detail"
  | "admin-product-detail"
  | "admin-order-detail"
  | "admin-dispute-detail"
  | "wishlist"

interface NavigationState {
  currentPage: PageView
  pageParams: Record<string, string>
  previousPages: { page: PageView; params: Record<string, string> }[]
  navigate: (page: PageView, params?: Record<string, string>) => void
  goBack: () => void
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  isAuthModalOpen: boolean
  authModalTab: "login" | "register" | "register-seller"
  toggleCart: () => void
  toggleMobileMenu: () => void
  toggleSearch: () => void
  openAuthModal: (tab?: "login" | "register" | "register-seller") => void
  closeAuthModal: () => void
}

// Map page names to URL paths (without locale prefix)
function pageToUrlBase(page: PageView, params: Record<string, string>): string {
  const base: Record<string, string> = {
    "home": "/",
    "browse": "/browse",
    "product-detail": `/product/${params.id || ""}`,
    "storefront": `/store/${params.slug || ""}`,
    "category": `/browse?category=${params.category || ""}`,
    "regions": "/browse?regions=true",
    "safety": "/how-it-works",
    "sellers": "/become-seller",
    "cart": "/cart",
    "checkout": "/checkout",
    "orders": "/orders",
    "order-detail": `/orders/${params.id || ""}`,
    "file-dispute": `/disputes/new?order=${params.orderId || ""}`,
    "seller-locator": "/seller-locator",
    "escrow": "/escrow",
    "seller-guide": "/seller-guide",
    "shipping": "/shipping",
    "faq": "/faq",
    "wishlist": "/wishlist",
    "notifications": "/notifications",
    "messaging": "/messages",
    "profile": "/profile",
    "forgot-password": "/forgot-password",
    "dashboard": "/seller/dashboard",
    "my-products": "/seller/products",
    "add-product": "/seller/products/new",
    "edit-product": `/seller/products/${params.id || ""}/edit`,
    "my-orders": "/seller/orders",
    "my-store": "/seller/store",
    "my-payouts": "/seller/payouts",
    "admin-dashboard": "/admin",
    "admin-users": "/admin/users",
    "admin-products": "/admin/products",
    "admin-orders": "/admin/orders",
    "admin-disputes": "/admin/disputes",
    "admin-settings": "/admin/settings",
    "terms": "/terms",
    "privacy": "/privacy",
    "cookies": "/cookies",
    "seller-terms": "/seller-terms",
    "dispute-policy": "/dispute-policy",
    "contact": "/contact",
    "about": "/about",
    "become-seller": "/become-seller",
  }
  return base[page] || "/"
}

// Exported function: page name to URL with locale prefix
export function pageToUrl(page: PageView, params: Record<string, string>): string {
  const basePath = pageToUrlBase(page, params)
  return getLocalePrefix() + basePath
}

// Map URL paths back to page names (strips locale prefix)
export function urlToPage(pathname: string, search: string): { page: PageView; params: Record<string, string> } {
  // Strip locale prefix from URL
  const { cleanPath } = stripLocalePrefix(pathname)
  const params = new URLSearchParams(search)
  if (cleanPath === "/" || cleanPath === "") return { page: "home", params: {} }
  if (cleanPath === "/browse") {
    const category = params.get("category")
    if (category) return { page: "category", params: { category } }
    if (params.get("regions")) return { page: "regions", params: {} }
    return { page: "browse", params: {} }
  }
  if (cleanPath.startsWith("/product/")) return { page: "product-detail", params: { id: cleanPath.split("/")[2] } }
  if (cleanPath.startsWith("/store/")) return { page: "storefront", params: { slug: cleanPath.split("/")[2] } }
  if (cleanPath === "/how-it-works") return { page: "safety", params: {} }
  if (cleanPath === "/become-seller" || cleanPath === "/sellers") return { page: "become-seller", params: {} }
  if (cleanPath === "/cart") return { page: "cart", params: {} }
  if (cleanPath === "/checkout") return { page: "checkout", params: {} }
  if (cleanPath === "/orders") return { page: "orders", params: {} }
  if (cleanPath.startsWith("/orders/")) return { page: "order-detail", params: { id: cleanPath.split("/")[2] } }
  if (cleanPath.startsWith("/disputes/new")) return { page: "file-dispute", params: { orderId: params.get("order") || "" } }
  if (cleanPath === "/seller-locator") return { page: "seller-locator", params: {} }
  if (cleanPath === "/escrow") return { page: "escrow", params: {} }
  if (cleanPath === "/seller-guide") return { page: "seller-guide", params: {} }
  if (cleanPath === "/shipping") return { page: "shipping", params: {} }
  if (cleanPath === "/faq") return { page: "faq", params: {} }
  if (cleanPath === "/wishlist") return { page: "wishlist", params: {} }
  if (cleanPath === "/notifications") return { page: "notifications", params: {} }
  if (cleanPath === "/messages") return { page: "messaging", params: {} }
  if (cleanPath === "/profile") return { page: "profile", params: {} }
  if (cleanPath === "/forgot-password") return { page: "forgot-password", params: {} }
  if (cleanPath.startsWith("/seller/dashboard")) return { page: "dashboard", params: {} }
  if (cleanPath === "/seller/products") return { page: "my-products", params: {} }
  if (cleanPath.startsWith("/seller/products/new")) return { page: "add-product", params: {} }
  if (cleanPath.startsWith("/seller/products/") && cleanPath.endsWith("/edit")) return { page: "edit-product", params: { id: cleanPath.split("/")[3] } }
  if (cleanPath.startsWith("/seller/orders")) return { page: "my-orders", params: {} }
  if (cleanPath.startsWith("/seller/store")) return { page: "my-store", params: {} }
  if (cleanPath.startsWith("/seller/payouts")) return { page: "my-payouts", params: {} }
  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    const sub = cleanPath.replace("/admin/", "").replace("/admin", "")
    const pageMap: Record<string, PageView> = {
      "": "admin-dashboard", "users": "admin-users", "products": "admin-products",
      "orders": "admin-orders", "disputes": "admin-disputes", "settings": "admin-settings"
    }
    return { page: pageMap[sub] || "admin-dashboard", params: {} }
  }
  if (cleanPath === "/terms") return { page: "terms", params: {} }
  if (cleanPath === "/privacy") return { page: "privacy", params: {} }
  if (cleanPath === "/cookies") return { page: "cookies", params: {} }
  if (cleanPath === "/seller-terms") return { page: "seller-terms", params: {} }
  if (cleanPath === "/dispute-policy") return { page: "dispute-policy", params: {} }
  if (cleanPath === "/contact") return { page: "contact", params: {} }
  if (cleanPath === "/about") return { page: "about", params: {} }
  return { page: "home", params: {} }
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentPage: "home",
  pageParams: {},
  previousPages: [],
  navigate: (page, params = {}) => {
    const state = get()
    set({
      previousPages: [
        ...state.previousPages.slice(-20),
        { page: state.currentPage, params: state.pageParams },
      ],
      currentPage: page,
      pageParams: params,
      isMobileMenuOpen: false,
      isSearchOpen: false,
    })
    // Update browser URL
    const url = pageToUrl(page, params)
    window.history.pushState({}, "", url)
    window.scrollTo(0, 0)
  },
  goBack: () => {
    const state = get()
    if (state.previousPages.length > 0) {
      const prev = state.previousPages[state.previousPages.length - 1]
      set({
        currentPage: prev.page,
        pageParams: prev.params,
        previousPages: state.previousPages.slice(0, -1),
      })
      const url = pageToUrl(prev.page, prev.params)
      window.history.pushState({}, "", url)
      window.scrollTo(0, 0)
    } else {
      set({ currentPage: "home", pageParams: {} })
      window.history.pushState({}, "", getLocalePrefix() + "/")
      window.scrollTo(0, 0)
    }
  },
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isAuthModalOpen: false,
  authModalTab: "login",
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  openAuthModal: (tab = "login") => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}))

interface CartState {
  items: { productId: string; title: string; price: number; quantity: number; image?: string; storeName: string; storeId: string }[]
  addItem: (item: { productId: string; title: string; price: number; image?: string; storeName: string; storeId: string }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

interface WishlistItem {
  productId: string
  title: string
  price: number
  image?: string
  storeName: string
  storeSlug: string
  addedAt: number
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isWished: (productId: string) => boolean
  toggleItem: (item: WishlistItem) => void
  clearWishlist: () => void
  itemCount: () => number
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: typeof window !== 'undefined' ? (() => {
    try { const saved = localStorage.getItem('cm-wishlist'); return saved ? JSON.parse(saved) : [] }
    catch { return [] }
  })() : [],
  addItem: (item) => {
    const exists = get().items.find(i => i.productId === item.productId)
    if (!exists) {
      const updated = [...get().items, { ...item, addedAt: Date.now() }]
      set({ items: updated })
      try { localStorage.setItem('cm-wishlist', JSON.stringify(updated)) } catch {}
    }
  },
  removeItem: (productId) => {
    const updated = get().items.filter(i => i.productId !== productId)
    set({ items: updated })
    try { localStorage.setItem('cm-wishlist', JSON.stringify(updated)) } catch {}
  },
  isWished: (productId) => get().items.some(i => i.productId === productId),
  toggleItem: (item) => {
    if (get().isWished(item.productId)) get().removeItem(item.productId)
    else get().addItem(item)
  },
  clearWishlist: () => {
    set({ items: [] })
    try { localStorage.removeItem('cm-wishlist') } catch {}
  },
  itemCount: () => get().items.length,
}))

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const items = get().items
    const existing = items.find((i) => i.productId === item.productId)
    if (existing) {
      set({ items: items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)) })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] })
    }
  },
  removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({ items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) })
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))

interface AuthState {
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string | null
    storeId?: string | null
    storeName?: string | null
    storeSlug?: string | null
    isVerified?: boolean
    phone?: string | null
    province?: string | null
    city?: string | null
    address?: string | null
    postalCode?: string | null
    bio?: string | null
  } | null
  setUser: (user: AuthState["user"]) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
