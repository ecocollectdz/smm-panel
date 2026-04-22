/* ─── Number formatters ────────────────────────────────────────────────────*/

/**
 * Format a dollar amount with 2 or 4 decimal places
 * @param {number} amount
 * @param {number} decimals - 2 for display, 4 for precise pricing
 */
export const formatUSD = (amount = 0, decimals = 2) =>
  `$${Number(amount).toFixed(decimals)}`

/**
 * Format a large number with K/M suffixes
 */
export const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

/**
 * Calculate the charge for an order
 * @param {number} rate  - price per 1000
 * @param {number} qty   - quantity
 * @returns {number}
 */
export const calcCharge = (rate, qty) =>
  parseFloat(((rate * qty) / 1000).toFixed(4))

/**
 * Calculate profit margin percentage
 */
export const calcMargin = (sellingRate, costRate) => {
  if (!costRate || costRate === 0) return 0
  return parseFloat((((sellingRate - costRate) / costRate) * 100).toFixed(1))
}

/* ─── Validators ───────────────────────────────────────────────────────────*/

export const isValidUrl = (url = '') => {
  try { new URL(url); return true } catch { return false }
}

export const isValidEmail = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/* ─── String helpers ───────────────────────────────────────────────────────*/

export const truncate = (str = '', max = 40) =>
  str.length > max ? str.slice(0, max) + '…' : str

export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

export const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

/* ─── Date helpers ─────────────────────────────────────────────────────────*/

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'week',   secs: 604800   },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

/* ─── Constants ────────────────────────────────────────────────────────────*/

export const ORDER_STATUSES = ['Pending', 'In progress', 'Completed', 'Partial', 'Canceled', 'Failed']

export const CATEGORIES = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Telegram', 'Spotify', 'Other']

export const CATEGORY_EMOJI = {
  Instagram: '📷', TikTok: '🎵', YouTube: '▶️',
  Twitter: '🐦', Facebook: '👤', Telegram: '✈️',
  Spotify: '🎧', Other: '🌐'
}

export const STATUS_COLOR = {
  'Pending':     { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  'In progress': { bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  'Completed':   { bg: 'bg-emerald-500/15',text: 'text-emerald-400'},
  'Partial':     { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  'Canceled':    { bg: 'bg-gray-500/15',   text: 'text-gray-400'   },
  'Failed':      { bg: 'bg-red-500/15',    text: 'text-red-400'    },
}

/* ─── API error extractor ──────────────────────────────────────────────────*/

export const getApiError = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback

/* ─── Local storage keys ───────────────────────────────────────────────────*/

export const STORAGE_KEYS = {
  TOKEN:         'token',
  LAST_CATEGORY: 'smm_last_category',
  THEME:         'smm_theme',
}
