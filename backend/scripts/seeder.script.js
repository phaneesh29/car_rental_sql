import pool from "../db/db.config.js";
import bcryptjs from "bcryptjs";

const superBranch = {
    branch_name: "Super Branch",
    street: "Master Street",
    city: "Express City",
    state: "Node State",
    zip: "560010",
};

const superEmployee = {
    first_name: "Super",
    last_name: "Admin",
    email: "superadmin@example.com",
    password: "super@admin123",
    role: "manager",
    status: "working",
    street: "Master Street",
    city: "Express City",
    state: "Node State",
    zip: "560010",
    phone_num: "1234567890",
}

async function seed() {
    const conn = await pool.getConnection();
    try {
        console.log("🌱 Seeding initial data...");
        await conn.beginTransaction();
        const [branches] = await conn.query("SELECT * FROM branch LIMIT 1");
        let branchId;
        if (branches.length === 0) {
            const [branchResult] = await conn.query("INSERT INTO branch (branch_name, street, city, state, zip) VALUES (?, ?, ?, ?, ?)", [superBranch.branch_name, superBranch.street, superBranch.city, superBranch.state, superBranch.zip]);
            branchId = branchResult.insertId;
            console.log(`🏢 Branch created with ID: ${branchId}`);
        } else {
            branchId = branches[0].branch_id;
            console.log(`🏢 Branch already exists (ID: ${branchId})`);
        }
        const [managers] = await conn.query("SELECT * FROM employee WHERE role = 'manager' LIMIT 1");
        if (managers.length === 0) {
            const hashedPassword = await bcryptjs.hash(superEmployee.password, 10);
            const [employeeResult] = await conn.query("INSERT INTO employee (first_name, last_name, email, password_hash, role, status, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [superEmployee.first_name, superEmployee.last_name, superEmployee.email, hashedPassword, superEmployee.role, superEmployee.status, branchId]);
            const [addressResult] = await conn.query("INSERT INTO employee_address (employee_id, street, city, state, zip) VALUES (?, ?, ?, ?, ?)", [employeeResult.insertId, superEmployee.street, superEmployee.city, superEmployee.state, superEmployee.zip]);
            const [phoneResult] = await conn.query("INSERT INTO employee_phone (employee_id, phone_num) VALUES (?, ?)", [employeeResult.insertId, superEmployee.phone_num]);
            console.log(`👤 Super admin created with ID: ${employeeResult.insertId}`);
        } else {
            console.log("👑 Manager already exists, skipping creation.");
        }
        await conn.commit();
        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        await conn.rollback();
        console.error("❌ Seeding failed:", error.message);
    } finally {
        conn.release();
        process.exit(0);
    }
}

seed();