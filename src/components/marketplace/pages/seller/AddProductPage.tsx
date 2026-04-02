'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CATEGORIES, PROVINCES } from '@/lib/types'
import { ChevronLeft, Loader2, Plus, X, Image, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function AddProductPage() {
  const { navigate, pageParams, currentPage } = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const isEditing = currentPage === 'edit-product' && !!pageParams.id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [condition, setCondition] = useState('NEW')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('1')
  const [images, setImages] = useState<string[]>([])
  const [newImage, setNewImage] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const fetchProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const p = await res.json()
        setTitle(p.title)
        setDescription(p.description)
        setPrice(p.price.toString())
        setComparePrice(p.comparePrice?.toString() || '')
        setCondition(p.condition)
        setCategory(p.category?.slug || '')
        setStock(p.stock.toString())
        try { setImages(JSON.parse(p.images)) } catch {}
        setProvince(p.province || '')
        setCity(p.city || '')
        setStatus(p.status)
      }
    } catch {}
  }

  useEffect(() => {
    if (isEditing && pageParams.id) {
      fetchProduct(pageParams.id)
    }
  }, [pageParams.id, fetchProduct, isEditing])

  const addImage = () => {
    if (newImage.trim()) {
      setImages([...images, newImage.trim()])
      setNewImage('')
    }
  }

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (saveStatus: string) => {
    if (!title || !description || !price || !category) {
      toast.error('Please fill all required fields')
      return
    }

    if (!user?.storeId) {
      toast.error('You need a store to add products')
      navigate('become-seller')
      return
    }

    setLoading(true)
    try {
      const body = {
        title, description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        condition, categorySlug: category,
        stock: parseInt(stock) || 1,
        images: JSON.stringify(images),
        province, city,
        status: saveStatus,
        storeId: user.storeId,
        sellerId: user.id,
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Product updated!' : 'Product created!')
        navigate('my-products')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save product')
      }
    } catch {
      toast.error('Failed to save product')
    }
    setLoading(false)
  }

  const inputClass = "bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('my-products')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </button>

      <h1 className="text-2xl font-bold text-stone-100 mb-8">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-300">Basic Information</h2>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" className={inputClass} />
          </div>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product in detail..." className="bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 rounded-xl min-h-[120px]" />
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-300">Pricing & Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-stone-300 text-xs mb-1.5 block">Price (CAD) *</Label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <Label className="text-stone-300 text-xs mb-1.5 block">Compare Price</Label>
              <Input type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-stone-300 text-xs mb-1.5 block">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className={`${inputClass} h-11`}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10">
                  <SelectItem value="NEW" className="text-stone-300">New</SelectItem>
                  <SelectItem value="LIKE_NEW" className="text-stone-300">Like New</SelectItem>
                  <SelectItem value="GOOD" className="text-stone-300">Good</SelectItem>
                  <SelectItem value="FAIR" className="text-stone-300">Fair</SelectItem>
                  <SelectItem value="USED" className="text-stone-300">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-stone-300 text-xs mb-1.5 block">Stock</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10">
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug} className="text-stone-300">{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-300">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-stone-300 text-xs mb-1.5 block">Province</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10">
                  {PROVINCES.map((p) => <SelectItem key={p.slug} value={p.slug} className="text-stone-300">{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-stone-300 text-xs mb-1.5 block">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-300">Images</h2>
          <div className="flex gap-2">
            <Input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Image URL" className={`${inputClass} flex-1`} />
            <Button onClick={addImage} variant="outline" className="border-white/10 text-stone-300 h-11 rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-800 border border-white/5">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-stone-600">Add image URLs for your product. First image will be the main photo.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('my-products')} className="border-white/10 text-stone-300 rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="border-white/10 text-stone-300 rounded-xl h-11 px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('ACTIVE')}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Publish Product
          </Button>
        </div>
      </div>
    </div>
  )
}
