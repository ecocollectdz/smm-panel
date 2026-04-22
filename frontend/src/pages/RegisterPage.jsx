import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Fill all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to SMMFlow 🚀')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const perks = ['500+ services available', 'Instant order processing', 'Secure Stripe payments', 'Real-time order tracking']

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent shadow-glow flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">SMMFlow</span>
          </Link>
        </div>

        <div className="card p-8">
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Create your account</h1>
            <p className="text-gray-400 text-sm">Start growing in minutes. Free to join.</p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle2 size={12} className="text-accent-light flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="name" type="text" value={form.name} onChange={handle}
                  className="input pl-10" placeholder="Your name" />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="email" type="email" value={form.email} onChange={handle}
                  className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handle}
                  className="input pl-10 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShow(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base justify-center mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-5 leading-relaxed">
            By registering you agree to our{' '}
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
          </p>

          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-accent-light hover:text-white transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
