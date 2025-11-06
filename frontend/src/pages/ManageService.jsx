import React, { useEffect, useState } from 'react'
import { Loader2, Wrench, CheckCircle2, AlertTriangle, Car, Building2 } from 'lucide-react'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'

const ManageService = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [updatingId, setUpdatingId] = useState(null) // Track which service is being updated

  // Fetch all service records
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const res = await api.get('/auth/manager/get/service', { withCredentials: true })
        setServices(res.data.data || [])
      } catch (err) {
        console.error(err)
        setMessage({
          text: err.response?.data?.message || '⚠️ Failed to fetch service records.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Handle mark as completed
  const handleCompleteService = async (serviceId, carId) => {
    setUpdatingId(serviceId)
    setMessage({ text: '', type: '' })

    try {
      const res = await api.patch(`/auth/manager/update/service/${serviceId}/${carId}`, {}, {
        withCredentials: true
      })

      setMessage({ text: res.data.message || 'Service marked as completed.', type: 'success' })

      // Refresh service list
      const refreshed = await api.get('/auth/manager/get/service', { withCredentials: true })
      setServices(refreshed.data.data || [])
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update service status.',
        type: 'error'
      })
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading service records...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Wrench className="text-red-500" /> Manage Services
            </h1>
          </div>

          {/* Feedback */}
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

          {/* Service List */}
          {services.length === 0 ? (
            <div className="text-gray-400 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              No service records found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:shadow-red-900/30 transition-all"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                      <Car className="text-red-400 w-4 h-4" /> {service.make} {service.model}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        service.is_completed
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-yellow-900/40 text-yellow-400'
                      }`}
                    >
                      {service.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Reg No:</span> {service.reg_num}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Date:</span>{' '}
                    {new Date(service.service_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Detail:</span> {service.service_detail}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Cost:</span> ₹{service.service_cost}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Building2 size={14} className="text-gray-500" />
                    <span className="text-gray-500">Branch ID:</span> {service.branch_id}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Car Status:</span>{' '}
                    <span
                      className={`${
                        service.car_status === 'available'
                          ? 'text-green-400'
                          : service.car_status === 'maintenance'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {service.car_status}
                    </span>
                  </p>

                  {/* Action */}
                  {!service.is_completed && (
                    <button
                      disabled={updatingId === service.service_id}
                      onClick={() =>
                        handleCompleteService(service.service_id, service.car_id)
                      }
                      className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                        updatingId === service.service_id
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {updatingId === service.service_id ? (
                        <Loader2 className="w-5 h-5 animate-spin inline" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Mark as Completed
                        </>
                      )}
                    </button>
                  )}

                  {!!service.is_completed && (
                    <div className="mt-4 py-2 text-center bg-green-900/20 rounded-lg text-green-400 font-semibold border border-green-800">
                      <CheckCircle2 className="inline w-4 h-4 mr-1" /> Service Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageService
