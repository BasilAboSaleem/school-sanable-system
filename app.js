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
const helmet = require("helmet");
const compression = require("compression");
const csurf = require("csurf");
const methodOverride = require("method-override");


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
app.use(compression()); // ✅ Good for Production: Reduces response body size
app.use(methodOverride("_method"));


// Security Headers (Helmet) - Disable CSP for inline scripts compat
app.use(
  helmet({
    contentSecurityPolicy: false, // ⚠️ Note: CSP disabled for inline scripts compatibility. Consider configuring for strict security in production.
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ⚠️ Production Recommendation: Uncomment rateLimit to prevent abuse
/*app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please slow down.",
  })
);*/

// Session + Flash 
app.use(
  session({
    secret: process.env.SESSION_SECRET || "superSecretKeyForSession",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "lax", // Protect against CSRF
    },
  })
);
app.use(flash());

// CSRF Protection (must be after cookie-parser/session and before routes)
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'lax' } });
app.use(csrfProtection);

// Make flash & CSRF available in views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.user || null;
  next();
});

// --------- Routes ----------
const indexRoutes = require("./app/routes/index");
const authRoutes = require("./app/routes/auth");
const superAdminRoutes = require("./app/routes/superAdmin");
const schoolAdminRoutes = require("./app/routes/schoolAdmin");
const attendanceRoutes = require("./app/routes/attendance");
const teacherRoutes = require("./app/routes/teacher");
const parentRoutes = require("./app/routes/parent");

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
app.use("/teacher", teacherRoutes);
app.use("/parent", parentRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/profile", require("./app/routes/profile"));

app.use("/", require("./app/routes/index"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api')) {
      return res.status(status).json({ error: message });
  }

  res.status(status).render("errors/error", { 
      // Assuming you have an error view, if not we'll render a simple one or redirect
      // For now, let's keep it simple or use a generic error view if it exists
      message: message,
      error: process.env.NODE_ENV === 'development' ? err : {}
  }, (err2, html) => {
      if (err2) return res.status(status).send(message); // Fallback
      res.send(html);
  });
});

module.exports = app;
