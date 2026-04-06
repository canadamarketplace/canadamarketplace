'use client'
import { useState, useEffect, useCallback } from 'react'
import { useNavigation, useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin, Plus, Pencil, Trash2, Check, Home, Building, Briefcase,
  MapPinOff
} from 'lucide-react'
import DashboardSidebar from '@/components/marketplace/layouts/DashboardSidebar'
import { toast } from 'sonner'

interface Address {
  id: string
  name: string
  street: string
  city: string
  province: string
  postalCode: string
  phone: string
  isDefault: boolean
  label: 'home' | 'work' | 'other'
}

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon'
]

const mockAddresses: Address[] = [
  { id: '1', name: 'Alex Johnson', street: '123 Bay Street, Apt 4B', city: 'Toronto', province: 'Ontario', postalCode: 'M5V 3L9', phone: '(416) 555-0123', isDefault: true, label: 'home' },
  { id: '2', name: 'Alex Johnson', street: '456 Robson Street', city: 'Vancouver', province: 'British Columbia', postalCode: 'V6B 1A2', phone: '(604) 555-0456', isDefault: false, label: 'work' },
]

const LABEL_ICONS: Record<string, typeof Home> = {
  home: Home,
  work: Briefcase,
  other: Building,
}

const LABEL_COLORS: Record<string, string> = {
  home: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  work: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  other: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

const emptyForm: Omit<Address, 'id'> = {
  name: '', street: '', city: '', province: '', postalCode: '', phone: '',
  isDefault: false, label: 'home',
}

export default function BuyerAddressBook() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Address, 'id'>>(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Load addresses from localStorage or use mock data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cm-addresses')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed)
          return
        }
      }
    } catch {}
    setAddresses(mockAddresses)
  }, [])

  const saveToStorage = useCallback((addrs: Address[]) => {
    try {
      localStorage.setItem('cm-addresses', JSON.stringify(addrs))
    } catch {}
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (addr: Address) => {
    setEditingId(addr.id)
    const { id, ...rest } = addr
    setForm(rest)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !form.province || !form.postalCode.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    let updated: Address[]
    if (editingId) {
      updated = addresses.map(a => a.id === editingId ? { ...form, id: editingId } : a)
      toast.success('Address updated successfully')
    } else {
      const newAddr: Address = { ...form, id: Date.now().toString() }
      updated = [...addresses, newAddr]
      toast.success('New address added')
    }

    // If this one is set as default, unset others
    if (form.isDefault) {
      updated = updated.map(a => a.id === (editingId || updated[updated.length - 1].id) ? a : { ...a, isDefault: false })
    }

    // If no default exists, make the first one default
    if (!updated.some(a => a.isDefault) && updated.length > 0) {
      updated[0] = { ...updated[0], isDefault: true }
    }

    setAddresses(updated)
    saveToStorage(updated)
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id)
    // If we deleted the default, set a new default
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0] = { ...updated[0], isDefault: true }
    }
    setAddresses(updated)
    saveToStorage(updated)
    setDeleteConfirmId(null)
    toast.success('Address deleted')
  }

  const setAsDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }))
    setAddresses(updated)
    saveToStorage(updated)
    toast.success('Default address updated')
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <MapPin className="w-16 h-16 text-cm-faint mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-cm-secondary mb-2">Please sign in</h1>
        <p className="text-sm text-cm-dim mb-6">Sign in to manage your address book</p>
        <Button onClick={() => useNavigation.getState().openAuthModal('login')} className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mt-4">Sign In</Button>
      </div>
    )
  }

  return (
    <DashboardSidebar role="buyer" activeItem="address-book" onNavigate={(page) => navigate(page)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-red-400" />
              <h1 className="text-2xl font-bold text-cm-primary">Address Book</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cm-hover text-xs text-cm-muted border border-cm-border-hover">
                {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}
              </span>
            </div>
            <p className="text-sm text-cm-dim mt-1">Manage your shipping and billing addresses</p>
          </div>
          <Button
            onClick={openNew}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl h-10 px-5 shadow-lg shadow-red-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-cm-elevated border border-cm-border-subtle">
            <div className="w-20 h-20 rounded-full bg-cm-hover flex items-center justify-center mx-auto mb-6">
              <MapPinOff className="w-10 h-10 text-cm-faint" />
            </div>
            <h2 className="text-lg font-semibold text-cm-secondary mb-2">No saved addresses</h2>
            <p className="text-sm text-cm-dim mb-6">Add your first address to speed up checkout</p>
            <Button
              onClick={openNew}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const LabelIcon = LABEL_ICONS[addr.label] || Building
              return (
                <div
                  key={addr.id}
                  className={`rounded-2xl bg-cm-elevated border transition-all group ${
                    addr.isDefault
                      ? 'border-red-500/30 ring-1 ring-red-500/10'
                      : 'border-cm-border-subtle hover:border-cm-border-hover'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between p-4 pb-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${LABEL_COLORS[addr.label]}`}>
                        <LabelIcon className="w-3.5 h-3.5" />
                      </div>
                      <Badge className={`${LABEL_COLORS[addr.label]} border text-[10px] px-1.5 py-0 capitalize`}>
                        {addr.label}
                      </Badge>
                      {addr.isDefault && (
                        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] px-1.5 py-0 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!addr.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAsDefault(addr.id)}
                          className="h-8 w-8 text-cm-dim hover:text-green-400 hover:bg-green-500/10 rounded-lg"
                          title="Set as default"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(addr)}
                        className="h-8 w-8 text-cm-dim hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(addr.id)}
                        className="h-8 w-8 text-cm-dim hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 pt-3">
                    <p className="text-sm font-semibold text-cm-secondary">{addr.name}</p>
                    <p className="text-sm text-cm-dim mt-1 leading-relaxed">
                      {addr.street}<br />
                      {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                    <p className="text-xs text-cm-muted mt-2">
                      {addr.phone}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add / Edit Address Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-cm-elevated border-cm-border-subtle text-cm-primary sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-cm-primary">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Label */}
              <div>
                <Label className="text-xs text-cm-dim mb-1.5 block">Address Label</Label>
                <div className="flex gap-2">
                  {(['home', 'work', 'other'] as const).map((lbl) => {
                    const Icon = LABEL_ICONS[lbl]
                    return (
                      <button
                        key={lbl}
                        onClick={() => setForm({ ...form, label: lbl })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm capitalize transition-all ${
                          form.label === lbl
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-cm-border-hover text-cm-dim hover:border-cm-border-hover hover:bg-cm-hover'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {lbl}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label className="text-xs text-cm-dim mb-1.5 block">Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                />
              </div>

              {/* Street Address */}
              <div>
                <Label className="text-xs text-cm-dim mb-1.5 block">Street Address *</Label>
                <Input
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="123 Main Street, Apt 4B"
                  className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                />
              </div>

              {/* City & Province */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">City *</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Toronto"
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Province *</Label>
                  <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
                    <SelectTrigger className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-cm-elevated border-cm-border-hover max-h-60 overflow-y-auto">
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p} className="text-cm-secondary">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Postal Code & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Postal Code *</Label>
                  <Input
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value.toUpperCase() })}
                    placeholder="M5V 3L9"
                    maxLength={7}
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs text-cm-dim mb-1.5 block">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(416) 555-0123"
                    className="bg-cm-hover border-cm-border-hover text-cm-secondary rounded-xl h-10"
                  />
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div
                  onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                    form.isDefault
                      ? 'bg-red-500 border-red-500'
                      : 'border-cm-border-hover bg-cm-hover'
                  }`}
                >
                  {form.isDefault && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-cm-secondary">Set as default address</span>
              </label>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl"
              >
                {editingId ? 'Save Changes' : 'Add Address'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
          <DialogContent className="bg-cm-elevated border-cm-border-subtle text-cm-primary sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-cm-primary">Delete Address</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-cm-dim py-2">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmId(null)}
                className="text-cm-dim hover:text-cm-secondary hover:bg-cm-hover rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-500 text-white rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardSidebar>
  )
}
