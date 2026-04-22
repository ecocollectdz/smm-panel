import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Link as LinkIcon, Hash, Info, ChevronDown } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  Instagram: '📷', TikTok: '🎵', YouTube: '▶️',
  Twitter: '🐦', Facebook: '👤', Telegram: '✈️', Spotify: '🎧', Other: '🌐'
}

export default function NewOrderPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [services, setServices]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [search, setSearch]             = useState('')
  const [selectedCat, setSelectedCat]   = useState('All')
  const [selectedService, setSelectedService] = useState(null)
  const [link, setLink]                 = useState('')
  const [quantity, setQuantity]         = useState('')

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.services))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const cats = [...new Set(services.map(s => s.category))]
    return ['All', ...cats]
  }, [services])

  const filtered = useMemo(() => services.filter(s => {
    const matchCat = selectedCat === 'All' || s.category === selectedCat
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  }), [services, selectedCat, search])

  const charge = useMemo(() => {
    if (!selectedService || !quantity) return 0
    return parseFloat(((selectedService.rate * parseInt(quantity || 0)) / 1000).toFixed(4))
  }, [selectedService, quantity])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedService) { toast.error('Select a service'); return }
    if (!link.trim()) { toast.error('Enter the link'); return }
    if (!quantity || parseInt(quantity) < selectedService.minOrder) {
      toast.error(`Minimum quantity is ${selectedService.minOrder}`); return
    }
    if (parseInt(quantity) > selectedService.maxOrder) {
      toast.error(`Maximum quantity is ${selectedService.maxOrder}`); return
    }
    if (charge > user.balance) {
      toast.error(`Insufficient balance. Need $${charge}, have $${user.balance.toFixed(2)}`); return
    }

    setSubmitting(true)
    try {
      await api.post('/orders', { serviceId: selectedService._id, link: link.trim(), quantity: parseInt(quantity) })
      toast.success('Order placed successfully! 🚀')
      await refreshUser()
      navigate('/dashboard/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">New Order</h1>
        <p className="page-subtitle">Select a service and provide your details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service selector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input pl-10" placeholder="Search services..." />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedCat === cat
                      ? 'bg-accent text-white shadow-glow'
                      : 'bg-dark-800 border border-white/[0.06] text-gray-400 hover:text-white hover:border-accent/30'
                  }`}>
                  {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Services list */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading services...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No services found</div>
            ) : (
              <div className="divide-y divide-white/[0.04] max-h-[460px] overflow-y-auto no-scrollbar">
                {filtered.map(service => (
                  <div key={service._id}
                    onClick={() => { setSelectedService(service); setQuantity(String(service.minOrder)) }}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-white/[0.03] ${
                      selectedService?._id === service._id ? 'bg-accent/10 border-l-2 border-accent' : ''
                    }`}>
                    <div className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0 text-base">
                      {CATEGORY_ICONS[service.category] || '🌐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${selectedService?._id === service._id ? 'text-white' : 'text-gray-200'}`}>
                        {service.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-500 text-xs">{service.minOrder.toLocaleString()} – {service.maxOrder.toLocaleString()}</span>
                        <span className="text-accent-light text-xs font-mono font-semibold">
                          ${service.rate.toFixed(4)}/1K
                        </span>
                      </div>
                    </div>
                    {selectedService?._id === service._id && (
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order form */}
        <div className="space-y-4">
          {/* Selected service info */}
          {selectedService && (
            <div className="card p-4 border border-accent/20">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Selected Service</p>
              <p className="text-white font-semibold text-sm">{selectedService.name}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Min: {selectedService.minOrder.toLocaleString()}</span>
                <span>Max: {selectedService.maxOrder.toLocaleString()}</span>
                <span className="text-accent-light font-mono">${selectedService.rate.toFixed(4)}/1K</span>
              </div>
              {selectedService.description && (
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{selectedService.description}</p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-5 space-y-4">
            <h3 className="section-title">Order Details</h3>

            <div>
              <label className="label">
                <LinkIcon size={11} className="inline mr-1" /> Link
              </label>
              <input value={link} onChange={e => setLink(e.target.value)}
                className="input" placeholder="https://..." />
            </div>

            <div>
              <label className="label">
                <Hash size={11} className="inline mr-1" /> Quantity
                {selectedService && (
                  <span className="normal-case text-gray-600 font-normal ml-1">
                    ({selectedService.minOrder.toLocaleString()} – {selectedService.maxOrder.toLocaleString()})
                  </span>
                )}
              </label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="input" placeholder="Enter quantity"
                min={selectedService?.minOrder} max={selectedService?.maxOrder} />
            </div>

            {/* Charge preview */}
            <div className="rounded-lg bg-dark-700 border border-white/[0.06] p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per 1000</span>
                <span className="text-gray-200 font-mono">
                  {selectedService ? `$${selectedService.rate.toFixed(4)}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity</span>
                <span className="text-gray-200 font-mono">{parseInt(quantity || 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                <span className="text-white font-semibold">Total Charge</span>
                <span className="text-accent-light font-mono font-bold text-lg">${charge.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Your balance</span>
                <span className={`font-mono ${charge > (user?.balance || 0) ? 'text-red-400' : 'text-emerald-400'}`}>
                  ${(user?.balance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {charge > (user?.balance || 0) && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg p-3">
                <Info size={13} />
                Insufficient balance. <a href="/dashboard/billing" className="underline">Add funds</a>
              </div>
            )}

            <button type="submit" disabled={submitting || !selectedService}
              className="btn-primary w-full py-3 justify-center">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart size={16} /> Place Order
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
