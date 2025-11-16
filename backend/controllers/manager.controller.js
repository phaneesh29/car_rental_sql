import pool from "../db/db.config.js";
import bcryptjs from "bcryptjs"
import jsonwebtoken from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, COOKIE_OPTIONS } from "../constants.js";

export const employeeRegisterController = async (req, res) => {
    let conn;
    try {
        const { fName, lName, role, email, password, branchId, street, city, state, zip, phoneNumber } = req.body;
        if (!fName?.trim() || !lName?.trim() || !role?.trim() || !email?.trim() || !branchId?.trim() || !street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim() || !phoneNumber?.trim()) {
            return res.status(400).json({ message: "All fields are required." });
        }

        let requiresPassword = role == 'manager';

        if (requiresPassword && (!password || password.length < 6)) {
            return res.status(400).json({ message: "Password is required for managers and must be at least 6 characters long." });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();
        const [existing] = await conn.query("SELECT * FROM employee WHERE email = ?", [email]);
        if (existing.length > 0) {
            await conn.rollback();
            return res.status(409).json({ message: "Employee with this email already exists." });
        }
        const [branch] = await conn.query("SELECT * FROM branch WHERE branch_id = ?", [branchId]);
        if (branch.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Branch not found." });
        }
        const hashedPassword = requiresPassword ? await bcryptjs.hash(password, 10) : null;

        const [result] = await conn.query("INSERT INTO employee (first_name, last_name, role, email, password_hash, branch_id) VALUES (?, ?, ?, ?, ?, ?)", [fName, lName, role, email, hashedPassword, branchId]);
        const employeeId = result.insertId;

        await conn.query("INSERT INTO employee_address (employee_id, street, city, state, zip) VALUES (?, ?, ?, ?, ?)", [employeeId, street, city, state, zip]);
        await conn.query("INSERT INTO employee_phone (employee_id, phone_num) VALUES (?, ?)", [employeeId, phoneNumber]);

        await conn.commit();
        res.status(201).json({ message: "Employee registered successfully." });

    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const managerLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }
        const [rows] = await pool.query("SELECT * FROM employee WHERE email = ? AND role = 'manager'", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const employee = rows[0];

        if (!employee.password_hash) {
            return res.status(401).json({ message: "Manager account has no password set." });
        }

        const isPasswordValid = await bcryptjs.compare(password, employee.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const employee_token = jsonwebtoken.sign({ employee_id: employee.employee_id, email: employee.email }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        return res.cookie("employeeToken", employee_token, COOKIE_OPTIONS).status(200).json({ message: "Login successful", employee_token });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const managerLogoutController = async (req, res) => {
    try {
        res.clearCookie("employeeToken", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const managerProfileController = async (req, res) => {
    try {
        res.status(200).json(req.manager);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const employeeUpdateController = async (req, res) => {
    try {
        const { employeeId, fName, lName, role, status, street, city, state, zip, phoneNumber, type } = req.body;

        if (!employeeId) {
            return res.status(400).json({ message: "Employee ID is required." });
        }

        if (!type) {
            return res.status(400).json({ message: "Update type is required." });
        }

        const [empRows] = await pool.query("SELECT employee_id FROM employee WHERE employee_id = ?", [employeeId]);
        if (empRows.length === 0) {
            return res.status(404).json({ message: "Employee not found." });
        }

        const updateType = type.toLowerCase().trim();

        if (updateType === 'personal') {
            if (!fName?.trim() || !lName?.trim()) {
                return res.status(400).json({ message: "First name and last name are required." });
            }
            await pool.query("UPDATE employee SET first_name = ?, last_name = ? WHERE employee_id = ?", [fName.trim(), lName.trim(), employeeId]);
            return res.status(200).json({ message: "Personal information updated successfully." });
        } else if (updateType === 'address') {
            if (!street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
                return res.status(400).json({ message: "All address fields are required." });
            }
            await pool.query("UPDATE employee_address SET street = ?, city = ?, state = ?, zip = ? WHERE employee_id = ?", [street.trim(), city.trim(), state.trim(), zip.trim(), employeeId]);
            return res.status(200).json({ message: "Address information updated successfully." });
        } else if (updateType === 'phone') {
            if (!phoneNumber?.trim()) {
                return res.status(400).json({ message: "Phone number is required." });
            }
            await pool.query("UPDATE employee_phone SET phone_num = ? WHERE employee_id = ?", [phoneNumber.trim(), employeeId]);
            return res.status(200).json({ message: "Phone number updated successfully." });
        } else if (updateType === 'rolestatus') {
            if (!role?.trim() || !status?.trim()) {
                return res.status(400).json({ message: "Role and status are required." });
            }
            await pool.query("UPDATE employee SET role = ?, status = ? WHERE employee_id = ?", [role.trim().toLowerCase(), status.trim().toLowerCase(), employeeId]);
            return res.status(200).json({ message: "Role and status updated successfully." });
        }
        else {
            return res.status(400).json({ message: "Invalid update type" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const addBranchController = async (req, res) => {
    try {
        const { branch_name, street, city, state, zip } = req.body;
        if (!branch_name?.trim() || !street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const [exists] = await pool.query("SELECT branch_id FROM branch WHERE branch_name = ?", [branch_name.trim()]);
        if (exists.length > 0) {
            return res.status(409).json({ message: "Branch already exists." });
        }

        await pool.query("INSERT INTO branch(branch_name, street, city, state, zip) VALUES (?, ?, ?, ?, ?)", [branch_name.trim(), street.trim(), city.trim(), state.trim(), zip.trim()]);
        res.status(201).json({ message: "Branch added successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllBranchesController = async (req, res) => {
    try {
        const [branches] = await pool.query("SELECT * FROM branch");
        if (branches.length === 0) {
            return res.status(404).json({ message: "No branches found." });
        }
        res.status(200).json({ message: "Branches fetched successfully.", total: branches.length, data: branches });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getBranchByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Branch ID is required." });
        }
        const [branches] = await pool.query("SELECT * FROM branch WHERE branch_id = ?", [parseInt(id)]);
        if (branches.length === 0) {
            return res.status(404).json({ message: "Branch not found." });
        }
        res.status(200).json({ message: "Branch fetched successfully.", data: branches[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateBranchController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Branch ID is required." });
        }
        const { street, city, state, zip } = req.body;

        if (!street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const [branches] = await pool.query("SELECT * FROM branch WHERE branch_id = ?", [id]);
        if (branches.length === 0) {
            return res.status(404).json({ message: "Branch not found." });
        }
        await pool.query("UPDATE branch SET street = ?, city = ?, state = ?, zip = ? WHERE branch_id = ?", [street.trim(), city.trim(), state.trim(), zip.trim(), id]);
        res.status(200).json({ message: "Branch updated successfully." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllCarsFromBranchController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Branch ID is required." });
        }
        const branchId = parseInt(id, 10);
        if (isNaN(branchId) || branchId <= 0) {
            return res.status(400).json({ message: "Invalid Branch ID." });
        }
        const [cars] = await pool.query("SELECT * FROM all_car_details WHERE branch_id = ?", [branchId]);
        if (cars.length === 0) {
            return res.status(404).json({ message: "No cars found for this branch." });
        }
        return res.status(200).json({ message: "Cars fetched successfully.", total: cars.length, data: cars });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
export const getAllEmployeesFromBranchController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Branch ID is required." });
        }
        const branchId = parseInt(id, 10);
        if (isNaN(branchId) || branchId <= 0) {
            return res.status(400).json({ message: "Invalid Branch ID." });
        }
        const [employees] = await pool.query("SELECT * FROM all_employee_details WHERE branch_id = ?", [branchId]);
        if (employees.length === 0) {
            return res.status(404).json({ message: "No employees found for this branch." });
        }
        return res.status(200).json({ message: "Employees fetched successfully.", total: employees.length, data: employees });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllCustomersController = async (req, res) => {
    try {
        const [customers] = await pool.query("SELECT cust_id,licence_num,f_name,l_name,email,phone_num FROM all_customer_details");
        if (customers.length === 0) {
            return res.status(404).json({ message: "No customers found." });
        }
        res.status(200).json({ message: "Customers fetched successfully.", total: customers.length, data: customers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCustomerByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Customer ID is required." });
        }
        const [customers] = await pool.query("SELECT * FROM all_customer_details WHERE cust_id = ?", [id]);
        if (customers.length === 0) {
            return res.status(404).json({ message: "No customers found." });
        }
        res.status(200).json({ message: "Customers fetched successfully.", total: customers.length, data: customers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllEmployeeController = async (req, res) => {
    try {
        const [employee] = await pool.query("SELECT * FROM all_employee_details");
        if (employee.length === 0) {
            return res.status(404).json({ message: "No employees found." });
        }
        res.status(200).json({ message: "Employees fetched successfully.", total: employee.length, data: employee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getEmployeeByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Employee ID is required." });
        }
        const [employee] = await pool.query("SELECT * FROM all_employee_details WHERE employee_id = ?", [id]);
        if (employee.length === 0) {
            return res.status(404).json({ message: "No employee found." });
        }
        res.status(200).json({ message: "Employee fetched successfully.", total: employee.length, data: employee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const employeeDeleteController = async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Employee ID is required." });
        }
        const employeeId = parseInt(id, 10);
        if(isNaN(employeeId) || employeeId <=0){
            return res.status(400).json({ message: "Invalid employee ID." });
        }
        if (employeeId === req.manager.employee_id) {
            return res.status(403).json({ message: "You cannot delete your own account." });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();        

        const [employeeCars] = await conn.query("SELECT * FROM employee_car WHERE employee_id = ? AND deleted = FALSE", [id]);
        if (employeeCars.length > 0) {
            await conn.query("UPDATE car SET status = 'available' WHERE car_id IN (SELECT car_id FROM employee_car WHERE employee_id = ? AND deleted = FALSE)", [id]);
            await conn.query("DELETE FROM rental WHERE car_id IN (SELECT car_id FROM employee_car WHERE employee_id = ? AND deleted = FALSE)", [id]);
        }
        const [result] = await conn.query("DELETE FROM employee WHERE employee_id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No employee found." });
        }
        await conn.commit();
        res.status(200).json({ message: "Employee deleted successfully." });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        if (conn) conn.release();
    }
}

export const addCarController = async (req, res) => {
    try {
        const { branch_id, year, make, model, reg_num, status, rental_rate } = req.body;
        if (!branch_id || !year || !make || !model || !reg_num || !status || !rental_rate) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const [branch] = await pool.query("SELECT * FROM branch WHERE branch_id = ?", [branch_id]);
        if (branch.length === 0) {
            return res.status(404).json({ message: "Branch not found." });
        }
        const [result] = await pool.query("INSERT INTO car (branch_id, year, make, model, reg_num, status, rental_rate) VALUES (?, ?, ?, ?, ?, ?, ?)", [branch_id, year, make, model, reg_num, status, rental_rate]);
        res.status(201).json({ message: "Car added successfully.", data: { id: result.insertId, ...req.body } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCarController = async (req, res) => {
    try {
        const [cars] = await pool.query("SELECT * FROM all_car_details");
        if (cars.length === 0) {
            return res.status(404).json({ message: "No cars found." });
        }
        res.status(200).json({ message: "Cars fetched successfully.", total: cars.length, data: cars });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCarByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Car ID is required." });
        }
        const [cars] = await pool.query("SELECT * FROM all_car_details WHERE car_id = ?", [id]);
        if (cars.length === 0) {
            return res.status(404).json({ message: "No car found." });
        }
        res.status(200).json({ message: "Car fetched successfully.", data: cars[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateCarByIdController = async (req, res) => {
    try {
        const { status, rental_rate } = req.body;
        const { id } = req.params;

        if (!id?.trim()) {
            return res.status(400).json({ message: "Car ID is required." });
        }
        if (!status?.trim() || rental_rate == null) {
            return res.status(400).json({ message: "Status and rental rate are required." });
        }
        const rate = parseFloat(rental_rate);
        if (isNaN(rate) || rate <= 0) {
            return res.status(400).json({ message: "Rental rate must be a valid positive number." });
        }

        const [result] = await pool.query(
            "UPDATE car SET status = ?, rental_rate = ? WHERE car_id = ?",
            [status.trim().toLowerCase(), rate, parseInt(id, 10)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Car not found." });
        }

        res.status(200).json({ message: "Car updated successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const deleteCarByIdController = async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Car ID is required." });
        }
        const carId = parseInt(id, 10);
        if (isNaN(carId) || carId <= 0) {
            return res.status(400).json({ message: "Invalid Car ID." });
        }
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [employeeRows] = await conn.query("SELECT employee_id FROM employee_car WHERE car_id = ?", [id]);
        if (employeeRows.length > 0) {
            await conn.query("UPDATE employee SET status = 'not_working' WHERE employee_id = ?", [employeeRows[0].employee_id]);

        }
        const [result] = await conn.query("DELETE FROM car WHERE car_id = ?", [id]);
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Car not found." });
        }
        await conn.commit();
        return res.status(200).json({ message: "Car deleted successfully." });
    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const getNotWorkingEmployeeController = async (req, res) => {
    try {
        const [employees] = await pool.query("SELECT * FROM all_employee_details WHERE status = 'not_working'");
        if (employees.length === 0) {
            return res.status(404).json({ message: "No not working employees found." });
        }
        return res.status(200).json({ message: "Not working employees fetched successfully.", data: employees });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const getAvailableCarsController = async (req, res) => {
    try {
        const [cars] = await pool.query("SELECT c.car_id, c.year,c.make,c.model,c.reg_num,c.status,c.rental_rate,c.branch_id,c.branch_name,c.branch_city FROM all_car_details AS c LEFT JOIN employee_car AS ec ON c.car_id = ec.car_id AND ec.deleted = FALSE WHERE ec.car_id IS NULL AND c.status = 'available'");
        if (cars.length === 0) {
            return res.status(200).json({ message: "No available cars found.", data: [] });
        }
        console.log(cars)
        return res.status(200).json({ message: "Available cars fetched successfully.", data: cars });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const addEmployeeCarController = async (req, res) => {
    let conn;
    try {
        const { employeeId, carId } = req.body;
        if (!employeeId || !carId) {
            return res.status(400).json({ message: "Employee ID and Car ID are required." });
        }
        const empId = parseInt(employeeId, 10);
        const carID = parseInt(carId, 10);
        if (isNaN(empId) || isNaN(carID) || empId <= 0 || carID <= 0) {
            return res.status(400).json({ message: "Invalid Employee ID or Car ID." });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [employeeRows] = await conn.query("SELECT * FROM all_employee_details WHERE employee_id = ? AND status = 'not_working'", [empId]);
        if (employeeRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Employee not found or not available." });
        }
        const [carRows] = await conn.query("SELECT * FROM all_car_details WHERE car_id = ? AND status = 'available'", [carID]);
        if (carRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Car not found or not available." });
        }
        if (Number(employeeRows[0].branch_id) !== Number(carRows[0].branch_id)) {
            await conn.rollback();
            return res.status(400).json({ message: "Employee and Car must belong to the same branch." });
        }
        const [existing] = await conn.query("SELECT * FROM employee_car WHERE (employee_id = ? OR car_id = ?) AND deleted = FALSE", [empId, carID]);
        if (existing.length > 0) {
            await conn.rollback();
            return res.status(409).json({ message: "Either the employee is already assigned a car or the car is already assigned to an employee." });
        }
        await conn.query("INSERT INTO employee_car (employee_id, car_id, date_assigned) VALUES (?, ?, CURDATE())", [empId, carID]);
        await conn.query("UPDATE employee SET status = 'working' WHERE employee_id = ?", [empId]);
        await conn.commit();
        res.status(201).json({ message: `Employee #${empId} assigned to Car #${carID} successfully.` });
    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const getAllEmployeeCarController = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM all_employeecar_details WHERE deleted = FALSE");
        if (rows.length === 0) {
            return res.status(404).json({ message: "No employee-car assignments found." });
        }
        res.status(200).json({ message: "Employee-Car assignments fetched successfully.", total: rows.length, data: rows });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const removeEmployeeCarController = async (req, res) => {
    let conn;
    try {
        const { cid, eid } = req.params;
        if (!cid || !eid) {
            return res.status(400).json({ message: "Car ID and Employee ID are required." });
        }
        const empId = parseInt(eid, 10);
        const carID = parseInt(cid, 10);
        if (isNaN(empId) || isNaN(carID) || empId <= 0 || carID <= 0) {
            return res.status(400).json({ message: "Invalid Employee ID or Car ID." });
        }
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [employeeRows] = await conn.query("SELECT * FROM employee_car WHERE employee_id = ? AND car_id = ? AND deleted = FALSE", [empId, carID]);
        if (employeeRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "No such employee-car assignment found." });
        }

        const [result] = await conn.query("UPDATE employee_car SET deleted = TRUE WHERE employee_id = ? AND car_id = ?", [empId, carID]);
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "No such employee-car assignment found." });
        }
        await conn.query("UPDATE employee SET status = 'not_working' WHERE employee_id = ?", [empId]);
        await conn.commit();
        res.status(200).json({ message: "Employee-Car assignment removed successfully." });
    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const addCarServiceRecordController = async (req, res) => {
    let conn;
    try {
        const { car_id, service_date, detail, cost } = req.body;
        if (!car_id || !service_date || !detail?.trim() || cost == null) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const carId = parseInt(car_id, 10);
        const serviceCost = parseFloat(cost);

        if (isNaN(carId) || isNaN(serviceCost) || serviceCost <= 0 || carId <= 0) {
            return res.status(400).json({ message: "Invalid Car ID or Service Cost." });
        }

        const serviceDate = service_date
            ? new Date(service_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [carRows] = await conn.query("SELECT * FROM car WHERE car_id = ?", [carId]);
        if (carRows.length === 0) {
            return res.status(404).json({ message: "Car not found." });
        }

        if (carRows[0].status === "maintenance") {
            await conn.rollback();
            return res.status(400).json({ message: "Car is already under maintenance." });
        }

        await conn.query("INSERT INTO service (car_id, service_date, detail, cost) VALUES (?, ?, ?, ?)", [carId, serviceDate, detail.trim(), serviceCost]);
        await conn.query("UPDATE car SET status = 'maintenance' WHERE car_id = ?", [carId]);

        const [empCarRows] = await conn.query("SELECT * FROM employee_car WHERE car_id = ? AND deleted = FALSE", [carId]);
        if (empCarRows.length > 0) {

            await conn.query("UPDATE employee SET status = 'not_working' WHERE employee_id = ?", [empCarRows[0].employee_id]);
            await conn.query("UPDATE employee_car SET deleted = TRUE WHERE car_id = ? AND employee_id = ?", [carId, empCarRows[0].employee_id]);
        }
        await conn.commit();
        res.status(201).json({ message: "Service record added successfully." });

    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const getAllServiceHistoryController = async (req, res) => {
    try {
        const [records] = await pool.query("SELECT * FROM all_service_details ORDER BY service_date DESC");
        if (records.length === 0) {
            return res.status(404).json({ message: "No service records found." });
        }
        res.status(200).json({ message: "Service records fetched successfully.", total: records.length, data: records });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}

export const getServiceHistoryByCarIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Car ID is required." });
        }
        const carId = parseInt(id, 10);
        if (isNaN(carId) || carId <= 0) {
            return res.status(400).json({ message: "Invalid Car ID." });
        }
        const [records] = await pool.query("SELECT * FROM all_service_details WHERE car_id = ? ORDER BY service_date DESC", [carId]);
        if (records.length === 0) {
            return res.status(404).json({ message: "No service records found for this car." });
        }
        res.status(200).json({ message: "Service records fetched successfully.", total: records.length, data: records });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const releveCarFromMaintenanceController = async (req, res) => {
    let conn;
    try {
        const { sId, cId } = req.params;
        if (!sId || !cId) {
            return res.status(400).json({ message: "Service ID and Car ID are required." });
        }
        const serviceId = parseInt(sId, 10);
        const carId = parseInt(cId, 10);
        if (isNaN(serviceId) || isNaN(carId) || serviceId <= 0 || carId <= 0) {
            return res.status(400).json({ message: "Invalid Service ID or Car ID." });
        }
        conn = await pool.getConnection();
        await conn.beginTransaction();
        const [serviceRows] = await conn.query("SELECT * FROM service WHERE car_id = ? AND is_completed = FALSE", [carId]);
        if (serviceRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "No ongoing service record found for this car." });
        }
        if (serviceRows[0].service_id !== serviceId) {
            await conn.rollback();
            return res.status(400).json({ message: "Service ID does not match the ongoing service record for this car." });
        }
        await conn.query("UPDATE service SET is_completed = TRUE WHERE service_id = ?", [serviceId]);
        await conn.query("UPDATE car SET status = 'available' WHERE car_id = ?", [carId]);
        await conn.commit();
        res.status(200).json({ message: "Car relieved from maintenance successfully." });
    } catch (error) {
        if (conn) await conn.rollback();
        res.status(500).json({ message: error.message || "Server Error" });
    } finally {
        if (conn) conn.release();
    }
}

export const getAllRentalsController = async (req, res) => {
    try {
        const [rentals] = await pool.query("SELECT * FROM all_rental_details ORDER BY rental_date DESC");
        if (rentals.length === 0) {
            return res.status(404).json({ message: "No rental records found." });
        }
        res.status(200).json({ message: "Rental records fetched successfully.", total: rentals.length, data: rentals });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}