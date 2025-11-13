import pool from "../db/db.config.js";
import bcryptjs from "bcryptjs"
import jsonwebtoken from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, COOKIE_OPTIONS } from "../constants.js";

export const customerRegisterController = async (req, res) => {
    let conn;
    try {
        const { licenseNumber, fName, lName, email, password, street, city, state, zip, phoneNumber } = req.body;
        if (!licenseNumber?.trim() || !fName?.trim() || !lName?.trim() || !email?.trim() || !password?.trim() || !street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim() || !phoneNumber?.trim()) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }
        conn = await pool.getConnection();
        await conn.beginTransaction();
        const [user] = await conn.query("SELECT * FROM customer WHERE email = ? OR licence_num = ?", [email, licenseNumber]);
        if (user.length > 0) {
            await conn.rollback();
            return res.status(409).json({ message: "User with this email or license number already exists." });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);

        const [result] = await conn.query("INSERT INTO customer (licence_num, f_name, l_name, email, password_hash) VALUES (?, ?, ?, ?, ?)", [licenseNumber, fName, lName, email, hashedPassword]);
        const customerId = result.insertId;

        await conn.query("INSERT INTO customeraddress (customer_id, street, city, state, zip) VALUES (?, ?, ?, ?, ?)", [customerId, street, city, state, zip]);
        await conn.query("INSERT INTO customerphone (cust_id, phone_num) VALUES (?, ?)", [customerId, phoneNumber]);

        await conn.commit();
        res.status(201).json({ message: "Customer registered successfully." });

    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const customerLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }
        const [rows] = await pool.query("SELECT * FROM customer WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const user = rows[0];
        const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const cust_token = jsonwebtoken.sign({ cust_id: user.cust_id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        return res.cookie("custToken", cust_token, COOKIE_OPTIONS).status(200).json({ message: "Login successful", cust_token });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const customerLogoutController = async (req, res) => {
    try {
        res.clearCookie("custToken", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const customerProfileController = async (req, res) => {
    try {
        res.status(200).json(req.customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const customerUpdateController = async (req, res) => {
    try {
        const { fName, lName, oldPassword, newPassword, street, city, state, zip, phoneNumber, type } = req.body;
        const customer_id = req.customer.cust_id;

        if (!type) {
            return res.status(400).json({ message: "Update type is required." });
        }

        const updateType = type.toLowerCase().trim();

        if (updateType == 'personal') {
            if (!fName?.trim() || !lName?.trim()) {
                return res.status(400).json({ message: "First name and last name are required." });
            }
            await pool.query("UPDATE customer SET f_name = ?, l_name = ? WHERE cust_id = ?", [fName, lName, customer_id]);
            return res.status(200).json({ message: "Personal information updated successfully." });
        } else if (updateType == 'address') {
            if (!street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
                return res.status(400).json({ message: "All address fields are required." });
            }
            await pool.query("UPDATE customeraddress SET street = ?, city = ?, state = ?, zip = ? WHERE customer_id = ?", [street, city, state, zip, customer_id]);
            return res.status(200).json({ message: "Address information updated successfully." });
        } else if (updateType == 'phone') {
            if (!phoneNumber?.trim()) {
                return res.status(400).json({ message: "Phone number is required." });
            }
            await pool.query("UPDATE customerphone SET phone_num = ? WHERE cust_id = ?", [phoneNumber, customer_id]);
            return res.status(200).json({ message: "Phone number updated successfully." });
        } else if (updateType == 'password') {
            if (!oldPassword?.trim() || !newPassword?.trim()) {
                return res.status(400).json({ message: "Old password and new password are required." });
            }
            const [rows] = await pool.query("SELECT password_hash FROM customer WHERE cust_id = ?", [customer_id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "Customer not found." });
            }
            const user = rows[0];
            const isOldPasswordValid = await bcryptjs.compare(oldPassword, user.password_hash);
            if (!isOldPasswordValid) {
                return res.status(401).json({ message: "Old password is incorrect." });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters." });
            }
            const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
            await pool.query("UPDATE customer SET password_hash = ? WHERE cust_id = ?", [hashedNewPassword, customer_id]);
            return res.status(200).json({ message: "Password updated successfully." });
        }
        else {
            return res.status(400).json({ message: "Invalid update type" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const getAvailableCarsController = async (req, res) => {
    try {
        const [cars] = await pool.query("SELECT * FROM all_employeecar_details WHERE car_status != 'maintenance' AND deleted = FALSE");
        if (!cars || cars.length === 0) {
            return res.status(404).json({ message: "No available cars found." });
        }
        res.status(200).json({ message: "Available cars retrieved successfully.", length: cars.length, data: cars });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const getCarBookedDatesController = async (req, res) => {
    try {
        const { carId } = req.params;
        
        if (!carId) {
            return res.status(400).json({ message: "Car ID is required." });
        }

        const carIdInt = parseInt(carId, 10);
        if (isNaN(carIdInt) || carIdInt < 0) {
            return res.status(400).json({ message: "Invalid car ID." });
        }

        // Get all active (not completed) rentals for this car
        const [rentals] = await pool.query(
            `SELECT rental_id, rental_date, return_date, customer_id 
             FROM rental 
             WHERE car_id = ? 
             AND is_completed = FALSE 
             ORDER BY rental_date ASC`,
            [carIdInt]
        );

        res.status(200).json({ 
            message: "Booked dates retrieved successfully.",
            carId: carIdInt,
            bookedPeriods: rentals.map(r => ({
                rental_id: r.rental_id,
                start_date: r.rental_date,
                end_date: r.return_date,
                is_own_booking: r.customer_id === req.customer.cust_id
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const addRentalController = async (req, res) => {
    let conn;
    try {
        const { carId, rental_date, return_date } = req.body;

        if (!carId || !rental_date || !return_date) {
            return res.status(400).json({ message: "Car ID, rental date, and return date are required." });
        }

        const customer_id = req.customer.cust_id;
        const carIdInt = parseInt(carId, 10);
        if (isNaN(carIdInt) || carIdInt < 0) {
            return res.status(400).json({ message: "Invalid car ID." });
        }
        if (!rental_date || !return_date) {
            return res.status(400).json({ message: "Rental and return dates are required." });
        }

        const rentalDateObj = new Date(rental_date);
        const returnDateObj = new Date(return_date);

        if (isNaN(rentalDateObj) || isNaN(returnDateObj)) {
            return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
        }

        if (returnDateObj <= rentalDateObj) {
            return res.status(400).json({ message: "Return date must be after rental date." });
        }

        const formatDate = (d) => d.toISOString().split("T")[0];
        const rentalDateFormatted = formatDate(rentalDateObj);
        const returnDateFormatted = formatDate(returnDateObj);

        conn = await pool.getConnection();
        await conn.beginTransaction();
        
        // Check if car exists and is not in maintenance
        const [carRows] = await conn.query("SELECT * FROM all_employeecar_details WHERE car_id = ? AND car_status != 'maintenance' AND deleted = FALSE", [carIdInt]);
        if (carRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Car not found or not available." });
        }

        // Check for date conflicts with existing rentals
        const [conflictingRentals] = await conn.query(
            `SELECT rental_id FROM rental 
             WHERE car_id = ? 
             AND is_completed = FALSE 
             AND (
                 (rental_date <= ? AND return_date > ?) OR
                 (rental_date < ? AND return_date >= ?) OR
                 (rental_date >= ? AND return_date <= ?)
             )`,
            [carIdInt, returnDateFormatted, rentalDateFormatted, returnDateFormatted, returnDateFormatted, rentalDateFormatted, returnDateFormatted]
        );

        if (conflictingRentals.length > 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Car is already booked for the selected dates. Please choose different dates." });
        }

        await conn.query("INSERT INTO rental (car_id, customer_id, rental_date, return_date) VALUES (?, ?, ?, ?)", [carIdInt, customer_id, rentalDateFormatted, returnDateFormatted]);
        await conn.commit();
        res.status(201).json({ message: "Rental added successfully." });

    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const getMyRentalHistoryController = async (req, res) => {
    try {
        const customer_id = req.customer.cust_id;
        const [rentalHistory] = await pool.query("SELECT * FROM all_rental_details WHERE customer_id = ? ORDER BY rental_date DESC", [customer_id]);
        if (rentalHistory.length === 0) {
            return res.status(404).json({ message: "No rental history found." });
        }
        res.status(200).json({ message: "Rental history retrieved successfully.", data: rentalHistory });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const getMyRentalByIdController = async (req, res) => {
    try {
        const customer_id = req.customer.cust_id;
        const { id } = req.params;
        const rentalIdInt = parseInt(id, 10);
        if (isNaN(rentalIdInt) || rentalIdInt < 0) {
            return res.status(400).json({ message: "Invalid rental ID." });
        }
        const [rental] = await pool.query("SELECT * FROM all_rental_details WHERE customer_id = ? AND rental_id = ?", [customer_id, rentalIdInt]);
        if (rental.length === 0) {
            return res.status(404).json({ message: "Rental not found." });
        }
        res.status(200).json({ message: "Rental retrieved successfully.", data: rental[0] });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const deleteMyRentalController = async (req, res) => {
    let conn;
    try {
        const customer_id = req.customer.cust_id;
        const { rentalId } = req.params;
        const rentalIdInt = parseInt(rentalId, 10);

        if (isNaN(rentalIdInt) || rentalIdInt < 0) {
            return res.status(400).json({ message: "Invalid rental ID." });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [rentalRows] = await conn.query("SELECT * FROM rental WHERE rental_id = ? AND customer_id = ?", [rentalIdInt, customer_id]);
        if (rentalRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Rental not found." });
        }

        const rental = rentalRows[0];
        if (rental.is_completed) {
            await conn.rollback();
            return res.status(400).json({ message: "Cannot cancel a completed rental." });
        }

        const rentalDate = new Date(rental.rental_date);
        const now = new Date();

        const diffMs = rentalDate.getTime() - now.getTime();

        if (diffMs < 3600000) {
            await conn.rollback();
            return res.status(400).json({ message: "Cancellations are only allowed at least 1 hour before the rental date." });
        }

        await conn.query("DELETE FROM rental WHERE rental_id = ? AND customer_id = ?", [rentalIdInt, customer_id]);
        await conn.commit();
        res.status(200).json({ message: "Rental deleted successfully." });

    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const completeMyPaymentController = async (req, res) => {
    let conn;
    try {
        const customer_id = req.customer.cust_id;
        const { rentalId, amount, method } = req.body;
        if (!rentalId || !amount || !method) {
            return res.status(400).json({ message: "Rental ID, amount, and payment method are required." });
        }
        const rentalIdInt = parseInt(rentalId, 10);
        if (isNaN(rentalIdInt) || rentalIdInt < 0) {
            return res.status(400).json({ message: "Invalid rental ID." });
        }

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
            return res.status(400).json({ message: "Invalid amount." });
        }

        const validMethods = ['upi', 'card', 'cash'];
        if (!validMethods.includes(method)) {
            return res.status(400).json({ message: "Invalid payment method." });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [rentalRows] = await conn.query("SELECT * FROM rental WHERE rental_id = ? AND customer_id = ?", [rentalIdInt, customer_id]);
        if (rentalRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Rental not found." });
        }

        const rental = rentalRows[0];

        if (rental.is_completed) {
            await conn.rollback();
            return res.status(400).json({ message: "Rental is already completed." });
        }
        const rentalDate = new Date(rental.rental_date);
        const now = new Date();

        if (now < rentalDate) {
            await conn.rollback();
            return res.status(400).json({ message: "Payment cannot be made before the rental period starts." });
        }
        if (amountFloat < rental.total_amount) {
            await conn.rollback();
            return res.status(400).json({ message: `Insufficient payment amount. Please pay ${rental.total_amount}` });
        }

        const [existingPaymentRows] = await conn.query("SELECT * FROM payment WHERE rental_id = ?", [rentalIdInt]);
        if (existingPaymentRows.length > 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Payment has already been made for this rental." });
        }

        await conn.query("INSERT INTO payment (rental_id, amount, method, payment_date,status) VALUES (?, ?, ?, NOW(),?)", [rentalIdInt, amountFloat, method.toLowerCase(), 'completed']);

        await conn.query("UPDATE rental SET is_completed = TRUE WHERE rental_id = ?", [rentalIdInt]);

        await conn.commit();
        res.status(200).json({ message: "Payment completed and rental marked as completed." });


    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const getMyPaymentsController = async (req, res) => {
    try {
        const customer_id = req.customer.cust_id;
        const [paymentDetails] = await pool.query("SELECT * FROM all_payment_details WHERE customer_id = ? ORDER BY payment_date DESC", [customer_id]);
        if (paymentDetails.length === 0) {
            return res.status(404).json({ message: "No payment records found." });
        }
        res.status(200).json({ message: "Payment records retrieved successfully.", data: paymentDetails });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const getPaymentDetailsController = async (req, res) => {
    try {
        const customer_id = req.customer.cust_id;
        const { paymentId } = req.params;
        const paymentIdInt = parseInt(paymentId, 10);
        if (isNaN(paymentIdInt) || paymentIdInt < 0) {
            return res.status(400).json({ message: "Invalid payment ID." });
        }
        const [paymentRows] = await pool.query("SELECT * FROM all_payment_details WHERE pay_id = ? AND customer_id = ?", [paymentIdInt, customer_id]);
        if (paymentRows.length === 0) {
            return res.status(404).json({ message: "Payment record not found." });
        }
        res.status(200).json({ message: "Payment record retrieved successfully.", data: paymentRows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}