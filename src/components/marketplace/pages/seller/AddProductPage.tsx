'use client'
import { useState, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CATEGORIES, PROVINCES } from '@/lib/types'
import { ChevronLeft, Loader2, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import ImageUploader, { type ImageItem } from '@/components/marketplace/ImageUploader'

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
  const [images, setImages] = useState<ImageItem[]>([])
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
        // Parse existing images - they may be URLs or JSON string
        try {
          const parsed = JSON.parse(p.images)
          if (Array.isArray(parsed)) {
            setImages(parsed.map((url: string, idx: number) => ({
              id: `existing-${idx}-${url.slice(-12)}`,
              url,
              thumbnail: url,
            })))
          }
        } catch {
          if (p.images && typeof p.images === 'string' && p.images.startsWith('[')) {
            try {
              const parsed = JSON.parse(p.images)
              setImages(parsed.map((url: string, idx: number) => ({
                id: `existing-${idx}-${url.slice(-12)}`,
                url,
                thumbnail: url,
              })))
            } catch {}
          }
        }
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

  const addImageUrl = () => {
    if (newImage.trim() && images.length < 5) {
      setImages([
        ...images,
        {
          id: `url-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: newImage.trim(),
          thumbnail: newImage.trim(),
        },
      ])
      setNewImage('')
    } else if (images.length >= 5) {
      toast.error('Maximum 5 images allowed')
    }
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

    // Check for any still-uploading images
    if (images.some(img => img.uploading)) {
      toast.error('Please wait for all images to finish uploading')
      return
    }

    // Remove any failed uploads (empty url)
    const validImages = images.filter(img => img.url)

    setLoading(true)
    try {
      const body = {
        title, description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        condition, categorySlug: category,
        stock: parseInt(stock) || 1,
        images: JSON.stringify(validImages.map(img => img.url)),
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

  const inputClass = "bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"
  const isUploading = images.some(img => img.uploading)

  return (
    <DashboardSidebar role="seller" activeItem={currentPage === 'edit-product' ? 'my-products' : 'add-product'} onNavigate={(page) => navigate(page)}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('my-products')} className="flex items-center gap-2 text-sm text-cm-dim hover:text-cm-secondary mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </button>

      <h1 className="text-2xl font-bold text-cm-primary mb-8">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-4">
          <h2 className="text-sm font-semibold text-cm-secondary">Basic Information</h2>
          <div>
            <Label className="text-cm-secondary text-xs mb-1.5 block">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" className={inputClass} />
          </div>
          <div>
            <Label className="text-cm-secondary text-xs mb-1.5 block">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product in detail..." className="bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint rounded-xl min-h-[120px]" />
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-4">
          <h2 className="text-sm font-semibold text-cm-secondary">Pricing & Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Price (CAD) *</Label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Compare Price</Label>
              <Input type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className={`${inputClass} h-11`}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-cm-elevated border-cm-border-hover">
                  <SelectItem value="NEW" className="text-cm-secondary">New</SelectItem>
                  <SelectItem value="LIKE_NEW" className="text-cm-secondary">Like New</SelectItem>
                  <SelectItem value="GOOD" className="text-cm-secondary">Good</SelectItem>
                  <SelectItem value="FAIR" className="text-cm-secondary">Fair</SelectItem>
                  <SelectItem value="USED" className="text-cm-secondary">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Stock</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <Label className="text-cm-secondary text-xs mb-1.5 block">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent className="bg-cm-elevated border-cm-border-hover">
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug} className="text-cm-secondary">{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-4">
          <h2 className="text-sm font-semibold text-cm-secondary">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">Province</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger className={`${inputClass} h-11`}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-cm-elevated border-cm-border-hover">
                  {PROVINCES.map((p) => <SelectItem key={p.slug} value={p.slug} className="text-cm-secondary">{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-cm-secondary text-xs mb-1.5 block">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-6 space-y-4">
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={5}
            label="Product Images"
            showPrimary={true}
          />

          {/* URL input for pasting image URLs */}
          <div className="flex gap-2">
            <Input
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Or paste an image URL"
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
            />
            <Button
              onClick={addImageUrl}
              variant="outline"
              disabled={!newImage.trim() || images.length >= 5}
              className="border-cm-border-hover text-cm-secondary h-11 rounded-xl hover:bg-cm-hover"
            >
              Add URL
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('my-products')} className="border-cm-border-hover text-cm-primary rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading || isUploading}
            className="border-cm-border-hover text-cm-primary rounded-xl h-11 px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('ACTIVE')}
            disabled={loading || isUploading}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Publish Product
          </Button>
        </div>
      </div>
    </div>
    </DashboardSidebar>
  )
}
