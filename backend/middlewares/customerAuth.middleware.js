import { ACCESS_TOKEN_SECRET } from "../constants.js";
import jsonwebtoken from "jsonwebtoken";
import pool from "../db/db.config.js";

export const customerAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.custToken || req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }
        const decoded = jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: "Unauthorized - Invalid or Expired Token" });
        }
        const [rows] = await pool.query("SELECT * FROM all_customer_details WHERE cust_id = ? AND email = ?", [decoded.cust_id, decoded.email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Unauthorized - User Not Found" });
        }
        req.customer = rows[0];
        next();
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
}