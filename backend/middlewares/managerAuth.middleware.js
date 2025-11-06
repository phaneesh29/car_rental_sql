import { ACCESS_TOKEN_SECRET } from "../constants.js";
import jsonwebtoken from "jsonwebtoken";
import pool from "../db/db.config.js";

export const managerAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.employeeToken || req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }
        const decoded = jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: "Unauthorized - Invalid or Expired Token" });
        }
        const [rows] = await pool.query("SELECT * FROM all_employee_details WHERE employee_id = ? AND email = ?", [decoded.employee_id, decoded.email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Unauthorized - User Not Found" });
        }
        if (rows[0].role !== 'manager') {
            return res.status(403).json({ message: "Unauthorized - Insufficient Permissions" });
        }
        req.manager = rows[0];
        next();
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}