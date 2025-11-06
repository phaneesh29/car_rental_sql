import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Loader2 } from 'lucide-react'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'

const BranchDashboard = () => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ branch_name: '', street: '', city: '', state: '', zip: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  const fetchBranches = async () => {
    try {
      const res = await api.get('/auth/manager/get/branch', { withCredentials: true })
      setBranches(res.data.data || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to fetch branches.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddBranch = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    try {
      const res = await api.post('/auth/manager/add/branch', form, { withCredentials: true })
      setMessage({ type: 'success', text: res.data.message })
      setForm({ branch_name: '', street: '', city: '', state: '', zip: '' })
      fetchBranches()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add branch.' })
    }
  }

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Branch Management</h1>

        {/* Inline message */}
        {message.text && (
          <div
            className={`mb-4 px-4 py-2 rounded-md text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-900/30 text-green-400 border border-green-700'
                : 'bg-red-900/30 text-red-400 border border-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add Branch Form */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Plus size={18} className="text-red-500" /> Add New Branch
          </h2>
          <form onSubmit={handleAddBranch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['branch_name', 'street', 'city', 'state', 'zip'].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.replace('_', ' ').toUpperCase()}
                className="p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            ))}
            <button
              type="submit"
              className="col-span-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-all"
            >
              Add Branch
            </button>
          </form>
        </div>

        {/* Branches List */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Existing Branches</h2>

          {loading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="animate-spin text-red-500" size={28} />
            </div>
          ) : branches.length === 0 ? (
            <p className="text-gray-400 text-sm">No branches found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th className="p-3 text-left">Branch Name</th>
                    <th className="p-3 text-left">Street</th>
                    <th className="p-3 text-left">City</th>
                    <th className="p-3 text-left">State</th>
                    <th className="p-3 text-left">ZIP</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b.branch_id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3">{b.branch_name}</td>
                      <td className="p-3">{b.street}</td>
                      <td className="p-3">{b.city}</td>
                      <td className="p-3">{b.state}</td>
                      <td className="p-3">{b.zip}</td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => navigate(`/manager/branch/details/${b.branch_id}`)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium"
                        >
                          Details
                        </button>
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

export default BranchDashboard
