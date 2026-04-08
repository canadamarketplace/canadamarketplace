'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import AdminAuthGuard from './AdminAuthGuard'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tag, Plus, Search, Loader2, Package, CheckCircle2, XCircle, Archive } from 'lucide-react'
import { toast } from 'sonner'

interface BrandInfo {
  name: string
  slug: string
  productCount: number
  activeProducts: number
  inactiveProducts: number
}

export default function AdminBrands() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [brands, setBrands] = useState<BrandInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Slug auto-generation from name
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=200')
      if (res.ok) {
        const data = await res.json()
        const products = data.products || data || []
        const brandMap: Record<string, { total: number; active: number; inactive: number }> = {}

        for (const p of products) {
          const brand = p.brand || p.store?.name || 'Unknown'
          if (!brandMap[brand]) brandMap[brand] = { total: 0, active: 0, inactive: 0 }
          brandMap[brand].total++
          if (p.status === 'ACTIVE') {
            brandMap[brand].active++
          } else {
            brandMap[brand].inactive++
          }
        }

        setBrands(
          Object.entries(brandMap)
            .map(([name, counts]) => ({
              name,
              slug: generateSlug(name),
              productCount: counts.total,
              activeProducts: counts.active,
              inactiveProducts: counts.inactive,
            }))
            .sort((a, b) => b.productCount - a.productCount)
        )
      }
    } catch {
      toast.error('Failed to load brands')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) fetchBrands()
  }, [user, fetchBrands])

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAddDialog = () => {
    setFormName('')
    setFormSlug('')
    setFormDescription('')
    setAddDialogOpen(true)
  }

  const openEditDialog = (brand: BrandInfo) => {
    setSelectedBrand(brand)
    setFormName(brand.name)
    setFormSlug(brand.slug)
    setFormDescription('')
    setEditDialogOpen(true)
  }

  const handleSaveBrand = async (isEdit: boolean) => {
    if (!formName.trim()) {
      toast.error('Brand name is required')
      return
    }
    setSaving(true)
    const slug = formSlug.trim() || generateSlug(formName)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEdit ? 'update_brand' : 'add_brand',
          name: formName.trim(),
          slug,
          description: formDescription.trim(),
          ...(isEdit && selectedBrand ? { oldName: selectedBrand.name } : {}),
        }),
      })
      if (res.ok) {
        toast.success(isEdit ? `Brand "${formName}" updated` : `Brand "${formName}" created`)
        setAddDialogOpen(false)
        setEditDialogOpen(false)
        setSelectedBrand(null)
        fetchBrands()
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} brand`)
      }
    } catch {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} brand`)
    }
    setSaving(false)
  }

  const getBrandStatus = (brand: BrandInfo) => {
    if (brand.inactiveProducts === 0) return { label: 'All Active', variant: 'active' as const }
    if (brand.activeProducts === 0) return { label: 'All Inactive', variant: 'inactive' as const }
    return { label: 'Mixed', variant: 'mixed' as const }
  }

  const statusStyles: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
    mixed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }

  const totalProducts = brands.reduce((sum, b) => sum + b.productCount, 0)
  const totalActive = brands.reduce((sum, b) => sum + b.activeProducts, 0)

  return (
    <AdminAuthGuard>
      <DashboardSidebar role="admin" activeItem="admin-brands" onNavigate={(page) => navigate(page)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Tag className="w-6 h-6 text-orange-400" />
                <h1 className="text-2xl font-bold text-cm-primary">Brand Management</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cm-hover text-xs text-cm-muted border border-cm-border-hover">
                  {brands.length} brands
                </span>
              </div>
              <p className="text-sm text-cm-dim">
                {totalProducts} total products across {totalActive} active listings
              </p>
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl h-10 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Brands', value: brands.length, icon: Package, color: 'text-cm-secondary' },
              { label: 'Total Products', value: totalProducts, icon: Archive, color: 'text-cm-secondary' },
              { label: 'Active Products', value: totalActive, icon: CheckCircle2, color: 'text-green-400' },
              { label: 'Inactive Products', value: totalProducts - totalActive, icon: XCircle, color: 'text-red-400' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <p className="text-[10px] text-cm-dim uppercase font-semibold">{stat.label}</p>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="pl-9 bg-cm-hover border-cm-border-hover text-cm-secondary placeholder:text-cm-faint h-10 rounded-xl"
            />
          </div>

          {/* Brands Table */}
          <div className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cm-border-subtle">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase tracking-wider">
                      Active
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3 text-[10px] font-semibold text-cm-dim uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-cm-border-subtle">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="h-6 bg-cm-input rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <Package className="w-12 h-12 text-cm-faint mx-auto mb-3" />
                        <p className="text-sm text-cm-dim">
                          {search ? 'No brands match your search' : 'No brands found'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map((brand, idx) => {
                      const status = getBrandStatus(brand)
                      return (
                        <tr
                          key={idx}
                          className="border-b border-cm-border-subtle last:border-0 hover:bg-cm-hover transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cm-hover border border-cm-border-subtle flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-cm-faint" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-cm-secondary">{brand.name}</p>
                                <p className="text-[10px] text-cm-faint font-mono">{brand.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-cm-secondary font-medium">
                            {brand.productCount}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-green-400 font-medium">{brand.activeProducts}</span>
                              {brand.inactiveProducts > 0 && (
                                <span className="text-[10px] text-cm-faint">/ {brand.productCount}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              className={`${statusStyles[status.variant]} text-[10px] border`}
                            >
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(brand)}
                              className="text-xs text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-lg h-8"
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Brand Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent className="bg-cm-elevated border-cm-border-subtle text-cm-primary sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-cm-primary">Add New Brand</DialogTitle>
                <DialogDescription className="text-sm text-cm-dim">
                  Create a new brand. Products can be associated with this brand later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Brand Name *</Label>
                  <Input
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      setFormSlug(generateSlug(e.target.value))
                    }}
                    placeholder="e.g., Apple, Sony, Nike"
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Slug (URL identifier)</Label>
                  <Input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="auto-generated-from-name"
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10 font-mono text-sm"
                  />
                  <p className="text-[10px] text-cm-faint mt-1">Auto-generated from name. Edit if needed.</p>
                </div>
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Description</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief brand description..."
                    rows={3}
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl resize-none text-sm"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setAddDialogOpen(false)}
                  className="text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveBrand(false)}
                  disabled={saving || !formName.trim()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create Brand
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Brand Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="bg-cm-elevated border-cm-border-subtle text-cm-primary sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-cm-primary">Edit Brand</DialogTitle>
                <DialogDescription className="text-sm text-cm-dim">
                  Update brand details for &ldquo;{selectedBrand?.name}&rdquo;.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Brand Name *</Label>
                  <Input
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      setFormSlug(generateSlug(e.target.value))
                    }}
                    placeholder="e.g., Apple, Sony, Nike"
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Slug (URL identifier)</Label>
                  <Input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="auto-generated-from-name"
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10 font-mono text-sm"
                  />
                  <p className="text-[10px] text-cm-faint mt-1">Auto-generated from name. Edit if needed.</p>
                </div>
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Description</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief brand description..."
                    rows={3}
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl resize-none text-sm"
                  />
                </div>
                {selectedBrand && (
                  <div className="p-3 rounded-xl bg-cm-hover border border-cm-border-subtle">
                    <p className="text-[10px] text-cm-dim uppercase font-semibold mb-2">Current Stats</p>
                    <div className="flex gap-4 text-xs text-cm-muted">
                      <span>{selectedBrand.productCount} products</span>
                      <span className="text-green-400">{selectedBrand.activeProducts} active</span>
                      <span className="text-red-400">{selectedBrand.inactiveProducts} inactive</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditDialogOpen(false)
                    setSelectedBrand(null)
                  }}
                  className="text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveBrand(true)}
                  disabled={saving || !formName.trim()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardSidebar>
    </AdminAuthGuard>
  )
}
