import React, { useEffect, useState, useCallback } from 'react'
import {
  Users, ShoppingCart, DollarSign, Package,
  Plus, Edit2, Trash2, Check, X, RefreshCw,
  TrendingUp, UserCheck, AlertCircle, Search
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const TABS = ['Overview', 'Services', 'Orders', 'Users']
const CATEGORIES = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Telegram', 'Spotify', 'Other']
const STATUS_BADGE = {
  'Pending': 'badge-pending', 'In progress': 'badge-progress',
  'Completed': 'badge-completed', 'Partial': 'badge-partial',
  'Canceled': 'badge-canceled', 'Failed': 'badge-failed',
}
const EMPTY_SERVICE = {
  name: '', description: '', category: 'Instagram', type: 'Followers',
  providerServiceId: '', providerRate: '', rate: '', minOrder: 100, maxOrder: 100000, isActive: true
}

/* ─── Sub-panels ─────────────────────────────────────────────────────────── */
function Overview({ stats }) {
  if (!stats) return <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>

  const statCards = [
    { label: 'Total Users',   value: stats.totalUsers,   icon: Users,        color: 'text-blue-400',    bg: 'bg-blue-400/10' },
    { label: 'Total Orders',  value: stats.totalOrders,  icon: ShoppingCart, color: 'text-purple-400',  bg: 'bg-purple-400/10' },
    { label: 'Revenue',       value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Live Services', value: stats.totalServices, icon: Package,     color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${bg}`}><Icon size={20} className={color} /></div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
              <p className="text-white font-display font-bold text-2xl mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order status breakdown */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Order Status Breakdown</h3>
        <div className="flex flex-wrap gap-3">
          {(stats.orderStats || []).map(({ _id, count }) => (
            <div key={_id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 border border-white/[0.06]">
              <span className={STATUS_BADGE[_id] || 'badge'}>{_id}</span>
              <span className="text-white font-mono font-semibold text-sm">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="section-title">Latest Orders</h3>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead><tr><th>User</th><th>Service</th><th>Qty</th><th>Charge</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {(stats.recentOrders || []).map(o => (
                <tr key={o._id}>
                  <td>
                    <p className="text-white text-sm">{o.user?.name || '—'}</p>
                    <p className="text-gray-500 text-xs">{o.user?.email}</p>
                  </td>
                  <td className="text-gray-300 text-sm max-w-[180px] truncate">{o.serviceSnapshot?.name || '—'}</td>
                  <td className="font-mono text-sm">{o.quantity?.toLocaleString()}</td>
                  <td className="font-mono text-sm text-emerald-400">${o.charge?.toFixed(4)}</td>
                  <td><span className={STATUS_BADGE[o.status] || 'badge'}>{o.status}</span></td>
                  <td className="text-gray-500 text-xs">{format(new Date(o.createdAt), 'MMM d, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ServiceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_SERVICE)
  const [saving, setSaving] = useState(false)

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4 border border-accent/20">
      <h3 className="section-title">{initial?._id ? 'Edit Service' : 'Add New Service'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Service Name</label>
          <input name="name" value={form.name} onChange={handle} required className="input" placeholder="e.g. Instagram Followers – HQ" />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={handle} className="input">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <input name="type" value={form.type} onChange={handle} required className="input" placeholder="Followers / Views / Likes" />
        </div>
        <div>
          <label className="label">Provider Service ID</label>
          <input name="providerServiceId" value={form.providerServiceId} onChange={handle} required className="input font-mono" placeholder="Provider's service ID" />
        </div>
        <div>
          <label className="label">Provider Rate ($/1K)</label>
          <input name="providerRate" type="number" value={form.providerRate} onChange={handle} required step="0.0001" min="0" className="input font-mono" placeholder="0.0100" />
        </div>
        <div>
          <label className="label">Your Selling Rate ($/1K)</label>
          <input name="rate" type="number" value={form.rate} onChange={handle} required step="0.0001" min="0" className="input font-mono" placeholder="0.0200" />
        </div>
        <div>
          <label className="label">Min Order</label>
          <input name="minOrder" type="number" value={form.minOrder} onChange={handle} required min="1" className="input font-mono" />
        </div>
        <div>
          <label className="label">Max Order</label>
          <input name="maxOrder" type="number" value={form.maxOrder} onChange={handle} required min="1" className="input font-mono" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description (optional)</label>
          <textarea name="description" value={form.description} onChange={handle} rows={2}
            className="input resize-none" placeholder="Service details..." />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handle} className="rounded" />
          <label htmlFor="isActive" className="text-gray-300 text-sm cursor-pointer">Active (visible to users)</label>
        </div>
      </div>
      {form.rate && form.providerRate && (
        <div className="bg-dark-700 rounded-lg p-3 text-xs text-gray-400">
          Margin: <span className="text-emerald-400 font-mono font-semibold">
            {(((form.rate - form.providerRate) / form.providerRate) * 100).toFixed(1)}%
          </span> — you earn <span className="text-emerald-400 font-mono">${(form.rate - form.providerRate).toFixed(4)}/1K</span>
        </div>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary gap-2">
          {saving ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
          {initial?._id ? 'Save Changes' : 'Create Service'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary gap-2">
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  )
}

function ServicesPanel() {
  const [services, setServices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null) // null | 'new' | service object
  const [search, setSearch]       = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/services/admin/all')
      .then(({ data }) => setServices(data.services))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async form => {
    try {
      if (form._id) {
        await api.put(`/services/${form._id}`, form)
        toast.success('Service updated')
      } else {
        await api.post('/services', form)
        toast.success('Service created')
      }
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service')
      throw err
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this service?')) return
    try {
      await api.delete(`/services/${id}`)
      toast.success('Service deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const filtered = services.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 py-2 text-xs" placeholder="Search services..." />
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary gap-1.5 py-2 text-xs"><RefreshCw size={13} /></button>
          <button onClick={() => setEditing('new')} className="btn-primary gap-1.5 py-2 text-xs">
            <Plus size={14} /> Add Service
          </button>
        </div>
      </div>

      {editing === 'new' && (
        <ServiceForm onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {editing && editing !== 'new' && (
        <ServiceForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead><tr>
                <th>Service</th><th>Category</th><th>Provider ID</th>
                <th>Cost/1K</th><th>Price/1K</th><th>Min–Max</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-gray-600 text-xs">{s.type}</p>
                    </td>
                    <td className="text-gray-300 text-sm">{s.category}</td>
                    <td className="font-mono text-xs text-gray-500">{s.providerServiceId}</td>
                    <td className="font-mono text-xs text-gray-400">${s.providerRate?.toFixed(4)}</td>
                    <td className="font-mono text-xs text-accent-light font-semibold">${s.rate?.toFixed(4)}</td>
                    <td className="text-xs text-gray-500 font-mono">{s.minOrder}–{s.maxOrder}</td>
                    <td>
                      <span className={s.isActive ? 'badge bg-emerald-500/15 text-emerald-400' : 'badge bg-gray-500/15 text-gray-500'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(s)} className="p-1.5 rounded hover:bg-accent/15 text-gray-400 hover:text-accent-light transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersPanel() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pagination, setPagination] = useState(null)
  const [status, setStatus]     = useState('All')

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 30 }
    if (status !== 'All') params.status = status
    api.get('/orders/admin/all', { params })
      .then(({ data }) => { setOrders(data.orders); setPagination(data.pagination) })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [page, status])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['All', 'Pending', 'In progress', 'Completed', 'Partial', 'Failed'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === s ? 'bg-accent text-white' : 'bg-dark-800 border border-white/[0.06] text-gray-400 hover:text-white'
            }`}>{s}</button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead><tr><th>User</th><th>Service</th><th>Link</th><th>Qty</th><th>Charge</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td>
                        <p className="text-white text-sm">{o.user?.name || '—'}</p>
                        <p className="text-gray-500 text-xs">{o.user?.email}</p>
                      </td>
                      <td className="max-w-[160px] truncate text-gray-300 text-sm">{o.serviceSnapshot?.name || '—'}</td>
                      <td>
                        <a href={o.link} target="_blank" rel="noreferrer"
                          className="text-accent-light text-xs hover:underline max-w-[120px] truncate block">{o.link}</a>
                      </td>
                      <td className="font-mono text-sm">{o.quantity?.toLocaleString()}</td>
                      <td className="font-mono text-sm text-emerald-400">${o.charge?.toFixed(4)}</td>
                      <td><span className={STATUS_BADGE[o.status] || 'badge'}>{o.status}</span></td>
                      <td className="text-gray-500 text-xs">{format(new Date(o.createdAt), 'MMM d, HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination?.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <p className="text-gray-500 text-xs">Total: {pagination.total}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [editUser, setEditUser] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [page, setPage]         = useState(1)
  const [pagination, setPagination] = useState(null)

  const load = useCallback((p = 1, s = '') => {
    setLoading(true)
    const params = { page: p, limit: 20 }
    if (s) params.search = s
    api.get('/admin/users', { params })
      .then(({ data }) => { setUsers(data.users); setPagination(data.pagination) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(page, search) }, [page])

  const handleSearchSubmit = e => { e.preventDefault(); setPage(1); load(1, search) }

  const toggleActive = async u => {
    try {
      await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive })
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`)
      load(page, search)
    } catch { toast.error('Failed') }
  }

  const handleAddBalance = async userId => {
    const amt = parseFloat(addAmount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    try {
      const { data } = await api.post(`/admin/users/${userId}/add-balance`, { amount: amt, description: 'Manual admin deposit' })
      toast.success(data.message)
      setEditUser(null); setAddAmount('')
      load(page, search)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 py-2 text-xs" placeholder="Search by name or email..." />
        </div>
        <button type="submit" className="btn-secondary py-2 text-xs">Search</button>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead><tr><th>User</th><th>Balance</th><th>Spent</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </td>
                      <td className="font-mono text-sm text-accent-light font-semibold">${u.balance.toFixed(2)}</td>
                      <td className="font-mono text-sm text-gray-400">${u.totalSpent.toFixed(2)}</td>
                      <td>
                        <span className={u.role === 'admin' ? 'badge bg-purple-500/15 text-purple-400' : 'badge bg-gray-500/15 text-gray-400'}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={u.isActive ? 'badge bg-emerald-500/15 text-emerald-400' : 'badge bg-red-500/15 text-red-400'}>
                          {u.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setEditUser(editUser?._id === u._id ? null : u)}
                            className="px-2 py-1 rounded text-xs bg-accent/10 text-accent-light hover:bg-accent/20 transition-colors">
                            +Balance
                          </button>
                          <button onClick={() => toggleActive(u)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${u.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                            {u.isActive ? 'Ban' : 'Unban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add balance inline form */}
            {editUser && (
              <div className="px-5 py-4 bg-dark-700 border-t border-white/[0.06]">
                <p className="text-white text-sm font-semibold mb-3">Add Balance to {editUser.name}</p>
                <div className="flex gap-2 max-w-sm">
                  <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)}
                    className="input py-2 text-sm font-mono" placeholder="Amount in USD" min="0.01" step="0.01" />
                  <button onClick={() => handleAddBalance(editUser._id)} className="btn-primary py-2 px-4 text-sm">Add</button>
                  <button onClick={() => { setEditUser(null); setAddAmount('') }} className="btn-ghost"><X size={14} /></button>
                </div>
              </div>
            )}

            {pagination?.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <p className="text-gray-500 text-xs">Total: {pagination.total} users</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Main Admin Page ────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [stats, setStats]         = useState(null)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error('Failed to load stats'))
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-purple-500/20 flex items-center justify-center">
            <TrendingUp size={14} className="text-purple-400" />
          </span>
          Admin Panel
        </h1>
        <p className="page-subtitle">Manage your SMM platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl w-fit mb-6 border border-white/[0.06]">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
              activeTab === tab
                ? 'bg-accent text-white shadow-glow'
                : 'text-gray-400 hover:text-white'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview'  && <Overview stats={stats} />}
      {activeTab === 'Services'  && <ServicesPanel />}
      {activeTab === 'Orders'    && <OrdersPanel />}
      {activeTab === 'Users'     && <UsersPanel />}
    </div>
  )
}
