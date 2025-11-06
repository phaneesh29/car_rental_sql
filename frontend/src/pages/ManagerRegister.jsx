import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Eye, EyeOff, UserPlus, Loader2, Building2 } from 'lucide-react'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'

const ManagerRegister = () => {
  const navigate = useNavigate()
  const [branches, setBranches] = useState([])
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    role: '',
    email: '',
    password: '',
    branchId: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phoneNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [branchLoading, setBranchLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/auth/manager/get/branch', { withCredentials: true })
        setBranches(res.data.data || [])
      } catch (err) {
        setMessage('⚠️ Failed to load branches.')
      } finally {
        setBranchLoading(false)
      }
    }
    fetchBranches()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const res = await api.post('/auth/manager/register', formData, { withCredentials: true })
      setMessage(res.data.message || 'Employee registered successfully.')
      setTimeout(() => navigate('/manager/dashboard'), 1200)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed.'
      setMessage(`⚠️ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex bg-gray-950 text-gray-100 min-h-screen overflow-hidden">
      <ManagerSidebar />

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
        <div className="p-8 max-w-3xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-red-500 flex items-center justify-center gap-2">
              <UserPlus /> Register Employee
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <input
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              {/* Role & Branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="manager">Manager</option>
                  <option value="worker">Worker</option>
                </select>

                {branchLoading ? (
                  <div className="flex items-center justify-center bg-gray-800 rounded-lg py-3 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Branches...
                  </div>
                ) : (
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.branch_id} value={b.branch_id}>
                        {b.branch_name} — {b.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password (Optional)"
                    className="bg-gray-800 p-3 rounded-lg w-full outline-none pr-10 focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <input
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="ZIP"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              {/* Phone */}
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="bg-gray-800 p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-red-600"
                required
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all mt-4 ${
                  loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  'Register Employee'
                )}
              </button>
            </form>

            {message && (
              <p
                className={`text-center mt-6 text-sm ${
                  message.startsWith('⚠️') ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerRegister
