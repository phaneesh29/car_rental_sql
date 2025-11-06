import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  Loader2,
  CreditCard,
  ArrowLeft,
  Wallet,
  CheckCircle,
  Car,
  CalendarDays,
  IndianRupee
} from 'lucide-react'
import api from '../api/axios'
import CustomerSidebar from '../components/CustomerSidebar'

const CustomerCompletePayment = () => {
  const { id: rentalId } = useParams()
  const navigate = useNavigate()
  const [method, setMethod] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [rental, setRental] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  // 🔹 Fetch rental details
  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await api.get(`/auth/customer/get/rental/${rentalId}`, {
          withCredentials: true
        })
        setRental(res.data.data)
        setAmount(res.data.data.total_amount || '')
      } catch (err) {
        console.error(err)
        setMessage({
          text: err.response?.data?.message || '⚠️ Failed to load rental details.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRental()
  }, [rentalId])

  // 🔹 Handle Payment
  const handlePayment = async (e) => {
    e.preventDefault()
    if (!amount || !method) {
      setMessage({ text: 'Please select payment method.', type: 'error' })
      return
    }

    setPaying(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await api.post(
        '/auth/customer/add/payment',
        { rentalId, amount, method },
        { withCredentials: true }
      )

      setMessage({
        text: res.data.message || '✅ Payment completed successfully!',
        type: 'success'
      })

      setTimeout(() => navigate('/customer/payments'), 2000)
    } catch (err) {
      console.error(err)
      setMessage({
        text: err.response?.data?.message || 'Payment failed. Try again.',
        type: 'error'
      })
    } finally {
      setPaying(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading rental details...</span>
      </div>
    )

  if (!rental)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-red-400">
        Failed to load rental details.
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <CustomerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-200 flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-500 flex items-center justify-center gap-2">
              <CreditCard className="text-red-500" /> Complete Payment
            </h1>
            <p className="text-sm text-gray-400 mt-1">Rental ID: {rentalId}</p>
          </div>

          {/* Feedback */}
          {message.text && (
            <p
              className={`mb-6 text-sm px-4 py-2 rounded-lg border text-center ${
                message.type === 'error'
                  ? 'bg-red-900/30 text-red-400 border-red-700'
                  : 'bg-green-900/30 text-green-400 border-green-700'
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Rental Summary */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-sm border border-gray-700">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Car size={16} className="text-red-500" />
              <span className="font-medium">
                {rental.car_make} {rental.car_model} ({rental.car_reg_num})
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays size={16} className="text-gray-500" />
              <span>
                {new Date(rental.rental_date).toLocaleDateString()} →{' '}
                {new Date(rental.return_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-400">
              <IndianRupee size={16} className="text-yellow-500" />
              <span>Total: ₹{rental.total_amount}</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {['upi', 'card', 'cash'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      method === m
                        ? 'bg-red-600 border-red-700 text-white'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Wallet size={16} /> {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={paying}
              className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all ${
                paying ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {paying ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                <>
                  <CheckCircle className="inline w-5 h-5 mr-1" /> Pay ₹{rental.total_amount}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerCompletePayment
