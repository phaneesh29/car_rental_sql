import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Car, Plus, Loader2, Trash2, Eye } from 'lucide-react'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'

const ManageCar = () => {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [branches, setBranches] = useState([])
  const [formData, setFormData] = useState({
    branch_id: '',
    year: '',
    make: '',
    model: '',
    reg_num: '',
    status: 'available', // ✅ Default locked to available
    rental_rate: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const safeExtractArray = (res) => {
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    return []
  }

  const fetchBranches = async () => {
    try {
      const res = await api.get('/auth/manager/get/branch', { withCredentials: true })
      setBranches(safeExtractArray(res))
    } catch (err) {
      console.error('⚠️ Failed to fetch branches:', err)
      setMessage({
        text: err.response?.data?.message || 'Failed to fetch branches.',
        type: 'error'
      })
    }
  }

  const fetchCars = async () => {
    try {
      const res = await api.get('/auth/manager/get/car', { withCredentials: true })
      setCars(safeExtractArray(res))
    } catch (err) {
      console.error('⚠️ Failed to fetch cars:', err)
      setCars([])
      setMessage({
        text: err.response?.data?.message || 'No cars found or failed to fetch.',
        type: 'error'
      })
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.allSettled([fetchBranches(), fetchCars()])
      setLoading(false)
    }
    init()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddCar = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await api.post('/auth/manager/add/car', formData, {
        withCredentials: true
      })
      setMessage({
        text: res.data.message || 'Car added successfully.',
        type: 'success'
      })

      setFormData({
        branch_id: '',
        year: '',
        make: '',
        model: '',
        reg_num: '',
        status: 'available',
        rental_rate: ''
      })
      await fetchCars()
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Failed to add car.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setMessage({ text: '', type: '' })
    try {
      await api.delete(`/auth/manager/delete/car/${id}`, { withCredentials: true })
      setCars((prev) => prev.filter((c) => c.car_id !== id))
      setMessage({ text: 'Car deleted successfully.', type: 'success' })
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Failed to delete car.',
        type: 'error'
      })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading cars and branches...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Car className="text-red-500" /> Manage Cars
            </h1>
          </div>

          {message.text && (
            <p
              className={`mb-6 text-sm px-4 py-2 rounded-lg border ${
                message.type === 'error'
                  ? 'bg-red-900/30 text-red-400 border-red-700'
                  : 'bg-green-900/30 text-green-400 border-green-700'
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Add Car Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Plus size={20} /> Add New Car
            </h2>

            <form onSubmit={handleAddCar} className="grid md:grid-cols-2 gap-4">
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              >
                <option value="">Select Branch</option>
                {branches.length > 0 ? (
                  branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.branch_name} — {b.city}
                    </option>
                  ))
                ) : (
                  <option disabled>No branches available</option>
                )}
              </select>

              <input
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="Year"
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <input
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="Make"
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model"
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <input
                name="reg_num"
                value={formData.reg_num}
                onChange={handleChange}
                placeholder="Registration Number"
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />

              {/* 🔒 Locked Status Field */}
              <div className="relative">
                <input
                  name="status"
                  value="Available"
                  disabled
                  className="bg-gray-800 p-3 rounded-lg w-full text-gray-400 cursor-not-allowed"
                />
                <p className="absolute right-3 top-3 text-xs text-gray-500">
                  (Locked)
                </p>
              </div>

              {/* Rental Rate Field with /day */}
              <div className="flex items-center bg-gray-800 rounded-lg p-3">
                <input
                  name="rental_rate"
                  value={formData.rental_rate}
                  onChange={handleChange}
                  placeholder="Rental Rate"
                  type="number"
                  className="bg-transparent flex-1 outline-none"
                  required
                />
                <span className="text-gray-400 text-sm ml-2">/day</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`md:col-span-2 mt-2 py-3 rounded-lg font-semibold transition-all ${
                  saving
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  'Add Car'
                )}
              </button>
            </form>
          </div>

          {/* Car List Section */}
          <div>
            <h2 className="text-xl font-semibold text-red-400 mb-4">Available Cars</h2>
            {cars.length === 0 ? (
              <p className="text-gray-400 text-sm">No cars found.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div
                    key={car.car_id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow hover:shadow-red-900/30 transition-all"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {car.make} {car.model}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          car.status === 'available'
                            ? 'bg-green-900/40 text-green-400'
                            : car.status === 'rented'
                            ? 'bg-yellow-900/40 text-yellow-400'
                            : 'bg-red-900/40 text-red-400'
                        }`}
                      >
                        {car.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Reg No:</span> {car.reg_num}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Branch:</span>{' '}
                      {car.branch_name || '—'} ({car.branch_city || 'N/A'})
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Rate:</span> ₹{car.rental_rate}/day
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => navigate(`/manager/cars/${car.car_id}`)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Eye size={15} /> View
                      </button>
                      <button
                        onClick={() => handleDelete(car.car_id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageCar
