import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Wallet, ShoppingCart, TrendingUp, Clock,
  PlusCircle, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
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

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${bg}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-white font-display font-bold text-2xl mt-0.5">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams]        = useSearchParams()

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment successful! Balance updated.')
      refreshUser()
    }
  }, [searchParams, refreshUser])

  useEffect(() => {
    api.get('/orders?limit=5').then(({ data }) => {
      setOrders(data.orders)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalOrders     = orders.length
  const completedOrders = orders.filter(o => o.status === 'Completed').length

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Wallet}     label="Balance"        value={`$${(user?.balance || 0).toFixed(2)}`}
          color="text-accent-light" bg="bg-accent/10"
          sub={<Link to="/dashboard/billing" className="text-accent-light hover:text-white text-xs">Add funds →</Link>}
        />
        <StatCard
          icon={ShoppingCart} label="Recent Orders" value={totalOrders}
          color="text-blue-400" bg="bg-blue-400/10" sub="Last 5 orders"
        />
        <StatCard
          icon={CheckCircle2} label="Completed" value={completedOrders}
          color="text-emerald-400" bg="bg-emerald-400/10" sub="Of recent orders"
        />
        <StatCard
          icon={TrendingUp} label="Total Spent" value={`$${(user?.totalSpent || 0).toFixed(2)}`}
          color="text-purple-400" bg="bg-purple-400/10" sub="All time"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/dashboard/new-order"
          className="card-hover p-5 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <PlusCircle size={22} className="text-accent-light" />
          </div>
          <div className="flex-1">
            <p className="text-white font-display font-semibold">New Order</p>
            <p className="text-gray-400 text-sm">Place an order for any service</p>
          </div>
          <ArrowRight size={16} className="text-gray-600 group-hover:text-accent-light group-hover:translate-x-1 transition-all" />
        </Link>

        <Link to="/dashboard/billing"
          className="card-hover p-5 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center group-hover:bg-emerald-400/20 transition-colors">
            <Wallet size={22} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-display font-semibold">Add Balance</p>
            <p className="text-gray-400 text-sm">Top up via Stripe securely</p>
          </div>
          <ArrowRight size={16} className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="section-title">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-accent-light hover:text-white text-sm transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No orders yet</p>
            <p className="text-gray-600 text-sm mt-1">Place your first order to get started</p>
            <Link to="/dashboard/new-order" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={16} /> Place Order
            </Link>
          </div>
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Link</th>
                  <th>Qty</th>
                  <th>Charge</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>
                      <div>
                        <p className="text-white text-sm font-medium">{o.serviceSnapshot?.name || '—'}</p>
                        <p className="text-gray-500 text-xs">{o.serviceSnapshot?.category}</p>
                      </div>
                    </td>
                    <td>
                      <a href={o.link} target="_blank" rel="noreferrer"
                        className="text-accent-light hover:underline text-xs truncate max-w-[140px] block">
                        {o.link}
                      </a>
                    </td>
                    <td className="font-mono text-sm">{o.quantity.toLocaleString()}</td>
                    <td className="font-mono text-sm text-emerald-400">${o.charge.toFixed(4)}</td>
                    <td>
                      <span className={STATUS_BADGE[o.status] || 'badge bg-gray-500/15 text-gray-400'}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs">
                      {format(new Date(o.createdAt), 'MMM d, HH:mm')}
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
