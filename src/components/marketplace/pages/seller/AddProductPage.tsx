'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CATEGORIES, PROVINCES } from '@/lib/types'
import { ChevronLeft, Loader2, Plus, X, Save, Upload, ImagePlus, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

interface ImageItem {
  url: string
  thumbnail: string
  uploading?: boolean
  progress?: number
}

const MAX_IMAGES = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AddProductPage() {
  const { navigate, pageParams, currentPage } = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const isEditing = currentPage === 'edit-product' && !!pageParams.id
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [isDragging, setIsDragging] = useState(false)

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
            setImages(parsed.map((url: string) => ({
              url,
              thumbnail: url,
            })))
          }
        } catch {
          // images might be a plain string or empty
          if (p.images && typeof p.images === 'string' && p.images.startsWith('[')) {
            try {
              const parsed = JSON.parse(p.images)
              setImages(parsed.map((url: string) => ({ url, thumbnail: url })))
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
    if (newImage.trim() && images.length < MAX_IMAGES) {
      setImages([...images, { url: newImage.trim(), thumbnail: newImage.trim() }])
      setNewImage('')
    } else if (images.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
    }
  }

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx))
  }

  const moveImage = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= images.length) return
    const newImages = [...images]
    ;[newImages[idx], newImages[newIdx]] = [newImages[newIdx], newImages[idx]]
    setImages(newImages)
  }

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }
    if (images.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    const tempId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newImg: ImageItem = { url: '', thumbnail: '', uploading: true, progress: 0 }
    setImages(prev => [...prev, newImg])

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImages(prev => prev.map(img => {
          // find last uploading image
          if (img.uploading && !img.url) {
            return { ...img, progress: Math.min((img.progress || 0) + Math.random() * 30, 90) }
          }
          return img
        }))
      }, 200)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()

      setImages(prev => prev.map(img => {
        if (img.uploading && !img.url) {
          return { url: data.url, thumbnail: data.thumbnail, uploading: false, progress: 100 }
        }
        return img
      }))
    } catch (err: any) {
      // Remove the failed upload
      setImages(prev => prev.filter(img => !img.uploading || img.url))
      toast.error(err.message || 'Failed to upload image')
    }
  }, [images.length])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_IMAGES - images.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      toast.warning(`Only ${remaining} more image(s) allowed`)
    }
    toUpload.forEach(file => uploadFile(file))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-300">Images</h2>
            <span className="text-xs text-stone-500">{images.filter(i => !i.uploading).length}/{MAX_IMAGES} images</span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? 'border-red-500 bg-red-500/5'
                : 'border-white/10 hover:border-red-500/30 hover:bg-white/[0.02]'
            } ${images.length >= MAX_IMAGES ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <ImagePlus className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-red-400' : 'text-stone-600'}`} />
            <p className="text-sm text-stone-400">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              or click to browse • JPEG, PNG, WebP, GIF • Max 5MB each
            </p>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Or paste an image URL" className={`${inputClass} flex-1`} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} />
            <Button onClick={addImageUrl} variant="outline" disabled={!newImage.trim() || images.length >= MAX_IMAGES} className="border-white/10 text-stone-300 h-11 rounded-xl hover:bg-white/5">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Thumbnails */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div
                  key={img.url || `uploading-${i}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-neutral-800 border border-white/5 group"
                >
                  {img.url ? (
                    <img
                      src={img.thumbnail || img.url}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-stone-500 animate-spin" />
                    </div>
                  )}

                  {/* Upload progress overlay */}
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-full px-2">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-300"
                            style={{ width: `${img.progress || 0}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 text-center mt-1">
                          {Math.round(img.progress || 0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* First image badge */}
                  {i === 0 && img.url && !img.uploading && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600 text-[9px] text-white font-medium">
                      Main
                    </div>
                  )}

                  {/* Remove button */}
                  {img.url && !img.uploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {/* Reorder buttons */}
                  {img.url && !img.uploading && images.filter(x => x.url).length > 1 && (
                    <div className="absolute bottom-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveImage(i, 'up') }}
                        disabled={i === 0}
                        className="w-5 h-5 rounded bg-black/60 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveImage(i, 'down') }}
                        disabled={i === images.length - 1}
                        className="w-5 h-5 rounded bg-black/60 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-stone-600">
            First image will be the main photo. You can reorder with the arrow buttons.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('my-products')} className="border-white/10 text-stone-300 rounded-xl h-11 px-6">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading || images.some(img => img.uploading)}
            className="border-white/10 text-stone-300 rounded-xl h-11 px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('ACTIVE')}
            disabled={loading || images.some(img => img.uploading)}
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
