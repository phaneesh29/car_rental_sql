import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react'
import api from '../api/axios'

const CarCalendar = ({ carId, carName, onClose, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedPeriods, setBookedPeriods] = useState([])
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (carId) {
      fetchBookedDates()
    }
  }, [carId])

  const fetchBookedDates = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/auth/customer/get/car/${carId}/booked-dates`, {
        withCredentials: true
      })
      setBookedPeriods(res.data.bookedPeriods || [])
    } catch (err) {
      console.error('Failed to fetch booked dates:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const isDateBooked = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookedPeriods.some(period => {
      const start = new Date(period.start_date)
      const end = new Date(period.end_date)
      return date >= start && date < end
    })
  }

  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateSelected = (date) => {
    if (!selectedRange.start) return false
    if (!selectedRange.end) {
      return date.getTime() === selectedRange.start.getTime()
    }
    return date >= selectedRange.start && date <= selectedRange.end
  }

  const handleDateClick = (date) => {
    if (isDateInPast(date) || isDateBooked(date)) return

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // Start new selection
      setSelectedRange({ start: date, end: null })
    } else {
      // Complete selection
      if (date < selectedRange.start) {
        setSelectedRange({ start: date, end: selectedRange.start })
      } else {
        // Check if any date in range is booked
        let hasBookedDate = false
        let checkDate = new Date(selectedRange.start)
        while (checkDate <= date) {
          if (isDateBooked(checkDate)) {
            hasBookedDate = true
            break
          }
          checkDate.setDate(checkDate.getDate() + 1)
        }

        if (hasBookedDate) {
          // Reset selection if range contains booked dates
          setSelectedRange({ start: date, end: null })
        } else {
          setSelectedRange({ start: selectedRange.start, end: date })
        }
      }
    }
  }

  const handleConfirm = () => {
    if (selectedRange.start && selectedRange.end) {
      const formatDate = (d) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      onDateSelect({
        rental_date: formatDate(selectedRange.start),
        return_date: formatDate(selectedRange.end)
      })
      onClose()
    }
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day, 12, 0, 0)
      const isBooked = isDateBooked(date)
      const isPast = isDateInPast(date)
      const isSelected = isDateSelected(date)
      const isToday = date.toDateString() === today.toDateString()

      let className = 'h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all text-sm font-medium '

      if (isPast) {
        className += 'text-gray-600 cursor-not-allowed'
      } else if (isBooked) {
        className += 'bg-red-900/40 text-red-400 cursor-not-allowed border border-red-700'
      } else if (isSelected) {
        className += 'bg-blue-600 text-white border-2 border-blue-400'
      } else {
        className += 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
      }

      if (isToday && !isPast) {
        className += ' ring-2 ring-green-500'
      }

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => handleDateClick(date)}
          title={
            isBooked
              ? 'Already booked'
              : isPast
              ? 'Past date'
              : 'Click to select'
          }
        >
          {day}
        </div>
      )
    }

    return days
  }

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + delta)
    setCurrentMonth(newMonth)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <CalendarIcon size={24} />
              Select Rental Dates
            </h2>
            <p className="text-gray-400 text-sm mt-1">{carName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading calendar...</div>
          ) : (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="text-gray-400" />
                </button>
                <h3 className="text-xl font-semibold text-gray-100">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="text-gray-400" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {renderCalendar()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-800 border border-gray-700"></div>
                  <span className="text-gray-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-900/40 border border-red-700"></div>
                  <span className="text-gray-400">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600"></div>
                  <span className="text-gray-400">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded ring-2 ring-green-500 bg-gray-800"></div>
                  <span className="text-gray-400">Today</span>
                </div>
              </div>

              {/* Selected Range Info */}
              {selectedRange.start && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Selected Range:</p>
                  <div className="flex items-center gap-2 text-gray-200">
                    <span className="font-semibold">
                      {selectedRange.start.toLocaleDateString()}
                    </span>
                    {selectedRange.end && (
                      <>
                        <span className="text-gray-500">→</span>
                        <span className="font-semibold">
                          {selectedRange.end.toLocaleDateString()}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({Math.ceil((selectedRange.end - selectedRange.start) / (1000 * 60 * 60 * 24)) + 1} days)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-semibold bg-gray-800 hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedRange.start || !selectedRange.end}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    selectedRange.start && selectedRange.end
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  Confirm Dates
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CarCalendar
