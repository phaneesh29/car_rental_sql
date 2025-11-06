import React, { useState } from 'react'
import { Mail, Lock, User, MapPin, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router'

const CustomerRegister = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    licenseNumber: '',
    fName: '',
    lName: '',
    email: '',
    password: '',
    street: '',
    state: '',
    city: '',
    zip: '',
    phoneNumber: '',
  })

  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/customer/register', formData)
      setMessage({ type: 'success', text: res.data.message })
      setTimeout(() => {
        navigate('/customer/login')
      }, 1200)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Registration failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-800">
        <div className="flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold">Customer Registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First and Last Name */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 w-1/2 bg-gray-800 rounded-lg px-3 py-2">
              <User className="text-gray-400 w-5 h-5" />
              <input
                name="fName"
                placeholder="First Name"
                value={formData.fName}
                onChange={handleChange}
                className="bg-transparent outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-1/2 bg-gray-800 rounded-lg px-3 py-2">
              <User className="text-gray-400 w-5 h-5" />
              <input
                name="lName"
                placeholder="Last Name"
                value={formData.lName}
                onChange={handleChange}
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <Mail className="text-gray-400 w-5 h-5" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* Password with eye toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <Lock className="text-gray-400 w-5 h-5" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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

          {/* Address Fields */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <MapPin className="text-gray-400 w-5 h-5" />
            <input
              name="street"
              placeholder="Street"
              value={formData.street}
              onChange={handleChange}
              className="bg-transparent outline-none w-full"
            />
          </div>
          <div className="flex gap-2">
            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="bg-gray-800 rounded-lg px-3 py-2 outline-none w-1/2"
            />
            <input
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className="bg-gray-800 rounded-lg px-3 py-2 outline-none w-1/2"
            />
          </div>
          <div className="flex gap-2">
            <input
              name="zip"
              placeholder="ZIP"
              value={formData.zip}
              onChange={handleChange}
              className="bg-gray-800 rounded-lg px-3 py-2 outline-none w-1/2"
            />
            <input
              name="licenseNumber"
              placeholder="License Number"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="bg-gray-800 rounded-lg px-3 py-2 outline-none w-1/2"
            />
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <Phone className="text-gray-400 w-5 h-5" />
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm mt-2 ${
                message.type === 'error' ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl font-semibold shadow-lg"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Extra Buttons */}
        <div className="flex justify-between mt-6 text-sm text-gray-400">
          <button
            onClick={() => navigate('/customer/login')}
            className="hover:text-red-500 transition-all"
          >
            🔑 Login as Customer
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

export default CustomerRegister
