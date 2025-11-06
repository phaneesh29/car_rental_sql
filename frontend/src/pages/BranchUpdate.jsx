import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'
import {
  Loader2,
  ArrowLeft,
  Save,
  Users,
  Car,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

const BranchUpdate = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [employees, setEmployees] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  })

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [branchRes, empRes, carRes] = await Promise.allSettled([
          api.get(`/auth/manager/get/branch/${id}`, { withCredentials: true }),
          api.get(`/auth/manager/get/branch/employee/${id}`, { withCredentials: true }),
          api.get(`/auth/manager/get/branch/car/${id}`, { withCredentials: true })
        ])

        if (branchRes.status === 'fulfilled') {
          const data = branchRes.value.data.data
          setBranch(data)
          setFormData({
            street: data.street || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || ''
          })
        }

        if (empRes.status === 'fulfilled') setEmployees(empRes.value.data.data || [])
        if (carRes.status === 'fulfilled') setCars(carRes.value.data.data || [])
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to fetch branch details.'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [id])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleUpdate = async () => {
    try {
      setUpdating(true)
      const res = await api.patch(`/auth/manager/update/branch/${id}`, formData, {
        withCredentials: true
      })
      setMessage({ type: 'success', text: res.data.message })
      setBranch({ ...branch, ...formData })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update branch.'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading branch data...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
            <MapPin className="text-red-500" /> Branch Details
          </h1>
          <button
            onClick={() => navigate('/manager/branch')}
            className="flex items-center gap-2 bg-gray-800 text-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-700 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-6 px-4 py-2 rounded-md text-sm font-medium border ${
              message.type === 'success'
                ? 'bg-green-900/30 text-green-400 border-green-700'
                : 'bg-red-900/30 text-red-400 border-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {branch && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">{branch.branch_name}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Branch ID</p>
                  <p className="font-medium text-gray-300">{branch.branch_id}</p>
                </div>
                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium text-gray-300">{branch.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">State</p>
                  <p className="font-medium text-gray-300">{branch.state}</p>
                </div>
                <div>
                  <p className="text-gray-500">ZIP</p>
                  <p className="font-medium text-gray-300">{branch.zip}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto p-6 mb-10">
              <h2 className="text-lg font-semibold mb-4 text-red-400">Update Branch Info</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['street', 'city', 'state', 'zip'].map((f) => (
                  <input
                    key={f}
                    type="text"
                    name={f}
                    value={formData[f]}
                    onChange={handleChange}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                    className="bg-gray-800 p-3 rounded-md outline-none w-full"
                  />
                ))}
              </div>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded-md font-semibold transition"
              >
                {updating ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {updating ? 'Updating...' : 'Update Branch'}
              </button>
            </div>
          </>
        )}

        {/* EMPLOYEES TABLE FIXED */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg max-w-6xl mx-auto p-6 mb-10">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <Users size={20} /> Employees in Branch
          </h2>

          {employees.length === 0 ? (
            <p className="text-gray-400 text-sm">No employees found in this branch.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">Role</th>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2 text-left">Phone</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.employee_id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-all"
                    >
                      <td className="py-2 font-medium text-gray-200">
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td className="py-2 text-gray-400 capitalize">{emp.role}</td>
                      <td className="py-2 text-gray-400 flex items-center gap-2">
                        <Mail size={13} className="text-gray-500" />
                        <span className="truncate">{emp.email}</span>
                      </td>
                      <td className="py-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-gray-500" />
                          <span className="whitespace-nowrap">{emp.phone_num}</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold min-w-[70px] ${
                            emp.status === 'working'
                              ? 'bg-green-900/30 text-green-400 border border-green-700'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CARS LIST - SAME */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg max-w-6xl mx-auto p-6 mb-10">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <Car size={20} /> Cars in Branch
          </h2>

          {cars.length === 0 ? (
            <p className="text-gray-400 text-sm">No cars found in this branch.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="py-2 text-left">Make & Model</th>
                    <th className="py-2 text-left">Reg No</th>
                    <th className="py-2 text-left">Year</th>
                    <th className="py-2 text-left">Rate (₹/day)</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.car_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-all">
                      <td className="py-2 font-medium text-gray-200">
                        {car.make} {car.model}
                      </td>
                      <td className="py-2 text-gray-400">{car.reg_num}</td>
                      <td className="py-2 text-gray-400">{car.year}</td>
                      <td className="py-2 text-gray-400">{car.rental_rate}</td>
                      <td className="py-2 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold min-w-[70px] ${
                            car.status === 'available'
                              ? 'bg-green-900/30 text-green-400 border border-green-700'
                              : car.status === 'rented'
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                              : 'bg-red-900/30 text-red-400 border border-red-700'
                          }`}
                        >
                          {car.status}
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
  )
}

export default BranchUpdate
