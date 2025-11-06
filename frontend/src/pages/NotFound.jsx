import React from 'react'
import { useNavigate } from 'react-router'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-red-600 drop-shadow-lg">404</h1>
        <p className="text-2xl font-semibold mt-4">Page Not Found</p>
        <p className="text-gray-400 mt-2 max-w-md">
          You’ve reached the end of the damn internet. There’s nothing here.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 transition-all rounded-xl font-semibold shadow-md"
        >
          Go Back Home
        </button>
      </div>
    </div>
  )
}

export default NotFound
