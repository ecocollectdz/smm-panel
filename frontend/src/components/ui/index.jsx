import React, { useEffect, useRef } from 'react'
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { useClickOutside } from "../../hooks";

/* ─── Spinner ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-2' }
  return (
    <div className={`${sizes[size]} border-accent/30 border-t-accent rounded-full animate-spin ${className}`} />
  )
}

export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size="lg" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
  return (
    <div className={`rounded-lg bg-dark-700 shimmer-bg animate-shimmer ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-t border-white/[0.04]">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-40 flex-1" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  )
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center mb-4">
          <Icon size={26} className="text-gray-600" />
        </div>
      )}
      <p className="text-white font-display font-semibold text-lg mb-1">{title}</p>
      {description && <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ─── Badge ──────────────────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const MAP = {
    'Pending':     'badge-pending',
    'In progress': 'badge-progress',
    'Completed':   'badge-completed',
    'Partial':     'badge-partial',
    'Canceled':    'badge-canceled',
    'Failed':      'badge-failed',
  }
  return <span className={MAP[status] || 'badge bg-gray-500/15 text-gray-400'}>{status}</span>
}

/* ─── Alert ──────────────────────────────────────────────────────────────── */
const ALERT_STYLES = {
  info:    { bg: 'bg-blue-500/10 border-blue-500/20',    icon: Info,         text: 'text-blue-300' },
  success: { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, text: 'text-emerald-300' },
  warning: { bg: 'bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle, text: 'text-yellow-300' },
  error:   { bg: 'bg-red-500/10 border-red-500/20',      icon: AlertCircle,  text: 'text-red-300' },
}

export function Alert({ type = 'info', children, className = '' }) {
  const s = ALERT_STYLES[type]
  const Icon = s.icon
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg} ${className}`}>
      <Icon size={16} className={`${s.text} flex-shrink-0 mt-0.5`} />
      <p className={`${s.text} text-sm leading-relaxed`}>{children}</p>
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const ref = useRef()
  useClickOutside(ref, onClose)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        ref={ref}
        className={`relative w-full ${sizeClasses[size]} card shadow-card-hover animate-slide-up max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="font-display font-semibold text-white text-lg">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── ConfirmDialog ──────────────────────────────────────────────────────── */
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose() }}
          className={danger ? 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-display font-semibold text-sm transition-all' : 'btn-primary'}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */
export function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null
  const start = (page - 1) * limit + 1
  const end   = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
      <p className="text-gray-500 text-xs">
        Showing <span className="text-gray-300">{start}–{end}</span> of <span className="text-gray-300">{total}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let p
            if (totalPages <= 5) p = i + 1
            else if (page <= 3) p = i + 1
            else if (page >= totalPages - 2) p = totalPages - 4 + i
            else p = page - 2 + i

            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  page === p
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

/* ─── CopyButton ─────────────────────────────────────────────────────────── */
export function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        copied
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          : 'bg-dark-700 text-gray-400 hover:text-white border border-white/[0.06] hover:border-accent/30'
      }`}>
      {copied ? '✓ Copied!' : label}
    </button>
  )
}

/* ─── ProgressBar ────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max, className = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={`w-full bg-dark-700 rounded-full h-1.5 overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
