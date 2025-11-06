import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router'

const CustomerLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await api.post('/auth/customer/login', formData, { withCredentials: true })
      setMessage({ type: 'success', text: res.data.message })

      // Redirect after successful login
      setTimeout(() => {
        navigate('/customer/dashboard')
      }, 1000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Login failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-800">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold">Customer Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <Mail className="text-gray-400 w-5 h-5" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <Lock className="text-gray-400 w-5 h-5" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-transparent outline-none w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm ${
                message.type === 'error' ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl font-semibold shadow-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Links */}
        <div className="flex justify-between mt-6 text-sm text-gray-400">
          <button
            onClick={() => navigate('/customer/register')}
            className="hover:text-red-500 transition-all"
          >
            🧾 Register Customer
          </button>
          <button
            onClick={() => navigate('/manager/login')}
            className="hover:text-red-500 transition-all"
          >
            🛠️ Manager Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerLogin
