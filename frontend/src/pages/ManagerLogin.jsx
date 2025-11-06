import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react'

const ManagerLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!email.trim() || !password.trim()) {
      setMessage('⚠️ All fields are required')
      return
    }

    try {
      setLoading(true)
      const res = await api.post(
        '/auth/manager/login',
        { email, password },
        { withCredentials: true }
      )

      // no nonsense — just backend response
      setMessage(res.data.message)
      if (res.data.message === 'Login successful') {
        setTimeout(() => navigate('/manager/dashboard'), 1200)
      }
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gray-800 p-3 rounded-full mb-3">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center">Manager Login</h1>
          <p className="text-gray-400 text-sm mt-1">
            Access your management dashboard
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
              placeholder="manager@example.com"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-lg font-semibold flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Logging In...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <p
            className={`text-center text-sm mt-5 ${
              message.includes('success') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* BACK TO LANDING */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-gray-400 hover:text-gray-200 text-sm w-full text-center"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default ManagerLogin
