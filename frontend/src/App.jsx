import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage    from './pages/OrdersPage'
import NewOrderPage  from './pages/NewOrderPage'
import BillingPage   from './pages/BillingPage'
import ProfilePage   from './pages/ProfilePage'
import AdminPage     from './pages/AdminPage'

// Layout
import DashboardLayout from './components/dashboard/DashboardLayout'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user)   return <Navigate to="/auth/login" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

const FullScreenLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
)

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* User dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index        element={<DashboardPage />} />
        <Route path="orders"    element={<OrdersPage />} />
        <Route path="new-order" element={<NewOrderPage />} />
        <Route path="billing"   element={<BillingPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><DashboardLayout isAdmin /></AdminRoute>}>
        <Route index element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1629',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif'
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
