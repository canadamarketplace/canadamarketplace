'use client'
import { useState } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Store, Loader2, Save, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function SellerStorePage() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [storeName, setStoreName] = useState(user?.storeName || 'TechShop Canada')
  const [storeDesc, setStoreDesc] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')

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
          <Button variant="outline" onClick={() => navigate('storefront', { slug: user.storeId?.toLowerCase().replace(/\s+/g, '-') })} className="border-white/10 text-stone-300 rounded-xl text-sm">
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
        <div className="rounded-2xl bg-neutral-900/60 border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-300">Branding</h2>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Logo URL</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className={inputClass} />
            {logoUrl && (
              <div className="mt-2 w-20 h-20 rounded-xl bg-neutral-800 border border-white/5 overflow-hidden">
                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <Label className="text-stone-300 text-xs mb-1.5 block">Banner URL</Label>
            <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://example.com/banner.png" className={inputClass} />
            {bannerUrl && (
              <div className="mt-2 h-32 rounded-xl bg-neutral-800 border border-white/5 overflow-hidden">
                <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
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
