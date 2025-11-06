import React from 'react'
import { Car, ArrowRight, KeyRound, ShieldCheck, Phone } from 'lucide-react'
import { useNavigate } from 'react-router'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2 text-red-500 text-2xl font-bold">
          <Car className="w-7 h-7" />
          DriveEase
        </div>
        <nav className="flex items-center gap-6 text-gray-300 text-sm">
          <button
            onClick={() => navigate('/customer/login')}
            className="hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/customer/register')}
            className="hover:text-white transition-colors"
          >
            Register
          </button>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="flex flex-col md:flex-row items-center justify-center grow px-10 py-20 gap-12">
        {/* LEFT CONTENT */}
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Rent Your <span className="text-red-500">Dream Car</span> Effortlessly
          </h1>
          <p className="text-gray-400 mb-8">
            Explore a wide range of luxury, economy, and electric vehicles.
            Book online and hit the road with confidence — anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/customer/register')}
              className="bg-red-600 hover:bg-red-700 transition-all py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/customer/login')}
              className="bg-gray-800 hover:bg-gray-700 transition-all py-3 px-6 rounded-xl font-semibold border border-gray-700"
            >
              Login
            </button>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE / ICONS */}
        <div className="hidden md:flex flex-col items-center gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 shadow-2xl">
            <Car className="w-24 h-24 text-red-500 animate-pulse" />
          </div>
          <p className="text-gray-400 text-sm">Fast, Secure & Reliable Car Rentals</p>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="bg-gray-900 border-t border-gray-800 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-red-900/30 transition-all">
            <KeyRound className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
            <p className="text-gray-400 text-sm">
              Book your car online within minutes. No long queues, no hidden fees.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-red-900/30 transition-all">
            <ShieldCheck className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Trusted & Secure</h3>
            <p className="text-gray-400 text-sm">
              All our vehicles are well-maintained and insured for your safety.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-red-900/30 transition-all">
            <Phone className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
            <p className="text-gray-400 text-sm">
              We’re here to assist you anytime — before, during, and after your trip.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} DriveEase. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
