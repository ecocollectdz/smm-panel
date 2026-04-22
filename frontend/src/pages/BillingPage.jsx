import React, { useEffect, useState } from 'react'
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Clock, Zap } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const AMOUNTS = [5, 10, 25, 50, 100, 200]

const TX_ICON = {
  deposit:      { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  order_charge: { icon: ArrowUpRight,  color: 'text-red-400',     bg: 'bg-red-400/10' },
  refund:       { icon: ArrowDownLeft, color: 'text-blue-400',    bg: 'bg-blue-400/10' },
}

export default function BillingPage() {
  const { user, refreshUser }   = useAuth()
  const [amount, setAmount]     = useState('')
  const [custom, setCustom]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [txLoading, setTxLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination]     = useState(null)
  const [page, setPage]                 = useState(1)

  useEffect(() => {
    setTxLoading(true)
    api.get('/payments/transactions', { params: { page, limit: 15 } })
      .then(({ data }) => { setTransactions(data.transactions); setPagination(data.pagination) })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setTxLoading(false))
  }, [page])

  const finalAmount = custom ? parseFloat(custom) : parseFloat(amount)

  const handleCheckout = async () => {
    if (!finalAmount || finalAmount < 1) { toast.error('Minimum deposit is $1'); return }
    if (finalAmount > 500) { toast.error('Maximum deposit is $500'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/payments/create-checkout', { amount: finalAmount })
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Billing</h1>
        <p className="page-subtitle">Manage your balance and payment history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Balance card */}
        <div className="card p-6 flex flex-col justify-between bg-gradient-to-br from-accent/20 to-purple-600/10 border-accent/20">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Available Balance</p>
            <p className="font-display font-bold text-4xl text-white mt-2">
              ${(user?.balance || 0).toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm mt-1">USD</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500">Total spent: <span className="text-gray-300">${(user?.totalSpent || 0).toFixed(2)}</span></p>
          </div>
        </div>

        {/* Add funds */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Plus size={18} className="text-accent-light" /> Add Funds
          </h2>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => { setAmount(String(a)); setCustom('') }}
                className={`py-2.5 rounded-lg text-sm font-display font-semibold transition-all border ${
                  amount === String(a) && !custom
                    ? 'bg-accent border-accent text-white shadow-glow'
                    : 'bg-dark-700 border-white/[0.06] text-gray-300 hover:border-accent/40 hover:text-white'
                }`}>
                ${a}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="mb-5">
            <label className="label">Custom Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input type="number" value={custom}
                onChange={e => { setCustom(e.target.value); setAmount('') }}
                className="input pl-8" placeholder="Enter amount (min $1)" min="1" max="500" step="0.01" />
            </div>
          </div>

          {/* Summary */}
          {(finalAmount > 0) && (
            <div className="flex items-center justify-between bg-dark-700 rounded-lg p-3 mb-4 border border-white/[0.06]">
              <span className="text-gray-400 text-sm">You'll add to balance:</span>
              <span className="text-white font-mono font-bold">${finalAmount.toFixed(2)}</span>
            </div>
          )}

          <button onClick={handleCheckout} disabled={loading || !finalAmount || finalAmount < 1}
            className="btn-primary w-full py-3 justify-center text-base">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting to Stripe...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard size={16} />
                {finalAmount >= 1 ? `Pay $${finalAmount.toFixed(2)} via Stripe` : 'Pay via Stripe'}
              </span>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
              <Zap size={11} /> Instant credit
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
              <CreditCard size={11} /> Secured by Stripe
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="section-title">Transaction History</h2>
        </div>

        {txLoading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/[0.04]">
              {transactions.map(tx => {
                const cfg = TX_ICON[tx.type] || TX_ICON.deposit
                const Icon = cfg.icon
                return (
                  <div key={tx._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={15} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm font-medium truncate">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-mono font-semibold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(4)}
                      </p>
                      <p className="text-gray-600 text-xs font-mono">
                        bal: ${tx.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                <p className="text-gray-500 text-xs">Page {page} of {pagination.pages}</p>
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
