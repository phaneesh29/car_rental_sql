import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
  MessageSquare,
  Settings2,
  Loader2,
  User,
  CarFront
} from 'lucide-react'
import api from '../api/axios'

const CustomerSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/customer/dashboard' },
    { label: 'Payments', icon: CreditCard, path: '/customer/payments' },
    { label: 'Support', icon: MessageSquare, path: '/customer/support' },
    { label: 'Settings', icon: Settings2, path: '/customer/settings' }
  ]

  // Verify customer session
  useEffect(() => {
    const verifyCustomer = async () => {
      try {
        const res = await api.get('/auth/customer/profile', { withCredentials: true })
        setCustomer(res.data)
      } catch (err) {
        console.error('Unauthorized or invalid session:', err)
        navigate('/login', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    verifyCustomer()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await api.post('/auth/customer/logout', {}, { withCredentials: true })
      navigate('/customer/login')
    } catch (err) {
      console.error('Logout failed:', err)
      navigate('/customer/login')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Verifying session...</span>
      </div>
    )

  if (!customer) return null

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50 transition-all">
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <CarFront className="text-red-500 w-6 h-6" />
          <h1 className="hidden md:block text-xl font-bold text-red-500 tracking-wide">
            DriveEasy
          </h1>
        </div>
      </div>

      {/* Customer Info */}
      <div className="hidden md:flex flex-col px-5 py-3 border-b border-gray-800 bg-gray-850">
        <div className="flex items-center gap-3">
          <div className="bg-red-900/40 text-red-400 p-2 rounded-full">
            <User size={18} />
          </div>
          <div>
            <p className="font-medium text-gray-200">
              {customer.f_name} {customer.l_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 md:px-4 py-5 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group relative flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 w-1 h-full bg-red-500 rounded-r-lg" />
              )}
              <Icon size={18} />
              <span className="hidden md:inline">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout Section */}
      <div className="px-3 md:px-4 py-4 border-t border-gray-800 bg-gray-900/90">
        {confirmLogout ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-300">Confirm logout?</p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm font-medium hover:text-white hover:bg-gray-700 transition-all"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        )}
      </div>
    </aside>
  )
}

export default CustomerSidebar
