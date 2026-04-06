'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, Edit, Trash2, Eye, MoreHorizontal, Upload, FileSpreadsheet, Download, CheckCircle, X, Loader2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
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

  // Bulk CSV state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const storeId = user?.storeId
      const storeParam = storeId ? `storeId=${storeId}` : ''
      const res = await fetch(`/api/products?limit=50&status=all${storeParam ? `&${storeParam}` : ''}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch {}
    setLoading(false)
  }, [user])

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

  const handleCsvFile = (file: File) => {
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length < 2) {
        toast.error('CSV file is empty or has no data rows')
        return
      }
      setCsvData(parsed)
    }
    reader.readAsText(file)
  }

  const handleImportCsv = async () => {
    if (csvData.length < 2) return
    setImporting(true)
    let successCount = 0
    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i]
      if (row.length < 2) continue
      const [title, priceStr, category, description, stockStr, condition, images] = row
      const price = parseFloat(priceStr || '0')
      const stock = parseInt(stockStr || '0', 10)
      if (!title || !priceStr || isNaN(price)) continue
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title,
            price: price,
            categorySlug: category || 'general',
            description: description || '',
            stock: stock || 0,
            condition: condition || 'New',
            images: images ? JSON.stringify([images]) : JSON.stringify([]),
            storeId: user?.storeId,
            sellerId: user?.id,
          }),
        })
        successCount++
      } catch {
        // skip failed rows
      }
    }
    setImportSuccess(successCount)
    setImporting(false)
    if (successCount > 0) {
      toast.success(`${successCount} product(s) imported!`)
    } else {
      toast.error('No products were imported. Check your CSV format.')
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    DRAFT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    SOLD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REMOVED: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <DashboardSidebar role="seller" activeItem="my-products" onNavigate={(page) => navigate(page)}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cm-primary">My Products</h1>
          <p className="text-sm text-cm-dim mt-1">{products.length} products</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkDialogOpen(true)}
            className="border-cm-border-hover text-cm-secondary rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload CSV
          </Button>
          <Button onClick={() => navigate('add-product')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-cm-input" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
          <Package className="w-16 h-16 text-cm-faint mx-auto mb-4" />
          <h3 className="text-lg font-medium text-cm-muted mb-2">No products yet</h3>
          <p className="text-sm text-cm-faint mb-4">Start by adding your first product</p>
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
              <div key={product.id} className="rounded-2xl bg-cm-elevated border border-cm-border-subtle overflow-hidden group">
                <div className="aspect-square bg-cm-input relative overflow-hidden">
                  {images.length > 0 ? (
                    <img src={images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cm-faint"><Package className="w-12 h-12" /></div>
                  )}
                  <Badge className={`absolute top-3 left-3 text-[10px] border ${statusColors[product.status] || ''}`}>
                    {product.status}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-cm-secondary truncate">{product.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-red-400">${product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-cm-faint">{product.sold} sold</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('product-detail', { id: product.id })}
                      className="flex-1 border-cm-border-hover text-cm-primary text-xs h-8 rounded-lg"
                    >
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('edit-product', { id: product.id })}
                      className="flex-1 border-cm-border-hover text-cm-primary text-xs h-8 rounded-lg"
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="border-cm-border-hover text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-lg px-2"
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
    {/* Bulk CSV Upload Dialog */}
        <Dialog open={bulkDialogOpen} onOpenChange={(open) => {
          setBulkDialogOpen(open)
          if (!open) { setCsvData([]); setCsvFile(null); setImportSuccess(0) }
        }}>
          <DialogContent className="bg-cm-elevated border-cm-border-hover rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-cm-primary flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Bulk Upload Products
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Download template */}
              <div className="rounded-xl bg-cm-hover border border-cm-border-subtle p-3">
                <p className="text-xs text-cm-dim mb-2">Download the CSV template to ensure your data is formatted correctly.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const template = 'title,price,category,description,stock,condition,images\nExample Product,29.99,Electronics,Amazing product description here,50,New,https://example.com/image.jpg'
                    const blob = new Blob([template], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'product_template.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success('Template downloaded!')
                  }}
                  className="border-cm-border-hover text-cm-secondary rounded-lg text-xs h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download Template
                </Button>
              </div>

              {/* File upload zone */}
              {!csvData.length && !importSuccess && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file && file.name.endsWith('.csv')) {
                      handleCsvFile(file)
                    } else {
                      toast.error('Please upload a .csv file')
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-cm-border-hover hover:border-red-500/30 hover:bg-cm-hover'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCsvFile(file)
                    }}
                  />
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-red-400' : 'text-cm-faint'}`} />
                  <p className="text-sm text-cm-secondary mb-1">
                    {csvFile ? csvFile.name : 'Drop your CSV file here or click to browse'}
                  </p>
                  <p className="text-xs text-cm-faint">Supports .csv files only</p>
                </div>
              )}

              {/* CSV Preview Table */}
              {csvData.length > 0 && !importSuccess && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-cm-secondary font-medium">
                      Preview: {csvData.length > 1 ? `${csvData.length - 1} products` : '1 product'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setCsvData([]); setCsvFile(null) }}
                      className="text-cm-dim hover:text-cm-secondary text-xs h-7"
                    >
                      <X className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  </div>
                  <div className="rounded-xl border border-cm-border-subtle overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-cm-hover sticky top-0">
                        <tr>
                          {(csvData[0] || []).map((header, i) => (
                            <th key={i} className="text-left text-[10px] font-semibold text-cm-dim px-3 py-2 whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(1, 6).map((row, i) => (
                          <tr key={i} className="border-t border-cm-border-subtle/50">
                            {row.map((cell, j) => (
                              <td key={j} className="text-xs text-cm-secondary px-3 py-2 max-w-[150px] truncate">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 6 && (
                      <p className="text-xs text-cm-faint text-center py-2 border-t border-cm-border-subtle/50">
                        ... and {csvData.length - 6} more rows
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleImportCsv}
                    disabled={importing}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl"
                  >
                    {importing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Import {csvData.length - 1} Products</>
                    )}
                  </Button>
                </div>
              )}

              {/* Import Success */}
              {importSuccess > 0 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-cm-primary mb-1">Import Complete!</h3>
                  <p className="text-sm text-cm-dim mb-6">{importSuccess} product(s) imported successfully</p>
                  <Button
                    variant="outline"
                    onClick={() => { setBulkDialogOpen(false); setCsvData([]); setCsvFile(null); setImportSuccess(0); fetchProducts() }}
                    className="border-cm-border-hover text-cm-secondary rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
    </DashboardSidebar>
  )
}

// CSV helper functions
function parseCSV(text: string): string[][] {
  return text.trim().split('\n').map(row =>
    row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  ).filter(row => row.some(cell => cell.length > 0))
}
