import React, { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff, Save, Key, Copy, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Alert, Spinner } from '../components/ui'
import api from '../services/api'
import toast from 'react-hot-toast'
import { initials } from '../utils'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()

  const [nameForm, setNameForm]   = useState({ name: user?.name || '' })
  const [passForm, setPassForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPass, setShowPass]   = useState({ current: false, new: false, confirm: false })
  const [savingName, setSavingName] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [error, setError]         = useState(null)

  const handleNameSave = async e => {
    e.preventDefault()
    if (!nameForm.name.trim()) { toast.error('Name cannot be empty'); return }
    setSavingName(true)
    try {
      await api.put('/auth/profile', { name: nameForm.name })
      await refreshUser()
      toast.success('Name updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name')
    } finally { setSavingName(false) }
  }

  const handlePassSave = async e => {
    e.preventDefault()
    setError(null)
    if (passForm.newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { setError('Passwords do not match'); return }
    setSavingPass(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      toast.success('Password changed!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally { setSavingPass(false) }
  }

  const toggleShow = key => setShowPass(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Profile & Settings</h1>
        <p className="page-subtitle">Manage your account details</p>
      </div>

      {/* Avatar + info */}
      <div className="card p-6 flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/20 border-2 border-accent/30 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-2xl text-accent-light">
            {initials(user?.name || '?')}
          </span>
        </div>
        <div>
          <p className="text-white font-display font-bold text-xl">{user?.name}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`badge ${user?.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-accent/15 text-accent-light'}`}>
              {user?.role}
            </span>
            <span className="text-gray-500 text-xs">
              Balance: <span className="text-white font-mono">${(user?.balance || 0).toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Name update */}
      <div className="card p-6 mb-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <User size={16} className="text-accent-light" /> Personal Info
        </h2>
        <form onSubmit={handleNameSave} className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input value={nameForm.name}
              onChange={e => setNameForm({ name: e.target.value })}
              className="input max-w-sm" placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative max-w-sm">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={user?.email} disabled className="input pl-9 opacity-50 cursor-not-allowed" />
            </div>
            <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingName} className="btn-primary gap-2">
            {savingName ? <Spinner size="sm" /> : <Save size={14} />} Save Changes
          </button>
        </form>
      </div>

      {/* Password change */}
      <div className="card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Lock size={16} className="text-accent-light" /> Change Password
        </h2>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handlePassSave} className="space-y-4 max-w-sm">
          {[
            { key: 'current', field: 'currentPassword', label: 'Current Password' },
            { key: 'new',     field: 'newPassword',     label: 'New Password' },
            { key: 'confirm', field: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, field, label }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass[key] ? 'text' : 'password'}
                  value={passForm[field]}
                  onChange={e => setPassForm(p => ({ ...p, [field]: e.target.value }))}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => toggleShow(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          <button type="submit" disabled={savingPass} className="btn-primary gap-2">
            {savingPass ? <Spinner size="sm" /> : <Key size={14} />} Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
