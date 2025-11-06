import express from "express";
import "dotenv/config"
import cookieParser from "cookie-parser";
import cors from "cors"
import { CORS_ORIGIN, PORT } from "./constants.js"

import { testDBConnection } from "./db/db.config.js";

import healthRouter from "./routes/health.route.js";
import customerRouter from "./routes/customer.route.js";
import managerRouter from "./routes/manager.route.js";

testDBConnection();

const app = express();

app.use(cors({
    origin: [CORS_ORIGIN],
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

app.use("/api/health", healthRouter)
app.use("/api/auth/customer", customerRouter)
app.use("/api/auth/manager", managerRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})