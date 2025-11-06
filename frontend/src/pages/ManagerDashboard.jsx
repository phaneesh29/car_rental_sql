import React, { useEffect, useState } from 'react'
import ManagerSidebar from '../components/ManagerSidebar'
import api from '../api/axios'
import {
  Loader2,
  Car,
  Users,
  CheckCircle,
  Clock,
  IndianRupee
} from 'lucide-react'

const ManagerDashboard = () => {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await api.get('/auth/manager/get/rental', { withCredentials: true })
        setRentals(res.data.data || [])
      } catch (err) {
        console.error(err)
        setMessage({
          text: err.response?.data?.message || '⚠️ Failed to load rental records.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRentals()
  }, [])

  // 🔹 Compute Stats
  const totalRentals = rentals.length
  const activeRentals = rentals.filter((r) => r.is_completed === 0).length
  const completedRentals = rentals.filter((r) => r.is_completed === 1).length
  const totalRevenue = rentals.reduce(
    (sum, r) => sum + parseFloat(r.total_amount || 0),
    0
  )

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Content */}
      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Car className="text-red-500" /> Manager Dashboard
            </h1>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 text-sm px-4 py-2 rounded-lg border ${
                message.type === 'error'
                  ? 'bg-red-900/30 text-red-400 border-red-700'
                  : 'bg-green-900/30 text-green-400 border-green-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center shadow-md hover:bg-gray-800/50 transition-all">
              <Users className="text-blue-400 mb-2" size={26} />
              <h2 className="text-sm text-gray-400">Total Rentals</h2>
              <p className="text-2xl font-bold">{totalRentals}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center shadow-md hover:bg-gray-800/50 transition-all">
              <Clock className="text-yellow-400 mb-2" size={26} />
              <h2 className="text-sm text-gray-400">Active Rentals</h2>
              <p className="text-2xl font-bold">{activeRentals}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center shadow-md hover:bg-gray-800/50 transition-all">
              <CheckCircle className="text-green-400 mb-2" size={26} />
              <h2 className="text-sm text-gray-400">Completed Rentals</h2>
              <p className="text-2xl font-bold">{completedRentals}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center shadow-md hover:bg-gray-800/50 transition-all">
              <IndianRupee className="text-red-400 mb-2" size={26} />
              <h2 className="text-sm text-gray-400">Total Revenue</h2>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Rentals Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Clock size={20} /> Recent Rentals
            </h2>

            {rentals.length === 0 ? (
              <p className="text-gray-400 text-sm">No rental records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="py-3 text-left">Car</th>
                      <th className="py-3 text-left">Customer</th>
                      <th className="py-3 text-left">Dates</th>
                      <th className="py-3 text-left">Total (₹)</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Employee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map((r) => (
                      <tr
                        key={r.rental_id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-all"
                      >
                        {/* Car */}
                        <td className="py-3">
                          <p className="font-semibold text-gray-200">
                            {r.car_make} {r.car_model}
                          </p>
                          <p className="text-gray-400 text-xs">{r.car_reg_num}</p>
                        </td>

                        {/* Customer */}
                        <td className="py-3">
                          <p className="font-medium text-gray-200">
                            {r.customer_first_name} {r.customer_last_name}
                          </p>
                          <p className="text-gray-400 text-xs">{r.customer_email}</p>
                        </td>

                        {/* Dates */}
                        <td className="py-3 text-gray-400">
                          {new Date(r.rental_date).toLocaleDateString()} →{' '}
                          {new Date(r.return_date).toLocaleDateString()}
                        </td>

                        {/* Amount */}
                        <td className="py-3 font-semibold text-gray-200">
                          {parseFloat(r.total_amount).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="py-3">
                          {r.is_completed ? (
                            <span className="text-green-400 font-semibold text-xs">
                              Completed
                            </span>
                          ) : (
                            <span className="text-yellow-400 font-semibold text-xs">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Employee */}
                        <td className="py-3 text-gray-400 text-xs">
                          {r.assigned_employee_first_name || 'N/A'}
                          <br />
                          <span className="text-gray-500">
                            {r.assigned_employee_email}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
