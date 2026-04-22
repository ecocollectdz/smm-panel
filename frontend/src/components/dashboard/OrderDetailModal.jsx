import React, { useEffect, useState } from 'react'
import { ExternalLink, RefreshCw, Hash, Link2, Calendar, DollarSign } from 'lucide-react'
import { Modal, StatusBadge, Spinner, Alert, ProgressBar } from '../ui'
import api from '../../services/api'
import { format } from 'date-fns'

export default function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const load = async () => {
    if (!orderId) return
    setLoading(true); setError(null)
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      setOrder(data.order)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [orderId])

  const delivered = order ? order.quantity - (order.remains || 0) : 0

  return (
    <Modal isOpen={!!orderId} onClose={onClose} title="Order Details">
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {error && <Alert type="error">{error}</Alert>}

      {order && !loading && (
        <div className="space-y-5">
          {/* Status + refresh */}
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <button onClick={load} className="btn-ghost gap-1.5 text-xs">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Service info */}
          <div className="card p-4 space-y-1">
            <p className="text-white font-display font-semibold">{order.serviceSnapshot?.name || '—'}</p>
            <p className="text-gray-500 text-xs">{order.serviceSnapshot?.category} · {order.serviceSnapshot?.type}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Hash,       label: 'Order ID',  value: order._id.slice(-8).toUpperCase(), mono: true },
              { icon: Hash,       label: 'Provider ID', value: order.providerOrderId || 'N/A',  mono: true },
              { icon: DollarSign, label: 'Charge',    value: `$${order.charge.toFixed(4)}`,      mono: true },
              { icon: Calendar,   label: 'Placed',    value: format(new Date(order.createdAt), 'MMM d, yyyy HH:mm') },
            ].map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="bg-dark-700 rounded-lg p-3 border border-white/[0.04]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-gray-500" />
                  <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
                </div>
                <p className={`text-white text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Delivery progress</span>
              <span className="font-mono">
                {delivered.toLocaleString()} / {order.quantity.toLocaleString()}
                {order.remains > 0 && <span className="text-yellow-400 ml-2">({order.remains.toLocaleString()} remaining)</span>}
              </span>
            </div>
            <ProgressBar value={delivered} max={order.quantity} />
          </div>

          {/* Link */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Link2 size={12} className="text-gray-500" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">Target Link</p>
            </div>
            <a href={order.link} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-accent-light hover:text-white text-sm break-all transition-colors">
              {order.link}
              <ExternalLink size={12} className="flex-shrink-0" />
            </a>
          </div>

          {order.startCount > 0 && (
            <div className="bg-dark-700 rounded-lg p-3 border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Start count</p>
              <p className="text-white font-mono text-sm">{order.startCount.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
