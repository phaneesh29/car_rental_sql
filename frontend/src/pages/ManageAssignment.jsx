import React, { useEffect, useState } from 'react'
import { Loader2, Car, UserCheck, Trash2, PlusCircle, Link2 } from 'lucide-react'
import api from '../api/axios'
import ManagerSidebar from '../components/ManagerSidebar'

const ManageAssignment = () => {
  const [employees, setEmployees] = useState([])
  const [cars, setCars] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [selectedEmp, setSelectedEmp] = useState('')
  const [selectedCar, setSelectedCar] = useState('')

  // 🧠 Reusable fetcher
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [empRes, carRes, assignRes] = await Promise.allSettled([
        api.get('/auth/manager/get/available/employees', { withCredentials: true }),
        api.get('/auth/manager/get/available/cars', { withCredentials: true }),
        api.get('/auth/manager/get/employeecar', { withCredentials: true })
      ])

      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data.data || [])
      if (carRes.status === 'fulfilled') setCars(carRes.value.data.data || [])
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data.data || [])
    } catch (err) {
      console.error('❌ Fetch failed:', err)
      setMessage({
        text: err.response?.data?.message || '⚠️ Failed to fetch data.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // 🧩 Assign car
  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedEmp || !selectedCar) {
      setMessage({ text: 'Select both employee and car first.', type: 'error' })
      return
    }

    setSaving(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await api.post(
        '/auth/manager/add/employeecar',
        { employeeId: selectedEmp, carId: selectedCar },
        { withCredentials: true }
      )

      setMessage({ text: res.data.message || 'Assigned successfully.', type: 'success' })
      setSelectedEmp('')
      setSelectedCar('')
      await fetchAllData()
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to assign car.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  // 🔥 Delete assignment with guaranteed refresh
  const handleDelete = async (carId, empId) => {
    setMessage({ text: '', type: '' })
    try {
      const res = await api.delete(`/auth/manager/delete/employeecar/${carId}/${empId}`, {
        withCredentials: true
      })

      // Instant UI update before refetch (for responsiveness)
      setAssignments((prev) =>
        prev.filter((a) => !(a.car_id === carId && a.employee_id === empId))
      )

      setMessage({ text: res.data.message || 'Assignment removed.', type: 'success' })

      // Ensure data consistency after API confirm
      setTimeout(fetchAllData, 600)
    } catch (err) {
      console.error('❌ Delete failed:', err)
      setMessage({
        text: err.response?.data?.message || 'Failed to remove assignment.',
        type: 'error'
      })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-400">
        <Loader2 className="animate-spin text-red-500" size={32} />
        <span className="ml-2">Loading data...</span>
      </div>
    )

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <Link2 className="text-red-500" /> Manage Employee-Car Assignments
            </h1>
          </div>

          {/* Feedback */}
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

          {/* Assignment Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 shadow-lg">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <UserCheck size={20} /> Assign Car to Employee
            </h2>

            <form onSubmit={handleAssign} className="grid md:grid-cols-2 gap-4">
              <select
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              >
                <option value="">Select Employee</option>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.first_name} {emp.last_name} — {emp.branch_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No employees available</option>
                )}
              </select>

              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-red-600"
                required
              >
                <option value="">Select Car</option>
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <option key={car.car_id} value={car.car_id}>
                      {car.make} {car.model} — {car.reg_num}
                    </option>
                  ))
                ) : (
                  <option disabled>No cars available</option>
                )}
              </select>

              <button
                type="submit"
                disabled={saving}
                className={`md:col-span-2 mt-2 py-3 rounded-lg font-semibold transition-all ${
                  saving
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  <>
                    <PlusCircle className="inline w-5 h-5 mr-1" /> Assign
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Assignments */}
          <div>
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Car size={20} /> Active Assignments
            </h2>

            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm">No active assignments found.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((a) => (
                  <div
                    key={`${a.car_id}-${a.employee_id}`}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:shadow-red-900/30 transition-all"
                  >
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      {a.employee_first_name} {a.employee_last_name}{' '}
                      <span className="text-gray-400 text-sm">({a.employee_role})</span>
                    </h3>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Car:</span> {a.car_make} {a.car_model}{' '}
                      ({a.car_reg_num})
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Branch:</span> {a.employee_branch_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Assigned On:</span>{' '}
                      {new Date(a.date_assigned).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => handleDelete(a.car_id, a.employee_id)}
                      className="mt-4 w-full flex items-center justify-center gap-1 text-red-400 hover:text-red-300 border border-red-800 rounded-lg py-2 text-sm transition-all"
                    >
                      <Trash2 size={15} /> Remove Assignment
                    </button>
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

export default ManageAssignment
