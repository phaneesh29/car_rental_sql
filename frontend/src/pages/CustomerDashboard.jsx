import React, { useEffect, useState } from 'react'
import {
  Loader2,
  Car,
  Clock,
  Trash2,
  PlusCircle,
  CreditCard,
  RefreshCcw,
} from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router'
import CustomerSidebar from '../components/CustomerSidebar'

const CustomerDashboard = () => {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [rentalData, setRentalData] = useState({
    carId: '',
    rental_date: '',
    return_date: ''
  })

  // 🔹 Fetch cars & rentals
  const fetchAll = async () => {
    setLoading(true)
    try {
      const [carsRes, rentalRes] = await Promise.allSettled([
        api.get('/auth/customer/get/cars', { withCredentials: true }),
        api.get('/auth/customer/get/rentals', { withCredentials: true })
      ])

      if (carsRes.status === 'fulfilled') setCars(carsRes.value.data.data || [])
      if (rentalRes.status === 'fulfilled') setRentals(rentalRes.value.data.data || [])
    } catch (err) {
      console.error(err)
      setMessage({
        text: err.response?.data?.message || '⚠️ Failed to load dashboard data.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // 🔹 Handle rental booking
  const handleRental = async (e) => {
    e.preventDefault()
    if (!rentalData.carId || !rentalData.rental_date || !rentalData.return_date) {
      setMessage({ text: 'Please fill all fields.', type: 'error' })
      return
    }

    setSaving(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await api.post('/auth/customer/add/rental', rentalData, {
        withCredentials: true
      })
      setMessage({ text: res.data.message || 'Rental booked successfully.', type: 'success' })

      // Reset and refresh
      setRentalData({ carId: '', rental_date: '', return_date: '' })
      await fetchAll()
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to book rental.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  // 🔹 Optimized delete handler
  const handleDeleteRental = async (id) => {
    setMessage({ text: '', type: '' })

    // Optimistic update
    const prevRentals = rentals
    setRentals((r) => r.filter((rent) => rent.rental_id !== id))

    try {
      const res = await api.delete(`/auth/customer/delete/rental/${id}`, {
        withCredentials: true
      })

      setMessage({
        text: res.data.message || 'Rental deleted successfully.',
        type: 'success'
      })

      // Background refresh (tiny delay to let DB settle)
      setTimeout(fetchAll, 400)
    } catch (err) {
      console.error(err)
      setMessage({
        text: err.response?.data?.message || 'Failed to delete rental.',
        type: 'error'
      })
      setRentals(prevRentals) // Revert
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <CustomerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Car className="text-red-500" /> Customer Dashboard
            </h1>
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm border border-gray-700 px-3 py-1 rounded-lg"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>

          {/* MESSAGE */}
          {message.text && (
            <p
              className={`mb-6 text-sm px-4 py-2 rounded-lg border transition-all ${
                message.type === 'error'
                  ? 'bg-red-900/30 text-red-400 border-red-700'
                  : 'bg-green-900/30 text-green-400 border-green-700'
              }`}
            >
              {message.text}
            </p>
          )}

          {/* RENT A CAR FORM */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 shadow-lg">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <PlusCircle size={20} /> Rent a Car
            </h2>

            <form onSubmit={handleRental} className="grid md:grid-cols-3 gap-4">
              <select
                name="carId"
                value={rentalData.carId}
                onChange={(e) => setRentalData({ ...rentalData, carId: e.target.value })}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              >
                <option value="">Select Car</option>
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <option key={car.car_id} value={car.car_id}>
                      {car.car_make} {car.car_model} — ₹{car.car_rental_rate}/day
                    </option>
                  ))
                ) : (
                  <option disabled>No cars available</option>
                )}
              </select>

              <input
                type="date"
                name="rental_date"
                value={rentalData.rental_date}
                onChange={(e) => setRentalData({ ...rentalData, rental_date: e.target.value })}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />

              <input
                type="date"
                name="return_date"
                value={rentalData.return_date}
                onChange={(e) => setRentalData({ ...rentalData, return_date: e.target.value })}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              />

              <button
                type="submit"
                disabled={saving}
                className={`md:col-span-3 mt-2 py-3 rounded-lg font-semibold transition-all ${
                  saving ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Book Rental'}
              </button>
            </form>
          </div>

          {/* RENTAL HISTORY */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Clock size={20} /> My Rental History
            </h2>

            {rentals.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No rental history found. Start renting now!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentals.map((r) => (
                  <div
                    key={r.rental_id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-5 transition-all hover:shadow-red-900/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {r.car_make} {r.car_model}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          r.is_completed
                            ? 'bg-green-900/40 text-green-400'
                            : 'bg-yellow-900/40 text-yellow-400'
                        }`}
                      >
                        {r.is_completed ? 'Completed' : 'Active'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Reg No:</span> {r.car_reg_num}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Rate:</span> ₹{r.car_rental_rate}/day
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Duration:</span>{' '}
                      {r.rental_duration ? `${r.rental_duration} days` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Total:</span>{' '}
                      ₹{r.total_amount || 'Pending'}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => navigate(`/customer/completepayment/${r.rental_id}`)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <CreditCard size={15} /> Pay
                      </button>
                      <button
                        onClick={() => handleDeleteRental(r.rental_id)}
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

export default CustomerDashboard
