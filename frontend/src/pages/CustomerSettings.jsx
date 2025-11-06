import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router'
import {
  Loader2,
  Lock,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import CustomerSidebar from '../components/CustomerSidebar'

const CustomerSettings = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    oldPassword: '',
    newPassword: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phoneNumber: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/customer/profile', { withCredentials: true })
        setProfile(res.data)
        setFormData({
          fName: res.data.f_name || '',
          lName: res.data.l_name || '',
          street: res.data.street || '',
          city: res.data.city || '',
          state: res.data.state || '',
          zip: res.data.zip || '',
          phoneNumber: res.data.phone_num || ''
        })
      } catch (err) {
        console.error('Unauthorized. Redirecting...')
        navigate('/login')
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
      const payload = { type }
      Object.entries(formData).forEach(([k, v]) => {
        if (v.trim() !== '') payload[k] = v
      })

      await api.patch('/auth/customer/update', payload, { withCredentials: true })
      setMessage('✅ Updated successfully. Redirecting...')
      setTimeout(() => navigate('/customer/dashboard'), 1500)
    } catch (err) {
      console.error(err)
      setMessage('⚠️ Update failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading profile...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <CustomerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Lock className="text-red-500" /> Customer Settings
            </h1>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="text-gray-400 hover:text-gray-200 flex items-center gap-2 text-sm border border-gray-700 rounded-lg px-3 py-1"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* PERSONAL INFO */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-red-500" />{' '}
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">First Name</label>
                <input
                  name="fName"
                  value={formData.fName}
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Last Name</label>
                <input
                  name="lName"
                  value={formData.lName}
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Email (Locked)</label>
                <input
                  value={profile.email}
                  disabled
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  License Number (Locked)
                </label>
                <input
                  value={profile.licence_num}
                  disabled
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              onClick={() => handleSubmit('personal')}
              disabled={saving}
              className={`mt-5 w-full py-2 rounded-lg font-semibold transition-all ${
                saving ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                'Update Personal Info'
              )}
            </button>
          </section>

          {/* ADDRESS */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-red-500" />{' '}
              <h2 className="text-xl font-semibold">Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['street', 'city', 'state', 'zip'].map((field) => (
                <div key={field}>
                  <label className="text-gray-400 text-sm block mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubmit('address')}
              disabled={saving}
              className={`mt-5 w-full py-2 rounded-lg font-semibold transition-all ${
                saving ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                'Update Address'
              )}
            </button>
          </section>

          {/* PHONE */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="text-red-500" />{' '}
              <h2 className="text-xl font-semibold">Phone Number</h2>
            </div>

            <label className="text-gray-400 text-sm block mb-1">Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="bg-gray-800 p-3 rounded-lg w-full outline-none"
            />

            <button
              onClick={() => handleSubmit('phone')}
              disabled={saving}
              className={`mt-5 w-full py-2 rounded-lg font-semibold transition-all ${
                saving ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                'Update Phone'
              )}
            </button>
          </section>

          {/* PASSWORD */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-red-500" />{' '}
              <h2 className="text-xl font-semibold">Change Password</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Old Password</label>
                <input
                  name="oldPassword"
                  type="password"
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  onChange={handleChange}
                  className="bg-gray-800 p-3 rounded-lg w-full outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleSubmit('password')}
              disabled={saving}
              className={`mt-5 w-full py-2 rounded-lg font-semibold transition-all ${
                saving ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                'Update Password'
              )}
            </button>
          </section>

          {message && (
            <p className="text-center text-sm text-green-400 mt-6">{message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerSettings
