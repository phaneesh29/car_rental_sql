import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  Loader2,
  CreditCard,
  ArrowLeft,
  FileText,
  Car,
  User,
  CalendarDays,
  Phone,
  Mail,
  Building2
} from 'lucide-react'
import api from '../api/axios'
import CustomerSidebar from '../components/CustomerSidebar'

const CustomerPaymentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/auth/customer/get/payments/${id}`, {
          withCredentials: true
        })
        setPayment(res.data?.data || null)
      } catch (err) {
        console.error(err)
        setMessage({
          text: err.response?.data?.message || '⚠️ Failed to load payment details.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [id])

  // 🧾 Auto-named print
  const handleAutoNamedPrint = () => {
    if (!payment) return
    const originalTitle = document.title
    const formattedDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const newTitle = `Payment_${payment.pay_id}_${formattedDate}`
    document.title = newTitle
    window.print()
    // Restore original after short delay
    setTimeout(() => {
      document.title = originalTitle
    }, 500)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading payment details...</span>
      </div>
    )

  if (!payment)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-red-400">
        ⚠️ Payment not found.
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      {/* Sidebar hidden in print */}
      <div className="print:hidden">
        <CustomerSidebar />
      </div>

      <div className="flex-1 ml-20 md:ml-64 p-8 flex items-center justify-center print:ml-0">
        <div
          id="print-area"
          className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative print:shadow-none print:border-none print:bg-white print:text-black"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/customer/payments')}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-200 flex items-center gap-2 text-sm print:hidden"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Header */}
          <div className="text-center mb-8 border-b border-gray-800 pb-4 print:border-b-black">
            <h1 className="text-3xl font-bold text-red-500 flex items-center justify-center gap-2 print:text-black">
              <CreditCard className="text-red-500 print:text-black" /> Payment Receipt
            </h1>
            <p className="text-sm text-gray-400 mt-1 print:text-black">
              Payment ID: {payment.pay_id}
            </p>
          </div>

          {/* Brand Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-red-500 tracking-wide print:text-black">
              MyCar Rentals Pvt. Ltd.
            </h2>
            <p className="text-sm text-gray-400 print:text-black">Bangalore, Karnataka</p>
          </div>

          {/* Car + Customer Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6 text-sm print:bg-white print:border print:border-black">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2 print:text-black">
                  <Car size={18} /> Car Details
                </h2>
                <p className="text-gray-300 print:text-black">
                  {payment.car_make} {payment.car_model} ({payment.car_reg_num})
                </p>
                <p className="text-gray-400 print:text-black">Year: {payment.car_year}</p>
                <p className="text-gray-400 print:text-black">
                  Rate: ₹{payment.car_rental_rate}/day
                </p>
                <p className="text-gray-400 print:text-black">
                  Status: {payment.car_status}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2 print:text-black">
                  <User size={18} /> Customer
                </h2>
                <p className="text-gray-300 print:text-black">
                  {payment.customer_first_name} {payment.customer_last_name}
                </p>
                <p className="text-gray-400 flex items-center gap-1 print:text-black">
                  <Mail size={14} /> {payment.customer_email}
                </p>
                <p className="text-gray-400 flex items-center gap-1 print:text-black">
                  <Phone size={14} /> {payment.customer_phone}
                </p>
              </div>
            </div>
          </div>

          {/* Rental Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6 text-sm print:bg-white print:border print:border-black">
            <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2 print:text-black">
              <CalendarDays size={18} /> Rental Info
            </h2>
            <p className="text-gray-300 print:text-black">
              From {new Date(payment.rental_date).toLocaleDateString()} to{' '}
              {new Date(payment.return_date).toLocaleDateString()}
            </p>
            <p className="text-gray-400 print:text-black">
              Total Amount: ₹{payment.total_amount}
            </p>
            <p className="text-gray-400 print:text-black">
              Payment Date: {new Date(payment.payment_date).toLocaleDateString()}
            </p>
            <p className="text-gray-400 capitalize print:text-black">
              Method: {payment.method}
            </p>
            <p
              className={`font-semibold mt-1 ${
                payment.status === 'completed'
                  ? 'text-green-400 print:text-green-800'
                  : 'text-yellow-400 print:text-yellow-700'
              }`}
            >
              Status: {payment.status}
            </p>
          </div>

          {/* Employee */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6 text-sm print:bg-white print:border print:border-black">
            <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2 print:text-black">
              <User size={18} /> Assigned Employee
            </h2>
            <p className="text-gray-300 print:text-black">
              {payment.assigned_employee_first_name}
            </p>
            <p className="text-gray-400 flex items-center gap-1 print:text-black">
              <Mail size={14} /> {payment.assigned_employee_email}
            </p>
            <p className="text-gray-400 flex items-center gap-1 print:text-black">
              <Phone size={14} /> {payment.assigned_employee_phone}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4 print:border-t-black print:text-black">
            <Building2 className="inline-block w-4 h-4 mr-1 text-gray-400 print:text-black" />
            MyCar Rentals | Official Receipt | Generated on{' '}
            {new Date().toLocaleDateString()}
          </div>

          {/* Print Button */}
          <div className="flex justify-center mt-6 print:hidden">
            <button
              onClick={handleAutoNamedPrint}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition-all"
            >
              <FileText size={16} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerPaymentDetails
