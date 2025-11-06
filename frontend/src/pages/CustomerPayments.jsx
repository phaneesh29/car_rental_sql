import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Loader2, CreditCard, Car, CalendarDays, AlertTriangle, Eye } from 'lucide-react'
import api from '../api/axios'
import CustomerSidebar from '../components/CustomerSidebar'

const CustomerPayments = () => {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })

  // 🔹 Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const res = await api.get('/auth/customer/get/payments', { withCredentials: true })
        setPayments(res.data.data || [])
      } catch (err) {
        console.error(err)
        setMessage({
          text: err.response?.data?.message || '⚠️ Failed to retrieve payments.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading payments...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <CustomerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <CreditCard className="text-red-500" /> My Payments
            </h1>
          </div>

          {/* Feedback Message */}
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

          {/* No Payments */}
          {payments.length === 0 ? (
            <div className="text-gray-400 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              No payment records found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((p) => (
                <div
                  key={p.pay_id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:shadow-red-900/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                      <Car className="text-red-400 w-4 h-4" /> {p.car_make} {p.car_model}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.status === 'completed'
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-yellow-900/40 text-yellow-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Reg No:</span> {p.car_reg_num}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Amount:</span> ₹{p.amount}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Method:</span> {p.method.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Paid On:</span>{' '}
                    {new Date(p.payment_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <CalendarDays size={14} className="text-gray-500" />
                    {new Date(p.rental_date).toLocaleDateString()} →{' '}
                    {new Date(p.return_date).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => navigate(`/customer/payments/${p.pay_id}`)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm"
                  >
                    <Eye size={15} /> View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerPayments
