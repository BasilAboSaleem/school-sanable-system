// ===========================
// School Sanable System - app.js
// ===========================

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Config / DB
const connectDB = require("./app/config/db"); 
connectDB();

// Middlewares
const authMiddleware = require("./app/middlewares/auth");

// App Initialization
const app = express();

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: process.env.BASE_URL || "*", credentials: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  rateLimit({
    windowMs: 1000,
    max: 50,
    message: "Too many requests, please slow down.",
  })
);

// Session + Flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || "superSecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);
app.use(flash());

// Make flash available in views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// --------- Routes ----------
const indexRoutes = require("./app/routes/index");
const authRoutes = require("./app/routes/auth");
const superAdminRoutes = require("./app/routes/superAdmin");
const schoolAdminRoutes = require("./app/routes/schoolAdmin");
const attendanceRoutes = require("./app/routes/attendance");

// Public Routes
app.use("/auth", authRoutes);

// Protected Routes (after authMiddleware)
app.use(authMiddleware); // يحمي كل ما بعده
app.use((req, res, next) => {
  res.locals.user = req.user || null; // الآن user متاح للـ EJS
  next();
});

app.use("/", indexRoutes);
app.use("/super-admin", superAdminRoutes);
app.use("/school-admin", schoolAdminRoutes);
app.use("/attendance", attendanceRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

module.exports = app;
