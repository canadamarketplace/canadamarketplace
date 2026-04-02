'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Users, Search, CheckCircle2, XCircle, Shield, Loader2, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface UserRecord {
  id: string; email: string; name: string; role: string; avatar?: string
  province?: string; city?: string; isVerified: boolean; isActive: boolean
  createdAt: string
  store?: { id: string; name: string; slug: string; rating: number; totalSales: number; isActive: boolean }
  _count?: { orders: number; reviews: number; disputes: number }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString() })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setTotal(data.total || 0)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [search, roleFilter, statusFilter, page, fetchUsers])

  const handleAction = async (userId: string, action: string, value: any) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [action]: value }),
      })
      if (res.ok) {
        toast.success(`User ${action} updated`)
        fetchUsers()
      }
    } catch {}
    setUpdating(false)
  }

  const roleColors: Record<string, string> = {
    BUYER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    SELLER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-stone-100 mb-2">User Management</h1>
      <p className="text-sm text-stone-500 mb-6">{total} total users</p>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search users..."
            className="pl-9 bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-600 h-10 rounded-xl"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1) }}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10">
            <SelectItem value="all" className="text-stone-300">All Roles</SelectItem>
            <SelectItem value="BUYER">Buyer</SelectItem>
            <SelectItem value="SELLER">Seller</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}>
          <SelectTrigger className="w-36 bg-white/5 border-white/10 text-stone-200 h-10 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10">
            <SelectItem value="all" className="text-stone-300">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">User</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Role</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Joined</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-white/5"><td colSpan={5} className="px-5 py-4"><div className="h-6 bg-neutral-800 rounded animate-pulse" /></td></tr>)
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-stone-600">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <>
                    <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-200">{u.name}</p>
                            <p className="text-xs text-stone-600">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`${roleColors[u.role] || ''} text-[10px] border`}>{u.role}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {u.isActive ? (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] border">Active</Badge>
                          ) : (
                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] border">Inactive</Badge>
                          )}
                          {u.isVerified && (
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(u.id, 'isVerified', !u.isVerified)} disabled={updating} className="p-1.5 rounded-lg hover:bg-white/5 text-stone-500 hover:text-blue-400" title="Toggle Verified">
                            <Shield className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAction(u.id, 'isActive', !u.isActive)} disabled={updating} className="p-1.5 rounded-lg hover:bg-white/5 text-stone-500 hover:text-green-400" title="Toggle Active">
                            {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setExpandedId(expandedId === u.id ? null : u.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-stone-500 hover:text-stone-300">
                            {expandedId === u.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === u.id && (
                      <tr key={`${u.id}-detail`}>
                        <td colSpan={5} className="px-5 py-4 bg-white/[0.02]">
                          <div className="grid sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-stone-500 mb-1">Location</p>
                              <p className="text-stone-300">{u.city || '-'}, {u.province || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-stone-500 mb-1">Orders / Reviews / Disputes</p>
                              <p className="text-stone-300">{u._count?.orders || 0} / {u._count?.reviews || 0} / {u._count?.disputes || 0}</p>
                            </div>
                            {u.store && (
                              <div>
                                <p className="text-xs text-stone-500 mb-1">Store</p>
                                <p className="text-stone-300">{u.store.name} · Rating: {u.store.rating.toFixed(1)} · Sales: {u.store.totalSales}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
