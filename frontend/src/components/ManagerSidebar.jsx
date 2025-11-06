import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Menu, X, LayoutDashboard, Users, Car, Settings, LogOut, User, Building2, UserPlus, IdCardLanyard, ToolCase, ClipboardList } from 'lucide-react'
import api from '../api/axios'

const ManagerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/manager/profile', { withCredentials: true })
        setProfile(res.data)
      } catch (err) {
        console.error('Unauthorized manager. Redirecting...')
        navigate('/manager/login')
      }
    }
    fetchProfile()
  }, [navigate])

  const navItems = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard /> },
    { name: 'Add Employee', path: '/manager/register', icon: <UserPlus /> },
    { name: 'Branch', path: '/manager/branch', icon: <Building2 /> },
    { name: 'Customers', path: '/manager/customers', icon: <Users /> },
    { name: 'Employees', path: '/manager/employee', icon: <IdCardLanyard /> },
    { name: 'Assign Employee', path: '/manager/assign', icon: <ClipboardList /> },
    { name: 'Cars', path: '/manager/cars', icon: <Car /> },
    { name: 'Service Cars', path: '/manager/service', icon: <ToolCase /> },
    { name: 'Settings', path: '/manager/settings', icon: <Settings /> },
  ]

  const handleLogout = async () => {
    try {
      await api.get('/auth/manager/logout', { withCredentials: true })
    } catch (err) {
      console.error('Logout failed, clearing cookie manually.')
    }
    document.cookie = 'employee_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    navigate('/manager/login')
  }

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && <h1 className="text-lg font-bold text-red-500">Manager Panel</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-100">
          {collapsed ? <Menu size={22} /> : <X size={22} />}
        </button>
      </div>

      {/* Manager Info */}
      {profile && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <div className="bg-gray-800 p-2 rounded-full">
            <User size={20} className="text-red-500" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-gray-400">{profile.role}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Building2 size={14} />
                <span>{profile.branch_name}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav Links */}
      <div className="flex-1 mt-2 space-y-1 overflow-y-auto scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-all ${
              location.pathname === item.path ? 'bg-gray-800 text-red-500' : ''
            }`}
          >
            <span className="w-6 h-6">{item.icon}</span>
            {!collapsed && <span>{item.name}</span>}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-red-400"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default ManagerSidebar
