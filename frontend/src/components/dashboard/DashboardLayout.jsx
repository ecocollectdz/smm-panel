import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, ShoppingCart, PlusCircle, CreditCard,
  LogOut, Menu, X, User, ChevronDown, Settings, Shield, Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const USER_NAV = [
  { to: '/dashboard',            icon: LayoutDashboard, label: 'Overview',   end: true },
  { to: '/dashboard/new-order',  icon: PlusCircle,      label: 'New Order'  },
  { to: '/dashboard/orders',     icon: ShoppingCart,    label: 'My Orders'  },
  { to: '/dashboard/billing',    icon: CreditCard,      label: 'Billing'    },
  { to: '/dashboard/profile',    icon: User,            label: 'Profile'    },
]

const ADMIN_NAV = [
  { to: '/admin', icon: Shield, label: 'Admin Panel', end: true },
]

export default function DashboardLayout({ isAdmin = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navItems = isAdmin ? ADMIN_NAV : USER_NAV

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  const Sidebar = () => (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-white/[0.06]
      flex flex-col transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static lg:z-auto
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent shadow-glow flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">SMMFlow</span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {isAdmin && (
          <div className="mb-4">
            <Link to="/dashboard" className="sidebar-link">
              <LayoutDashboard size={16} /> User Dashboard
            </Link>
          </div>
        )}

        <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold px-3 mb-2">
          {isAdmin ? 'Admin' : 'Menu'}
        </p>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {!isAdmin && user?.role === 'admin' && (
          <>
            <div className="border-t border-white/[0.06] my-3" />
            <NavLink to="/admin"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Shield size={16} /> Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-light text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-accent-light text-xs font-mono font-semibold">
              ${(user?.balance || 0).toFixed(2)}
            </p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      <Sidebar />

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-dark-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-white font-display font-semibold text-sm leading-none">
                {isAdmin ? 'Admin Panel' : 'Dashboard'}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance chip */}
            {!isAdmin && (
              <Link to="/dashboard/billing"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors">
                <CreditCard size={13} className="text-accent-light" />
                <span className="font-mono text-sm font-semibold text-accent-light">
                  ${(user?.balance || 0).toFixed(2)}
                </span>
              </Link>
            )}

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(p => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-accent-light text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-gray-300">{user?.name}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 card shadow-card-hover z-50 py-1">
                  <div className="px-4 py-2 border-b border-white/[0.06]">
                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
