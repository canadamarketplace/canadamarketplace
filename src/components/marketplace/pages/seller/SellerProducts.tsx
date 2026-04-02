'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Product {
  id: string; title: string; price: number; status: string; condition: string
  images: string; stock: number; sold: number; views: number; slug: string
  category: { name: string; slug: string }
}

export default function SellerProducts() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const storeParam = user?.storeId ? `storeId=${user.storeId}` : ''
      const res = await fetch(`/api/products?limit=50&status=all${storeParam ? `&${storeParam}` : ''}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, status: 'REMOVED' }),
      })
      if (res.ok) {
        toast.success('Product removed')
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">My Products</h1>
          <p className="text-sm text-stone-500 mt-1">{products.length} products</p>
        </div>
        <Button onClick={() => navigate('add-product')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-neutral-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-neutral-900/60 border border-white/5">
          <Package className="w-16 h-16 text-stone-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-400 mb-2">No products yet</h3>
          <p className="text-sm text-stone-600 mb-4">Start by adding your first product</p>
          <Button onClick={() => navigate('add-product')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            let images: string[] = []
            try { images = JSON.parse(product.images) } catch {}
            return (
              <div key={product.id} className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden group">
                <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                  {images.length > 0 ? (
                    <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-700"><Package className="w-12 h-12" /></div>
                  )}
                  <Badge className={`absolute top-3 left-3 text-[10px] border ${statusColors[product.status] || ''}`}>
                    {product.status}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-stone-200 truncate">{product.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-red-400">${product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-stone-600">{product.sold} sold</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('product-detail', { id: product.id })}
                      className="flex-1 border-white/10 text-stone-400 text-xs h-8 rounded-lg"
                    >
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('edit-product', { id: product.id })}
                      className="flex-1 border-white/10 text-stone-400 text-xs h-8 rounded-lg"
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="border-white/10 text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
