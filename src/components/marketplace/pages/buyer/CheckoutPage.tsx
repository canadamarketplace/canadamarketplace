'use client'
import { useState, useMemo } from 'react'
import { useNavigation, useCart, useAuth, useCoupon } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PROVINCES } from '@/lib/types'
import { calculateTax, getProvinceCode, type TaxResult } from '@/lib/canadian-tax'
import {
  CreditCard, MapPin, Loader2, CheckCircle2, ArrowRight, Shield, ShoppingBag, Percent,
  Tag, X, ChevronDown, ChevronUp, Gift
} from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const { navigate } = useNavigation()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const { appliedCoupon, applyCoupon, removeCoupon } = useCoupon()

  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')

  const [address, setAddress] = useState(user?.name || '')
  const [city, setCity] = useState(user?.storeName || '')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [notes, setNotes] = useState('')

  // Coupon state
  const [couponExpanded, setCouponExpanded] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const subtotal = total()
  const fee = Math.round(subtotal * 0.08 * 100) / 100

  // Calculate tax based on selected province
  const taxResult: TaxResult | null = useMemo(() => {
    if (!province) return null
    const provinceCode = getProvinceCode(province)
    if (!provinceCode) return null
    return calculateTax(subtotal, provinceCode)
  }, [province, subtotal])

  const discount = appliedCoupon?.discount || 0
  const taxAmount = taxResult?.tax.totalTax || 0
  const cartTotal = Math.max(0, subtotal + fee + taxAmount - discount)

  // Get the selected province's display info
  const selectedProvince = PROVINCES.find(p => p.slug === province)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), orderAmount: subtotal }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.valid) {
          applyCoupon({
            code: data.coupon.code,
            type: data.coupon.type,
            value: data.coupon.value,
            discount: data.discount,
          })
          toast.success(`Coupon "${data.coupon.code}" applied! You save $${data.discount.toFixed(2)}`)
          setCouponCode('')
        } else {
          setCouponError(data.error || 'Invalid coupon')
        }
      } else {
        const data = await res.json()
        setCouponError(data.error || 'Invalid coupon')
      }
    } catch {
      setCouponError('Failed to validate coupon')
    }
    setCouponLoading(false)
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    toast.success('Coupon removed')
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in')
      return
    }
    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }
    if (!address || !city || !province || !postalCode) {
      toast.error('Please fill all shipping fields')
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        buyerId: user.id,
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: address,
        shippingCity: city,
        shippingProvince: province,
        shippingPostalCode: postalCode,
        notes,
      }

      if (appliedCoupon) {
        body.couponCode = appliedCoupon.code
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role || 'BUYER',
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const order = await res.json()
        setOrderId(order.id)
        setOrderPlaced(true)
        clearCart()
        removeCoupon()
        toast.success('Order placed successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to place order')
      }
    } catch {
      toast.error('Failed to place order')
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-stone-700 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-200 mb-2">Please sign in</h1>
        <p className="text-stone-500 mb-6">You need to be logged in to checkout</p>
        <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
          Sign In
        </Button>
      </div>
    )
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-stone-700 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-200 mb-2">Your cart is empty</h1>
        <Button onClick={() => navigate('browse')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mt-4">
          Browse Products
        </Button>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-stone-100 mb-2">Order Placed!</h1>
        <p className="text-stone-400 mb-2">Your order has been placed successfully.</p>
        <p className="text-sm text-stone-600 mb-8">Your payment is secured with escrow protection.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('order-detail', { id: orderId })} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
            View Order
          </Button>
          <Button variant="outline" onClick={() => navigate('orders')} className="border-white/10 text-stone-300 rounded-xl">
            My Orders
          </Button>
        </div>
      </div>
    )
  }

  const inputClass = "bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-stone-100 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" /> Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-stone-300 text-xs mb-1.5 block">Street Address *</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-stone-300 text-xs mb-1.5 block">City *</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toronto" className={inputClass} required />
                </div>
                <div>
                  <Label className="text-stone-300 text-xs mb-1.5 block">Province *</Label>
                  <div className="relative">
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className={`w-full ${inputClass} appearance-none bg-white/5`}
                      required
                    >
                      <option value="" className="bg-neutral-900">Select Province</option>
                      {PROVINCES.map((p) => (
                        <option key={p.slug} value={p.slug} className="bg-neutral-900">
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                    {selectedProvince && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Percent className="w-3 h-3 text-red-300" />
                        <span className="text-[10px] text-red-300 font-medium">
                          {taxResult ? `${taxResult.tax.totalRate}%` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <Label className="text-stone-300 text-xs mb-1.5 block">Postal Code *</Label>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="M5V 3L9" className={inputClass} required />
              </div>
              <div>
                <Label className="text-stone-300 text-xs mb-1.5 block">Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special delivery instructions" className="bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 rounded-xl min-h-[80px]" />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" /> Payment Protection
            </h2>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-300">Escrow Protected</p>
                <p className="text-xs text-stone-500 mt-1">Your payment is held securely and only released to the seller after you confirm receipt of your order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-neutral-900/60 border border-white/5 p-6">
            <h2 className="text-lg font-semibold text-stone-100 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600"><ShoppingBag className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-300 truncate">{item.title}</p>
                    <p className="text-[10px] text-stone-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-stone-200">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-white/5 my-4" />

            {/* Coupon Section */}
            {!appliedCoupon ? (
              <div className="mb-4">
                <button
                  onClick={() => setCouponExpanded(!couponExpanded)}
                  className="flex items-center gap-2 w-full text-left group"
                >
                  <Gift className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-stone-300 group-hover:text-stone-100 transition-colors">
                    Have a coupon?
                  </span>
                  {couponExpanded ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 ml-auto" />
                  )}
                </button>

                {couponExpanded && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                        <Input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }}
                          placeholder="Enter coupon code"
                          className="bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11 pl-10 font-mono"
                        />
                      </div>
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-4 disabled:opacity-40"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Applied Coupon Badge */
              <div className="mb-4 rounded-xl bg-green-500/5 border border-green-500/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">
                      {appliedCoupon.code}
                    </span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border text-[10px] px-1.5 py-0">
                      -${appliedCoupon.discount.toFixed(2)}
                    </Badge>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-stone-500 hover:text-red-400 transition-colors"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {appliedCoupon.type === 'PERCENTAGE'
                    ? `${appliedCoupon.value}% off`
                    : `$${appliedCoupon.value.toFixed(2)} off`}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-300">${subtotal.toFixed(2)}</span>
              </div>

              {/* Discount line */}
              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="text-green-400 font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}

              {/* Tax breakdown */}
              {taxResult && (
                <>
                  <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Percent className="w-3.5 h-3.5 text-red-300" />
                      <span className="text-xs font-medium text-white">
                        Tax — {taxResult.tax.province}
                      </span>
                      <span className="text-[10px] text-stone-600 ml-auto">
                        {taxResult.tax.totalRate}% combined
                      </span>
                    </div>
                    {taxResult.tax.hst > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500 pl-5">HST ({taxResult.tax.hst / subtotal * 100}%)</span>
                        <span className="text-stone-400">${taxResult.tax.hst.toFixed(2)}</span>
                      </div>
                    )}
                    {taxResult.tax.gst > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500 pl-5">GST (5%)</span>
                        <span className="text-stone-400">${taxResult.tax.gst.toFixed(2)}</span>
                      </div>
                    )}
                    {taxResult.tax.pst > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500 pl-5">
                          {taxResult.tax.provinceCode === 'QC' ? 'QST' : 'PST'} ({taxResult.tax.pst / subtotal * 100}%)
                        </span>
                        <span className="text-stone-400">${taxResult.tax.pst.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-medium pt-1 border-t border-red-500/10">
                      <span className="text-stone-400 pl-5">Total Tax</span>
                      <span className="text-white">${taxResult.tax.totalTax.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              {!province && (
                <p className="text-xs text-stone-600 text-center py-1">
                  Select a province to calculate tax
                </p>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Marketplace fee (8%)</span>
                <span className="text-stone-300">${fee.toFixed(2)}</span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex justify-between">
                <span className="text-base font-semibold text-stone-200">Total</span>
                <span className="text-xl font-bold text-stone-100">${cartTotal.toFixed(2)} <span className="text-xs text-stone-600">CAD</span></span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading || !province}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-12 mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CreditCard className="w-5 h-5 mr-2" />}
              Place Order · ${cartTotal.toFixed(2)}
            </Button>

            <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-stone-600">
              <Shield className="w-3 h-3" />
              Secured with escrow protection
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
