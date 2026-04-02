"use client"
import { create } from "zustand"

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
      window.scrollTo(0, 0)
    } else {
      set({ currentPage: "home", pageParams: {} })
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
