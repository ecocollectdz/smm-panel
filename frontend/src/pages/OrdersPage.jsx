import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, PlusCircle, RefreshCw, Filter } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_BADGE = {
  'Pending':     'badge-pending',
  'In progress': 'badge-progress',
  'Completed':   'badge-completed',
  'Partial':     'badge-partial',
  'Canceled':    'badge-canceled',
  'Failed':      'badge-failed',
}
const STATUSES = ['All', 'Pending', 'In progress', 'Completed', 'Partial', 'Canceled', 'Failed']

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('All')
  const [page, setPage]       = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetchOrders = async (p = 1, s = 'All') => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20 }
      if (s !== 'All') params.status = s
      const { data } = await api.get('/orders', { params })
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders(page, status) }, [page, status])

  const handleStatusChange = s => {
    setStatus(s); setPage(1)
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track all your orders in real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchOrders(page, status)}
            className="btn-secondary gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/dashboard/new-order" className="btn-primary gap-2">
            <PlusCircle size={14} /> New Order
          </Link>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {STATUSES.map(s => (
          <button key={s} onClick={() => handleStatusChange(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === s
                ? 'bg-accent text-white'
                : 'bg-dark-800 border border-white/[0.06] text-gray-400 hover:text-white'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-14 text-center">
            <ShoppingCart size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">No orders found</p>
            <p className="text-gray-600 text-sm">
              {status !== 'All' ? `No ${status} orders` : 'Place your first order to get started'}
            </p>
            <Link to="/dashboard/new-order" className="btn-primary mt-5 inline-flex">
              <PlusCircle size={15} /> Place Order
            </Link>
          </div>
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Service</th>
                    <th>Link</th>
                    <th>Qty</th>
                    <th>Remains</th>
                    <th>Charge</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o._id}>
                      <td className="font-mono text-xs text-gray-600">
                        #{String(i + 1 + (page - 1) * 20).padStart(3, '0')}
                      </td>
                      <td>
                        <div>
                          <p className="text-white text-sm font-medium leading-tight">
                            {o.serviceSnapshot?.name || '—'}
                          </p>
                          <p className="text-gray-500 text-xs">{o.serviceSnapshot?.category}</p>
                        </div>
                      </td>
                      <td>
                        <a href={o.link} target="_blank" rel="noreferrer"
                          className="text-accent-light hover:underline text-xs block max-w-[160px] truncate">
                          {o.link}
                        </a>
                      </td>
                      <td className="font-mono text-sm">{o.quantity.toLocaleString()}</td>
                      <td className="font-mono text-sm text-gray-400">
                        {o.remains > 0 ? o.remains.toLocaleString() : '—'}
                      </td>
                      <td className="font-mono text-sm text-emerald-400">${o.charge.toFixed(4)}</td>
                      <td>
                        <span className={STATUS_BADGE[o.status] || 'badge'}>
                          {o.status}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs whitespace-nowrap">
                        {format(new Date(o.createdAt), 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <p className="text-gray-500 text-xs">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
