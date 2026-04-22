import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'

/* ─── useDebounce ────────────────────────────────────────────────────────── */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

/* ─── usePrevious ────────────────────────────────────────────────────────── */
export function usePrevious(value) {
  const ref = useRef()
  useEffect(() => { ref.current = value })
  return ref.current
}

/* ─── useLocalStorage ────────────────────────────────────────────────────── */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) { console.error(err) }
  }

  return [storedValue, setValue]
}

/* ─── useServices ────────────────────────────────────────────────────────── */
export function useServices({ category } = {}) {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = {}
      if (category && category !== 'All') params.category = category
      const { data } = await api.get('/services', { params })
      setServices(data.services)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => { fetch() }, [fetch])

  return { services, loading, error, refetch: fetch }
}

/* ─── useOrders ──────────────────────────────────────────────────────────── */
export function useOrders({ page = 1, limit = 20, status } = {}) {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit }
      if (status && status !== 'All') params.status = status
      const { data } = await api.get('/orders', { params })
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => { fetch() }, [fetch])

  return { orders, loading, error, pagination, refetch: fetch }
}

/* ─── useTransactions ────────────────────────────────────────────────────── */
export function useTransactions({ page = 1, limit = 15 } = {}) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [pagination, setPagination]     = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/payments/transactions', { params: { page, limit } })
      .then(({ data }) => { setTransactions(data.transactions); setPagination(data.pagination) })
      .catch(err => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false))
  }, [page, limit])

  return { transactions, loading, error, pagination }
}

/* ─── useCountdown ───────────────────────────────────────────────────────── */
export function useCountdown(seconds) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft])
  const reset = () => setTimeLeft(seconds)
  return { timeLeft, reset, done: timeLeft <= 0 }
}

/* ─── useClickOutside ────────────────────────────────────────────────────── */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = e => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler(e)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
