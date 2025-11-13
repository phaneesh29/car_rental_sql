# 📅 Calendar Feature Guide - BookMyShow Style Booking

## Overview
The car rental system now features an interactive calendar interface similar to BookMyShow's seat selection, allowing customers to visually see which dates are already booked and select available dates for their rental.

## 🎯 Key Features

### Visual Calendar Interface
Just like BookMyShow shows booked and available seats, our calendar shows:
- **Booked Dates** (Red) - Already rented by other customers
- **Available Dates** (Gray) - Free to book
- **Selected Dates** (Blue) - Your current selection
- **Today** (Green ring) - Current date indicator
- **Past Dates** (Faded) - Cannot be selected

### Interactive Date Selection
1. **Click once** on an available date to set the start date
2. **Click again** on another date to set the end date
3. The system automatically selects the entire range between dates
4. If you try to select a range containing booked dates, the selection resets

### Smart Validation
- ❌ Cannot select past dates
- ❌ Cannot select already booked dates
- ❌ Cannot select ranges that overlap with bookings
- ✅ Real-time visual feedback on what's available

## 🚀 How to Use

### Step-by-Step Booking Process

1. **Navigate to Customer Dashboard**
   - Log in to your customer account
   - Go to the main dashboard

2. **Select a Car**
   - Choose your desired car from the dropdown menu
   - All cars except those in maintenance will appear

3. **Open the Calendar**
   - Click the purple button: **"View Calendar & Select Dates"**
   - A full-screen calendar modal will appear

4. **View Current Month**
   - Calendar shows the current month by default
   - Use ◀ and ▶ arrows to navigate between months

5. **Understand the Color Codes**
   - 🟢 Green ring: Today
   - ⚫ Gray background: Available to book
   - 🔴 Red background: Already booked
   - 🔵 Blue background: Your selection
   - ⚪ Faded text: Past dates

6. **Select Your Dates**
   - Click on your desired **start date** (must be gray/available)
   - Click on your desired **end date** (must be gray/available)
   - The entire range will turn blue
   - Below the calendar, you'll see: "Selected Range: Jan 15, 2025 → Jan 20, 2025 (6 days)"

7. **Confirm or Adjust**
   - If happy with selection: Click **"Confirm Dates"**
   - To change: Click a new start date
   - To cancel: Click **"Cancel"** or the ✕ button

8. **Complete Booking**
   - Dates auto-populate in the booking form
   - Optionally click **"Check Availability"** to verify
   - Click **"Book Rental"** to finalize

## 💡 Pro Tips

### Visual Scanning
- Quickly scan the calendar to see availability patterns
- Look for consecutive available dates (all gray) for longer trips
- Red clusters indicate popular booking periods

### Range Selection
- Always click the earlier date first (recommended but not required)
- The system will auto-correct if you click end before start
- Selection resets if you try to include a booked (red) date

### Month Navigation
- Book ahead by navigating to future months
- Check multiple months to find the best available window
- Past months show only faded dates (not bookable)

### Mobile Usage
- Calendar is fully responsive
- Touch-friendly for mobile devices
- Swipe-like navigation between months

## 🎨 Visual Reference

### Calendar Legend
```
🟢 Today        → Green ring around date
⚫ Available    → Gray background, clickable
🔴 Booked       → Red background, not clickable  
🔵 Selected     → Blue background, your choice
⚪ Past         → Faded gray, not clickable
```

### Example Scenario

**January 2025 Calendar View:**
```
Sun  Mon  Tue  Wed  Thu  Fri  Sat
                1⚪   2⚪   3⚪   4⚪
 5🟢   6⚫   7⚫   8🔴   9🔴  10🔴  11⚫
12⚫  13⚫  14⚫  15🔵  16🔵  17🔵  18🔵
19🔵  20🔵  21⚫  22⚫  23🔴  24🔴  25⚫
26⚫  27⚫  28⚫  29⚫  30⚫  31⚫
```

In this example:
- Today is the 5th (green ring)
- Dates 1-4 are in the past (faded)
- Dates 8-10 and 23-24 are already booked (red)
- Dates 15-20 are selected by the user (blue)
- All other future dates are available (gray)

## 🔧 Technical Details

### API Endpoint
```
GET /auth/customer/get/car/:carId/booked-dates
```

**Response:**
```json
{
  "message": "Booked dates retrieved successfully.",
  "carId": 5,
  "bookedPeriods": [
    {
      "rental_id": 12,
      "start_date": "2025-01-08",
      "end_date": "2025-01-10",
      "is_own_booking": false
    },
    {
      "rental_id": 15,
      "start_date": "2025-01-23",
      "end_date": "2025-01-24",
      "is_own_booking": false
    }
  ]
}
```

### Component Location
```
frontend/src/components/CarCalendar.jsx
```

### Integration
The calendar modal is integrated into the Customer Dashboard and appears as an overlay when the "View Calendar & Select Dates" button is clicked.

## ❓ FAQ

**Q: Can I select non-consecutive dates?**
A: No, the system books consecutive days. If you need a car for non-consecutive periods, make separate bookings.

**Q: What if I accidentally select the wrong dates?**
A: Just click a new start date to begin a new selection, or click "Cancel" to close without applying changes.

**Q: Why can't I select certain dates?**
A: Dates may be unselectable for three reasons:
1. They're in the past
2. They're already booked by another customer
3. Your selected range would overlap with an existing booking

**Q: Do I see my own bookings as red?**
A: Yes, your own active bookings also appear as red to prevent double-booking.

**Q: Can I book just one day?**
A: Yes! Click the same date twice, or click consecutive dates. The system calculates based on the range.

**Q: What happens when I confirm dates?**
A: The modal closes and the dates automatically fill into the rental form. You still need to click "Book Rental" to finalize.

## 🎯 Comparison with Traditional Booking

| Feature | Traditional (Date Picker) | New (Calendar View) |
|---------|--------------------------|---------------------|
| Visual availability | ❌ Must check manually | ✅ See all at once |
| Booked dates visible | ❌ Error after submit | ✅ Red dates shown |
| Date range selection | Text input only | ✅ Visual click selection |
| Month overview | ❌ No overview | ✅ Full month view |
| User experience | Basic | 🎬 BookMyShow-style |
| Error prevention | After submission | ✅ Before selection |

## 🎉 Benefits

1. **Reduced Booking Errors**: See conflicts before attempting to book
2. **Better Planning**: Visualize entire month to find best dates
3. **Time Savings**: No trial-and-error with date pickers
4. **Intuitive UX**: Familiar pattern (like booking movie tickets)
5. **Mobile Friendly**: Works seamlessly on all devices
6. **Transparent**: Full visibility into car availability

---

**Enjoy the new BookMyShow-style booking experience! 🚗🎬**
