'use client'
import { useState, useEffect } from 'react'
import { useNavigation } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Eye, Trash2, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProductRecord {
  id: string; title: string; price: number; status: string; condition: string
  images: string; createdAt: string; isFeatured: boolean; sold: number
  category: { name: string; slug: string }
  store: { id: string; name: string; slug: string; sellerId: string }
}

export default function AdminProducts() {
  const { navigate } = useNavigation()
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) setProducts(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAction = async (productId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status }),
      })
      if (res.ok) {
        toast.success(`Product ${status.toLowerCase()}`)
        fetchProducts()
      }
    } catch {}
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    DRAFT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    SOLD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REMOVED: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <AdminAuthGuard>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-stone-100 mb-2">Product Management</h1>
      <p className="text-sm text-stone-500 mb-6">{products.length} total products</p>

      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Product</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Store</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Price</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-white/5"><td colSpan={5} className="px-5 py-4"><div className="h-6 bg-neutral-800 rounded animate-pulse" /></td></tr>)
              ) : (
                products.map((p) => {
                  let images: string[] = []
                  try { images = JSON.parse(p.images) } catch {}
                  return (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0">
                            {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : (
                              <div className="w-full h-full flex items-center justify-center text-stone-600"><Package className="w-4 h-4" /></div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-stone-200 truncate max-w-[200px]">{p.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-600">{p.category?.name}</span>
                              {p.isFeatured && <Star className="w-3 h-3 text-red-300 fill-red-300" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-stone-400">{p.store?.name}</td>
                      <td className="px-5 py-3 text-sm font-medium text-stone-200">${p.price.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <Badge className={`${statusColors[p.status] || ''} text-[10px] border`}>{p.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => navigate('product-detail', { id: p.id })} className="p-1.5 rounded-lg hover:bg-white/5 text-stone-500 hover:text-stone-300" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {p.status === 'ACTIVE' && (
                            <button onClick={() => handleAction(p.id, 'REMOVED')} className="p-1.5 rounded-lg hover:bg-red-500/10 text-stone-500 hover:text-red-400" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {p.status === 'REMOVED' && (
                            <button onClick={() => handleAction(p.id, 'ACTIVE')} className="p-1.5 rounded-lg hover:bg-green-500/10 text-stone-500 hover:text-green-400" title="Approve">
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
    </AdminAuthGuard>
  )
}
