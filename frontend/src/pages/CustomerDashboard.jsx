import React, { useEffect, useState } from 'react'
import {
  Loader2,
  Car,
  Clock,
  Trash2,
  PlusCircle,
  CreditCard,
  RefreshCcw,
  Calendar,
} from 'lucide-react'
import api from '../api/axios'
import { useNavigate } from 'react-router'
import CustomerSidebar from '../components/CustomerSidebar'
import CarCalendar from '../components/CarCalendar'

const CustomerDashboard = () => {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedCarForCalendar, setSelectedCarForCalendar] = useState(null)
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

  // 🔹 Open calendar for selected car
  const openCalendar = () => {
    if (!rentalData.carId) {
      setMessage({ text: 'Please select a car first.', type: 'error' })
      return
    }
    const selectedCar = cars.find(c => c.car_id === parseInt(rentalData.carId))
    setSelectedCarForCalendar(selectedCar)
    setShowCalendar(true)
  }

  // 🔹 Handle date selection from calendar
  const handleDateSelectFromCalendar = (dates) => {
    setRentalData({
      ...rentalData,
      rental_date: dates.rental_date,
      return_date: dates.return_date
    })
  }

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

            <form onSubmit={handleRental} className="space-y-4">
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

              {/* Selected Dates Display */}
              {rentalData.rental_date && rentalData.return_date && rentalData.carId && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Booking Summary:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-gray-200">
                      <span className="text-sm">Rental Period:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {rentalData.rental_date.split('-').reverse().join('/')}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="font-semibold">
                          {rentalData.return_date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-gray-200">
                      <span className="text-sm">Duration:</span>
                      <span className="font-semibold">
                        {(() => {
                          const start = new Date(rentalData.rental_date + 'T00:00:00')
                          const end = new Date(rentalData.return_date + 'T00:00:00')
                          const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
                          return days || 1
                        })()} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-200">
                      <span className="text-sm">Rate per day:</span>
                      <span className="font-semibold">
                        ₹{cars.find(c => c.car_id === parseInt(rentalData.carId))?.car_rental_rate || 0}
                      </span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-red-400">Total Amount:</span>
                        <span className="text-2xl font-bold text-red-500">
                          ₹{(() => {
                            const start = new Date(rentalData.rental_date + 'T00:00:00')
                            const end = new Date(rentalData.return_date + 'T00:00:00')
                            const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
                            const rate = cars.find(c => c.car_id === parseInt(rentalData.carId))?.car_rental_rate || 0
                            return (days * rate).toLocaleString()
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Button */}
              <button
                type="button"
                onClick={openCalendar}
                disabled={!rentalData.carId}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  !rentalData.carId
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <Calendar size={20} />
                View Calendar & Select Dates
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
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
                      <span className="text-gray-500">Rental Date:</span> {new Date(r.rental_date).toLocaleDateString()}
                    </p>
                    
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Return Date:</span> {new Date(r.return_date).toLocaleDateString()}
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

      {/* Calendar Modal */}
      {showCalendar && selectedCarForCalendar && (
        <CarCalendar
          carId={selectedCarForCalendar.car_id}
          carName={`${selectedCarForCalendar.car_make} ${selectedCarForCalendar.car_model}`}
          onClose={() => setShowCalendar(false)}
          onDateSelect={handleDateSelectFromCalendar}
        />
      )}
    </div>
  )
}

export default CustomerDashboard
