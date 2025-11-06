import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'
import { Loader2, User, Briefcase, MapPin, Phone } from 'lucide-react'

const ManagerSettings = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phoneNumber: '',
    role: '',
    status: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/manager/profile', { withCredentials: true })
        const data = res.data
        setProfile(data)
        setFormData({
          fName: data.first_name || '',
          lName: data.last_name || '',
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          phoneNumber: data.phone_num || '',
          role: data.role || '',
          status: data.status || ''
        })
      } catch (err) {
        console.error('Unauthorized. Redirecting...')
        navigate('/manager/login')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (type) => {
    try {
      setSaving(true)
      const payload = { type, employeeId: profile.employee_id }

      Object.entries(formData).forEach(([key, val]) => {
        if (val && val.trim() !== '') payload[key] = val.trim()
      })

      await api.patch('/auth/manager/update', payload, { withCredentials: true })
      setMessage('✅ Updated successfully!')
      navigate('/manager/dashboard')
    } catch (err) {
      console.error(err)
      setMessage('⚠️ Update failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <p>Loading manager profile...</p>
      </div>
    )

  return (
    <div className="flex bg-gray-950 text-gray-100 h-screen overflow-hidden">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-red-500">
              Manager Settings
            </h1>

            {/* PERSONAL */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <User className="text-red-500" />
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
                <input
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
                <input
                  value={profile.email}
                  disabled
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none text-gray-500 cursor-not-allowed"
                  placeholder="Email (Locked)"
                />
                <input
                  value={profile.employee_id}
                  disabled
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none text-gray-500 cursor-not-allowed"
                  placeholder="Employee ID (Locked)"
                />
              </div>
              <button
                onClick={() => handleSubmit('personal')}
                disabled={saving}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Update Personal Info'}
              </button>
            </section>

            {/* ADDRESS */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="text-red-500" />
                <h2 className="text-xl font-semibold">Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
                <input
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="ZIP"
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
              </div>
              <button
                onClick={() => handleSubmit('address')}
                disabled={saving}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Update Address'}
              </button>
            </section>

            {/* PHONE */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="text-red-500" />
                <h2 className="text-xl font-semibold">Phone</h2>
              </div>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="bg-gray-800 p-3 rounded-lg w-full outline-none"
              />
              <button
                onClick={() => handleSubmit('phone')}
                disabled={saving}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Update Phone'}
              </button>
            </section>

            {/* ROLE & STATUS */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="text-red-500" />
                <h2 className="text-xl font-semibold">Role & Status</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                >
                  <option value="">Select Role</option>
                  <option value="manager">Manager</option>
                  <option value="worker">Worker</option>
                </select>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="working">Working</option>
                  <option value="not_working">Not Working</option>
                </select>
              </div>
              <button
                onClick={() => handleSubmit('rolestatus')}
                disabled={saving}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Update Role & Status'}
              </button>
            </section>

            {message && <p className="text-center text-sm text-green-400 mt-6">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerSettings
