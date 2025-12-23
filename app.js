// ===========================
// School Sanable System - app.js
// ===========================

// ---------- Imports -----------
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

// --------- Config / DB ----------
const connectDB = require("./app/config/db"); // MongoDB

// --------- Middlewares ----------
/*const authMiddleware = require("./app/middlewares/auth");
const roleMiddleware = require("./app/middlewares/role");*/

// --------- App Initialization ----------
const app = express();

// --------- View Engine Setup ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --------- Database Connection ----------
connectDB();

// --------- Global Middleware ----------

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// CORS
app.use(cors({ origin: process.env.BASE_URL || "*", credentials: true }));

// Logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate Limiter (basic)
app.use(
  rateLimit({
    windowMs: 1000, // 1 second
    max: 50,
    message: "Too many requests, please slow down.",
  })
);

// --------- Routes ----------
const indexRoutes = require("./app/routes/index");
app.use("/", indexRoutes);
/*
const authRoutes = require("./app/routes/auth.routes");
const schoolRoutes = require("./app/routes/school.routes");
const studentRoutes = require("./app/routes/student.routes");
const employeeRoutes = require("./app/routes/employee.routes");
const supplierRoutes = require("./app/routes/supplier.routes");
const incomeRoutes = require("./app/routes/income.routes");
const expenseRoutes = require("./app/routes/expense.routes");
*/

// Public routes
//app.use("/auth", authRoutes);

// Auth middleware for protected routes
//app.use(authMiddleware);

// Protected routes
/*
app.use("/schools", schoolRoutes);
app.use("/students", studentRoutes);
app.use("/employees", employeeRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/income", incomeRoutes);
app.use("/expense", expenseRoutes);
*/

// --------- Health Check ----------
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// --------- 404 Handler ----------
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// --------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// --------- Export App ----------
module.exports = app;
