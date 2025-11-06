import React from 'react'
import { Mail, Phone, Headphones, Clock } from 'lucide-react'
import CustomerSidebar from '../components/CustomerSidebar'

const CustomerSupport = () => {
  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <CustomerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Headphones className="text-red-500" /> Customer Support
            </h1>
          </div>

          {/* Support Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Need help with your bookings, payments, or profile?  
              Our support team is available to assist you with any questions or issues.
            </p>

            <div className="space-y-6">
              {/* Email Support */}
              <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-red-600 transition-all">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <Mail className="text-red-500" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Email Support</h3>
                  <p className="text-sm text-gray-400">
                    Reach us anytime at{' '}
                    <a
                      href="mailto:support@mycar.com"
                      className="text-red-400 hover:text-red-300 underline"
                    >
                      support@mycar.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Phone Support */}
              <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-red-600 transition-all">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <Phone className="text-red-500" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Phone Support</h3>
                  <p className="text-sm text-gray-400">
                    Call us between 9 AM – 8 PM IST at{' '}
                    <a
                      href="tel:+918618328700"
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      +91 86183 28700
                    </a>
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <Clock className="text-red-500" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Working Hours</h3>
                  <p className="text-sm text-gray-400">Monday to Saturday, 9:00 AM – 8:00 PM</p>
                  <p className="text-sm text-gray-500">Closed on Sundays & Public Holidays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-10 text-center text-gray-500 text-sm">
            <p>We’ll do our best to get back to you as soon as possible. 🚗💨</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSupport
