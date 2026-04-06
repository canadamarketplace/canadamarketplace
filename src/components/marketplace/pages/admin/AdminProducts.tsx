'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, Eye, Trash2, Star, Loader2, CheckCircle2, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

interface ProductRecord {
  id: string; title: string; price: number; status: string; condition: string
  images: string; createdAt: string; isFeatured: boolean; sold: number
  moderationStatus?: string
  category: { name: string; slug: string }
  store: { id: string; name: string; slug: string; sellerId: string }
}

export default function AdminProducts() {
  const { navigate } = useNavigation()
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const query = params.toString()
      const res = await fetch(`/api/admin/products${query ? '?' + query : ''}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch {}
    setLoading(false)
  }, [search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleModerate = async (productId: string, moderationStatus: string) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, moderationStatus }),
      })
      if (res.ok) {
        toast.success(`Product ${moderationStatus.toLowerCase()}`)
        fetchProducts()
      }
    } catch {}
  }

  const handleStatusChange = async (productId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status }),
      })
      if (res.ok) {
        toast.success(`Product ${status.toLowerCase()}`)
        fetchProducts()
        setSelectedIds(new Set())
      }
    } catch {}
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const handleBulkAction = async (action: { status?: string; moderationStatus?: string }) => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_update',
          productIds: Array.from(selectedIds),
          ...action,
        }),
      })
      if (res.ok) {
        toast.success(`${selectedIds.size} products updated`)
        fetchProducts()
        setSelectedIds(new Set())
      } else {
        toast.error('Bulk action failed')
      }
    } catch {
      toast.error('Bulk action failed')
    }
    setBulkLoading(false)
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    DRAFT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    SOLD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REMOVED: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const moderationColors: Record<string, string> = {
    PENDING_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const moderationLabels: Record<string, string> = {
    PENDING_REVIEW: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  }

  return (
    <AdminAuthGuard>
    <DashboardSidebar role="admin" activeItem="admin-products" onNavigate={(page) => navigate(page)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-cm-primary mb-2">Product Management</h1>
      <p className="text-sm text-cm-dim mb-6">{products.length} total products</p>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-faint" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint h-10 rounded-xl"
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="rounded-2xl bg-cm-elevated border border-red-500/20 p-4 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-cm-secondary">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction({ moderationStatus: 'APPROVED' })}
              disabled={bulkLoading}
              className="border-green-500/20 text-green-400 hover:bg-green-500/10 rounded-xl h-9 text-xs"
            >
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
              Approve Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction({ moderationStatus: 'REJECTED' })}
              disabled={bulkLoading}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl h-9 text-xs"
            >
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />}
              Reject Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction({ status: 'REMOVED' })}
              disabled={bulkLoading}
              className="border-cm-border-hover text-cm-dim hover:bg-red-500/10 hover:text-red-400 rounded-xl h-9 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remove Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cm-border-subtle">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.size === products.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-cm-border-hover bg-cm-hover accent-red-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Product</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Store</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Price</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Moderation</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-cm-border-subtle"><td colSpan={7} className="px-5 py-4"><div className="h-6 bg-cm-input rounded animate-pulse" /></td></tr>)
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-cm-faint">No products found</td></tr>
              ) : (
                products.map((p) => {
                  let images: string[] = []
                  try { images = JSON.parse(p.images) } catch {}
                  return (
                    <tr key={p.id} className={`border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover ${selectedIds.has(p.id) ? 'bg-red-500/5' : ''}`}>
                      <td className="w-10 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="w-4 h-4 rounded border-cm-border-hover bg-cm-hover accent-red-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cm-input overflow-hidden flex-shrink-0">
                            {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : (
                              <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-4 h-4" /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-cm-secondary truncate max-w-[200px]">{p.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-cm-faint">{p.category?.name}</span>
                              {p.isFeatured && <Star className="w-3 h-3 text-red-300 fill-red-300" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-cm-muted">{p.store?.name}</td>
                      <td className="px-5 py-3 text-sm font-medium text-cm-secondary">${p.price.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <Badge className={`${statusColors[p.status] || ''} text-[10px] border`}>{p.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={`${moderationColors[p.moderationStatus || ''] || 'bg-cm-hover text-cm-muted border-cm-border-hover'} text-[10px] border`}>
                          {moderationLabels[p.moderationStatus || ''] || p.moderationStatus || '—'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button onClick={() => navigate('product-detail', { id: p.id })} className="p-1.5 rounded-lg hover:bg-cm-hover text-cm-dim hover:text-cm-secondary" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {p.moderationStatus === 'PENDING_REVIEW' && (
                            <>
                              <button onClick={() => handleModerate(p.id, 'APPROVED')} className="p-1.5 rounded-lg hover:bg-green-500/10 text-cm-dim hover:text-green-400" title="Approve Moderation">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleModerate(p.id, 'REJECTED')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-cm-dim hover:text-red-400" title="Reject Moderation">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {p.status === 'ACTIVE' && (
                            <button onClick={() => handleStatusChange(p.id, 'REMOVED')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-cm-dim hover:text-red-400" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {p.status === 'REMOVED' && (
                            <button onClick={() => handleStatusChange(p.id, 'ACTIVE')} className="p-1.5 rounded-lg hover:bg-green-500/10 text-cm-dim hover:text-green-400" title="Restore">
                              <Package className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
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
