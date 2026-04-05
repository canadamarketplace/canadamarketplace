'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Store, Loader2, Save, Eye, Upload, X, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ─── Single Image Upload Zone ─── */
function SingleImageUpload({
  label,
  value,
  onChange,
  aspectRatio,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  aspectRatio: 'square' | 'wide'
  placeholder: string
  hint: string
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      let prog = 0
      const progressInterval = setInterval(() => {
        prog = Math.min(prog + Math.random() * 25, 85)
        setProgress(prog)
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
      onChange(data.url)
      toast.success('Image uploaded!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [onChange])

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
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const isSquare = aspectRatio === 'square'

  return (
    <div>
      <Label className="text-stone-300 text-xs mb-1.5 block">{label}</Label>

      {/* Image preview or upload zone */}
      {value ? (
        <div className="relative group">
          <div className={`${isSquare ? 'w-28 h-28' : 'h-36 w-full'} rounded-xl bg-neutral-800 border border-white/5 overflow-hidden`}>
            <img src={value} alt={label} className="w-full h-full object-cover" />
          </div>
          {/* Remove & replace buttons */}
          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onChange('')}
              className="w-9 h-9 rounded-full bg-black/70 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full bg-black/70 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Replace image"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-xl text-center transition-all flex flex-col items-center justify-center ${
            isSquare ? 'w-28 h-28' : 'h-36 w-full'
          } ${isDragging ? 'border-red-500 bg-red-500/5' : 'border-white/10 hover:border-red-500/30 hover:bg-white/[0.02]'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="w-full px-3">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">{Math.round(progress)}%</p>
            </div>
          ) : (
            <>
              <ImagePlus className={`w-6 h-6 ${isDragging ? 'text-red-400' : 'text-stone-600'} mb-1`} />
              <p className="text-[11px] text-stone-500">{placeholder}</p>
            </>
          )}
        </div>
      )}

      <p className="text-[10px] text-stone-600 mt-1">{hint}</p>
    </div>
  )
}

/* ─── Seller Store Page ─── */
export default function SellerStorePage() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [storeDesc, setStoreDesc] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')

  // Hydrate state from user data after mount
  useEffect(() => {
    setIsMounted(true)
    if (user) {
      setStoreName(user.storeName || '')
      // Fetch store data to get logo, banner, description
      if (user.storeId) {
        fetch(`/api/stores/${user.storeId}`)
          .then(res => res.ok ? res.json() : null)
          .then(store => {
            if (store) {
              setStoreName(store.name || '')
              setStoreDesc(store.description || '')
              setLogoUrl(store.logo || '')
              setBannerUrl(store.banner || '')
            }
          })
          .catch(() => {})
      }
    }
  }, [user])

  if (!isMounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-800 rounded w-48" />
          <div className="h-40 bg-neutral-800 rounded-2xl" />
          <div className="h-60 bg-neutral-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!storeName) {
      toast.error('Store name is required')
      return
    }
    if (!user?.storeId) {
      toast.error('You need a store to update settings')
      navigate('become-seller')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: user.storeId,
          name: storeName,
          description: storeDesc,
          logo: logoUrl,
          banner: bannerUrl,
        }),
      })
      if (res.ok) {
        toast.success('Store settings saved!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save store settings')
      }
    } catch {
      toast.error('Failed to save store settings')
    }
    setLoading(false)
  }

  const inputClass = "bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-11"

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-100">Store Settings</h1>
        {user?.storeId && (
          <Button variant="outline" onClick={() => navigate('storefront', { slug: (user.storeId || '').toLowerCase().replace(/\s+/g, '-') })} className="border-white/10 text-stone-300 rounded-xl text-sm">
            <Eye className="w-4 h-4 mr-1.5" /> View Store
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-300 flex items-center gap-2">
            <Store className="w-4 h-4" /> Store Information
          </h2>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Store Name *</Label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Description</Label>
            <Textarea value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} placeholder="Tell customers about your store..." className="bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 rounded-xl min-h-[100px]" />
          </div>
        </div>

        {/* Branding */}
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-6">
          <h2 className="text-sm font-semibold text-stone-300">Branding</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Logo upload */}
            <SingleImageUpload
              label="Store Logo"
              value={logoUrl}
              onChange={setLogoUrl}
              aspectRatio="square"
              placeholder="Upload Logo"
              hint="Recommended: square image, JPEG/PNG, max 5MB"
            />

            {/* Logo URL fallback */}
            <div className="space-y-2">
              <Label className="text-stone-300 text-xs mb-1.5 block">Or paste Logo URL</Label>
              <Input
                value={logoUrl.startsWith('/uploads/') ? '' : logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Banner upload */}
            <SingleImageUpload
              label="Store Banner"
              value={bannerUrl}
              onChange={setBannerUrl}
              aspectRatio="wide"
              placeholder="Upload Banner"
              hint="Recommended: wide image (1200×300), max 5MB"
            />

            {/* Banner URL fallback */}
            <div className="space-y-2">
              <Label className="text-stone-300 text-xs mb-1.5 block">Or paste Banner URL</Label>
              <Input
                value={bannerUrl.startsWith('/uploads/') ? '' : bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.png"
                className={inputClass}
              />
            </div>
          </div>

          {/* Live preview */}
          {(logoUrl || bannerUrl) && (
            <div className="rounded-xl border border-white/5 overflow-hidden">
              {bannerUrl && (
                <div className="h-32 bg-neutral-800">
                  <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="bg-neutral-900/80 p-4 flex items-center gap-3">
                {logoUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-white/5 overflow-hidden flex-shrink-0">
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-white/5 flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-stone-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-stone-200">{storeName || 'Your Store'}</p>
                  <p className="text-xs text-stone-500">Store preview</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl h-11 px-8"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
