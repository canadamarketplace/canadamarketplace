'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

interface AdminOrder {
  id: string; orderNumber: string; status: string; total: number
  shippingAddress: string; shippingCity: string; shippingProvince: string
  trackingNumber?: string; createdAt: string
  buyer: { id: string; name: string; email: string }
  items: Array<{ id: string; title: string; price: number; quantity: number; image?: string; product?: { store: { sellerId: string; name: string } } }>
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) setOrders(await res.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [statusFilter, fetchOrders])

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-orders" onNavigate={(page) => navigate(page)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary">Order Management</h1>
          <p className="text-sm text-cm-dim mt-1">{orders.length} total orders</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-48 bg-cm-hover border-cm-border-hover text-cm-secondary h-10 rounded-xl">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-cm-elevated border-cm-border-hover">
            <SelectItem value="all" className="text-cm-secondary">All Orders</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-cm-secondary">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cm-border-subtle">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Order</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Buyer</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Total</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Date</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-cm-border-subtle"><td colSpan={6} className="px-5 py-4"><div className="h-6 bg-cm-input rounded animate-pulse" /></td></tr>)
              ) : orders.filter(o => !statusFilter || o.status === statusFilter).length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-cm-faint">No orders found</td></tr>
              ) : (
                orders.filter(o => !statusFilter || o.status === statusFilter).map((order) => (
                  <>
                    <tr key={order.id} className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover">
                      <td className="px-5 py-3 text-xs font-mono text-cm-muted">{order.orderNumber}</td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-cm-secondary">{order.buyer?.name}</p>
                        <p className="text-[10px] text-cm-faint">{order.buyer?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-cm-secondary">${order.total.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <Badge className={`${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || ''} text-[10px] border`}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-cm-dim">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="p-1.5 rounded-lg hover:bg-cm-hover text-cm-dim hover:text-cm-secondary">
                          {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={6} className="px-5 py-4 bg-cm-hover">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-cm-dim mb-2">Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-cm-input overflow-hidden flex-shrink-0">
                                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (
                                        <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-3 h-3" /></div>
                                      )}
                                    </div>
                                    <span className="text-xs text-cm-secondary truncate flex-1">{item.title}</span>
                                    <span className="text-xs text-cm-dim">${item.price.toFixed(2)} x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-cm-dim mb-2">Shipping</h4>
                              <p className="text-xs text-cm-muted">{order.shippingAddress}</p>
                              <p className="text-xs text-cm-muted">{order.shippingCity}, {order.shippingProvince}</p>
                              {order.trackingNumber && (
                                <p className="text-xs text-purple-300 mt-1">Tracking: {order.trackingNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardSidebar>
    </AdminAuthGuard>
  )
}
