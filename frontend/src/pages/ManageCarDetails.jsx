import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Loader2, Wrench, Car, ClipboardList, PlusCircle } from 'lucide-react'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'

const ManageCarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serviceAdding, setServiceAdding] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [serviceMessage, setServiceMessage] = useState({ text: '', type: '' })
  const [services, setServices] = useState([])

  const [updateData, setUpdateData] = useState({
    status: '',
    rental_rate: ''
  })

  const [serviceData, setServiceData] = useState({
    service_date: '',
    detail: '',
    cost: ''
  })

  // Fetch car details + service history
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [carRes, serviceRes] = await Promise.allSettled([
          api.get(`/auth/manager/get/car/${id}`, { withCredentials: true }),
          api.get(`/auth/manager/get/service/${id}`, { withCredentials: true })
        ])

        if (carRes.status === 'fulfilled') {
          setCar(carRes.value.data.data)
          setUpdateData({
            status: carRes.value.data.data.status,
            rental_rate: carRes.value.data.data.rental_rate
          })
        } else {
          throw new Error(carRes.reason?.response?.data?.message || 'Car not found')
        }

        if (serviceRes.status === 'fulfilled') {
          setServices(serviceRes.value.data.data || [])
        } else {
          setServices([])
        }
      } catch (err) {
        console.error(err)
        setMessage({ text: err.message || 'Failed to load car details.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [id])

  // Handle rental_rate update
  const handleChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value })
  }

  // Handle service input change
  const handleServiceChange = (e) => {
    setServiceData({ ...serviceData, [e.target.name]: e.target.value })
  }

  // Update car (only rental_rate is editable)
  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await api.patch(`/auth/manager/update/car/${id}`, updateData, {
        withCredentials: true
      })
      setMessage({ text: res.data.message || 'Car updated successfully.', type: 'success' })
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update car.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  // Add service record
  const handleAddService = async (e) => {
    e.preventDefault()
    setServiceAdding(true)
    setServiceMessage({ text: '', type: '' })

    try {
      const payload = {
        car_id: id,
        service_date: serviceData.service_date,
        detail: serviceData.detail,
        cost: serviceData.cost
      }

      const res = await api.post('/auth/manager/add/service', payload, {
        withCredentials: true
      })
      setServiceMessage({
        text: res.data.message || 'Service record added successfully.',
        type: 'success'
      })

      // Refresh service history
      const refreshed = await api.get(`/auth/manager/get/service/${id}`, { withCredentials: true })
      setServices(refreshed.data.data || [])
      setServiceData({ service_date: '', detail: '', cost: '' })
    } catch (err) {
      setServiceMessage({
        text: err.response?.data?.message || 'Failed to add service record.',
        type: 'error'
      })
    } finally {
      setServiceAdding(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading car details...</span>
      </div>
    )

  if (!car)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-red-400">
        Car not found.
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Car className="text-red-500" /> Car Details
            </h1>
            <button
              onClick={() => navigate('/manager/cars')}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
            >
              ← Back
            </button>
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

          {/* Car Info Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <ClipboardList size={20} /> Car Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={car.make}
                disabled
                className="bg-gray-800 p-3 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <input
                value={car.model}
                disabled
                className="bg-gray-800 p-3 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <input
                value={car.year}
                disabled
                className="bg-gray-800 p-3 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <input
                value={car.reg_num}
                disabled
                className="bg-gray-800 p-3 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <input
                value={car.branch_name}
                disabled
                className="bg-gray-800 p-3 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <input
                value={car.branch_city}
                disabled
                className="bg-gray-800 p-3 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdate} className="mt-6 grid md:grid-cols-2 gap-4">
              {/* 🔒 Locked Status Field */}
              <div className="relative">
                <input
                  name="status"
                  value={updateData.status}
                  disabled
                  className="bg-gray-800 p-3 rounded-lg w-full text-gray-400 cursor-not-allowed"
                />
                <p className="absolute right-3 top-3 text-xs text-gray-500">(Locked)</p>
              </div>

              <div className="flex items-center bg-gray-800 rounded-lg p-3">
                <input
                  name="rental_rate"
                  value={updateData.rental_rate}
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
                  'Update Car Details'
                )}
              </button>
            </form>
          </div>

          {/* Add Service Record */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Wrench size={20} /> Add Service Record
            </h2>

            {serviceMessage.text && (
              <p
                className={`mb-4 text-sm px-4 py-2 rounded-lg border ${
                  serviceMessage.type === 'error'
                    ? 'bg-red-900/30 text-red-400 border-red-700'
                    : 'bg-green-900/30 text-green-400 border-green-700'
                }`}
              >
                {serviceMessage.text}
              </p>
            )}

            <form onSubmit={handleAddService} className="grid md:grid-cols-2 gap-4">
              <input
                type="date"
                name="service_date"
                value={serviceData.service_date}
                onChange={handleServiceChange}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <input
                name="detail"
                value={serviceData.detail}
                onChange={handleServiceChange}
                placeholder="Service Detail"
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <input
                name="cost"
                value={serviceData.cost}
                onChange={handleServiceChange}
                placeholder="Service Cost"
                type="number"
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />
              <button
                type="submit"
                disabled={serviceAdding}
                className={`md:col-span-2 mt-2 py-3 rounded-lg font-semibold transition-all ${
                  serviceAdding
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {serviceAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  <>
                    <PlusCircle className="inline w-5 h-5 mr-1" /> Add Service
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Service History */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <ClipboardList size={20} /> Service History
            </h2>

            {services.length === 0 ? (
              <p className="text-gray-400 text-sm">No service records found.</p>
            ) : (
              <div className="space-y-4">
                {services.map((s) => (
                  <div
                    key={s.service_id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm"
                  >
                    <p>
                      <span className="text-gray-500">Date:</span> {s.service_date}
                    </p>
                    <p>
                      <span className="text-gray-500">Detail:</span> {s.service_detail}
                    </p>
                    <p>
                      <span className="text-gray-500">Cost:</span> ₹{s.service_cost}
                    </p>
                    <p>
                      <span className="text-gray-500">Completed:</span>{' '}
                      {s.is_completed ? '✅ Yes' : '❌ No'}
                    </p>
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

export default ManageCarDetails
